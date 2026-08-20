import { env } from "cloudflare:workers";

const inboxEmail = "hello@ilovetoolxyz.com";
const fromEmail = "Delhi Service Network <onboarding@resend.dev>";

type EmailPayload = {
  subject: string;
  lines: string[];
};

export async function sendNotificationEmail({ subject, lines }: EmailPayload) {
  const apiKey = typeof env.RESEND_API_KEY === "string" ? env.RESEND_API_KEY : "";

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [inboxEmail],
      subject,
      text: lines.join("\n"),
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: await response.text() };
  }

  return { sent: true };
}

export { inboxEmail };
