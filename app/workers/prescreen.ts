// AI pre-answering: generate answers to all likely screening questions for a job
// Uses Azure OpenAI GPT-4o - answers cached in job_queue.prescreened_answers

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT ?? "";
const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const DEPLOYMENT = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ?? "gpt-4o";

const COMMON_QUESTIONS = [
  "Are you authorized to work in this country?",
  "Do you require sponsorship?",
  "Are you willing to relocate?",
  "What is your current notice period?",
  "What are your salary expectations?",
  "How many years of experience do you have?",
  "Are you willing to work on-site?",
  "Describe yourself in a few sentences.",
  "Why are you interested in this role?",
  "What is your highest level of education?",
];

export async function prescreenJob(cvText: string, jobDescription: string): Promise<Record<string, string>> {
  if (!AZURE_ENDPOINT || !AZURE_KEY) return {};

  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-02-01`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": AZURE_KEY },
      body: JSON.stringify({
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `You are helping a job applicant pre-answer screening questions for an online application.
Generate concise, professional answers for common application questions based on their CV and the job description.
Rules:
- Keep each answer under 100 words unless it's a cover letter
- Be specific, reference numbers and companies from the CV
- For yes/no eligibility: answer "Yes"
- For salary: give a market-appropriate range from the CV
- For notice period: "2 weeks" unless CV says otherwise
- Return ONLY valid JSON: {"question": "answer", ...}
- Do not invent experience or companies not in the CV`,
          },
          {
            role: "user",
            content: `CV:\n${cvText}\n\nJob Description:\n${jobDescription}\n\nGenerate answers for these questions:\n${COMMON_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nReturn a JSON object with question as key, answer as value.`,
          },
        ],
      }),
    });

    const data = (await res.json()) as any;
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "{}";
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[prescreen] error:", err);
    return {};
  }
}

export async function answerQuestion(question: string, cvText: string, context?: string): Promise<string> {
  if (!AZURE_ENDPOINT || !AZURE_KEY) return "";

  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-02-01`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": AZURE_KEY },
      body: JSON.stringify({
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are helping a job applicant answer screening questions. Answer concisely and professionally.
Rules:
- Under 150 words unless it's a cover letter (max 250)
- Specific - use numbers from CV where relevant
- For yes/no eligibility: "Yes"
- For salary: give market range from CV
- For notice period: "2 weeks" unless CV says otherwise
- Never make up degrees or companies not in the CV`,
          },
          {
            role: "user",
            content: `CV:\n${cvText}\n${context ? `\nJob context:\n${context}\n` : ""}\nQuestion: "${question}"\n\nProvide a direct answer only. No preamble.`,
          },
        ],
      }),
    });

    const data = (await res.json()) as any;
    return data?.choices?.[0]?.message?.content?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function generateConnectionNote(params: {
  senderName: string;
  senderRole?: string;
  recipientName: string;
  recipientTitle: string;
  recipientCompany: string;
  recentPost?: string;
  mutualConnection?: string;
}): Promise<string> {
  if (!AZURE_ENDPOINT || !AZURE_KEY) return "";

  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-02-01`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": AZURE_KEY },
      body: JSON.stringify({
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content: `Generate a LinkedIn connection request note. Must be under 300 characters. Sound human and specific - reference the recipient's work or a post if available. Do not be generic or salesy.`,
          },
          {
            role: "user",
            content: `Sender: ${params.senderName}${params.senderRole ? `, ${params.senderRole}` : ""}
Recipient: ${params.recipientName}, ${params.recipientTitle} at ${params.recipientCompany}
${params.recentPost ? `Recent post snippet: "${params.recentPost}"` : ""}
${params.mutualConnection ? `Mutual connection: ${params.mutualConnection}` : ""}

Write a connection note (max 300 chars).`,
          },
        ],
      }),
    });

    const data = (await res.json()) as any;
    const note = data?.choices?.[0]?.message?.content?.trim() ?? "";
    return note.slice(0, 300);
  } catch {
    return "";
  }
}
