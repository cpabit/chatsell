import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { LeadsManager } from "@/components/admin/leads-manager";
import type { AdminLead } from "@/lib/admin-types";
import { getAdminSession } from "@/lib/admin-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const metadata = {
  title: "Contactos | ChatSell",
};

function formatCreatedAt(value: unknown) {
  if (!(value instanceof Timestamp)) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(value.toDate());
}

export default async function AdminLeadsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "admin") {
    redirect("/admin");
  }

  const snapshot = await getAdminFirestore()
    .collection("leads")
    .orderBy("createdAt", "desc")
    .get();
  const leads: AdminLead[] = snapshot.docs.map((document) => {
    const data = document.data();
    const address =
      typeof data.address === "string"
        ? data.address
        : typeof data.deliveryAddress === "string"
          ? data.deliveryAddress
          : "";

    return {
      id: document.id,
      name: typeof data.name === "string" ? data.name : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      address,
      status: typeof data.status === "string" ? data.status : "new",
      createdAt: formatCreatedAt(data.createdAt),
    };
  });

  return (
    <>
      <AdminHeader session={session} />
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          SEGUIMIENTO
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Contactos ({leads.length})
        </h1>
        <p className="mb-8 mt-3 text-stone-600">
          Los contactos se cargan al abrir esta página, sin actualizaciones
          automáticas.
        </p>
        <LeadsManager initialLeads={leads} />
      </main>
    </>
  );
}
