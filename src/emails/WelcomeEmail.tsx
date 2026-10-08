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

interface WelcomeEmailProps {
  username: string;
  verificationUrl?: string;
  siteName: string;
  logoUrl: string;
  supportEmail: string;
}

export const WelcomeEmail = ({
  username,
  verificationUrl,
  siteName,
  logoUrl,
  supportEmail,
}: WelcomeEmailProps) => {
  const currentYear = new Date().getFullYear();
  return (
    <Html>
      <Head />
      <Preview>Welcome to {siteName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={logoUrl}
              alt={`${siteName} Logo`}
              width={150}
              style={logo}
            />
            <Heading style={h1}>Welcome to {siteName}!</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              Welcome to {siteName}! Your account has been successfully created, and you&apos;re now part of our community.
            </Text>
            <Text style={text}>
              Explore our wide range of products, enjoy exclusive offers, and track your orders with ease.
            </Text>

            {verificationUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={verificationUrl}>
                  Verify Email Address
                </Button>
                <Text style={text}>
                  If the button above doesn&apos;t work, you can also copy and paste this link into your browser:
                </Text>
                <Link href={verificationUrl} style={link}>
                  {verificationUrl}
                </Link>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={`${process.env.SITE_URL}/shop`}>
                Start Shopping
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

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "20px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "12px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const button = {
  backgroundColor: "#007bff",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 20px",
};

const link = {
  color: "#007bff",
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

export default WelcomeEmail; 