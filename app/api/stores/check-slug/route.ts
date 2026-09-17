import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";

  if (!slug || !/^[a-z0-9-]{2,60}$/.test(slug)) {
    return NextResponse.json({ available: false });
  }

  const existing = await prisma.store.findUnique({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
