import { redirect } from "next/navigation";

export default function HomePage() {
  // Por enquanto, redireciona direto pro dashboard
  // Quando o auth estiver ativo, verifica sessão primeiro
  redirect("/dashboard");
}
