import { NextResponse } from "next/server";

import { loginSchema } from "@/features/auth/lib/schemas";
import { verifyPassword } from "@/features/auth/server/password";
import { createSession, setSessionCookie } from "@/features/auth/server/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Please check your email and password.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return NextResponse.json(
        {
          message: "We couldn't find an account matching those details."
        },
        { status: 401 }
      );
    }

    const session = await createSession(user.id);
    const response = NextResponse.json(
      {
        redirectTo: "/analyses"
      },
      { status: 200 }
    );

    setSessionCookie(response, session.token, session.expiresAt);

    return response;
  } catch (error) {
    console.error("Failed to sign in user", error);

    return NextResponse.json(
      {
        message: "We couldn't sign you in right now. Please try again."
      },
      { status: 500 }
    );
  }
}
