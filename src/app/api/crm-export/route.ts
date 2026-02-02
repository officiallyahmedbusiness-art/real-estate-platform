import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { logActivity } from "@/lib/activity";
import { logAudit } from "@/lib/audit";

function clean(value: string | null) {
  return (value ?? "").trim();
}

function toCsv(rows: string[][]) {
  return rows
    .map((cols) =>
      cols
        .map((value) => {
          const safe = value.replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(",")
    )
    .join("\n");
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = clean(url.searchParams.get("status"));
  const source = clean(url.searchParams.get("source"));
  const assigned = clean(url.searchParams.get("assigned"));
  const lostReason = clean(url.searchParams.get("lost_reason"));
  const overdue = clean(url.searchParams.get("overdue"));
  const query = clean(url.searchParams.get("q"));

  let leadsQuery = supabase
    .from("leads")
    .select("id, name, phone, phone_e164, status, lead_source, created_at, assigned_to, lost_reason, listings(title)");
  if (status) leadsQuery = leadsQuery.eq("status", status);
  if (source) leadsQuery = leadsQuery.eq("lead_source", source);
  if (lostReason) leadsQuery = leadsQuery.eq("lost_reason", lostReason);
  if (assigned === "unassigned") {
    leadsQuery = leadsQuery.is("assigned_to", null);
  } else if (assigned) {
    leadsQuery = leadsQuery.eq("assigned_to", assigned);
  }
  if (overdue === "1") {
    leadsQuery = leadsQuery.lt("next_action_at", new Date().toISOString());
  }
  if (query) {
    leadsQuery = leadsQuery.or(
      `name.ilike.%${query}%,phone.ilike.%${query}%,phone_e164.ilike.%${query}%`
    );
  }

  const { data: leads } = await leadsQuery;
  const rows = [
    [
      "id",
      "name",
      "phone",
      "phone_e164",
      "status",
      "source",
      "lost_reason",
      "assigned_to",
      "listing_title",
      "created_at",
    ],
  ];

  (leads ?? []).forEach((lead) => {
    const listing = Array.isArray(lead.listings) ? lead.listings[0] : lead.listings;
    rows.push([
      lead.id ?? "",
      lead.name ?? "",
      lead.phone ?? "",
      lead.phone_e164 ?? "",
      lead.status ?? "",
      lead.lead_source ?? "",
      lead.lost_reason ?? "",
      lead.assigned_to ?? "",
      listing?.title ?? "",
      lead.created_at ?? "",
    ]);
  });

  await logActivity(supabase, {
    actor_user_id: data.user.id,
    action: "lead_export",
    entity: "lead",
    meta: {
      count: leads?.length ?? 0,
      filters: {
        status,
        source,
        assigned,
        lost_reason: lostReason,
        overdue,
        q: query,
      },
    },
  });
  await logAudit(supabase, {
    actor_user_id: data.user.id,
    action: "lead_export",
    entity_type: "lead",
    metadata: {
      count: leads?.length ?? 0,
      filters: {
        status,
        source,
        assigned,
        lost_reason: lostReason,
        overdue,
        q: query,
      },
    },
  });

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=leads-export.csv",
    },
  });
}
