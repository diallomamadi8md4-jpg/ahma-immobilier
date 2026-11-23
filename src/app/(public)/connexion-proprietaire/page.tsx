import { PortailLogin } from "@/components/public/portail-login";

export const metadata = { title: "Connexion propriétaire" };

export default function ConnexionProprietairePage() {
  return <PortailLogin role="proprietaire" />;
}
