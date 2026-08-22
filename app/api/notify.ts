import { env } from "cloudflare:workers";

const inboxEmail = "srijanartrugs90@gmail.com";
const fromEmail = "Delhi Service Network <onboarding@resend.dev>";

type EmailPayload = {
  subject: string;
  lines: string[];
};

export async function sendNotificationEmail({ subject, lines }: EmailPayload) {
  const apiKey = typeof env.RESEND_API_KEY === "string" ? env.RESEND_API_KEY : "";

  if (!apiKey) {
    return sendFormSubmitFallback({ subject, lines });
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

async function sendFormSubmitFallback({ subject, lines }: EmailPayload) {
  const response = await fetch(`https://formsubmit.co/ajax/${inboxEmail}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      _template: "table",
      _captcha: "false",
      source: "Delhi Service Network",
      message: lines.join("\n"),
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: await response.text() };
  }

  return { sent: true, provider: "formsubmit" };
}

export { inboxEmail };
