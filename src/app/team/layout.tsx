import type { ReactNode } from "react";
import TeamPresenceClient from "@/components/team/TeamPresenceClient";

export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TeamPresenceClient />
      {children}
    </>
  );
}
