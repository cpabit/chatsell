"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase-client";

export function LogoutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });

      if (!response.ok) {
        setErrorMessage("No se pudo cerrar la sesión. Inténtalo de nuevo.");
        return;
      }

      await signOut(getFirebaseAuth());
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la sesión. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        onClick={handleLogout}
        type="button"
      >
        {isSubmitting ? "Saliendo..." : "Cerrar sesión"}
      </button>
      {errorMessage ? (
        <p aria-live="polite" className="mt-2 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
