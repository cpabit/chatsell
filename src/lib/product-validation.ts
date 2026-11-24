import { isRecord } from "@/lib/admin-api";

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  order: number;
};

export type ProductUpdate = Partial<ProductInput> & { active?: boolean };

const productFields = new Set([
  "name",
  "description",
  "price",
  "imageUrl",
  "order",
  "active",
]);

function isValidImageUrl(value: string) {
  if (value === "") {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseProductInput(value: unknown): ProductInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const { name, description, price, imageUrl, order } = value;
  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.trim().length > 120 ||
    typeof description !== "string" ||
    description.trim().length > 2000 ||
    typeof price !== "number" ||
    !Number.isSafeInteger(price) ||
    price < 1 ||
    typeof imageUrl !== "string" ||
    !isValidImageUrl(imageUrl) ||
    typeof order !== "number" ||
    !Number.isSafeInteger(order) ||
    order < 1
  ) {
    return null;
  }

  return {
    name: name.trim(),
    description: description.trim(),
    price,
    imageUrl: imageUrl.trim(),
    order,
  };
}

export function parseProductUpdate(value: unknown): ProductUpdate | null {
  if (!isRecord(value)) {
    return null;
  }

  const keys = Object.keys(value);
  if (keys.length === 0 || keys.some((key) => !productFields.has(key))) {
    return null;
  }

  const update: ProductUpdate = {};

  if ("name" in value) {
    if (
      typeof value.name !== "string" ||
      value.name.trim().length === 0 ||
      value.name.trim().length > 120
    ) {
      return null;
    }
    update.name = value.name.trim();
  }

  if ("description" in value) {
    if (
      typeof value.description !== "string" ||
      value.description.trim().length > 2000
    ) {
      return null;
    }
    update.description = value.description.trim();
  }

  if ("price" in value) {
    if (
      typeof value.price !== "number" ||
      !Number.isSafeInteger(value.price) ||
      value.price < 1
    ) {
      return null;
    }
    update.price = value.price;
  }

  if ("imageUrl" in value) {
    if (
      typeof value.imageUrl !== "string" ||
      !isValidImageUrl(value.imageUrl)
    ) {
      return null;
    }
    update.imageUrl = value.imageUrl.trim();
  }

  if ("order" in value) {
    if (
      typeof value.order !== "number" ||
      !Number.isSafeInteger(value.order) ||
      value.order < 1
    ) {
      return null;
    }
    update.order = value.order;
  }

  if ("active" in value) {
    if (typeof value.active !== "boolean") {
      return null;
    }
    update.active = value.active;
  }

  return update;
}
