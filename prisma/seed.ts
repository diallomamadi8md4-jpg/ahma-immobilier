import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@ahma-immobilier.ci";
const ADMIN_PASSWORD = "Ahma@Gestion2026!";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type ProprietaireSeed = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typePersonne: string;
  societe?: string;
  adresse: string;
  typePiece: string;
  numeroPiece: string;
};

type BienSeed = {
  titre: string;
  type: string;
  statut: string;
  quartier: string;
  adresse: string;
  superficie: number;
  nbChambres?: number;
  nbSallesDeBain?: number;
  etage?: number;
  description: string;
  loyer?: number;
  prixVente?: number;
  caution?: number;
  equipements: string[];
  accent: string;
  proprio: number;
};

type LocataireSeed = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  profession: string;
  typePiece: string;
  numeroPiece: string;
};

async function main() {
  console.log("🔄 Réinitialisation des données...");

  await prisma.paiement.deleteMany();
  await prisma.contrat.deleteMany();
  await prisma.bien.deleteMany();
  await prisma.locataire.deleteMany();
  await prisma.proprietaire.deleteMany();
  await prisma.admin.deleteMany();

  // ---- Admin ----
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.create({
    data: { email: ADMIN_EMAIL, nom: "Aïcha Hma", poste: "Directrice de l'agence", passwordHash },
  });
  console.log(`✅ Admin créé : ${ADMIN_EMAIL}`);

  // ---- Propriétaires ----
  const proprioData: ProprietaireSeed[] = [
    { nom: "Kouassi", prenom: "Yves", email: "y.kouassi@gmail.com", telephone: "+225 07 08 12 34 56", typePersonne: "physique", adresse: "Cocody Riviera 2, Abidjan", typePiece: "CNI", numeroPiece: "CI225019874" },
    { nom: "Diallo", prenom: "Aminata", email: "a.diallo@outlook.com", telephone: "+225 05 64 78 90 12", typePersonne: "physique", adresse: "Marcory Zone 4, Abidjan", typePiece: "CNI", numeroPiece: "CI110873654" },
    { nom: "SCI Angré Invest", prenom: "", email: "contact@angre-invest.ci", telephone: "+225 27 22 44 88 90", typePersonne: "morale", societe: "SCI Angré Invest SARL", adresse: "Cocody Angré, Abidjan", typePiece: "RCCM", numeroPiece: "CI-ABJ-2018-B-12345" },
    { nom: "Touré", prenom: "Mamadou", email: "m.toure@yahoo.fr", telephone: "+225 01 02 33 44 55", typePersonne: "physique", adresse: "Bingerville, Abidjan", typePiece: "Passeport", numeroPiece: "PP0198774" },
  ];
  const proprietaires: Awaited<ReturnType<typeof prisma.proprietaire.create>>[] = [];
  for (const d of proprioData) {
    proprietaires.push(await prisma.proprietaire.create({ data: d }));
  }
  console.log(`✅ ${proprietaires.length} propriétaires créés`);

  // ---- Biens ----
  const bienData: BienSeed[] = [
    {
      titre: "Villa moderne avec piscine",
      type: "villa", statut: "loue", quartier: "Cocody Riviera Golf 3", adresse: "Rue des Jardins, Cocody",
      superficie: 350, nbChambres: 5, nbSallesDeBain: 4,
      description: "Villa contemporaine de standing avec piscine, jardin paysager et finitions haut de gamme. Idéale pour une famille expatriée.",
      loyer: 1800000, caution: 3600000,
      equipements: ["Piscine", "Jardin", "Climatisation", "Garage 2 voitures", "Alarme", "eau chaude", "Groupe électrogène"],
      accent: "emerald", proprio: 0,
    },
    {
      titre: "Appartement haut standing meublé",
      type: "appartement", statut: "loue", quartier: "Cocody Ambassades", adresse: "Boulevard Latrille, Cocody",
      superficie: 140, nbChambres: 3, nbSallesDeBain: 2, etage: 3,
      description: "Appartement meublé de qualité dans une résidence sécurisée avec ascenseur, proche des ambassades.",
      loyer: 900000, caution: 1800000,
      equipements: ["Meublé", "Ascenseur", "Gardien 24/7", "Climatisation", "Parking", "Wi-Fi"],
      accent: "teal", proprio: 0,
    },
    {
      titre: "Plateau bureau open space",
      type: "bureau", statut: "loue", quartier: "Le Plateau", adresse: "Avenue Chardy, Plateau",
      superficie: 220, etage: 6,
      description: "Plateau de bureaux traversant et lumineux au cœur du Plateau, idéal pour PME ou start-up.",
      loyer: 2500000, caution: 5000000,
      equipements: ["Open space", "Parking", "Ascenseur", "Climatisé", "Fibre optique", "Salle de réunion"],
      accent: "sky", proprio: 1,
    },
    {
      titre: "Villa de maître avec grand terrain",
      type: "villa", statut: "reserve", quartier: "Bingerville", adresse: "Route de Bingerville",
      superficie: 500, nbChambres: 6, nbSallesDeBain: 5,
      description: "Villa spacieuse sur un grand terrain arboré, calme absolu à 15 min d'Abidjan.",
      loyer: 2500000, caution: 5000000,
      equipements: ["Piscine", "Grand jardin", "Garage", "Dépendance", "Climatisation", "Puits"],
      accent: "violet", proprio: 3,
    },
    {
      titre: "Appartement confortable Zone 4",
      type: "appartement", statut: "loue", quartier: "Marcory Zone 4", adresse: "Rue du Canal, Marcory",
      superficie: 95, nbChambres: 2, nbSallesDeBain: 1, etage: 2,
      description: "Appartement fonctionnel proche des commerces et restaurants de la Zone 4.",
      loyer: 650000, caution: 1300000,
      equipements: ["Balcon", "Climatisation", "Parking", "Gardien", "Eau courante"],
      accent: "gold", proprio: 1,
    },
    {
      titre: "Terrain viabilisé 600 m²",
      type: "terrain", statut: "disponible", quartier: "Cocody Angré", adresse: "Angré 8e Tranche",
      superficie: 600,
      description: "Terrain plat et viabilisé (eau, électricité, voirie), titre foncier en règle. Excellent pour construction résidentielle.",
      prixVente: 65000000,
      equipements: ["Titre foncier", "Viabilisé", "Plat", "Clôturé"],
      accent: "amber", proprio: 2,
    },
    {
      titre: "Local commercial sur axe passant",
      type: "commerce", statut: "maintenance", quartier: "Treichville", adresse: "Avenue 13, Treichville",
      superficie: 80,
      description: "Local commercial en rez-de-chaussée sur axe très passant, vitrine double exposition. Travaux de rafraîchissement en cours.",
      loyer: 1200000, caution: 2400000,
      equipements: ["Vitrine", "Réserve", "Sanitaires", "Cour arrière"],
      accent: "rose", proprio: 1,
    },
    {
      titre: "Appartement meublé Plateau",
      type: "appartement", statut: "loue", quartier: "Le Plateau", adresse: "Rue des Banques, Plateau",
      superficie: 110, nbChambres: 2, nbSallesDeBain: 2, etage: 5,
      description: "Bel appartement meublé moderne avec vue dégagée, parfait pour cadre supérieur.",
      loyer: 1100000, caution: 2200000,
      equipements: ["Meublé", "Vue dégagée", "Ascenseur", "Climatisation", "Parking", "Gardien"],
      accent: "cyan", proprio: 0,
    },
    {
      titre: "Villa familiale Yopougon",
      type: "villa", statut: "disponible", quartier: "Yopougon", adresse: "Quartier Selmer, Yopougon",
      superficie: 200, nbChambres: 4, nbSallesDeBain: 3,
      description: "Villa familiale spacieuse dans un quartier calme, proche des écoles. Disponible à la relocation.",
      loyer: 750000, caution: 1500000,
      equipements: ["Jardin", "Garage", "Climatisation", "Eau courante", "Clôturé"],
      accent: "emerald", proprio: 3,
    },
    {
      titre: "Plateau bureau lumineux Marcory",
      type: "bureau", statut: "loue", quartier: "Marcory", adresse: "Boulevard Valery Giscard d'Estaing",
      superficie: 150, etage: 4,
      description: "Plateau de bureaux moderne entièrement climatisé, proche des grandes entreprises.",
      loyer: 1800000, caution: 3600000,
      equipements: ["Open space", "Ascenseur", "Climatisé", "Parking", "Salle de pause"],
      accent: "sky", proprio: 1,
    },
    {
      titre: "Terrain 800 m² Grand-Bassam",
      type: "terrain", statut: "disponible", quartier: "Grand-Bassam", adresse: "Quartier France, Grand-Bassam",
      superficie: 800,
      description: "Terrain à 5 min du littoral, idéal pour résidence secondaire ou investissement locatif. Titre foncier disponible.",
      prixVente: 38000000,
      equipements: ["Titre foncier", "Viabilisé", "Proche littoral"],
      accent: "amber", proprio: 2,
    },
  ];

  // Visuels de démonstration (photos libres de droits, stockées localement)
  const PHOTOS: Record<string, string[]> = {
    "Villa moderne avec piscine": ["/images/properties/villa-moderne.webp", "/images/properties/villa-piscine.webp", "/images/properties/interieur-cuisine.webp"],
    "Appartement haut standing meublé": ["/images/properties/interieur-appartement.webp", "/images/properties/interieur-sejour.webp", "/images/properties/interieur-clair.webp"],
    "Plateau bureau open space": ["/images/properties/bureau-studio.webp", "/images/properties/bureau-immeuble.webp", "/images/properties/bureau-open.webp"],
    "Villa de maître avec grand terrain": ["/images/properties/villa-jardin.webp", "/images/properties/villa-exterieur.webp", "/images/properties/interieur-moderne.webp"],
    "Appartement confortable Zone 4": ["/images/properties/interieur-elegant.webp", "/images/properties/interieur-sdb.webp", "/images/properties/interieur-clair.webp"],
    "Terrain viabilisé 600 m²": ["/images/properties/terrain-vert.webp", "/images/properties/terrain-paysage.webp"],
    "Local commercial sur axe passant": ["/images/properties/commerce-vitrine.webp", "/images/properties/bureau-reunion.webp"],
    "Appartement meublé Plateau": ["/images/properties/interieur-moderne.webp", "/images/properties/interieur-cuisine.webp", "/images/properties/interieur-appartement.webp"],
    "Villa familiale Yopougon": ["/images/properties/villa-famille.webp", "/images/properties/villa-prestige.webp", "/images/properties/interieur-sejour.webp"],
    "Plateau bureau lumineux Marcory": ["/images/properties/bureau-open.webp", "/images/properties/bureau-reunion.webp", "/images/properties/bureau-studio.webp"],
    "Terrain 800 m² Grand-Bassam": ["/images/properties/terrain-paysage.webp", "/images/properties/terrain-vert.webp"],
    "Villa Traditionnel": ["/images/properties/villa-luxe.webp", "/images/properties/villa-contemporaine.webp", "/images/properties/interieur-elegant.webp"],
  };

  const biens: Awaited<ReturnType<typeof prisma.bien.create>>[] = [];
  for (const d of bienData) {
    const { proprio, ...rest } = d;
    biens.push(
      await prisma.bien.create({
        data: {
          ...rest,
          equipements: JSON.stringify(d.equipements),
          photos: JSON.stringify(PHOTOS[d.titre] ?? []),
          proprietaireId: proprietaires[proprio].id,
        },
      })
    );
  }
  console.log(`✅ ${biens.length} biens créés`);

  // ---- Locataires ----
  const locData: LocataireSeed[] = [
    { nom: "Brou", prenom: "Koffi", email: "k.brou@gmail.com", telephone: "+225 07 11 22 33 44", adresse: "Cocody, Abidjan", profession: "Cadre bancaire", typePiece: "CNI", numeroPiece: "CI225099663" },
    { nom: "N'Guessan", prenom: "Awa", email: "a.nguessan@hotmail.com", telephone: "+225 05 77 88 99 00", adresse: "Marcory, Abidjan", profession: "Pharmacienne", typePiece: "CNI", numeroPiece: "CI118822334" },
    { nom: "Sangaré", prenom: "Ibrahim", email: "i.sangare@outlook.com", telephone: "+225 01 55 66 77 88", adresse: "Plateau, Abidjan", profession: "Directeur technique", typePiece: "Passeport", numeroPiece: "PP0221144" },
    { nom: "Koné", prenom: "Fatou", email: "f.kone@gmail.com", telephone: "+225 07 44 55 66 11", adresse: "Yopougon, Abidjan", profession: "Comptable", typePiece: "CNI", numeroPiece: "CI220411998" },
    { nom: "Yéo", prenom: "Adama", email: "a.yeo@yahoo.fr", telephone: "+225 05 33 22 11 00", adresse: "Treichville, Abidjan", profession: "Commerçant", typePiece: "CNI", numeroPiece: "CI119933002" },
    { nom: "Diabaté", prenom: "Mariam", email: "m.diabate@gmail.com", telephone: "+225 01 09 08 07 06", adresse: "Bingerville, Abidjan", profession: "Architecte", typePiece: "CNI", numeroPiece: "CI223311456" },
  ];
  const locataires: Awaited<ReturnType<typeof prisma.locataire.create>>[] = [];
  for (const d of locData) {
    locataires.push(await prisma.locataire.create({ data: d }));
  }
  console.log(`✅ ${locataires.length} locataires créés`);

  // ---- Contrats ----
  const now = new Date();
  const monthsAgo = (m: number, day = 1) => new Date(now.getFullYear(), now.getMonth() - m, day);
  const monthsAhead = (m: number, day = 1) => new Date(now.getFullYear(), now.getMonth() + m, day);

  type ContratSeed = {
    bien: number; loc: number; debut: Date; fin: Date; loyer: number; caution: number;
    statut: string; notes?: string;
  };
  const contratData: ContratSeed[] = [
    { bien: 0, loc: 0, debut: monthsAgo(8, 1), fin: monthsAhead(4, 1), loyer: 1800000, caution: 3600000, statut: "actif", notes: "Bail résidentiel, famille expatriée." },
    { bien: 1, loc: 1, debut: monthsAgo(10, 1), fin: monthsAhead(0, 28), loyer: 900000, caution: 1800000, statut: "actif", notes: "Renouvellement à prévoir prochainement." },
    { bien: 2, loc: 2, debut: monthsAgo(6, 1), fin: monthsAhead(6, 1), loyer: 2500000, caution: 5000000, statut: "actif", notes: "Bail commercial PME." },
    { bien: 4, loc: 3, debut: monthsAgo(12, 1), fin: monthsAhead(0, 15), loyer: 650000, caution: 1300000, statut: "actif", notes: "Échéance proche — contacter pour renouvellement." },
    { bien: 7, loc: 4, debut: monthsAgo(3, 1), fin: monthsAhead(9, 1), loyer: 1100000, caution: 2200000, statut: "actif" },
    { bien: 8, loc: 5, debut: monthsAgo(14, 1), fin: monthsAgo(2, 1), loyer: 750000, caution: 1500000, statut: "expire", notes: "Contrat arrivé à échéance, bien disponible." },
    { bien: 3, loc: 0, debut: monthsAhead(1, 1), fin: monthsAhead(13, 1), loyer: 2500000, caution: 5000000, statut: "a_venir", notes: "Entrée des lieux le mois prochain." },
    { bien: 9, loc: 2, debut: monthsAgo(2, 1), fin: monthsAhead(10, 1), loyer: 1800000, caution: 3600000, statut: "actif" },
  ];

  const contrats: Awaited<ReturnType<typeof prisma.contrat.create>>[] = [];
  for (const d of contratData) {
    const { bien, loc } = d;
    contrats.push(
      await prisma.contrat.create({
        data: {
          dateDebut: d.debut,
          dateFin: d.fin,
          loyerMensuel: d.loyer,
          caution: d.caution,
          statut: d.statut,
          notes: d.notes,
          bienId: biens[bien].id,
          locataireId: locataires[loc].id,
        },
      })
    );
  }
  console.log(`✅ ${contrats.length} contrats créés`);

  // ---- Paiements (échéancier sur 12 mois) ----
  const methodes = ["especes", "virement", "mobile_money"];
  let pCount = 0;
  for (let ci = 0; ci < contrats.length; ci++) {
    const c = contrats[ci];
    for (let i = 0; i <= 11; i++) {
      const md = new Date(now.getFullYear(), now.getMonth() - i, 5);
      // Ne générer que sur la période du contrat
      if (md < new Date(c.dateDebut) || md > new Date(c.dateFin)) continue;

      let statut: "paye" | "en_attente" | "retard" = "paye";
      // Créer quelques impayés réaliste
      if (i === 0 && (ci === 1 || ci === 3 || ci === 7)) statut = "en_attente";
      if (i === 1 && (ci === 3 || ci === 4)) statut = "retard";
      if (i === 2 && ci === 3) statut = "retard";

      const methode = methodes[(ci + i) % methodes.length];
      const mk = monthKey(md);
      const ref = `AHM-${mk.replace("-", "")}-${String(c.id).padStart(3, "0")}-${String(i).padStart(2, "0")}`;

      await prisma.paiement.create({
        data: {
          contratId: c.id,
          locataireId: c.locataireId,
          bienId: c.bienId,
          montant: c.loyerMensuel,
          datePaiement: md,
          moisConcerne: mk,
          methode,
          statut,
          reference: ref,
        },
      });
      pCount++;
    }
  }
  console.log(`✅ ${pCount} paiements générés`);

  console.log("\n🎉 Données de démonstration initialisées avec succès !");
  console.log(`   Connexion admin : ${ADMIN_EMAIL} (mot de passe communiqué à l'administrateur)`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
