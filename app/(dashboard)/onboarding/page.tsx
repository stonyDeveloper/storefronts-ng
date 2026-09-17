import { redirect } from "next/navigation";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = {
  title: "Set up your store — Storefronts",
};

export default async function OnboardingPage() {
  try {
    const merchant = await requireMerchant();

    if (merchant.store?.onboardingComplete) {
      redirect("/dashboard");
    }

    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50">
        <OnboardingWizard />
      </div>
    );
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }
}
