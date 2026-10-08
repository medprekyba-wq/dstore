"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import WelcomeEmail from "@/emails/WelcomeEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import { getEmailLogo, getSiteName } from "@/get-api-data/seo-setting";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

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
  const logo = await getEmailLogo();
  const siteName = await getSiteName();

  const emailHtml = await render(
    OrderConfirmationEmail({
      orderNumber,
      customerName,
      orderDate,
      totalAmount,
      orderItems,
      shippingAddress,
      siteName: siteName!,
      logoUrl: logo!,
      supportEmail: process.env.EMAIL_FROM || "hello.pimjo.com",
    })
  );

   await transporter.sendMail({
    from: process.env.EMAIL_FROM,
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
  // Fetch site data
  const logo = await getEmailLogo();
  const siteName = await getSiteName();
  const emailHtml = await render(
    WelcomeEmail({
      username,
      verificationUrl,
      siteName: siteName!,
      logoUrl: logo!,
      supportEmail: process.env.EMAIL_FROM || "hello.pimjo.com",
    })
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset Your Password",
    html: emailHtml,
  });
}; 