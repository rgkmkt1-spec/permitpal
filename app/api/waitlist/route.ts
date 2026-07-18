import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email, zip, city, projectType, projectLabel, municipality, permits, checklist, warnings } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const citySearch = encodeURIComponent((municipality || city || zip) + " building department permit office");
    const permitOfficeLink = "https://www.google.com/search?q=" + citySearch;
    const formSearch = encodeURIComponent((municipality || city || zip) + " " + projectLabel + " permit application form download");
    const formLink = "https://www.google.com/search?q=" + formSearch;

    const permitCards = permits?.map((p: any) => {
      return "<div style='background:#f5f5f5;border-radius:6px;padding:12px;margin-bottom:8px;'>" +
        "<p style='margin:0 0 4px;font-size:14px;font-weight:bold;color:#1a1a1a;'>" + p.name + "</p>" +
        "<p style='margin:0 0 6px;font-size:12px;color:#555;line-height:1.4;'>" + p.description + "</p>" +
        "<p style='margin:0;font-size:12px;color:#1C3A2F;'>Cost: " + p.typical_cost + " &nbsp;|&nbsp; " + p.typical_timeline + "</p>" +
        "</div>";
    }).join("") || "<p style='font-size:13px;color:#666;'>No permits required.</p>";

    const checklistHtml = checklist?.map((item: string) => {
      return "<li style='font-size:13px;color:#333;padding:4px 0;line-height:1.4;'>" + item + "</li>";
    }).join("") || "";

    const warningsHtml = warnings?.map((w: string) => {
      return "<div style='background:#fffbea;border-left:3px solid #e8c94a;padding:8px 10px;margin-bottom:6px;font-size:12px;color:#7a5c1e;line-height:1.4;border-radius:0 4px 4px 0;'>" + w + "</div>";
    }).join("") || "";

    const customerHtml =
      "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'></head><body style='margin:0;padding:0;background:#f0f0f0;'>" +
      "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f0f0f0;padding:16px 0;'><tr><td align='center'>" +
      "<table width='100%' style='max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;' cellpadding='0' cellspacing='0'>" +

      "<tr><td style='background:#1C3A2F;padding:20px 16px;text-align:center;'>" +
      "<p style='margin:0 0 8px;'><span style='background:#E8D5A3;color:#1C3A2F;border-radius:3px;padding:1px 6px;font-family:monospace;font-size:11px;font-weight:bold;'>PP</span><span style='color:#E8D5A3;font-size:16px;margin-left:6px;font-family:Georgia,serif;'>PermitPal</span></p>" +
      "<p style='margin:0 0 4px;color:#F7F5F0;font-size:16px;font-family:Georgia,serif;'>Your Permit Summary</p>" +
      "<p style='margin:0;color:#A8C5B5;font-size:12px;'>" + projectLabel + " &mdash; " + (municipality || zip) + "</p>" +
      "</td></tr>" +

      "<tr><td style='padding:16px;'>" +
      "<p style='margin:0 0 10px;font-size:13px;font-weight:bold;color:#1C3A2F;border-bottom:1px solid #e0e0e0;padding-bottom:6px;font-family:Arial,sans-serif;'>PERMITS YOU WILL LIKELY NEED</p>" +
      permitCards +

      (warningsHtml ? "<p style='margin:12px 0 8px;font-size:13px;font-weight:bold;color:#7a5c1e;border-bottom:1px solid #e0e0e0;padding-bottom:6px;font-family:Arial,sans-serif;'>WATCH OUT FOR THESE</p>" + warningsHtml : "") +

      (checklistHtml ? "<p style='margin:12px 0 8px;font-size:13px;font-weight:bold;color:#1C3A2F;border-bottom:1px solid #e0e0e0;padding-bottom:6px;font-family:Arial,sans-serif;'>YOUR ACTION CHECKLIST</p><ul style='margin:0 0 12px;padding-left:18px;'>" + checklistHtml + "</ul>" : "") +

      "<p style='margin:12px 0 8px;font-size:13px;font-weight:bold;color:#1C3A2F;border-bottom:1px solid #e0e0e0;padding-bottom:6px;font-family:Arial,sans-serif;'>NEXT STEPS</p>" +
      "<a href='" + permitOfficeLink + "' style='display:block;background:#1C3A2F;color:#E8D5A3;padding:12px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold;text-align:center;margin-bottom:8px;font-family:Arial,sans-serif;'>Find your local permit office</a>" +
      "<a href='" + formLink + "' style='display:block;background:#f0f5f2;color:#1C3A2F;padding:12px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold;text-align:center;margin-bottom:12px;border:1px solid #c5d9ce;font-family:Arial,sans-serif;'>Find your permit application form</a>" +

      "<p style='margin:0;background:#f5f5f5;border-radius:6px;padding:10px 12px;font-size:11px;color:#999;line-height:1.5;font-family:Arial,sans-serif;'>AI-generated guidance only. Always verify with your local building department before starting work.</p>" +
      "</td></tr>" +

      "<tr><td style='background:#1C3A2F;padding:12px 16px;text-align:center;'>" +
      "<p style='margin:0;font-size:11px;color:#A8C5B5;font-family:Arial,sans-serif;'>" +
      "<a href='https://permitpalapp.com' style='color:#A8C5B5;text-decoration:none;'>permitpalapp.com</a>" +
      " &nbsp;&bull;&nbsp; " +
      "<a href='mailto:support@permitpalapp.com' style='color:#A8C5B5;text-decoration:none;'>support@permitpalapp.com</a>" +
      "</p></td></tr>" +

      "</table></td></tr></table></body></html>";

    const notifyHtml =
      "<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;'>" +
      "<div style='background:#1C3A2F;padding:16px;border-radius:6px;margin-bottom:16px;'>" +
      "<h2 style='color:#E8D5A3;margin:0;font-size:16px;'>New PermitPal Signup</h2></div>" +
      "<p style='font-size:14px;'><strong>Email:</strong> " + email + "</p>" +
      "<p style='font-size:14px;'><strong>ZIP:</strong> " + (zip || "Not provided") + "</p>" +
      "<p style='font-size:14px;'><strong>City:</strong> " + (city || municipality || "Not provided") + "</p>" +
      "<p style='font-size:14px;'><strong>Project:</strong> " + (projectLabel || projectType || "Not provided") + "</p>" +
      "<p style='font-size:14px;'><strong>Time:</strong> " + new Date().toLocaleString() + "</p>" +
      "</div>";

    await transporter.sendMail({
      from: '"PermitPal" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: "Your " + projectLabel + " Permit Summary - " + (municipality || zip),
      html: customerHtml,
    });

    await transporter.sendMail({
      from: '"PermitPal" <' + process.env.GMAIL_USER + '>',
      to: process.env.GMAIL_USER,
      subject: "New PermitPal Signup - " + projectLabel + " in " + (municipality || zip),
      html: notifyHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}