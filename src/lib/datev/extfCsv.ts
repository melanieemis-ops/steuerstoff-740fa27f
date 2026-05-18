import {
  buildExtfMetadataRow,
  EXTF_BOOKING_HEADERS,
  EXTF_ROW_LENGTH,
  type ExtfBookingHeader,
  type ExtfMetadataInput,
  formatYYYYMMDD,
  pad2,
} from "./extfHeaders";

export type SollHabenKennzeichen = "S" | "H";

export type DatevBookingInput = {
  /** Bruttobetrag positiv, z. B. 14.88 */
  amount: number;
  /** S: Konto im Soll. H: Konto im Haben. */
  sollHaben: SollHabenKennzeichen;
  /** DATEV-Konto, z. B. Bank/Kasse 1200. */
  account: string;
  /** Gegenkonto ohne BU-Schlüssel, z. B. Erlöse 8400 oder Aufwand 4930. */
  contraAccount: string;
  belegDate: Date;
  belegfeld1?: string;
  belegfeld2?: string;
  bookingText?: string;
  currency?: string;
  buKey?: string;
  kost1?: string;
  kost2?: string;
  documentFileName?: string;
  documentLink?: string;
  festschreibung?: "0" | "1";
  leistungsdatum?: Date;
};

const HEADER_INDEX = new Map<ExtfBookingHeader, number>(
  EXTF_BOOKING_HEADERS.map((header, index) => [header, index]),
);

function setByHeader(
  row: string[],
  header: ExtfBookingHeader,
  value: string | number | null | undefined,
): void {
  const index = HEADER_INDEX.get(header);
  if (index === undefined) throw new Error(`Unbekannte EXTF-Spalte: ${header}`);
  row[index] = value === null || value === undefined ? "" : String(value);
}

export function parseGermanAmount(value: string | number): number {
  if (typeof value === "number") return value;
  const normalized = value.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new Error(`Ungültiger Betrag: ${value}`);
  return parsed;
}

export function formatDatevAmount(value: number): string {
  if (!Number.isFinite(value)) throw new Error(`Ungültiger Betrag: ${value}`);
  return Math.abs(value).toFixed(2).replace(".", ",");
}

/** DATEV-Belegdatum im Buchungsstapel: TTMM, z. B. 0102. */
export function formatDatevBelegdatum(date: Date): string {
  return `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}`;
}

export function bookingToExtfRow(booking: DatevBookingInput): string[] {
  const row = Array<string>(EXTF_ROW_LENGTH).fill("");

  setByHeader(row, "Umsatz (ohne Soll/Haben-Kz)", formatDatevAmount(booking.amount));
  setByHeader(row, "Soll/Haben-Kennzeichen", booking.sollHaben);
  setByHeader(row, "WKZ Umsatz", booking.currency ?? "EUR");
  setByHeader(row, "Konto", booking.account);
  setByHeader(row, "Gegenkonto (ohne BU-Schlüssel)", booking.contraAccount);
  setByHeader(row, "BU-Schlüssel", booking.buKey);
  setByHeader(row, "Belegdatum", formatDatevBelegdatum(booking.belegDate));
  setByHeader(row, "Belegfeld 1", booking.belegfeld1);
  setByHeader(row, "Belegfeld 2", booking.belegfeld2);
  setByHeader(row, "Buchungstext", truncate(booking.bookingText, 60));
  setByHeader(row, "KOST1 - Kostenstelle", booking.kost1);
  setByHeader(row, "KOST2 - Kostenstelle", booking.kost2);

  if (booking.documentLink) setByHeader(row, "Beleglink", booking.documentLink);

  if (booking.documentFileName) {
    setByHeader(row, "Beleginfo - Art 1", "PDF-Dateiname");
    setByHeader(row, "Beleginfo - Inhalt 1", truncate(booking.documentFileName, 210));
  }

  if (booking.festschreibung) setByHeader(row, "Festschreibung", booking.festschreibung);
  if (booking.leistungsdatum) setByHeader(row, "Leistungsdatum", formatYYYYMMDD(booking.leistungsdatum));

  return row;
}

export function toExtfCsv(input: {
  metadata: ExtfMetadataInput;
  bookings: DatevBookingInput[];
  addUtf8Bom?: boolean;
}): string {
  const rows = [
    buildExtfMetadataRow(input.metadata),
    [...EXTF_BOOKING_HEADERS],
    ...input.bookings.map(bookingToExtfRow),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\r\n") + "\r\n";
  return input.addUtf8Bom === false ? csv : `\uFEFF${csv}`;
}

export function derivePeriodFromBookings(bookings: DatevBookingInput[]): {
  periodStart: Date;
  periodEnd: Date;
  fiscalYearStart: Date;
} {
  if (bookings.length === 0) {
    const today = new Date();
    return {
      periodStart: new Date(today.getFullYear(), today.getMonth(), 1),
      periodEnd: today,
      fiscalYearStart: new Date(today.getFullYear(), 0, 1),
    };
  }

  const timestamps = bookings.map((booking) => booking.belegDate.getTime());
  const min = new Date(Math.min(...timestamps));
  const max = new Date(Math.max(...timestamps));

  return {
    periodStart: new Date(min.getFullYear(), min.getMonth(), min.getDate()),
    periodEnd: new Date(max.getFullYear(), max.getMonth(), max.getDate()),
    fiscalYearStart: new Date(min.getFullYear(), 0, 1),
  };
}

function csvCell(value: string | number | null | undefined): string {
  const raw = value === null || value === undefined ? "" : String(value);
  if (/[;"\r\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function truncate(value: string | null | undefined, maxLength: number): string {
  if (!value) return "";
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
