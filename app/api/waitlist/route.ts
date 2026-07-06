import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, zip, projectType } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Send notification email to you
    await resend.emails.send({
      from: "PermitPal <onboarding@resend.dev>",
      to: "rgkmkt1@gmail.com",
      subject: "New PermitPal Waitlist Signup!",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <div style="background: #1C3A2F; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #E8D5A3; margin: 0; font-family: Georgia, serif;">New Waitlist Signup 🎉</h2>
          </div>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>ZIP Code:</strong> ${zip || "Not provided"}</p>
          <p><strong>Project Type:</strong> ${projectType || "Not provided"}</p>
          <p><strong>Signed up:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #E8E4DC; margin: 20px 0;" />
          <p style="color: #6B6B6B; font-size: 13px;">This notification was sent from PermitPal waitlist.</p>
        </div>
      `,
    });

    // Send confirmation email to the customer
    await resend.emails.send({
      from: "PermitPal <onboarding@resend.dev>",
      to: email,
      subject: "You're on the PermitPal waitlist!",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <div style="background: #1C3A2F; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #E8D5A3; margin: 0; font-family: Georgia, serif;">You're on the list! 🎉</h2>
          </div>
          <p>Thanks for joining the PermitPal waitlist. We'll notify you as soon as new features are ready.</p>
          <p>In the meantime, your free permit report is waiting for you:</p>
          <a href="https://permitpalapp.com" style="display: inline-block; background: #1C3A2F; color: #E8D5A3; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">Generate Your Permit Report →</a>
          <hr style="border: 1px solid #E8E4DC; margin: 20px 0;" />
          <p style="color: #6B6B6B; font-size: 13px;">PermitPal · permitpalapp.com · support@permitpalapp.com</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}