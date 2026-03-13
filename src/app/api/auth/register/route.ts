import { NextResponse } from "next/server";

import { registerSchema } from "@/features/auth/lib/schemas";
import { hashPassword } from "@/features/auth/server/password";
import { createSession, setSessionCookie } from "@/features/auth/server/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Please check the highlighted fields and try again.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account already exists for that email."
        },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: parsed.data.email.toLowerCase(),
        passwordHash: hashPassword(parsed.data.password)
      }
    });

    const session = await createSession(user.id);
    const response = NextResponse.json(
      {
        redirectTo: "/analyses"
      },
      { status: 201 }
    );

    setSessionCookie(response, session.token, session.expiresAt);

    return response;
  } catch (error) {
    console.error("Failed to register user", error);

    return NextResponse.json(
      {
        message: "We couldn't create your workspace right now. Please try again."
      },
      { status: 500 }
    );
  }
}
