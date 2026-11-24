"use client";

import { FirebaseError } from "firebase/app";
import {
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase-client";

function getLoginErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      return "El correo o la contraseña no son correctos.";
    }

    if (error.code === "auth/too-many-requests") {
      return "Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.";
    }

    if (error.code === "auth/network-request-failed") {
      return "No se pudo conectar con Firebase. Revisa tu conexión.";
    }
  }

  return error instanceof Error
    ? error.message
    : "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    let auth: Auth | undefined;
    try {
      auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        await signOut(auth);
        setErrorMessage(
          result.error ?? "No se pudo validar el acceso al panel.",
        );
        return;
      }

      await signOut(auth);
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      if (auth) {
        await signOut(auth);
      }
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-stone-700"
          htmlFor="email"
        >
          Correo electrónico
        </label>
        <input
          autoComplete="username"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-stone-700"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      {errorMessage ? (
        <p
          aria-live="polite"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        className="w-full rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Validando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
