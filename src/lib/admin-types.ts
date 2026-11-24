import type { AdminRole } from "@/lib/admin-session";

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  order: number;
};

export type AdminLead = {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
};

export type AdminUser = {
  uid: string;
  email: string;
  role: AdminRole | null;
  active: boolean;
  createdAt: string;
};
