import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Acceso al equipo | ChatSell",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-sm sm:p-10">
        <Link
          className="text-sm font-semibold tracking-wide text-orange-700"
          href="/"
        >
          CHATSELL
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-900">
          Acceso al equipo
        </h1>
        <p className="mt-3 leading-6 text-stone-600">
          Ingresa con el correo y la contraseña de tu cuenta autorizada.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
