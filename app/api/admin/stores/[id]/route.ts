import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthenticationError, AuthorizationError } from "@/lib/auth";

const AdminUpdateStoreSchema = z.object({
  isSuspended: z.boolean(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = AdminUpdateStoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const store = await prisma.store.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: store });
  } catch (e) {
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof AuthorizationError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[PATCH /api/admin/stores/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
