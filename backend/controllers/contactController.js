const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────
// @desc    Send a contact-form message to the site owner
// @route   POST /api/contact
// @access  Public
// ─────────────────────────────────────────
const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // ── Validation ───────────────────────────────
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Please fill in all fields.");
  }

  // Basic email format check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address.");
  }

  if (message.trim().length < 10) {
    res.status(400);
    throw new Error("Message must be at least 10 characters.");
  }

  // ── Transporter ──────────────────────────────
  // Guard: fail fast with a readable error instead of "Missing credentials for PLAIN"
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error(
      "[Contact] GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. " +
      "Add both variables and restart the server."
    );
    res.status(500);
    throw new Error("Email service is not configured. Please contact the site administrator.");
  }

  // Use explicit SMTP settings (port 465 + TLS) instead of service: "gmail"
  // so authentication is unambiguous and never falls back to PLAIN without credentials.
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,          // TLS from the start (required for port 465)
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // ── Mail to the owner ────────────────────────
  const ownerMail = {
    from: `"AgriLink Contact Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,          // faidakulimushi431@gmail.com
    replyTo: email,                       // reply goes directly to the sender
    subject: `[AgriLink Contact] New message from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#16a34a;padding:20px 24px">
          <h2 style="color:#fff;margin:0;font-size:18px">New Contact Form Submission</h2>
        </div>
        <div style="padding:24px;background:#fff">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:80px;vertical-align:top"><strong>Name</strong></td>
              <td style="padding:8px 0;color:#111827">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;vertical-align:top"><strong>Email</strong></td>
              <td style="padding:8px 0"><a href="mailto:${email}" style="color:#16a34a">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;vertical-align:top"><strong>Message</strong></td>
              <td style="padding:8px 0;color:#111827;white-space:pre-wrap">${message}</td>
            </tr>
          </table>
        </div>
        <div style="padding:12px 24px;background:#f9fafb;font-size:12px;color:#9ca3af">
          Sent from AgriLink Market contact form • ${new Date().toUTCString()}
        </div>
      </div>
    `,
  };

  // ── Auto-reply to the sender ─────────────────
  const autoReply = {
    from: `"AgriLink Market" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "We received your message – AgriLink Market",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#16a34a;padding:20px 24px">
          <h2 style="color:#fff;margin:0;font-size:18px">Thanks for reaching out, ${name}!</h2>
        </div>
        <div style="padding:24px;background:#fff;font-size:14px;color:#374151;line-height:1.6">
          <p>We've received your message and will get back to you as soon as possible.</p>
          <p>Here's a copy of what you sent:</p>
          <blockquote style="border-left:3px solid #16a34a;margin:16px 0;padding:8px 16px;background:#f0fdf4;color:#374151;white-space:pre-wrap">${message}</blockquote>
          <p>Best regards,<br/><strong>The AgriLink Market Team</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(ownerMail);
    await transporter.sendMail(autoReply);
  } catch (mailErr) {
    console.error("[Contact] Nodemailer error:", mailErr.message);
    res.status(502);
    throw new Error(
      "We could not send your message right now. Please try again later or email us directly at faidakulimushi431@gmail.com"
    );
  }

  res.json({ success: true, message: "Message sent successfully." });
});

module.exports = { sendContactMessage };
