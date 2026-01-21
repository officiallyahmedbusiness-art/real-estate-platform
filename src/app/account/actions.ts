"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { parseProfileInput } from "@/lib/validators";
import { safeNextPath } from "@/lib/paths";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath("/account", "/dashboard");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const parsed = parseProfileInput({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  });

  if (!parsed) return;

  await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: parsed.full_name,
      phone: parsed.phone || null,
    },
    { onConflict: "id" }
  );

  revalidatePath("/account");
}
