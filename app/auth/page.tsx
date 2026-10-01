import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Acceso",
  description: "Inicia sesión o crea tu cuenta en Arcade Vault.",
};

export default function AuthPage() {
  return <AuthForm />;
}
