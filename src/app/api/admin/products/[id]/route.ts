import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authorizeAdmin, readJsonBody } from "@/lib/admin-api";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { parseProductUpdate } from "@/lib/product-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }

  const body = await readJsonBody(request);
  if (!body.valid) {
    return NextResponse.json(
      { error: "La solicitud no contiene datos JSON válidos." },
      { status: 400 },
    );
  }

  const update = parseProductUpdate(body.value);
  if (!update) {
    return NextResponse.json(
      { error: "Los datos del producto no son válidos." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  try {
    await getAdminFirestore()
      .collection("products")
      .doc(id)
      .update({
        ...update,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: authorization.session.uid,
      });
  } catch (error) {
    console.error(`No se pudo actualizar el producto ${id}.`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ product: { id, ...update } });
}
