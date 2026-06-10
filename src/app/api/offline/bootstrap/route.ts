import { getCatalogBootstrap } from "@/lib/store/catalog-cache";

export const revalidate = 90;

export async function GET() {
  const data = await getCatalogBootstrap();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=90, stale-while-revalidate=300",
    },
  });
}
