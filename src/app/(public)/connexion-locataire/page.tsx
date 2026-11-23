import { PortailLogin } from "@/components/public/portail-login";

export const metadata = { title: "Connexion locataire" };

export default function ConnexionLocatairePage() {
  return <PortailLogin role="locataire" />;
}
