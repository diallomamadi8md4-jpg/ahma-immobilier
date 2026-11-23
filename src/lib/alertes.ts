import prisma from "@/lib/prisma";
import { appUrl, sendMail } from "@/lib/mailer";
import { criteriaLabel, criteriaToQuery, matchBien, parseCriteria, type SearchBien } from "@/lib/search";

/**
 * À appeler après la création d'un bien (ou son passage en disponible).
 * Crée une alerte par recherche correspondante et envoie un email si Resend est configuré.
 */
export async function notifyNouveauxBiens(bien: SearchBien & { id: number }): Promise<number> {
  const recherches = await prisma.rechercheSauvegardee.findMany({ where: { actif: true } });
  let count = 0;

  for (const recherche of recherches) {
    const criteres = parseCriteria(recherche.criteres);
    if (!matchBien(bien, criteres)) continue;

    const deja = await prisma.alerte.findUnique({
      where: { rechercheId_bienId: { rechercheId: recherche.id, bienId: bien.id } },
      select: { id: true },
    });
    if (deja) continue;

    await prisma.alerte.create({ data: { rechercheId: recherche.id, bienId: bien.id } });
    count++;

    if (process.env.RESEND_API_KEY) {
      const lien = `${appUrl()}/biens/${bien.id}`;
      const gestion = `${appUrl()}/alertes?token=${recherche.token}`;
      await sendMail({
        to: recherche.email,
        subject: `Nouveau bien sur Ahma Immobilier : ${bien.titre}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#17312b">
            <h2 style="color:#047857">Un nouveau bien correspond à votre recherche</h2>
            <h3>${bien.titre}</h3>
            <p>${bien.quartier} · ${bien.superficie} m²${bien.loyer ? ` · ${bien.loyer.toLocaleString("fr-FR")} FCFA/mois` : ""}</p>
            <p style="font-size:13px;color:#64748b">Recherche : ${criteriaLabel(criteres)}</p>
            <p><a href="${lien}" style="background:#047857;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;display:inline-block">Voir le bien</a></p>
            <p style="font-size:12px;color:#94a3b8">Gérer mes alertes : <a href="${gestion}">${gestion}</a><br/>
            Lien de recherche : ${appUrl()}${criteriaToQuery(criteres)}</p>
          </div>`,
      });
    }
  }

  return count;
}
