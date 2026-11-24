import { NextResponse } from "next/server";
import {
  getAdminSession,
  type AdminRole,
  type AdminSession,
} from "@/lib/admin-session";

type AuthorizationResult =
  | { authorized: true; session: AdminSession }
  | { authorized: false; response: NextResponse };

export async function authorizeAdmin(
  requiredRole?: AdminRole,
): Promise<AuthorizationResult> {
  const session = await getAdminSession();

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Debes iniciar sesión para continuar." },
        { status: 401 },
      ),
    };
  }

  if (requiredRole === "admin" && session.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "No tienes permiso para realizar esta acción." },
        { status: 403 },
      ),
    };
  }

  return { authorized: true, session };
}

export async function readJsonBody(
  request: Request,
): Promise<{ valid: true; value: unknown } | { valid: false }> {
  try {
    return { valid: true, value: await request.json() };
  } catch {
    return { valid: false };
  }
}

export function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
