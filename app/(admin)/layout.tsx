import { redirect } from "next/navigation";
import { requireAdmin, AuthenticationError, AuthorizationError } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    if (e instanceof AuthorizationError) redirect("/dashboard");
    throw e;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminSidebar />
      <div className="flex flex-col lg:pl-64">
        <AdminHeader />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
