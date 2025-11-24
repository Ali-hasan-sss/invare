"use server";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const REQUIRED_ENV_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

export async function POST(request: Request) {
  try {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.error(
        `Missing SMTP environment variables: ${missing.join(", ")}`
      );
      return NextResponse.json(
        { error: "Server email configuration is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body || {};

    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !message ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "Please provide name, email, and message" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const recipient =
      process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_USER;
    const emailSubject = subject
      ? `[Invaré Contact] ${subject}`
      : "New contact form submission";

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: recipient,
      subject: emailSubject,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${
        subject || "N/A"
      }\n\nMessage:\n${message}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
