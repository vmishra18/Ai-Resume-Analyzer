import { randomUUID } from "node:crypto";

import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

const SESSION_COOKIE_NAME = "resume_signal_session";
const SESSION_DURATION_DAYS = 30;

function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

function getCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  };
}

export async function createSession(userId: string) {
  const token = randomUUID();
  const expiresAt = getSessionExpiryDate();

  await db.authSession.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  return {
    token,
    expiresAt
  };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(expiresAt));
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/"
  });
}

async function getSessionToken() {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function destroyCurrentSession() {
  const token = await getSessionToken();

  if (!token) {
    return;
  }

  await db.authSession.deleteMany({
    where: { token }
  });
}

export async function getCurrentUser() {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const session = await db.authSession.findUnique({
    where: { token },
    include: {
      user: true
    }
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await db.authSession.delete({
      where: { token }
    });

    return null;
  }

  return session.user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return user;
}
