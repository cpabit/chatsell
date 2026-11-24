import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authorizeAdmin, readJsonBody } from "@/lib/admin-api";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { parseProductInput } from "@/lib/product-validation";

export async function POST(request: Request) {
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

  const product = parseProductInput(body.value);
  if (!product) {
    return NextResponse.json(
      { error: "Revisa nombre, descripción, precio, imagen y orden." },
      { status: 400 },
    );
  }

  const id = randomUUID();
  try {
    await getAdminFirestore()
      .collection("products")
      .doc(id)
      .create({
        ...product,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: authorization.session.uid,
      });
  } catch (error) {
    console.error("No se pudo crear el producto.", error);
    return NextResponse.json(
      { error: "No se pudo guardar el producto. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ product: { id, ...product, active: true } }, {
    status: 201,
  });
}
