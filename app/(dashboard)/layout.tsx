import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Upsert merchant — runs on every dashboard render but is fast and idempotent.
  // currentUser() is a Clerk API call; acceptable overhead for MVP.
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  const merchant = await prisma.merchant.upsert({
    where: { clerkUserId: userId },
    update: { email },
    create: { clerkUserId: userId, email },
    include: { store: true },
  });

  // Clerk's post-sign-in redirect is a static URL and can't know the caller's
  // role, so admins land here first — send them on to /admin instead.
  if (merchant.role === "ADMIN") redirect("/admin");

  const storeName = merchant.store?.name ?? null;
  const storeSlug = merchant.store?.slug ?? null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardSidebar storeName={storeName} storeSlug={storeSlug} />

      {/* Offset content by sidebar width on desktop; add bottom padding for mobile bottom-nav */}
      <div className="flex flex-col lg:pl-64">
        <DashboardHeader storeSlug={storeSlug} />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
