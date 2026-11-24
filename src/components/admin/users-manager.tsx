"use client";

import { useState } from "react";
import type { AdminRole } from "@/lib/admin-session";
import type { AdminUser } from "@/lib/admin-types";

function UserRow({
  user,
  onUpdate,
}: {
  user: AdminUser;
  onUpdate: (uid: string, values: { role?: AdminRole; active?: boolean }) => Promise<string | null>;
}) {
  const [role, setRole] = useState<AdminRole>(user.role ?? "editor");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveRole() {
    setIsSaving(true);
    setErrorMessage("");
    setNotice("");
    const error = await onUpdate(user.uid, { role });
    if (error) {
      setErrorMessage(error);
    } else {
      setNotice("Rol actualizado.");
    }
    setIsSaving(false);
  }

  async function toggleActive() {
    setIsSaving(true);
    setErrorMessage("");
    setNotice("");
    const error = await onUpdate(user.uid, { active: !user.active });
    if (error) {
      setErrorMessage(error);
    } else {
      setNotice(user.active ? "Cuenta desactivada." : "Cuenta activada.");
    }
    setIsSaving(false);
  }

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium text-stone-900">
            {user.email || "Cuenta sin correo"}
          </p>
          <p className="mt-1 text-xs text-stone-500">UID: {user.uid}</p>
          <p className="mt-1 text-xs text-stone-500">
            Creado: {user.createdAt || "No disponible"}
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
            user.active
              ? "bg-green-50 text-green-800"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          {user.active ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-stone-700">
          Rol
          <select
            className="mt-1 block rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            onChange={(event) =>
              setRole(event.target.value === "admin" ? "admin" : "editor")
            }
            value={role}
          >
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <button
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
          disabled={isSaving}
          onClick={() => void saveRole()}
          type="button"
        >
          Guardar rol
        </button>
        <button
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
          disabled={isSaving}
          onClick={() => void toggleActive()}
          type="button"
        >
          {user.active ? "Desactivar" : "Activar"}
        </button>
      </div>
      {errorMessage ? (
        <p aria-live="polite" className="mt-3 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {notice ? (
        <p aria-live="polite" className="mt-3 text-sm text-green-800" role="status">
          {notice}
        </p>
      ) : null}
    </article>
  );
}

export function UsersManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function updateUser(
    uid: string,
    values: { role?: AdminRole; active?: boolean },
  ) {
    try {
      const response = await fetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        return result.error ?? "No se pudo actualizar el usuario.";
      }

      setUsers((current) =>
        current.map((user) =>
          user.uid === uid
            ? {
                ...user,
                ...(values.role ? { role: values.role } : {}),
                ...(typeof values.active === "boolean"
                  ? { active: values.active }
                  : {}),
              }
            : user,
        ),
      );
      return null;
    } catch {
      return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
    }
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setErrorMessage("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const result = (await response.json()) as {
        error?: string;
        user?: AdminUser;
      };
      const createdUser = result.user;

      if (!response.ok || !createdUser) {
        setErrorMessage(result.error ?? "No se pudo crear el usuario.");
        return;
      }

      setUsers((current) => [...current, createdUser]);
      setEmail("");
      setPassword("");
      setRole("editor");
      setNotice(
        "Cuenta creada. Comparte la contraseña temporal de forma segura.",
      );
    } catch {
      setErrorMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Crear cuenta del equipo
        </h2>
        <form
          className="grid gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-5 sm:grid-cols-2"
          onSubmit={createUser}
        >
          <label className="text-sm font-medium text-stone-700">
            Correo electrónico
            <input
              autoComplete="email"
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Contraseña temporal
            <input
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Rol
            <select
              className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"
              onChange={(event) =>
                setRole(event.target.value === "admin" ? "admin" : "editor")
              }
              value={role}
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              className="rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-60"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? "Creando..." : "Crear cuenta"}
            </button>
          </div>
          <p className="text-xs leading-5 text-stone-600 sm:col-span-2">
            La contraseña temporal se envía al servidor para crear la cuenta;
            acuerda un cambio de contraseña con la persona por un canal seguro.
          </p>
        </form>
        {errorMessage ? (
          <p aria-live="polite" className="mt-3 text-sm text-red-800" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {notice ? (
          <p aria-live="polite" className="mt-3 text-sm text-green-800" role="status">
            {notice}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Usuarios ({users.length})
        </h2>
        {users.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-600">
            No se encontraron cuentas del equipo.
          </p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <UserRow key={user.uid} onUpdate={updateUser} user={user} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
