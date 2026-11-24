import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminSession } from "@/lib/admin-session";

export const metadata = {
  title: "Panel | ChatSell",
};

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <>
      <AdminHeader session={session} />
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          BOCADITOS BY ANDREA SANCHEZ
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Panel de administración
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-600">
          {session.email ? `Sesión iniciada como ${session.email}. ` : ""}
          {session.role === "admin"
            ? "Desde aquí puedes gestionar el catálogo, los contactos y las cuentas del equipo."
            : "Desde aquí puedes mantener actualizado el catálogo de productos."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:border-orange-300"
            href="/admin/products"
          >
            <h2 className="font-semibold text-stone-900">Productos</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Agrega, edita, ordena y oculta productos del catálogo.
            </p>
          </Link>
          {session.role === "admin" ? (
            <>
              <Link
                className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:border-orange-300"
                href="/admin/leads"
              >
                <h2 className="font-semibold text-stone-900">Contactos</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Revisa las personas interesadas y marca su seguimiento.
                </p>
              </Link>
              <Link
                className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:border-orange-300"
                href="/admin/users"
              >
                <h2 className="font-semibold text-stone-900">Usuarios</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Crea cuentas y administra los permisos del equipo.
                </p>
              </Link>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
