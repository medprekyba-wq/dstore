"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render";

import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import WelcomeEmail from "@/emails/WelcomeEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import {
  getEmailLogo,
  getSiteName,
} from "@/get-api-data/seo-setting";

function getEmailConfig() {
  const host = process.env.EMAIL_SERVER_HOST?.trim();
  const port = Number(process.env.EMAIL_SERVER_PORT || "587");
  const user = process.env.EMAIL_SERVER_USER?.trim();
  const password = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM?.trim();

  if (!host || !user || !password || !from) {
    throw new Error(
      "Missing email configuration. Check EMAIL_SERVER_HOST, " +
        "EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, and EMAIL_FROM."
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("EMAIL_SERVER_PORT is invalid.");
  }

  return {
    host,
    port,
    user,
    password,
    from,
  };
}

function getSupportEmail(from: string) {
  // Supports EMAIL_FROM="Store Name <orders@example.com>".
  const match = from.match(/<([^>]+)>/);

  return process.env.EMAIL_SUPPORT?.trim() || match?.[1] || from;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const config = getEmailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,

    // Port 465 requires TLS immediately.
    // Port 587 upgrades the connection using STARTTLS.
    secure: config.port === 465,
    requireTLS: config.port === 587,

    auth: {
      user: config.user,
      pass: config.password,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    dnsTimeout: 10000,
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    const smtpError = error as {
      code?: string;
      command?: string;
      responseCode?: number;
    };

    console.error("SMTP email delivery failed:", {
      code: smtpError.code,
      command: smtpError.command,
      responseCode: smtpError.responseCode,
    });

    // Let the caller handle the failure.
    throw error;
  } finally {
    transporter.close();
  }
}

export const sendOrderConfirmationEmail = async ({
  to,
  orderNumber,
  customerName,
  orderDate,
  totalAmount,
  orderItems,
  shippingAddress,
}: {
  to: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  orderItems: {
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
}) => {
  const config = getEmailConfig();

  const [logo, siteName] = await Promise.all([
    getEmailLogo(),
    getSiteName(),
  ]);

  const emailHtml = await render(
    OrderConfirmationEmail({
      orderNumber,
      customerName,
      orderDate,
      totalAmount,
      orderItems,
      shippingAddress,
      siteName: siteName || "Your Store",
      logoUrl: logo || "",
      supportEmail: getSupportEmail(config.from),
    })
  );

  await sendEmail({
    to,
    subject: `Order Confirmation - Order #${orderNumber}`,
    html: emailHtml,
  });
};

export const sendWelcomeEmail = async ({
  to,
  username,
  verificationUrl,
}: {
  to: string;
  username: string;
  verificationUrl?: string;
}) => {
  const config = getEmailConfig();

  const [logo, siteName] = await Promise.all([
    getEmailLogo(),
    getSiteName(),
  ]);

  const emailHtml = await render(
    WelcomeEmail({
      username,
      verificationUrl,
      siteName: siteName || "Your Store",
      logoUrl: logo || "",
      supportEmail: getSupportEmail(config.from),
    })
  );

  await sendEmail({
    to,
    subject: `Welcome to ${siteName || "Your Store"}!`,
    html: emailHtml,
  });
};

export const sendPasswordResetEmail = async ({
  to,
  username,
  resetUrl,
  siteName,
  logoUrl,
  supportEmail,
}: {
  to: string;
  username: string;
  resetUrl: string;
  siteName: string;
  logoUrl: string;
  supportEmail: string;
}) => {
  const emailHtml = await render(
    PasswordResetEmail({
      username,
      resetUrl,
      siteName,
      logoUrl,
      supportEmail,
    })
  );

  await sendEmail({
    to,
    subject: "Reset Your Password",
    html: emailHtml,
  });
};
export const sendAdminPaymentConfirmationEmail = async ({
  orderNumber,
  totalAmount,
  currency,
  paymentIntentId,
}: {
  orderNumber: string;
  totalAmount: number;
  currency: string;
  paymentIntentId: string;
}) => {
  const to = process.env.EMAIL_ADMIN?.trim();

  if (!to) {
    throw new Error("EMAIL_ADMIN is not configured.");
  }

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(totalAmount);

  await sendEmail({
    to,
    subject: `Payment confirmed - Order #${orderNumber}`,
    html: `
      <h2>Order payment confirmed</h2>
      <p>Stripe has confirmed payment and the order is marked paid.</p>
      <table cellpadding="8" cellspacing="0" border="1">
        <tr>
          <th align="left">Order number</th>
          <td>${escapeHtml(orderNumber)}</td>
        </tr>
        <tr>
          <th align="left">Payment status</th>
          <td>Paid</td>
        </tr>
        <tr>
          <th align="left">Total paid</th>
          <td>${escapeHtml(formattedAmount)}</td>
        </tr>
        <tr>
          <th align="left">Stripe payment reference</th>
          <td>${escapeHtml(paymentIntentId)}</td>
        </tr>
      </table>
    `,
  });
};