import type { DatevBookingInput } from "../datev/extfCsv";

export type VoucherKind = "revenue" | "expense";
export type PdfDocumentKind = "invoice" | "bankStatement";
export type PdfExtractionMode = "auto" | PdfDocumentKind;

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
  /** auto = Kontoauszug erkennen, sonst Rechnung/Beleg wie bisher. */
  mode?: PdfExtractionMode;
  /** Für Bankauszüge mit Datumsangaben wie 02.05. ohne Jahr. */
  statementYear?: number;
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

type BankTransaction = {
  amountSigned: number;
  bookingDate: Date;
  valueDate?: Date;
  purpose: string;
  reference?: string;
  rawBlock: string;
};

type MoneyMatch = {
  value: number;
  raw: string;
  index: number;
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
  { contains: ["kontoführung", "kontofuehrung", "bankgebühr", "bankgebuehr", "entgeltabschluss", "abschlussentgelt"], account: "4970", kind: "expense", bookingText: "Bankgebühren" },
];

/**
 * Neue Hauptfunktion: erzeugt bei Rechnungen wie bisher eine Buchungszeile,
 * bei Kontoauszügen aber mehrere Buchungszeilen aus einem PDF.
 */
export function extractBookingsFromPdfText(input: {
  fileName: string;
  text: string;
  documentKind?: PdfDocumentKind;
  options?: PdfExtractionOptions;
}): DatevBookingInput[] {
  const normalizedText = normalizeText(input.text);
  const mode = input.documentKind ?? input.options?.mode ?? "auto";

  if (mode === "bankStatement" || (mode === "auto" && looksLikeBankStatement(normalizedText))) {
    const bankBookings = extractBankStatementBookings({ ...input, text: normalizedText });
    if (bankBookings.length > 0) return bankBookings;
  }

  return [extractBookingFromPdfText({ ...input, text: normalizedText })];
}

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

export function extractBankStatementBookings(input: {
  fileName: string;
  text: string;
  options?: PdfExtractionOptions;
}): DatevBookingInput[] {
  const options = { ...DEFAULT_OPTIONS, ...(input.options ?? {}) };
  const text = normalizeText(input.text);
  const statementYear = input.options?.statementYear ?? inferYearFromText(text) ?? new Date().getFullYear();
  const blocks = findBankTransactionBlocks(text);
  const transactions = blocks
    .map((block) => parseBankTransactionBlock(block, statementYear))
    .filter((transaction): transaction is BankTransaction => Boolean(transaction));

  const uniqueTransactions = dedupeBankTransactions(transactions);

  if (uniqueTransactions.length === 0) {
    throw new Error(`${input.fileName}: Kontoauszug erkannt, aber keine einzelnen Umsätze gefunden. Das PDF enthält offenbar ein Bankauszugs-Format, das noch nicht zeilenweise gelesen werden konnte.`);
  }

  return uniqueTransactions.map((transaction, index) => {
    const isIncoming = transaction.amountSigned >= 0;
    const matchedRule = findAccountRule(`${transaction.purpose} ${transaction.rawBlock}`, options.accountRules ?? []);
    const inferredKind = isIncoming ? "revenue" : "expense";
    const contraAccount = matchedRule?.account ?? (inferredKind === "expense" ? options.expenseAccount : options.revenueAccount);

    return {
      amount: Math.abs(transaction.amountSigned),
      sollHaben: isIncoming ? "S" : "H",
      account: options.bankAccount,
      contraAccount,
      buKey: matchedRule?.buKey ?? options.defaultBuKey,
      belegDate: transaction.bookingDate,
      belegfeld1: transaction.reference ?? `BA-${String(index + 1).padStart(3, "0")}`,
      belegfeld2: transaction.valueDate ? formatIsoDate(transaction.valueDate) : undefined,
      bookingText: cleanToken(matchedRule?.bookingText ?? transaction.purpose ?? "Bankumsatz").slice(0, 60),
      currency: options.currency,
      documentFileName: input.fileName,
    };
  });
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

function looksLikeBankStatement(text: string): boolean {
  const lower = text.toLowerCase();
  const hasBankWords =
    /kontoauszug|kontoums[aä]tze|umsatz(?:anzeige|übersicht)|buchungstag|wertstellung|valuta|alter kontostand|neuer kontostand|kontostand|saldo/.test(lower);

  if (!hasBankWords) return false;

  const transactionLikeLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isBankSummaryLine(line) && !isBankHeaderLine(line))
    .filter((line) => collectDates(line).length > 0 && collectBankMoneyAmounts(line).length > 0);

  return /kontoauszug|kontoums[aä]tze/.test(lower) || transactionLikeLines.length >= 2;
}

