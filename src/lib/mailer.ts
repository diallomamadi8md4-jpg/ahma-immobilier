/**
 * Envoi d'email optionnel via l'API HTTP de Resend (aucune dépendance à installer).
 * Sans RESEND_API_KEY, les alertes restent disponibles dans le centre de notifications
 * de l'application — l'envoi d'email est simplement ignoré.
 */
export async function sendMail({
  to, subject, html, text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? "Ahma Immobilier <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        text: text ?? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
