import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import TeamActivateClient from "@/components/team/TeamActivateClient";

export default function TeamActivatePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <TeamActivateClient />
      </main>
      <SiteFooter />
    </div>
  );
}

