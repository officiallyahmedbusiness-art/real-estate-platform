import { redirect } from "next/navigation";
import { requireOwnerAccess } from "@/lib/owner";

export default async function OwnerUsersPage() {
  await requireOwnerAccess("/owner/team/users");
  redirect("/owner/team/users");
}
