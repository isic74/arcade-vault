import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Acceso",
  description: "Inicia sesión o crea tu cuenta en Arcade Vault.",
};

export default async function AuthPage({ searchParams }: PageProps<"/auth">) {
  const { tab } = await searchParams;
  return <AuthForm initialTab={tab === "registro" ? "up" : "in"} />;
}
