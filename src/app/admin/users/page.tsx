import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { UsersManager } from "@/components/admin/users-manager";
import type { AdminUser } from "@/lib/admin-types";
import { getAdminSession, type AdminRole } from "@/lib/admin-session";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const metadata = {
  title: "Usuarios | ChatSell",
};

function isAdminRole(value: unknown): value is AdminRole {
  return value === "admin" || value === "editor";
}

function formatCreatedAt(value: unknown) {
  if (!(value instanceof Timestamp)) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  }).format(value.toDate());
}

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "admin") {
    redirect("/admin");
  }

  const [profiles, authUsers] = await Promise.all([
    getAdminFirestore().collection("users").get(),
    getAdminAuth().listUsers(1000),
  ]);
  const profilesByUid = new Map(
    profiles.docs.map((document) => [document.id, document.data()]),
  );
  const users: AdminUser[] = authUsers.users.map((user) => {
    const profile = profilesByUid.get(user.uid);
    const role = profile?.role;

    return {
      uid: user.uid,
      email: user.email ?? "",
      role: isAdminRole(role) ? role : null,
      active: profile?.active === true && !user.disabled,
      createdAt: formatCreatedAt(profile?.createdAt),
    };
  });

  return (
    <>
      <AdminHeader session={session} />
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          EQUIPO
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Usuarios
        </h1>
        <p className="mb-8 mt-3 text-stone-600">
          Administra las cuentas, los roles y el acceso al panel.
        </p>
        <UsersManager initialUsers={users} />
      </main>
    </>
  );
}
