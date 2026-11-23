import { cookies } from "next/headers";
import { PORTAIL_COOKIE, verifyPortail, type PortailSession } from "./portail-auth";

export async function getPortailSession(): Promise<PortailSession | null> {
  return verifyPortail(cookies().get(PORTAIL_COOKIE)?.value);
}
