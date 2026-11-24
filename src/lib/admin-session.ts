import { FirebaseAuthError } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

export const SESSION_COOKIE_NAME = "chatsell_session";
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export type AdminRole = "admin" | "editor";

export type AdminSession = {
  uid: string;
  email: string | null;
  role: AdminRole;
};

function isAdminRole(role: unknown): role is AdminRole {
  return role === "admin" || role === "editor";
}

function isInvalidSessionError(error: unknown) {
  if (!(error instanceof FirebaseAuthError)) {
    return false;
  }

  return [
    "auth/argument-error",
    "auth/invalid-session-cookie",
    "auth/session-cookie-expired",
    "auth/session-cookie-revoked",
    "auth/user-disabled",
  ].includes(error.code);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  let decodedCookie;
  try {
    decodedCookie = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
  } catch (error) {
    if (isInvalidSessionError(error)) {
      return null;
    }

    throw error;
  }

  const userDocument = await getAdminFirestore()
    .collection("users")
    .doc(decodedCookie.uid)
    .get();

  if (!userDocument.exists) {
    return null;
  }

  const role = userDocument.get("role");

  if (userDocument.get("active") !== true || !isAdminRole(role)) {
    return null;
  }

  return {
    uid: decodedCookie.uid,
    email: decodedCookie.email ?? null,
    role,
  };
}
