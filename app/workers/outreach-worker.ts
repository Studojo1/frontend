// Outreach automation - LinkedIn connection requests + drip message sequences
// Day 0: connect, Day 3: message, Day 7: follow-up, Day 14: done

import { eq, and, lt, sql } from "drizzle-orm";
import db from "~/lib/db";
import { outreachContacts, userLinkedinSessions, outreachCampaigns, user as userTable } from "../../auth-schema";
import { decrypt } from "~/lib/encrypt.server";
import { buildProxy } from "~/lib/proxy.server";
import { pauseOutreach, logEvent, getWarmupLimit, checkAcceptanceRate } from "./safety-manager";
import { generateConnectionNote } from "./prescreen";

let chromiumModule: any = null;
async function getChromium() {
  if (!chromiumModule) {
    chromiumModule = (await import("patchright")).chromium;
  }
  return chromiumModule;
}

async function launchBrowser(userId: string, country: string, city: string, contextOptions: any): Promise<{ browser: any; ctx: any }> {
  const chromium = await getChromium();
  const proxy = buildProxy(userId, country, city); // undefined if DECODO_* not set
  const browser = await chromium.launch({
    headless: true,
    proxy,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const ctx = await browser.newContext(contextOptions);
  return { browser, ctx };
}

// ── Run outreach step for a contact ──────────────────────────────────────────

export async function runOutreachStep(contactId: string): Promise<{ status: string; error?: string }> {
  const [contact] = await db
    .select()
    .from(outreachContacts)
    .where(eq(outreachContacts.id, contactId))
    .limit(1);

  if (!contact) return { status: "failed", error: "contact_not_found" };

  const [session] = await db
    .select()
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, contact.userId))
    .limit(1);

  if (!session?.liAtEncrypted) return { status: "skipped", error: "no_session" };

  // Check acceptance rate before sending
  const acceptanceRate = await checkAcceptanceRate(contact.userId);
  if (acceptanceRate !== null && acceptanceRate < 0.20) {
    return { status: "skipped", error: "low_acceptance_rate" };
  }

  let liAt: string;
  try {
    liAt = await decrypt(session.liAtEncrypted);
  } catch {
    return { status: "failed", error: "decrypt_failed" };
  }

  let browser: any, ctx: any;
  try {
    ({ browser, ctx } = await launchBrowser(
      contact.userId,
      session.proxyCountry ?? "IN",
      session.proxyCity ?? "bangalore",
      {
        userAgent: session.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        locale: session.locale ?? "en-US",
        timezoneId: session.timezone ?? "Asia/Kolkata",
        storageState: {
          cookies: [{ name: "li_at", value: liAt, domain: ".linkedin.com", path: "/", httpOnly: true, secure: true, sameSite: "None" }],
          origins: [],
        },
      }
    ));

    const page = await ctx.newPage();
    let rateLimited = false;

    page.on("response", async (response) => {
      if (response.status() === 429 || response.status() === 999) {
        rateLimited = true;
        await logEvent("linkedin_429", contact.userId, { step: "outreach" });
        await pauseOutreach(contact.userId, 48, "rate_limited");
      }
    });

    let result: { status: string; error?: string };

    switch (contact.sequenceStep) {
      case 0:
        result = await sendConnectionRequest(page, contact, session, rateLimited);
        break;
      case 1:
        result = await sendIntroMessage(page, contact, rateLimited);
        break;
      case 2:
        result = await sendFollowUp(page, contact, rateLimited);
        break;
      default:
        result = { status: "done" };
    }

    await browser.close();

    if (result.status === "sent" || result.status === "requested") {
      const nextStep = contact.sequenceStep + 1;
      await db.update(outreachContacts).set({
        sequenceStep: nextStep,
        status: contact.sequenceStep === 0 ? "requested" : "messaged",
        lastActionAt: new Date(),
        ...(contact.sequenceStep === 0 ? {} : {}),
      }).where(eq(outreachContacts.id, contactId));
    }

    return result;
  } catch (err: any) {
    browser?.close().catch(() => {});
    return { status: "failed", error: err?.message?.slice(0, 100) };
  }
}

// ── Connection request ────────────────────────────────────────────────────────

