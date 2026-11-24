import { FirebaseAuthError } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authorizeAdmin, isRecord, readJsonBody } from "@/lib/admin-api";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import type { AdminRole } from "@/lib/admin-session";

type RouteContext = { params: Promise<{ uid: string }> };

function isAdminRole(value: unknown): value is AdminRole {
  return value === "admin" || value === "editor";
}

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeAdmin("admin");
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { uid } = await context.params;
  if (uid === authorization.session.uid) {
    return NextResponse.json(
      { error: "No puedes cambiar tu propio rol ni desactivar tu cuenta." },
      { status: 400 },
    );
  }

  const body = await readJsonBody(request);
  if (!body.valid || !isRecord(body.value)) {
    return NextResponse.json(
      { error: "La solicitud no contiene datos válidos." },
      { status: 400 },
    );
  }

  const keys = Object.keys(body.value);
  const hasRole = "role" in body.value;
  const hasActive = "active" in body.value;
  if (
    keys.length === 0 ||
    keys.some((key) => key !== "role" && key !== "active") ||
    (!hasRole && !hasActive) ||
    (hasRole && !isAdminRole(body.value.role)) ||
    (hasActive && typeof body.value.active !== "boolean")
  ) {
    return NextResponse.json(
      { error: "El rol o el estado indicados no son válidos." },
      { status: 400 },
    );
  }

  const profileRef = getAdminFirestore().collection("users").doc(uid);
  const profileUpdate: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: authorization.session.uid,
  };
  if (hasRole) {
    profileUpdate.role = body.value.role;
  }
  if (hasActive) {
    profileUpdate.active = body.value.active;
  }

  try {
    const auth = getAdminAuth();
    await auth.getUser(uid);

    if (body.value.active === false) {
      await profileRef.set(profileUpdate, { merge: true });
      await auth.updateUser(uid, { disabled: true });
      await auth.revokeRefreshTokens(uid);
    } else if (body.value.active === true) {
      await auth.updateUser(uid, { disabled: false });
      await profileRef.set(profileUpdate, { merge: true });
    } else {
      await profileRef.set(profileUpdate, { merge: true });
    }
  } catch (error) {
    if (
      error instanceof FirebaseAuthError &&
      error.code === "auth/user-not-found"
    ) {
      return NextResponse.json(
        { error: "No se encontró la cuenta de autenticación." },
        { status: 404 },
      );
    }

    console.error(`No se pudo actualizar el usuario ${uid}.`, error);
    return NextResponse.json(
      {
        error:
          body.value.active === false
            ? "El rol quedó bloqueado, pero no se pudo completar la desactivación."
            : "No se pudo actualizar el usuario. Inténtalo de nuevo.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ uid, ...body.value });
}