function findBankTransactionBlocks(text: string): string[][] {
  const lines = text
    .split("\n")
    .map((line) => cleanBankLine(line))
    .filter(Boolean);

  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (isBankHeaderLine(line) || isBankSummaryLine(line)) {
      if (current.length > 0 && blockHasAmount(current)) blocks.push(current);
      current = [];
      continue;
    }

    const hasDate = collectDates(line).length > 0;
    const startsTransaction = isPotentialBankTransactionStart(line);

    // Viele Kontoauszüge, u.a. Postbank, zerlegen PDF-Tabellen so, dass Datum,
    // Buchungstext und Betrag auf getrennten Textzeilen stehen. Deshalb startet
    // schon eine reine Datumszeile einen möglichen Umsatzblock.
    if (startsTransaction || hasDate) {
      if (current.length > 0 && blockHasAmount(current)) blocks.push(current);
      current = [line];
      continue;
    }

    if (current.length > 0 && current.length < 18) {
      current.push(line);
      continue;
    }

    // Fallback: Betrag ohne vorherige Datumszeile. Wir hängen ihn mit etwas Kontext an,
    // damit Tabellen, die Betragsspalten separat extrahieren, nicht komplett verloren gehen.
    if (collectBankMoneyAmounts(line).length > 0 && blocks.length === 0) {
      current = current.length > 0 ? [...current, line] : [line];
    }
  }

  if (current.length > 0 && blockHasAmount(current)) blocks.push(current);

  return blocks;
}

function cleanBankLine(line: string): string {
  return line.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

function isBankHeaderLine(line: string): boolean {
  return /^(buchungstag|buchung|wertstellung|valuta|vorgang|umsatz|betrag|saldo|haben|soll|datum)(\s|$)/i.test(line) ||
    /buchungstag.*wertstellung.*betrag/i.test(line) ||
    /seite\s+\d+\s+von\s+\d+/i.test(line) ||
    /iban|bic|kontonummer|kundennummer|auszug(?:nummer)?|blz/i.test(line);
}

function isBankSummaryLine(line: string): boolean {
  return /alter kontostand|neuer kontostand|anfangssaldo|endsaldo|saldo per|kontostand|summe der ums[aä]tze|abrechnung|abschluss/i.test(line);
}

function isPotentialBankTransactionStart(line: string): boolean {
  const hasDate = collectDates(line).length > 0;
  if (!hasDate) return false;
  if (isBankHeaderLine(line) || isBankSummaryLine(line)) return false;

  // Auch reine Datumszeilen gelten als Start, weil PDF.js Tabellen oft spaltenweise
  // oder zeilenweise getrennt ausliest.
  return true;
}

function blockHasAmount(block: string[]): boolean {
  return collectBankMoneyAmounts(block.join(" ")).length > 0;
}

function parseBankTransactionBlock(block: string[], fallbackYear?: number): BankTransaction | undefined {
  const rawBlock = cleanToken(block.join(" "));
  if (!rawBlock || isBankSummaryLine(rawBlock)) return undefined;

  const dates = collectDates(rawBlock, fallbackYear);
  if (dates.length === 0) return undefined;

  const amounts = collectBankMoneyAmounts(rawBlock).filter((amount) => Math.abs(amount.value) >= 0.01);
  if (amounts.length === 0) return undefined;

  const chosenAmount = chooseBankTransactionAmount(amounts, rawBlock);
  const purpose = buildBankPurpose(rawBlock, chosenAmount.raw);

  return {
    amountSigned: chosenAmount.value,
    bookingDate: dates[0],
    valueDate: dates[1],
    purpose: purpose || "Bankumsatz",
    reference: findBankReference(rawBlock),
    rawBlock,
  };
}

function chooseBankTransactionAmount(amounts: MoneyMatch[], context: string): MoneyMatch {
  const explicitSigned = amounts.filter((amount) => /(^[+\-−])|([+\-−]\s*(?:€|EUR)?$)|\b(?:Soll|Haben|S|H)\b/i.test(amount.raw));
  if (explicitSigned.length > 0) return explicitSigned[explicitSigned.length - 1];

  // Wenn Umsatz und Saldo in derselben Zeile stehen, ist der Umsatz in vielen
  // Banktabellen der erste Betrag und der Saldo/Kontostand der letzte.
  if (/saldo|kontostand|neuer kontostand|alter kontostand/i.test(context) && amounts.length > 1) {
    return amounts[0];
  }

  return amounts[amounts.length - 1];
}

function collectBankMoneyAmounts(text: string): MoneyMatch[] {
  const result: MoneyMatch[] = [];
  const regex = /(?:^|[^\d])(?:€|EUR)?\s*((?:[+\-−]\s*)?(?:\d{1,3}(?:[.\s]\d{3})+|\d+),\d{2})\s*(?:€|EUR)?\s*([+\-−])?\s*(Soll|Haben|S|H)?\b/gi;

  for (const match of text.matchAll(regex)) {
    const amountPart = match[1];
    const trailingSign = match[2];
    const debitCreditToken = match[3];
    const raw = cleanToken(`${amountPart}${trailingSign ?? ""}${debitCreditToken ? ` ${debitCreditToken}` : ""}`);
    const parsed = parseSignedGermanBankAmount(amountPart, debitCreditToken ?? trailingSign, text);
    if (parsed === undefined || !Number.isFinite(parsed)) continue;
    result.push({ value: parsed, raw, index: match.index ?? 0 });
  }

  return result;
}

function parseSignedGermanBankAmount(value: string, signToken: string | undefined, context: string): number | undefined {
  const unsigned = parseGermanDecimal(value.replace(/[+\-−]/g, ""));
  if (unsigned === undefined) return undefined;

  const hasMinus = /[\-−]/.test(value) || signToken === "-" || signToken === "−";
  const hasPlus = /\+/.test(value) || signToken === "+";
  const token = signToken?.toLowerCase();

  if (hasMinus || token === "s" || token === "soll") return -Math.abs(unsigned);
  if (hasPlus || token === "h" || token === "haben") return Math.abs(unsigned);

  const lower = context.toLowerCase();
  const negativeHint = /lastschrift|belastung|kartenzahlung|abbuchung|auszahlung|entgelt|gebühr|gebuehr|soll|einzug|dauerauftrag|überweisung an|ueberweisung an/.test(lower);
  const positiveHint = /gutschrift|zahlungseingang|eingang|haben|überweisung von|ueberweisung von/.test(lower);

  if (negativeHint && !positiveHint) return -Math.abs(unsigned);
  return Math.abs(unsigned);
}

function buildBankPurpose(rawBlock: string, rawAmount: string): string {
  let text = rawBlock;
  text = text.replace(rawAmount, " ");
  text = text.replace(/(?:^|[^\d])(?:€|EUR)?\s*(?:[+\-−]\s*)?(?:\d{1,3}(?:[.\s]\d{3})+|\d+),\d{2}\s*(?:€|EUR)?\s*[+\-−]?\s*(?:Soll|Haben|S|H)?\b/gi, " ");
  text = text.replace(/\b\d{1,2}[.\-/]\d{1,2}[.\-/](?:\d{2}|\d{4})\b/g, " ");
  text = text.replace(/\b\d{1,2}[.\-/]\d{1,2}\.?(?!\d)\b/g, " ");
  text = text.replace(/\b(?:buchungstag|buchung|wertstellung|valuta|umsatz|betrag|soll|haben|eur|€|saldo|kontostand|postbank)\b/gi, " ");
  text = text.replace(/(?:end-to-end-ref(?:erenz)?|ende-zu-ende-referenz|mandatsreferenz|kundenreferenz|referenz|mref|eref)\s*[:\-]?\s*[A-Z0-9\-/_]+/gi, " ");
  return cleanToken(text).slice(0, 60);
}

function findBankReference(text: string): string | undefined {
  const match = text.match(/(?:end-to-end-ref(?:erenz)?|ende-zu-ende-referenz|mandatsreferenz|kundenreferenz|referenz|mref|eref)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-/_]{2,})/i);
  return match?.[1] ? cleanToken(match[1]).slice(0, 36) : undefined;
}

