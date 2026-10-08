import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    /*
     * SMTP configuration
     */
    const EMAIL_SERVER_HOST = process.env.EMAIL_SERVER_HOST?.trim();
    const EMAIL_SERVER_PORT = process.env.EMAIL_SERVER_PORT?.trim();
    const EMAIL_SERVER_USER = process.env.EMAIL_SERVER_USER?.trim();
    const EMAIL_SERVER_PASSWORD = process.env.EMAIL_SERVER_PASSWORD;
    const EMAIL_FROM = process.env.EMAIL_FROM?.trim();

    if (
      !EMAIL_SERVER_HOST ||
      !EMAIL_SERVER_PORT ||
      !EMAIL_SERVER_USER ||
      !EMAIL_SERVER_PASSWORD ||
      !EMAIL_FROM
    ) {
      console.error("Contact form: SMTP configuration is incomplete.");

      return NextResponse.json(
        { message: "Email service is not configured." },
        { status: 500 }
      );
    }

    /*
     * Parse request
     */
    const body = await request.json();

    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const email = clean(body.email);
    const subject = clean(body.subject);
    const message = clean(body.message);
    const website = clean(body.website);

    /*
     * Honeypot spam protection
     */
    if (website) {
      return NextResponse.json(
        { message: "Message sent successfully." },
        { status: 200 }
      );
    }

    /*
     * Required fields
     */
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    /*
     * Length validation
     */
    if (
      firstName.length > MAX_NAME_LENGTH ||
      lastName.length > MAX_NAME_LENGTH
    ) {
      return NextResponse.json(
        { message: "Name is too long." },
        { status: 400 }
      );
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { message: "Email address is too long." },
        { status: 400 }
      );
    }

    if (subject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json(
        { message: "Subject is too long." },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { message: "Message is too long." },
        { status: 400 }
      );
    }

    /*
     * Email validation
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    /*
     * Protect against email header injection
     */
    if (
      email.includes("\r") ||
      email.includes("\n") ||
      subject.includes("\r") ||
      subject.includes("\n")
    ) {
      return NextResponse.json(
        { message: "Invalid input." },
        { status: 400 }
      );
    }

    /*
     * Validate SMTP port
     */
    const port = Number(EMAIL_SERVER_PORT);

    if (!Number.isInteger(port)) {
      console.error("Contact form: invalid SMTP port.");

      return NextResponse.json(
        { message: "Email service configuration error." },
        { status: 500 }
      );
    }

    /*
     * Create SMTP connection
     *
     * For Resend:
     * EMAIL_SERVER_USER=resend
     * EMAIL_SERVER_PASSWORD=re_xxxxx
     */
    const transporter = nodemailer.createTransport({
      host: EMAIL_SERVER_HOST,
      port,
      secure: port === 465,

      auth: {
        user: EMAIL_SERVER_USER,
        pass: EMAIL_SERVER_PASSWORD,
      },
    });

    /*
     * Escape user input before inserting into HTML
     */
    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    /*
     * Send email
     *
     * IMPORTANT:
     * EMAIL_SERVER_USER is only the SMTP username ("resend").
     * EMAIL_FROM is the actual sender email address.
     */
    await transporter.sendMail({
      from: {
        name: "DiagnoStore Contact Form",
        address: EMAIL_FROM,
      },

      /*
       * Contact form messages are delivered to the same
       * support mailbox.
       */
      to: EMAIL_FROM,

      /*
       * Clicking Reply will reply directly to the customer.
       */
      replyTo: email,

      subject: `Contact Form: ${subject}`,

      text: `
New message from DiagnoStore.com

Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:

${message}
      `.trim(),

      html: `
        <div
          style="
            font-family: Arial, Helvetica, sans-serif;
            max-width: 650px;
            margin: 0 auto;
            color: #222;
            line-height: 1.6;
          "
        >
          <h2>New message from DiagnoStore.com</h2>

          <table
            style="
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            "
          >
            <tr>
              <td
                style="
                  padding: 8px 0;
                  width: 100px;
                "
              >
                <strong>Name:</strong>
              </td>

              <td style="padding: 8px 0;">
                ${safeFirstName} ${safeLastName}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 0;">
                <strong>Email:</strong>
              </td>

              <td style="padding: 8px 0;">
                ${safeEmail}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 0;">
                <strong>Subject:</strong>
              </td>

              <td style="padding: 8px 0;">
                ${safeSubject}
              </td>
            </tr>
          </table>

          <h3>Message</h3>

          <div
            style="
              padding: 15px;
              border: 1px solid #e5e5e5;
              border-radius: 6px;
            "
          >
            ${safeMessage}
          </div>

          <p
            style="
              margin-top: 25px;
              font-size: 12px;
              color: #777;
            "
          >
            This message was submitted through the contact form on
            DiagnoStore.com.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Message sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        message:
          "We were unable to send your message. Please try again later.",
      },
      { status: 500 }
    );
  }
}