import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
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
  siteName: string;
  logoUrl: string;
  supportEmail: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  orderDate,
  totalAmount,
  orderItems,
  shippingAddress,
  siteName,
  logoUrl,
  supportEmail,
}: OrderConfirmationEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Order Confirmation - Order #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={logoUrl}
              alt={`${siteName} Logo`}
              width={150}
              style={logo}
            />
            <Heading style={h1}>Order Confirmation</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Thank you for your order! We&apos;re excited to let you know that your order #{orderNumber} has been successfully placed.
            </Text>

            <Section style={orderDetails}>
              <Heading style={h3}>Order Details</Heading>
              <Text style={text}>
                <strong>Order Date:</strong> {orderDate}
              </Text>
              <Text style={text}>
                <strong>Item(s):</strong>
              </Text>
              {orderItems.map((item, index) => (
                <Text key={index} style={itemText}>
                  • {item.name} - Quantity: {item.quantity} - ${item.price}
                </Text>
              ))}
              <Text style={text}>
                <strong>Total:</strong> ${totalAmount}
              </Text>
              <Text style={text}>
                <strong>Shipping Address:</strong>
              </Text>
              <Text style={addressText}>
                {shippingAddress.name}<br />
                {shippingAddress.address}<br />
                {shippingAddress.city}<br />
                {shippingAddress.country}
              </Text>
            </Section>

            <Text style={text}>
              We&apos;ll notify you once your order ships with tracking details.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={`${process.env.SITE_URL}/my-account/orders`}>
                View Order
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact us at{" "}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
            </Text>
            <Text style={footerText}>
              © {currentYear} {siteName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "20px",
  backgroundColor: "#f9f9f9",
  borderRadius: "5px",
};

const orderDetails = {
  margin: "20px 0",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "20px 0",
  padding: "0",
};

const h3 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "12px 0",
};

const itemText = {
  color: "#333",
  fontSize: "16px",
  margin: "4px 0 4px 20px",
};

const addressText = {
  color: "#333",
  fontSize: "16px",
  margin: "4px 0 4px 20px",
  lineHeight: "1.4",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const button = {
  backgroundColor: "#28a745",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 20px",
};

const link = {
  color: "#28a745",
  textDecoration: "none",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "20px",
};

const footerText = {
  fontSize: "12px",
  color: "#777",
  margin: "4px 0",
};

export default OrderConfirmationEmail; 