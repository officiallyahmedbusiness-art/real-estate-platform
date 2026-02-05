import { createClient } from "@supabase/supabase-js";

const email = "foxm575@gmail.com";
const phone = "01020614022";
const fullName = "Foxm Admin";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const match = users.find((user) => (user.email ?? "").toLowerCase() === targetEmail);
    if (match?.id) return match.id;
    if (users.length < perPage) return null;
    if (data?.lastPage && page >= data.lastPage) return null;
    page += 1;
  }
}

async function run() {
  let userId = await findUserIdByEmail(email);
  let inviteLink = null;

  if (!userId) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, phone, role: "admin" },
    });
    if (error) throw error;

    inviteLink = null;
    userId = data?.user?.id ?? (await findUserIdByEmail(email));
  }

  if (!userId) {
    throw new Error("Failed to resolve user id for admin invite.");
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      phone,
      email,
      role: "admin",
    },
    { onConflict: "id" }
  );

  if (upsertError) throw upsertError;

  console.log("Admin user ensured:", { userId, email, inviteLink });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

