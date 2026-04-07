import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ─── Config ───────────────────────────────────────────────────────────────────

const TO = "vinicius.highlevelmkt@gmail.com";

// ─── Sanitise ─────────────────────────────────────────────────────────────────
// Escape HTML special characters before injecting user input into the template.

const safe = (s: string) =>
  s
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#x27;")
    .replace(/\n/g, "<br />");

// ─── Email template ───────────────────────────────────────────────────────────

function buildHtml({
  name,
  email,
  message,
  timestamp,
}: {
  name:      string;
  email:     string;
  message:   string;
  timestamp: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>New HLM enquiry</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#f4f4f4;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0f0;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:500;letter-spacing:0.2em;
                         text-transform:uppercase;color:#aaaaaa;">HLM</p>
              <h1 style="margin:0;font-size:22px;font-weight:300;color:#111111;
                          letter-spacing:-0.02em;line-height:1.2;">New enquiry</h1>
            </td>
          </tr>

          <!-- Fields -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

                <!-- Name -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0 0 5px;font-size:10px;font-weight:500;
                               letter-spacing:0.18em;text-transform:uppercase;color:#bbbbbb;">
                      Name
                    </p>
                    <p style="margin:0;font-size:16px;font-weight:400;color:#111111;
                               line-height:1.5;">
                      ${safe(name)}
                    </p>
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0 0 5px;font-size:10px;font-weight:500;
                               letter-spacing:0.18em;text-transform:uppercase;color:#bbbbbb;">
                      Email
                    </p>
                    <p style="margin:0;font-size:16px;color:#111111;line-height:1.5;">
                      <a href="mailto:${safe(email)}"
                         style="color:#111111;text-decoration:underline;
                                text-underline-offset:3px;">
                        ${safe(email)}
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td>
                    <p style="margin:0 0 5px;font-size:10px;font-weight:500;
                               letter-spacing:0.18em;text-transform:uppercase;color:#bbbbbb;">
                      What they're building
                    </p>
                    <p style="margin:0;font-size:15px;font-weight:300;color:#444444;
                               line-height:1.75;">
                      ${safe(message)}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:11px;color:#cccccc;letter-spacing:0.02em;">
                ${safe(timestamp)} &middot; Lisbon
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText({
  name,
  email,
  message,
  timestamp,
}: {
  name:      string;
  email:     string;
  message:   string;
  timestamp: string;
}) {
  return [
    "New HLM enquiry",
    "================",
    "",
    `Name:      ${name}`,
    `Email:     ${email}`,
    `Received:  ${timestamp} (Lisbon)`,
    "",
    "What they're building",
    "---------------------",
    message,
  ].join("\n");
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Parse body ─────────────────────────────────────────────────────────
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, message } = body as Record<string, unknown>;

    // ── Validate ───────────────────────────────────────────────────────────
    if (typeof name    !== "string" ||
        typeof email   !== "string" ||
        typeof message !== "string") {
      return NextResponse.json({ error: "Invalid field types." }, { status: 400 });
    }

    const n = name.trim();
    const e = email.trim().toLowerCase();
    const m = message.trim();

    if (!n || !e || !m) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (n.length < 2) {
      return NextResponse.json({ error: "Name is too short." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (m.length < 5) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }

    // ── Check env ──────────────────────────────────────────────────────────
    const apiKey = process.env.RESEND_API_KEY;
    const from   = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY is not set.");
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
    }

    // ── Timestamp (Lisbon) ─────────────────────────────────────────────────
    const timestamp = new Date().toLocaleString("en-GB", {
      timeZone:  "Europe/Lisbon",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // ── Send ───────────────────────────────────────────────────────────────
    const resend = new Resend(apiKey);

    const { error: sendError } = await resend.emails.send({
      from,
      to:      TO,
      replyTo: e,                           // reply goes directly to the enquirer
      subject: `New HLM enquiry — ${n}`,
      html:    buildHtml({ name: n, email: e, message: m, timestamp }),
      text:    buildText({ name: n, email: e, message: m, timestamp }),
    });

    if (sendError) {
      console.error("[contact] Resend error:", sendError);
      return NextResponse.json(
        { error: "Failed to send. Please try again or email us directly." },
        { status: 500 },
      );
    }

    console.log(`[contact] Sent — ${n} <${e}> at ${timestamp}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
