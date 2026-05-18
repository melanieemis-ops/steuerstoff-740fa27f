import type { DatevBookingInput } from "../datev/extfCsv";

export type VoucherKind = "revenue" | "expense";

export type AccountRule = {
  /** Treffer, sobald einer der Begriffe im PDF-Text vorkommt. */
  contains: string | string[];
  /** Gegenkonto ohne BU-Schlüssel, z. B. 8400, 4930, 3400. */
  account: string;
  kind?: VoucherKind;
  buKey?: string;
  bookingText?: string;
};

export type PdfExtractionOptions = {
  kind?: VoucherKind;
  bankAccount?: string;
  revenueAccount?: string;
  expenseAccount?: string;
  currency?: string;
  defaultBuKey?: string;
  buKeyByVatRate?: Record<string, string>;
  accountRules?: AccountRule[];
};

export type ExtractedVoucher = {
  fileName: string;
  amount: number;
  belegDate: Date;
  invoiceNumber?: string;
  counterparty?: string;
  vatRate?: number;
  rawText: string;
};

const DEFAULT_OPTIONS: Required<
  Pick<PdfExtractionOptions, "kind" | "bankAccount" | "revenueAccount" | "expenseAccount" | "currency">
> = {
  kind: "revenue",
  bankAccount: "1200",
  revenueAccount: "8400",
  expenseAccount: "4930",
  currency: "EUR",
};

export const DEFAULT_ACCOUNT_RULES: AccountRule[] = [
  { contains: ["hosting", "domain", "server", "software", "saas", "microsoft", "google", "openai", "adobe"], account: "4964", kind: "expense", bookingText: "Software/IT" },
  { contains: ["porto", "dhl", "dpd", "ups", "deutsche post"], account: "4910", kind: "expense", bookingText: "Porto" },
  { contains: ["büro", "office", "papier", "toner", "drucker"], account: "4930", kind: "expense", bookingText: "Bürobedarf" },
  { contains: ["telefon", "internet", "telekom", "vodafone", "o2"], account: "4920", kind: "expense", bookingText: "Telefon/Internet" },
  { contains: ["hotel", "bahn", "deutsche bahn", "taxi", "flug", "reise"], account: "4660", kind: "expense", bookingText: "Reisekosten" },
  { contains: ["bewirtung", "restaurant", "cafe", "café"], account: "4650", kind: "expense", bookingText: "Bewirtung" },
  { contains: ["spende", "donation", "zuwendung"], account: "3220", kind: "revenue", bookingText: "Spende/Zuwendung" },
  { contains: ["mitgliedsbeitrag", "beitrag"], account: "2110", kind: "revenue", bookingText: "Mitgliedsbeitrag" },
];

export function extractBookingFromPdfText(input: {
  fileName: string;
  text: string;
  options?: PdfExtractionOptions;
}): DatevBookingInput {
  const options = { ...DEFAULT_OPTIONS, ...(input.options ?? {}) };
  const voucher = extractVoucher(input.fileName, input.text);
  const matchedRule = findAccountRule(input.text, options.accountRules ?? []);
  const kind = matchedRule?.kind ?? options.kind;
  const contraAccount = matchedRule?.account ?? (kind === "expense" ? options.expenseAccount : options.revenueAccount);
  const buKey =
    matchedRule?.buKey ??
    (voucher.vatRate !== undefined ? options.buKeyByVatRate?.[String(voucher.vatRate)] : undefined) ??
    options.defaultBuKey;

  return {
    amount: voucher.amount,
    sollHaben: kind === "expense" ? "H" : "S",
    account: options.bankAccount,
    contraAccount,
    buKey,
    belegDate: voucher.belegDate,
    belegfeld1: voucher.invoiceNumber,
    bookingText: buildBookingText({
      counterparty: voucher.counterparty,
      invoiceNumber: voucher.invoiceNumber,
      fallback: matchedRule?.bookingText ?? input.fileName.replace(/\.pdf$/i, ""),
    }),
    currency: options.currency,
    documentFileName: input.fileName,
  };
}

export function extractVoucher(fileName: string, rawText: string): ExtractedVoucher {
  const text = normalizeText(rawText);
  const amount = findAmount(text);
  const belegDate = findDate(text);

  if (amount === undefined) throw new Error(`${fileName}: Kein Bruttobetrag gefunden.`);
  if (!belegDate) throw new Error(`${fileName}: Kein Beleg-/Rechnungsdatum gefunden.`);

  return {
    fileName,
    amount,
    belegDate,
    invoiceNumber: findInvoiceNumber(text),
    counterparty: guessCounterparty(text, fileName),
    vatRate: findVatRate(text),
    rawText: text,
  };
}

