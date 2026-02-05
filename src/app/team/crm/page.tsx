import { redirect } from "next/navigation";
import { requireTeamRole } from "@/lib/teamAuth";

export default async function TeamCrmRedirect() {
  await requireTeamRole(["owner", "admin", "ops", "staff", "agent"], "/team/crm");
  redirect("/crm");
}
