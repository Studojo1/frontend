const RESEND_API_URL = "https://api.resend.com/emails";

interface InternshipApplicationNotification {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string | null;
  internshipTitle: string;
  companyName: string;
  internshipId: string;
  applicationId: string;
  appliedAt: Date;
}

export async function sendInternshipApplicationNotification(
  data: InternshipApplicationNotification
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping internship application notification");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Studojo <applications@studojo.com>";
  const to = process.env.INTERNSHIP_APPLICATIONS_NOTIFY_EMAIL?.trim() || "vanshikastudojo@gmail.com";

  const maverickBase = process.env.MAVERICK_BASE_URL?.trim() || "https://maverick.studojo.com";
  const applicationLink = `${maverickBase}/internships/${data.internshipId}/applications`;

  const appliedAtFormatted = data.appliedAt.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const subject = `New application: ${data.applicantName} for ${data.internshipTitle}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #191a23;">
      <h2 style="margin: 0 0 16px;">New internship application</h2>
      <p style="margin: 0 0 24px; color: #4b5563;">A candidate just applied through the Studojo platform.</p>

      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <tbody>
          <tr style="background: #f9fafb;"><td style="font-weight: 600; width: 160px;">Applicant</td><td>${escapeHtml(data.applicantName)}</td></tr>
          <tr><td style="font-weight: 600;">Email</td><td><a href="mailto:${escapeHtml(data.applicantEmail)}">${escapeHtml(data.applicantEmail)}</a></td></tr>
          <tr style="background: #f9fafb;"><td style="font-weight: 600;">Phone</td><td>${data.applicantPhone ? escapeHtml(data.applicantPhone) : "<em style='color:#9ca3af;'>not provided</em>"}</td></tr>
          <tr><td style="font-weight: 600;">Role</td><td>${escapeHtml(data.internshipTitle)}</td></tr>
          <tr style="background: #f9fafb;"><td style="font-weight: 600;">Company</td><td>${escapeHtml(data.companyName)}</td></tr>
          <tr><td style="font-weight: 600;">Applied at</td><td>${escapeHtml(appliedAtFormatted)} IST</td></tr>
        </tbody>
      </table>

      <p style="margin: 24px 0;">
        <a href="${applicationLink}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600;">View in Maverick</a>
      </p>

      <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px;">Application ID: ${escapeHtml(data.applicationId)}</p>
    </div>
  `.trim();

  const text = [
    "New internship application",
    "",
    `Applicant: ${data.applicantName}`,
    `Email: ${data.applicantEmail}`,
    `Phone: ${data.applicantPhone || "not provided"}`,
    `Role: ${data.internshipTitle}`,
    `Company: ${data.companyName}`,
    `Applied at: ${appliedAtFormatted} IST`,
    "",
    `View in Maverick: ${applicationLink}`,
    "",
    `Application ID: ${data.applicationId}`,
  ].join("\n");

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "<unreadable>");
    throw new Error(`Resend API returned ${response.status}: ${errorBody}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
