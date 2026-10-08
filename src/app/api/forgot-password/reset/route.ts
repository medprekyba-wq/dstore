import { getEmailLogo, getSiteName } from '@/get-api-data/seo-setting';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { prisma } from '@/lib/prismaDB';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return new NextResponse('Missing Fields', { status: 400 });
  }

  const formatedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: formatedEmail,
    },
  });

  if (!user) {
    return new NextResponse("User doesn't exist", { status: 400 });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');

  const passwordResetTokenExp = new Date();
  passwordResetTokenExp.setMinutes(passwordResetTokenExp.getMinutes() + 10);

  await prisma.user.update({
    where: {
      email: formatedEmail,
    },
    data: {
      passwordResetToken: resetToken,
      passwordResetTokenExp,
    },
  });

  const resetURL = `${process.env.SITE_URL}/reset-password/${resetToken}`;

  try {

    const logo = await getEmailLogo();
    const siteName = await getSiteName();

    await sendPasswordResetEmail({
      to: formatedEmail,
      username: user.name || "User",
      resetUrl: resetURL,
      siteName: siteName!,
      logoUrl: logo!,
      supportEmail: process.env.EMAIL_FROM || "hello.pimjo.com",
    });

    return NextResponse.json('An email has been sent to your email', {
      status: 200,
    });
  } catch (error) {
    console.log(error,'error in forgot password');
    return NextResponse.json('An error has occurred. Please try again!', {
      status: 500,
    });
  }
}
