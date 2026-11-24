import { FirebaseAuthError } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/lib/admin-session";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;

function isInvalidIdTokenError(error: unknown) {
  if (!(error instanceof FirebaseAuthError)) {
    return false;
  }

  return [
    "auth/argument-error",
    "auth/id-token-expired",
    "auth/id-token-revoked",
    "auth/invalid-id-token",
    "auth/user-disabled",
    "auth/user-not-found",
  ].includes(error.code);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "La solicitud de inicio de sesión no es válida." },
      { status: 400 },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("idToken" in body) ||
    typeof body.idToken !== "string" ||
    body.idToken.length === 0
  ) {
    return NextResponse.json(
      { error: "Falta la credencial de autenticación." },
      { status: 400 },
    );
  }

  let decodedToken;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(body.idToken, true);
  } catch (error) {
    if (isInvalidIdTokenError(error)) {
      return NextResponse.json(
        { error: "La sesión de Firebase no es válida. Inicia sesión de nuevo." },
        { status: 401 },
      );
    }

    console.error("No se pudo verificar el token de Firebase.", error);
    return NextResponse.json(
      { error: "No se pudo validar el acceso. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  let userDocument;
  try {
    userDocument = await getAdminFirestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();
  } catch (error) {
    console.error("No se pudo consultar el rol del usuario.", error);
    return NextResponse.json(
      { error: "No se pudo validar el rol. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  const role = userDocument.get("role");
  if (
    !userDocument.exists ||
    userDocument.get("active") !== true ||
    (role !== "admin" && role !== "editor")
  ) {
    return NextResponse.json(
      {
        error:
          "La cuenta no tiene un rol activo autorizado. Contacta al administrador.",
      },
      { status: 403 },
    );
  }

  try {
    const sessionCookie = await getAdminAuth().createSessionCookie(
      body.idToken,
      { expiresIn: SESSION_DURATION_MS },
    );
    const response = NextResponse.json({ ok: true, role });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("No se pudo crear la sesión del panel.", error);
    return NextResponse.json(
      { error: "No se pudo crear la sesión. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