function dedupeBankTransactions(transactions: BankTransaction[]): BankTransaction[] {
  const seen = new Set<string>();
  const result: BankTransaction[] = [];

  for (const transaction of transactions) {
    const key = [
      transaction.bookingDate.toISOString().slice(0, 10),
      transaction.amountSigned.toFixed(2),
      transaction.purpose.slice(0, 40).toLowerCase(),
    ].join("|");

    if (seen.has(key)) continue;
    seen.add(key);
    result.push(transaction);
  }

  return result;
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

function collectDates(text: string, fallbackYear?: number): Date[] {
  const result: Date[] = [];
  const fullDateRegex = /\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2}|\d{4})\b/g;

  for (const match of text.matchAll(fullDateRegex)) {
    const date = buildDate(Number(match[1]), Number(match[2]), normalizeYear(Number(match[3])));
    if (date) result.push(date);
  }

  if (result.length > 0) return result;

  const year = fallbackYear ?? inferYearFromText(text) ?? new Date().getFullYear();
  const shortDateRegex = /\b(\d{1,2})[.\-/](\d{1,2})\.?(?!\d)/g;
  for (const match of text.matchAll(shortDateRegex)) {
    const date = buildDate(Number(match[1]), Number(match[2]), year);
    if (date) result.push(date);
  }

  return result;
}

function normalizeYear(year: number): number {
  if (year < 100) return year >= 70 ? 1900 + year : 2000 + year;
  return year;
}

function buildDate(day: number, month: number, year: number): Date | undefined {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) return date;
  return undefined;
}

function inferYearFromText(text: string): number | undefined {
  const match = text.match(/\b(20\d{2}|19\d{2})\b/);
  return match?.[1] ? Number(match[1]) : undefined;
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

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cleanToken(value: string): string {
  return value.replace(/[\s\u00a0]+/g, " ").replace(/[;"`´]/g, "").trim();
}
