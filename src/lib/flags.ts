export type FeatureFlags = {
  enableCompare: boolean;
  enableSavedSearch: boolean;
  enableEnglish: boolean;
  enableLeadCRM: boolean;
};

function readFlag(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

export function getFlags(): FeatureFlags {
  return {
    enableCompare: readFlag(process.env.NEXT_PUBLIC_ENABLE_COMPARE, true),
    enableSavedSearch: readFlag(process.env.NEXT_PUBLIC_ENABLE_SAVED_SEARCH, true),
    enableEnglish: readFlag(process.env.NEXT_PUBLIC_ENABLE_ENGLISH, true),
    enableLeadCRM: readFlag(process.env.NEXT_PUBLIC_ENABLE_LEAD_CRM, true),
  };
}
