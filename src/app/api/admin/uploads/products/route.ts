import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-api";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const authorization = await authorizeAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "La carga de imágenes todavía no está configurada en Vercel." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el archivo enviado." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Selecciona un archivo de imagen." },
      { status: 400 },
    );
  }

  const extension = allowedImageTypes.get(file.type);
  if (!extension || file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "Usa una imagen JPG, PNG o WebP de hasta 5 MB." },
      { status: 400 },
    );
  }

  try {
    const blob = await put(
      `products/${randomUUID()}.${extension}`,
      file,
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type,
      },
    );

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("No se pudo subir la imagen del producto.", error);
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
