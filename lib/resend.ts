import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

export type DigestPayload = {
  to: string;
  dueCount: number;
  unsubscribeUrl: string;
  appUrl: string;
  topTitles: string[];
};

export async function sendDigestEmail(p: DigestPayload): Promise<boolean> {
  const r = getClient();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!r || !from) {
    console.warn("[email] RESEND not configured; skipping digest send");
    return false;
  }
  try {
    await r.emails.send({
      from,
      to: p.to,
      subject: `${p.dueCount} ${p.dueCount === 1 ? "thing" : "things"} to remember today`,
      html: renderDigest(p),
      text: renderDigestText(p),
    });
    return true;
  } catch (e) {
    console.error("[email] digest send failed", e);
    return false;
  }
}

function renderDigest(p: DigestPayload): string {
  const list = p.topTitles
    .map(
      (t) =>
        `<li style="margin:6px 0;color:#27272a;">${escapeHtml(t.slice(0, 140))}</li>`,
    )
    .join("");
  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:32px auto;color:#18181b;">
  <h2 style="font-size:18px;margin:0 0 8px;">${p.dueCount} ${p.dueCount === 1 ? "thing" : "things"} to remember today</h2>
  <p style="color:#52525b;margin:0 0 16px;">A short calm session is all it takes.</p>
  <ul style="padding-left:18px;margin:0 0 16px;">${list}</ul>
  <p>
    <a href="${p.appUrl}/review" style="background:#18181b;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Start review →</a>
  </p>
  <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">
    <a href="${p.unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe</a>
  </p>
</body></html>`;
}

function renderDigestText(p: DigestPayload): string {
  return [
    `${p.dueCount} ${p.dueCount === 1 ? "thing" : "things"} to remember today.`,
    "",
    ...p.topTitles.map((t) => `• ${t.slice(0, 140)}`),
    "",
    `Review: ${p.appUrl}/review`,
    `Unsubscribe: ${p.unsubscribeUrl}`,
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
