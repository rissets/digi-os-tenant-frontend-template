import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OnboardingStudio } from "@/src/components/onboarding-studio";

export const metadata: Metadata = { title: "Tenant onboarding studio", robots: { index: false, follow: false } };

export default function OnboardingPage() {
  if (process.env.ENABLE_ONBOARDING_STUDIO !== "true") notFound();
  return <OnboardingStudio/>;
}
