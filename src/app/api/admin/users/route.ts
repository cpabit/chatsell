import { FirebaseAuthError } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authorizeAdmin, isRecord, readJsonBody } from "@/lib/admin-api";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import type { AdminRole } from "@/lib/admin-session";

function isAdminRole(value: unknown): value is AdminRole {
  return value === "admin" || value === "editor";
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin("admin");
  if (!authorization.authorized) {
    return authorization.response;
  }

  const body = await readJsonBody(request);
  if (!body.valid || !isRecord(body.value)) {
    return NextResponse.json(
      { error: "La solicitud no contiene datos válidos." },
      { status: 400 },
    );
  }

  const email =
    typeof body.value.email === "string"
      ? body.value.email.trim().toLowerCase()
      : "";
  const password =
    typeof body.value.password === "string" ? body.value.password : "";
  const role = body.value.role;

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8 ||
    !isAdminRole(role)
  ) {
    return NextResponse.json(
      {
        error:
          "Indica un correo válido, una contraseña temporal de al menos 8 caracteres y un rol.",
      },
      { status: 400 },
    );
  }

  let userRecord;
  try {
    userRecord = await getAdminAuth().createUser({
      email,
      password,
      emailVerified: false,
    });
  } catch (error) {
    if (
      error instanceof FirebaseAuthError &&
      error.code === "auth/email-already-exists"
    ) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 },
      );
    }

    console.error("No se pudo crear la cuenta de Firebase Authentication.", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  try {
    await getAdminFirestore()
      .collection("users")
      .doc(userRecord.uid)
      .create({
        role,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: authorization.session.uid,
      });
  } catch (error) {
    console.error("No se pudo guardar el perfil del usuario.", error);
    try {
      await getAdminAuth().deleteUser(userRecord.uid);
    } catch (cleanupError) {
      console.error(
        `No se pudo retirar la cuenta incompleta ${userRecord.uid}.`,
        cleanupError,
      );
    }
    return NextResponse.json(
      { error: "No se pudo guardar el rol del usuario. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      user: {
        uid: userRecord.uid,
        email: userRecord.email ?? email,
        role,
        active: true,
        createdAt: "",
      },
    },
    { status: 201 },
  );
}

