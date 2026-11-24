import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductsManager } from "@/components/admin/products-manager";
import type { AdminProduct } from "@/lib/admin-types";
import { getAdminSession } from "@/lib/admin-session";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const metadata = {
  title: "Productos | ChatSell",
};

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const snapshot = await getAdminFirestore()
    .collection("products")
    .orderBy("active", "asc")
    .orderBy("order", "asc")
    .get();
  const products: AdminProduct[] = snapshot.docs
    .map((document) => {
      const data = document.data();
      return {
        id: document.id,
        name: typeof data.name === "string" ? data.name : "",
        description:
          typeof data.description === "string" ? data.description : "",
        price: typeof data.price === "number" ? data.price : 0,
        imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
        active: data.active === true,
        order: typeof data.order === "number" ? data.order : 1,
      };
    })
    .sort(
      (left, right) =>
        Number(right.active) - Number(left.active) ||
        left.order - right.order,
    );

  return (
    <>
      <AdminHeader session={session} />
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          CATÁLOGO
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Productos
        </h1>
        <p className="mb-8 mt-3 text-stone-600">
          Los productos ocultos se conservan y pueden volver a activarse.
        </p>
        <ProductsManager initialProducts={products} />
      </main>
    </>
  );
}
