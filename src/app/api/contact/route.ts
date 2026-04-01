import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body as Record<string, string>;

    // ── Server-side validation ──────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // ── Delivery ────────────────────────────────────────────────────────────
    // Wire up your preferred transport here. Two common options:
    //
    // 1) Resend (recommended — https://resend.com):
    //    import { Resend } from "resend";
    //    const resend = new Resend(process.env.RESEND_API_KEY);
    //    await resend.emails.send({
    //      from:    "noreply@highlevelmkt.com",
    //      to:      "contato@highlevelmkt.com",
    //      subject: `New enquiry — ${name}`,
    //      text:    `Name: ${name}\nEmail: ${email}\n\n${message}`,
    //    });
    //
    // 2) Nodemailer / SMTP:
    //    const transporter = nodemailer.createTransport({ ... });
    //    await transporter.sendMail({ from, to, subject, text });
    //
    // Until wired, enquiries are logged to stdout (visible in Vercel logs):
    console.log("[contact]", {
      name:    name.trim(),
      email:   email.trim(),
      message: message.trim().slice(0, 200),
      at:      new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