async function sendConnectionRequest(page: any, contact: any, session: any, rateLimited: boolean): Promise<{ status: string; error?: string }> {
  if (rateLimited) return { status: "skipped", error: "rate_limited" };

  try {
    await page.goto(contact.linkedinUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Wait for LinkedIn SPA to render — domcontentloaded fires before h1/buttons appear
    await page.waitForSelector("h1, .pv-text-details__left-panel, .artdeco-card", { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(1500);

    // Check if already connected (1st degree badge)
    const alreadyConnected = await page.evaluate(() =>
      !![...document.querySelectorAll("span")].find((s) => s.textContent?.trim() === "1st")
    );
    if (alreadyConnected) {
      await db.update(outreachContacts).set({ status: "accepted", connectedAt: new Date(), sequenceStep: 1 }).where(eq(outreachContacts.id, contact.id));
      return { status: "already_connected" };
    }

    // Get sender's real name for the connection note
    const [senderRow] = await db.select({ name: userTable.name }).from(userTable).where(eq(userTable.id, contact.userId)).limit(1);
    const senderName = senderRow?.name ?? "Job seeker";

    // Try to click Connect — handles standard profile, 2nd-degree, and Creator Mode
    const connectClicked = await clickConnectButton(page);
    if (!connectClicked) return { status: "skipped", error: "no_connect_button" };

    await page.waitForTimeout(1500);

    // "Add a note" modal — optionally attach personalized note
    const addNoteBtn = await page.$('button[aria-label*="Add a note"]');
    if (addNoteBtn) {
      await addNoteBtn.click();
      await page.waitForTimeout(500);

      const note = await generateConnectionNote({
        senderName,
        recipientName: contact.name ?? "there",
        recipientTitle: contact.title ?? "",
        recipientCompany: contact.company ?? "",
        recentPost: contact.recentPostSnippet ?? undefined,
        mutualConnection: contact.mutualConnection ?? undefined,
      });

      const noteTextarea = await page.$("textarea#custom-message");
      if (noteTextarea && note) {
        await noteTextarea.fill(note.slice(0, 300));
      }
    }

    // Click Send
    for (const sel of ['button[aria-label="Send without a note"]', 'button[aria-label="Send now"]', 'button[aria-label="Send invitation"]']) {
      const btn = await page.$(sel);
      if (btn) { await btn.click(); await page.waitForTimeout(1000); return { status: "requested" }; }
    }
    // Text fallback inside dialog
    const modal = await page.$('[role="dialog"], .artdeco-modal');
    if (modal) {
      for (const btn of await modal.$$("button")) {
        const t = (await btn.textContent().catch(() => "")).trim().toLowerCase();
        if (t === "send" || t.includes("send without") || t.includes("send now")) {
          await btn.click();
          await page.waitForTimeout(1000);
          return { status: "requested" };
        }
      }
    }

    return { status: "failed", error: "no_send_button" };
  } catch (err: any) {
    return { status: "failed", error: err?.message?.slice(0, 100) };
  }
}

// Click the Connect button — handles standard profiles AND Creator Mode (More → Connect)
async function clickConnectButton(page: any): Promise<boolean> {
  // Strategy 1: aria-label with "Invite" + "connect"
  const inviteBtn = await page.$('button[aria-label*="Invite"][aria-label*="connect"]').catch(() => null);
  if (inviteBtn) { await inviteBtn.click(); return true; }

  // Strategy 2: exact text "Connect" in profile card (not in "People you may know")
  const directClicked = await page.evaluate(() => {
    for (const btn of document.querySelectorAll("button")) {
      if (btn.textContent?.trim() !== "Connect") continue;
      const section = btn.closest("section");
      const heading = section?.querySelector("h2, h3")?.textContent ?? "";
      if (!heading.includes("People you may") && !heading.includes("You might")) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  if (directClicked) return true;

  // Strategy 3: Creator Mode — click "More" then "Connect" in dropdown
  const moreClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].slice(0, 20);
    const more = btns.find((b) => b.textContent?.trim() === "More");
    if (more) { more.click(); return true; }
    return false;
  });

  if (!moreClicked) return false;

  await page.waitForTimeout(1000);

  const dropdownClicked = await page.evaluate(() => {
    const dd = document.querySelector(".artdeco-dropdown__content, [class*='dropdown__content']");
    if (!dd) return false;
    for (const el of dd.querySelectorAll("span, button, li")) {
      if (el.textContent?.trim() === "Connect") {
        (el.closest("button") ?? el as HTMLElement).click();
        return true;
      }
    }
    return false;
  });

  return dropdownClicked;
}

// ── Intro message (after acceptance) ─────────────────────────────────────────

async function sendIntroMessage(page: any, contact: any, rateLimited: boolean): Promise<{ status: string; error?: string }> {
  if (rateLimited) return { status: "skipped", error: "rate_limited" };

  const message = `Hi ${contact.name?.split(" ")[0] ?? "there"}, thanks for connecting! I recently applied for a role at ${contact.company ?? "your company"} and wanted to reach out directly. Happy to share more context if helpful.`;
  return sendLinkedInMessage(page, contact, message);
}

// ── Follow-up ─────────────────────────────────────────────────────────────────

async function sendFollowUp(page: any, contact: any, rateLimited: boolean): Promise<{ status: string; error?: string }> {
  if (rateLimited) return { status: "skipped", error: "rate_limited" };

  const followUp = `Hi ${contact.name?.split(" ")[0] ?? "there"} - just a quick follow-up on my earlier message. Happy to connect on a call if you have 15 minutes. No pressure either way.`;
  return sendLinkedInMessage(page, contact, followUp);
}

// ── Core message send (proven approach) ──────────────────────────────────────
// 1. Search conversation list by name - avoids Premium modal interception
// 2. Fallback: navigate to profile, JS-click Message, remove Premium modals

async function sendLinkedInMessage(page: any, contact: any, message: string): Promise<{ status: string; error?: string }> {
  try {
    await page.goto("https://www.linkedin.com/messaging/", { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2500);

    // Try conversation search first - more reliable than clicking Message on profile
    const firstName = contact.name?.split(" ")[0] ?? "";
    const lastName = contact.name?.split(" ").slice(-1)[0] ?? "";
    const searchInput = await page.$('[placeholder="Search messages"]');

    if (searchInput && firstName) {
      await searchInput.click();
      await page.keyboard.type(firstName, { delay: 80 });
      await page.waitForTimeout(2000);

      const convItems = await page.$$(".msg-conversation-listitem");
      for (const item of convItems) {
        const text = await item.textContent().catch(() => "");
        if (text?.includes(firstName) && (!lastName || text?.includes(lastName))) {
          await item.click({ force: true });
          await page.waitForTimeout(1500);
          break;
        }
      }
    }

    let msgBox = await page.$(".msg-form__contenteditable");

    // Fallback: navigate to profile and click Message via JS
    if (!msgBox && contact.linkedinUrl) {
      await page.goto(contact.linkedinUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(3000);

      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("a, button")].find(
          (b) => b.textContent?.trim() === "Message" || b.getAttribute("aria-label")?.includes("Message")
        );
        if (btn) (btn as HTMLElement).click();
      });
      await page.waitForTimeout(3000);

      // Remove Premium and overlay elements that intercept clicks
      await page.evaluate(() => {
        document.querySelectorAll("[data-test-modal],.artdeco-modal,[role='dialog']").forEach((m) => {
          if ((m.textContent ?? "").includes("Premium") || (m.textContent ?? "").includes("InMail")) m.remove();
        });
        document.querySelectorAll(".search-global-typeahead__overlay").forEach((e) => e.remove());
      });
      await page.waitForTimeout(500);

      msgBox = await page.$(".msg-form__contenteditable")
        ?? await page.$(".msg-overlay-conversation-bubble div[contenteditable='true']");
    }

    if (!msgBox) return { status: "skipped", error: "not_connected_yet" };

    await msgBox.click({ force: true });
    // Use keyboard.type - fill() doesn't trigger LinkedIn's input events
    await page.keyboard.type(message);
    await page.waitForTimeout(800);

    const sendBtn = await page.$("button.msg-form__send-button") ?? await page.$('[aria-label="Send"]');
    if (!sendBtn) return { status: "failed", error: "no_send_button" };

    await sendBtn.click({ force: true });
    await page.waitForTimeout(1000);
    return { status: "sent" };
  } catch (err: any) {
    return { status: "failed", error: err?.message?.slice(0, 100) };
  }
}

// ── Auto-withdraw stale pending invitations (>14 days) ────────────────────────

export async function withdrawStaleInvitations(userId: string) {
  const [session] = await db
    .select()
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, userId))
    .limit(1);

  if (!session?.liAtEncrypted) return;

  let liAt: string;
  try {
    liAt = await decrypt(session.liAtEncrypted);
  } catch {
    return;
  }

  const chromium = await getChromium();
  let browser;

  try {
    browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
    const ctx = await browser.newContext({
      storageState: {
        cookies: [{ name: "li_at", value: liAt, domain: ".linkedin.com", path: "/", httpOnly: true, secure: true, sameSite: "None" }],
        origins: [],
      },
    });
    const page = await ctx.newPage();

    // Navigate to sent invitations
    await page.goto("https://www.linkedin.com/mynetwork/invitation-manager/sent/", { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2000);

    let withdrawn = 0;
    const maxWithdraw = 10; // batch limit per run

    while (withdrawn < maxWithdraw) {
      // Find withdraw buttons
      const withdrawBtns = await page.$$('button[aria-label*="Withdraw"]');
      if (withdrawBtns.length === 0) break;

      await withdrawBtns[0].click();
      await page.waitForTimeout(500);

      // Confirm dialog
      const confirmBtn = await page.$('button[aria-label*="Withdraw"]');
      if (confirmBtn) await confirmBtn.click();
      await page.waitForTimeout(1000);
      withdrawn++;
    }

    console.log(`[outreach] Withdrew ${withdrawn} stale invitations for user ${userId}`);
    await browser.close();
  } catch (err: any) {
    browser?.close().catch(() => {});
    console.error("[outreach] withdraw error:", err?.message);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function findButton(page: any, labels: string[]): Promise<any> {
  for (const label of labels) {
    const btn = await page.$(`button:has-text("${label}")`).catch(() => null);
    if (btn) return btn;
  }
  return null;
}
