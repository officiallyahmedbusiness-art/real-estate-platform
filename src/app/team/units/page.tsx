import { redirect } from "next/navigation";
import { requireTeamRole } from "@/lib/teamAuth";

export default async function TeamUnitsPage() {
  const { role } = await requireTeamRole(
    ["owner", "admin", "ops", "staff", "agent", "developer"],
    "/team/units"
  );

  if (role === "developer") {
    redirect("/developer");
  }
  if (role === "ops" || role === "staff" || role === "agent") {
    redirect("/staff");
  }
  redirect("/admin");
}
