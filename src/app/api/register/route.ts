import bcrypt from "bcrypt";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import { rateLimit } from "@/lib/rateLimit";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/emailService";

export async function POST(request: Request) {
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";

  // Apply rate limiting: 5 requests per minute per IP
  const limitResult = await rateLimit(clientIp);

  if (!limitResult.success) {
    throw new Error("Too many requests, please try again later");
  }

  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const formatedEmail = email.toLowerCase();

  const exist = await prisma.user.findUnique({
    where: {
      email: formatedEmail,
    },
  });

  if (exist) {
    return new NextResponse("Email already exists", { status: 400 });
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  // Function to check if an email is in the list of admin emails
  function isAdminEmail(email: string) {
    return adminEmails.includes(email);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  } = {
    name,
    email: formatedEmail,
    password: hashedPassword,
    role: UserRole.USER,
  };

  if (isAdminEmail(formatedEmail)) {
    newUser.role = UserRole.ADMIN;
  }

  try {
    const user = await prisma.user.create({
      data: {
        ...newUser,
      },
    });
    revalidateTag("users", { expire: 0 });

    // Send welcome email
    await sendWelcomeEmail({
      to: user.email!,
      username: user.name || "User",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("[REGISTER_POST]", error, "error in register");
    return new NextResponse("Internal error", { status: 500 });
  }
}
