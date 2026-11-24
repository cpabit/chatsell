import Link from "next/link";
import type { AdminSession } from "@/lib/admin-session";
import { LogoutButton } from "@/components/admin/logout-button";

export function AdminHeader({ session }: { session: AdminSession }) {
  return (
    <header className="border-b border-orange-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
          <Link
            className="text-sm font-bold tracking-wide text-orange-800"
            href="/admin"
          >
            CHATSELL
          </Link>
          <nav aria-label="Administración" className="flex flex-wrap gap-4">
            <Link
              className="text-sm text-stone-700 hover:text-orange-800"
              href="/admin/products"
            >
              Productos
            </Link>
            {session.role === "admin" ? (
              <>
                <Link
                  className="text-sm text-stone-700 hover:text-orange-800"
                  href="/admin/leads"
                >
                  Contactos
                </Link>
                <Link
                  className="text-sm text-stone-700 hover:text-orange-800"
                  href="/admin/users"
                >
                  Usuarios
                </Link>
              </>
            ) : null}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-stone-600">
            {session.email ?? "Equipo"} ·{" "}
            {session.role === "admin" ? "Administrador" : "Editor"}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