function normalizeText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function findAmount(text: string): number | undefined {
  const candidates: Array<{ value: number; score: number }> = [];
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const amounts = collectMoneyAmounts(line);
    if (amounts.length === 0) continue;

    let score = 0;
    if (/gesamtbetrag|rechnungsbetrag|zahlbetrag|endbetrag|betrag\s+fällig|amount\s+due|total\s+due/i.test(line)) score += 100;
    if (/brutto|total|summe/i.test(line)) score += 60;
    if (/netto|ust|mwst|umsatzsteuer|vat|steuer|rabatt|skonto/i.test(line)) score -= 40;

    for (const value of amounts) candidates.push({ value, score });
  }

  if (candidates.length === 0) {
    const allAmounts = collectMoneyAmounts(text);
    if (allAmounts.length === 0) return undefined;
    return Math.max(...allAmounts.map(Math.abs));
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return Math.abs(b.value) - Math.abs(a.value);
  });

  return Math.abs(candidates[0].value);
}

function collectMoneyAmounts(text: string): number[] {
  const matches = text.matchAll(/(?<!\d)-?\d{1,3}(?:[.\s]\d{3})*,\d{2}|(?<!\d)-?\d+,\d{2}/g);
  return [...matches]
    .map((match) => parseGermanDecimal(match[0]))
    .filter((value): value is number => value !== undefined && Number.isFinite(value));
}

function parseGermanDecimal(value: string): number | undefined {
  const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function findDate(text: string): Date | undefined {
  const candidates: Array<{ date: Date; score: number; index: number }> = [];
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  lines.forEach((line, index) => {
    const dates = collectDates(line);
    if (dates.length === 0) return;

    let score = 0;
    if (/rechnungsdatum|belegdatum|invoice\s+date|datum/i.test(line)) score += 80;
    if (/lieferdatum|leistungsdatum|fällig|due\s+date|zahlbar/i.test(line)) score -= 50;

    for (const date of dates) candidates.push({ date, score, index });
  });

  if (candidates.length === 0) {
    const allDates = collectDates(text);
    return allDates[0];
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  return candidates[0].date;
}

function collectDates(text: string): Date[] {
  const result: Date[] = [];
  const regex = /\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2}|\d{4})\b/g;
  for (const match of text.matchAll(regex)) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    let year = Number(match[3]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) result.push(date);
  }
  return result;
}

function findInvoiceNumber(text: string): string | undefined {
  const patterns = [
    /(?:rechnungs(?:nummer|nr\.?|\s*nr\.?)|rechnung\s*nr\.?|beleg(?:nummer|nr\.?)|invoice\s*(?:number|no\.?)|receipt\s*(?:number|no\.?))\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\-/_\.]{2,})/i,
    /\b(?:nr\.|no\.)\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\-/_\.]{2,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanToken(match[1]).slice(0, 36);
  }

  return undefined;
}

function findVatRate(text: string): number | undefined {
  const match =
    text.match(/(?:mwst|ust|umsatzsteuer|vat)[^\n%]{0,80}?\b(19|7|0)(?:[,.]0{1,2})?\s*%/i) ??
    text.match(/\b(19|7|0)(?:[,.]0{1,2})?\s*%\s*(?:mwst|ust|umsatzsteuer|vat)/i);

  return match?.[1] ? Number(match[1]) : undefined;
}

function guessCounterparty(text: string, fileName: string): string | undefined {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 3 && line.length <= 80)
    .filter((line) => !/rechnung|invoice|datum|kundennummer|beleg|betrag|iban|bic|telefon|email|www\.|https?:\/\//i.test(line))
    .filter((line) => collectMoneyAmounts(line).length === 0);

  const companyLine = lines.find((line) => /gmbh|ug|ag|kg|ohg|e\.k\.|ltd|llc|inc|verein|stiftung/i.test(line));
  return cleanToken(companyLine ?? lines[0] ?? fileName.replace(/\.pdf$/i, ""));
}

function findAccountRule(text: string, rules: AccountRule[]): AccountRule | undefined {
  const lower = text.toLowerCase();
  return rules.find((rule) => {
    const terms = Array.isArray(rule.contains) ? rule.contains : [rule.contains];
    return terms.some((term) => lower.includes(term.toLowerCase()));
  });
}

function buildBookingText(input: { counterparty?: string; invoiceNumber?: string; fallback: string }): string {
  const parts = [input.counterparty ?? input.fallback, input.invoiceNumber ? `RG ${input.invoiceNumber}` : undefined].filter(Boolean);
  return cleanToken(parts.join(" ")).slice(0, 60);
}

function cleanToken(value: string): string {
  return value.replace(/[\s\u00a0]+/g, " ").replace(/[;"`´]/g, "").trim();
}
