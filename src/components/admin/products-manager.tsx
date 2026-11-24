"use client";

import { useState } from "react";
import type { AdminProduct } from "@/lib/admin-types";

type ProductValues = Omit<AdminProduct, "id" | "active">;

const emptyProduct: ProductValues = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  order: 1,
};

function ProductForm({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: ProductValues;
  onSave: (values: ProductValues) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);
    try {
      const error = await onSave(values);
      if (error) {
        setErrorMessage(error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function update<K extends keyof ProductValues>(
    key: K,
    value: ProductValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(file: File | undefined) {
    if (!file) {
      return;
    }

    setErrorMessage("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/uploads/products", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        error?: string;
        url?: string;
      };

      if (!response.ok || !result.url) {
        setErrorMessage(result.error ?? "No se pudo subir la imagen.");
        return;
      }

      update("imageUrl", result.url);
    } catch {
      setErrorMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-5"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-stone-700">
          Nombre
          <input
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal"
            maxLength={120}
            onChange={(event) => update("name", event.target.value)}
            required
            value={values.name}
          />
        </label>
        <label className="text-sm font-medium text-stone-700">
          Precio (COP)
          <input
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal"
            min={1}
            onChange={(event) => update("price", Number(event.target.value))}
            required
            type="number"
            value={values.price || ""}
          />
        </label>
        <label className="text-sm font-medium text-stone-700 sm:col-span-2">
          Descripción
          <textarea
            className="mt-1.5 min-h-24 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal"
            maxLength={2000}
            onChange={(event) => update("description", event.target.value)}
            value={values.description}
          />
        </label>
        <label className="text-sm font-medium text-stone-700 sm:col-span-2">
          URL de imagen (opcional)
          <input
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal"
            onChange={(event) => update("imageUrl", event.target.value)}
            placeholder="https://..."
            type="url"
            value={values.imageUrl}
          />
        </label>
        <label className="text-sm font-medium text-stone-700 sm:col-span-2">
          O subir imagen (JPG, PNG o WebP, máximo 5 MB)
          <input
            accept="image/jpeg,image/png,image/webp"
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:font-medium file:text-orange-800"
            disabled={isUploading || isSaving}
            onChange={(event) => void uploadImage(event.target.files?.[0])}
            type="file"
          />
          {isUploading ? (
            <span className="mt-1 block text-xs text-stone-500">
              Subiendo imagen...
            </span>
          ) : null}
        </label>
        <label className="text-sm font-medium text-stone-700">
          Orden de aparición
          <input
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal"
            min={1}
            onChange={(event) => update("order", Number(event.target.value))}
            required
            type="number"
            value={values.order}
          />
        </label>
      </div>

      {errorMessage ? (
        <p aria-live="polite" className="text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-60"
          disabled={isSaving || isUploading}
          type="submit"
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
        {onCancel ? (
          <button
            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function ProductsManager({
  initialProducts,
}: {
  initialProducts: AdminProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function saveProduct(values: ProductValues, id?: string) {
    setNotice("");
    setErrorMessage("");

    try {
      const response = await fetch(
        id ? `/api/admin/products/${id}` : "/api/admin/products",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const result = (await response.json()) as {
        error?: string;
        product?: AdminProduct;
      };
      const savedProduct = result.product;

      if (!response.ok || !savedProduct) {
        return result.error ?? "No se pudo guardar el producto.";
      }

      setProducts((current) => {
        if (id) {
          return current.map((product) =>
            product.id === id ? { ...product, ...savedProduct } : product,
          );
        }
        return [...current, savedProduct].sort(
          (left, right) => left.order - right.order,
        );
      });
      setEditingId(null);
      setNotice(id ? "Producto actualizado." : "Producto creado.");
      return null;
    } catch {
      return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
    }
  }

  async function toggleActive(product: AdminProduct) {
    setErrorMessage("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(result.error ?? "No se pudo cambiar el estado.");
        return;
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, active: !item.active } : item,
        ),
      );
      setNotice(
        product.active ? "Producto ocultado del catálogo." : "Producto activado.",
      );
    } catch {
      setErrorMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Agregar producto
        </h2>
        <ProductForm
          initialValue={emptyProduct}
          onSave={(values) => saveProduct(values)}
        />
      </section>

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

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Catálogo ({products.length})
        </h2>
        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-600">
            Todavía no hay productos. Puedes agregar el primero arriba.
          </p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <article
                className="rounded-2xl border border-stone-200 bg-white p-5"
                key={product.id}
              >
                {editingId === product.id ? (
                  <ProductForm
                    initialValue={{
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      order: product.order,
                    }}
                    key={product.id}
                    onCancel={() => setEditingId(null)}
                    onSave={(values) => saveProduct(values, product.id)}
                  />
                ) : (
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-stone-900">
                          {product.name}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            product.active
                              ? "bg-green-50 text-green-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {product.active ? "Activo" : "Oculto"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">
                        {product.description || "Sin descripción"}
                      </p>
                      <p className="mt-2 text-sm font-medium text-stone-800">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(product.price)}
                        {" · Orden "}
                        {product.order}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                        onClick={() => setEditingId(product.id)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                        onClick={() => void toggleActive(product)}
                        type="button"
                      >
                        {product.active ? "Ocultar" : "Activar"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
