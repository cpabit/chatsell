import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authorizeAdmin, isRecord, readJsonBody } from "@/lib/admin-api";
import { getAdminFirestore } from "@/lib/firebase-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeAdmin("admin");
  if (!authorization.authorized) {
    return authorization.response;
  }

  const body = await readJsonBody(request);
  if (
    !body.valid ||
    !isRecord(body.value) ||
    body.value.status !== "contacted"
  ) {
    return NextResponse.json(
      { error: "El estado de contacto no es válido." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  try {
    await getAdminFirestore()
      .collection("leads")
      .doc(id)
      .update({
        status: "contacted",
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: authorization.session.uid,
      });
  } catch (error) {
    console.error(`No se pudo actualizar el contacto ${id}.`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar el contacto. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id, status: "contacted" });
}
