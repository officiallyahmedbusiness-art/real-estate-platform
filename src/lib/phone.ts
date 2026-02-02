const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

function normalizeDigits(input: string) {
  return input.replace(/[٠-٩۰-۹]/g, (char) => ARABIC_DIGITS[char] ?? char);
}

export function normalizeEgyptPhone(raw: string | null | undefined) {
  const input = normalizeDigits((raw ?? "").trim());
  if (!input) return null;

  let cleaned = input.replace(/[^\d+]/g, "");
  if (!cleaned) return null;

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.startsWith("0")) {
    cleaned = `20${cleaned.slice(1)}`;
  } else if (cleaned.length === 10) {
    cleaned = `20${cleaned}`;
  }

  if (!cleaned || cleaned.length < 11) return null;
  return `+${cleaned}`;
}
