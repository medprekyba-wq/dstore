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

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
  siteName: string;
  logoUrl: string;
  supportEmail: string;
}

export const PasswordResetEmail = ({
  username,
  resetUrl,
  siteName,
  logoUrl,
  supportEmail,
}: PasswordResetEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={logoUrl}
              alt={`${siteName} Logo`}
              width={150}
              style={logo}
            />
            <Heading style={h1}>Reset Your Password</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              We received a request to reset your password for your {siteName} account. Click the button below to set a new password.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Text style={text}>
              This link will expire in 24 hours. If you didn&apos;t request a password reset, please ignore this email or contact us.
            </Text>
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
  backgroundColor: "#dc3545",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 20px",
};

const link = {
  color: "#dc3545",
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

export default PasswordResetEmail; 