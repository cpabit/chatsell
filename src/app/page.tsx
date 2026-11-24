import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-orange-100 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          CHATSELL
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Bocaditos By Andrea Sanchez
        </h1>
        <p className="mt-4 leading-7 text-stone-600">
          La base de la tienda está lista. Aquí estará Bocado para ayudarte a
          descubrir el catálogo.
        </p>
        <p className="mt-8 inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-800">
          Próximamente
        </p>
        <div className="mt-10 border-t border-stone-100 pt-5">
          <Link
            className="text-sm font-medium text-orange-800 underline-offset-4 hover:underline"
            href="/admin/login"
          >
            Acceso al equipo
          </Link>
        </div>
      </section>
    </main>
  );
}
