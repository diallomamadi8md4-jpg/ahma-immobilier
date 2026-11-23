import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

// Le sitemap dépend de la base : il doit être généré à la demande, pas au build.
export const dynamic = "force-dynamic";

const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const biens = await prisma.bien.findMany({ select: { id: true, createdAt: true } });
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/biens`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...["/carte", "/comparer", "/simulateur", "/estimer", "/contact", "/signalement", "/alertes"].map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...biens.map((b) => ({
      url: `${base}/biens/${b.id}`,
      lastModified: b.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
