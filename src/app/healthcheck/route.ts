/** Endpoint léger pour les health checks : pas de base de données, pas de streaming. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(
    { status: "ok" },
    {
      status: 200,
      headers: { "Cache-Control": "public, max-age=60" },
    }
  );
}
