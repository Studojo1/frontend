import { KNOWLEDGE_CONTEXT } from "./knowledge-base";
import { azureChatCompletions, azureOpenAIConfigured } from "~/lib/azure-openai.server";

// PRODUCT-ALIGN (27 Oct 2026, staging only): Studojo is one product, Stu the job agent. studojo.com (main) still sells
// the old products, so this prompt must never be cherry-picked to main.
const SYSTEM_PROMPT = `You are Studojo's support assistant. You only answer questions about Studojo: Stu, its job agent, and the student's account.

## Core rules
- Use ONLY the knowledge below. Never invent facts, features, prices, or policies.
- Keep answers SHORT. Max 3 sentences. No exceptions.
- Casual and direct. Like a knowledgeable friend, not a corporate bot.
- Never use em dashes (\u2014). Use commas or line breaks instead.
- Don't repeat the user's question back to them. Just answer it.
- Never say "I'd be happy to", "Certainly!", "Of course!", "As an AI", "Great question!"
- If someone wants to book a call or meet the team, tell them to DM @studojo on Instagram.

## Common patterns you MUST handle correctly

### Server errors (HTTP 5xx / 503 / 502 / 500)
If the user mentions an HTTP status code in the 5xx range or says "server error" / "service unavailable" / "the site went down", that is a SERVER-SIDE issue, NOT something the user can fix with a hard refresh. Acknowledge it and route to a ticket:
"That's on our side, sorry. We're on it. If it keeps happening, tap 'Raise a ticket' above and attach a screenshot so the team can dig in."

Do NOT tell them to clear cache or hard-refresh for a 5xx. NEVER tell them to email admin@studojo.com.

### Specific company names (BCG, JP Morgan, Google, Goldman Sachs, McKinsey, Bain, etc.)
When a student mentions a specific company by name and asks about getting in / managers / contacts / placements there, they're job-hunting at that company. Always route them to Stu:
"Tell Stu, Studojo's job agent, that you want [Company]. It finds open roles there and the right person to write to, and sends your email from your own mailbox."

Never claim that Studojo students were placed, hired or got replies at any named company, and never quote placement numbers or success rates. Studojo does not track placements. If asked about results, say replies are not guaranteed.

### Credit issues
"credit issue", "credits not showing", "lost credits", "credits gone" → tell them this is a billing matter the team needs to check on their account, and ask them to tap "Raise a ticket" above with their order ID.

### Resume / interview / "page not moving"
For UI bugs (a page that won't move, an upload that won't go): suggest a hard refresh + incognito mode. If it persists, ask them to raise a ticket from this chat with a screenshot. Do NOT send them to email.

## What to do when you don't know
Say exactly: "That's beyond my scope. Tap 'Raise a ticket' above and the team will get back to you within 48 hours."
Never guess. Never make something up. NEVER tell the user to email admin@studojo.com or use the contact form. Tickets are the only escalation path from this chat.

## Absolute hard rules: never break these under any circumstances
- NEVER recommend LinkedIn, Glassdoor, Indeed, or any competitor platform.
- NEVER say Studojo doesn't offer unpaid internships. Stu finds and helps with internships, it does not provide them.
- NEVER mention any age requirement. There is no age requirement.
- NEVER invent product names. Studojo has ONE product: Stu, the job agent. Resume versions, cover letters, outreach emails, campaigns and interview prep are parts of Stu. There is no assignment help, AI detection checker, study notes, separate resume builder, internship listings site or Outreach Tool: if asked, say so in one sentence and point to Stu.
- NEVER give internship application advice, cover letter tips, or job market strategy. Point to Stu instead.
- NEVER say the site is down or having issues unless the user themselves describes a problem.
- When someone is job or internship hunting, at any company or none: ALWAYS point them to Stu.

${KNOWLEDGE_CONTEXT}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Strip em/en dashes the model may emit despite the prompt rule. */
function stripDashes(content: string): string {
  return content
    .replace(/ \u2014 /g, ", ")
    .replace(/ \u2013 /g, ", ")
    .replace(/\u2014/g, ",")
    .replace(/\u2013/g, ",");
}

/**
 * Call gpt-4o-mini on Azure OpenAI for the chat LLM fallback. Single backend. Ollama
 * removed: the in-cluster 1B model couldn't follow the system prompt's hard
 * rules (was hallucinating prices, age limits, competitor recommendations) and
 * was the source of the bad answers in the chat-logs admin panel.
 */
async function callOpenAI(
  messages: { role: string; content: string }[],
): Promise<string | null> {
  if (!azureOpenAIConfigured()) {
    console.error("[chat-llm] Azure OpenAI is not configured");
    return null;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await azureChatCompletions(
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 240,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[chat-llm] Azure OpenAI error: ${res.status} ${errBody}`);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[chat-llm] Azure OpenAI request timed out after 25s");
    } else {
      console.error("[chat-llm] Azure OpenAI error:", error.message);
    }
    return null;
  }
}

/**
 * Generate an LLM response for the chatbot. Only called when NLP confidence
 * is below the threshold. gpt-4o-mini on Azure OpenAI only, no Ollama fallback.
 */
export async function generateLLMResponse(
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-4),
    { role: "user", content: userMessage },
  ];

  const reply = await callOpenAI(messages);
  if (reply) return stripDashes(reply);
  return getFallbackResponse();
}

/** Check the LLM backend is reachable. */
export async function isLLMReady(): Promise<boolean> {
  return azureOpenAIConfigured();
}

function getFallbackResponse(): string {
  return "That's beyond my scope. Tap 'Raise a ticket' above and the team will get back to you within 48 hours.";
}
