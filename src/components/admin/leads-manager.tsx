"use client";

import { useState } from "react";
import type { AdminLead } from "@/lib/admin-types";

export function LeadsManager({ initialLeads }: { initialLeads: AdminLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  async function markContacted(lead: AdminLead) {
    setErrorMessage("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(result.error ?? "No se pudo actualizar el contacto.");
        return;
      }

      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id ? { ...item, status: "contacted" } : item,
        ),
      );
      setNotice("Contacto marcado como atendido.");
    } catch {
      setErrorMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="space-y-4">
      {notice ? (
        <p aria-live="polite" className="text-sm text-green-800" role="status">
          {notice}
        </p>
      ) : null}
      {errorMessage ? (
        <p aria-live="polite" className="text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {leads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-600">
          Aún no hay contactos registrados.
        </p>
      ) : (
        leads.map((lead) => (
          <article
            className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center"
            key={lead.id}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-stone-900">
                  {lead.name || "Sin nombre"}
                </h2>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">
                  {lead.status === "contacted" ? "Atendido" : lead.status || "Nuevo"}
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-700">
                Teléfono: {lead.phone || "No indicado"}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Entrega: {lead.address || "No indicada"}
              </p>
              <p className="mt-2 text-xs text-stone-500">
                {lead.createdAt || "Fecha no disponible"}
              </p>
            </div>
            {lead.status !== "contacted" ? (
              <button
                className="rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-800"
                onClick={() => void markContacted(lead)}
                type="button"
              >
                Marcar atendido
              </button>
            ) : null}
          </article>
        ))
      )}
    </div>
  );
}
