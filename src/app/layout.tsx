import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatSell | Bocaditos By Andrea Sanchez",
  description: "La tienda conversacional de Bocaditos By Andrea Sanchez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
