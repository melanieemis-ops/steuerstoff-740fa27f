/**
 * DATEV-EXTF Kopf- und Spaltenstruktur.
 * Die Spalten entsprechen deiner EXTF_TEMPLATE_MIT_KOPFZEILE.xlsx:
 * Zeile 1 = EXTF-Control-Zeile, Zeile 2 = Buchungsstapel-Header.
 */
export const EXTF_BOOKING_HEADERS = [
  "Umsatz (ohne Soll/Haben-Kz)",
  "Soll/Haben-Kennzeichen",
  "WKZ Umsatz",
  "Kurs",
  "Basis-Umsatz",
  "WKZ Basis-Umsatz",
  "Konto",
  "Gegenkonto (ohne BU-Schlüssel)",
  "BU-Schlüssel",
  "Belegdatum",
  "Belegfeld 1",
  "Belegfeld 2",
  "Skonto",
  "Buchungstext",
  "Postensperre",
  "Diverse Adressnummer",
  "Geschäftspartnerbank",
  "Sachverhalt",
  "Zinssperre",
  "Beleglink",
  "Beleginfo - Art 1",
  "Beleginfo - Inhalt 1",
  "Beleginfo - Art 2",
  "Beleginfo - Inhalt 2",
  "Beleginfo - Art 3",
  "Beleginfo - Inhalt 3",
  "Beleginfo - Art 4",
  "Beleginfo - Inhalt 4",
  "Beleginfo - Art 5",
  "Beleginfo - Inhalt 5",
  "Beleginfo - Art 6",
  "Beleginfo - Inhalt 6",
  "Beleginfo - Art 7",
  "Beleginfo - Inhalt 7",
  "Beleginfo - Art 8",
  "Beleginfo - Inhalt 8",
  "KOST1 - Kostenstelle",
  "KOST2 - Kostenstelle",
  "Kost-Menge",
  "EU-Land u. UStID",
  "EU-Steuersatz",
  "Abw. Versteuerungsart",
  "Sachverhalt L+L",
  "Funktionsergänzung L+L",
  "BU 49 Hauptfunktionstyp",
  "BU 49 Hauptfunktionsnummer",
  "BU 49 Funktionsergänzung",
  "Zusatzinformation - Art 1",
  "Zusatzinformation- Inhalt 1",
  "Zusatzinformation - Art 2",
  "Zusatzinformation- Inhalt 2",
  "Zusatzinformation - Art 3",
  "Zusatzinformation- Inhalt 3",
  "Zusatzinformation - Art 4",
  "Zusatzinformation- Inhalt 4",
  "Zusatzinformation - Art 5",
  "Zusatzinformation- Inhalt 5",
  "Zusatzinformation - Art 6",
  "Zusatzinformation- Inhalt 6",
  "Zusatzinformation - Art 7",
  "Zusatzinformation- Inhalt 7",
  "Zusatzinformation - Art 8",
  "Zusatzinformation- Inhalt 8",
  "Zusatzinformation - Art 9",
  "Zusatzinformation- Inhalt 9",
  "Zusatzinformation - Art 10",
  "Zusatzinformation- Inhalt 10",
  "Zusatzinformation - Art 11",
  "Zusatzinformation- Inhalt 11",
  "Zusatzinformation - Art 12",
  "Zusatzinformation- Inhalt 12",
  "Zusatzinformation - Art 13",
  "Zusatzinformation- Inhalt 13",
  "Zusatzinformation - Art 14",
  "Zusatzinformation- Inhalt 14",
  "Zusatzinformation - Art 15",
  "Zusatzinformation- Inhalt 15",
  "Zusatzinformation - Art 16",
  "Zusatzinformation- Inhalt 16",
  "Zusatzinformation - Art 17",
  "Zusatzinformation- Inhalt 17",
  "Zusatzinformation - Art 18",
  "Zusatzinformation- Inhalt 18",
  "Zusatzinformation - Art 19",
  "Zusatzinformation- Inhalt 19",
  "Zusatzinformation - Art 20",
  "Zusatzinformation- Inhalt 20",
  "Stück",
  "Gewicht",
  "Zahlweise",
  "Forderungsart",
  "Veranlagungsjahr",
  "Zugeordnete Fälligkeit",
  "Skontotyp",
  "Auftragsnummer",
  "Buchungstyp",
  "Ust-Schlüssel (Anzahlungen)",
  "EU-Land (Anzahlungen)",
  "Sachverhalt L+L (Anzahlungen)",
  "EU-Steuersatz (Anzahlungen)",
  "Erlöskonto (Anzahlungen)",
  "Herkunft-Kz",
  "Leerfeld",
  "KOST-Datum",
  "Mandatsreferenz",
  "Skontosperre",
  "Gesellschaftername",
  "Beteiligtennummer",
  "Identifikationsnummer",
  "Zeichnernummer",
  "Postensperre bis",
  "Bezeichnung SoBil-Sachverhalt",
  "Kennzeichen SoBil-Buchung",
  "Festschreibung",
  "Leistungsdatum",
  "Datum Zuord.Steuerperiode",
] as const;

export type ExtfBookingHeader = (typeof EXTF_BOOKING_HEADERS)[number];
export const EXTF_ROW_LENGTH = EXTF_BOOKING_HEADERS.length;

export type ExtfMetadataInput = {
  consultantNumber?: string;
  clientNumber?: string;
  fiscalYearStart: Date;
  periodStart: Date;
  periodEnd: Date;
  /** In deiner Vorlage: HS */
  creator?: string;
  /** In deiner Vorlage: Übergabe von HS */
  batchName?: string;
  /** In deiner Vorlage/Kontenrahmen: 4 */
  accountingReason?: string;
  currency?: string;
  now?: Date;
};

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatYYYYMMDD(date: Date): string {
  return [date.getFullYear(), pad2(date.getMonth() + 1), pad2(date.getDate())].join("");
}

export function formatDateTime14(date: Date): string {
  return `${formatYYYYMMDD(date)}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
}

/**
 * Baut die EXTF-Control-Zeile im Stil deiner Vorlage.
 * Leere Felder bleiben leer, damit die Spaltenzahl exakt passt.
 */
export function buildExtfMetadataRow(input: ExtfMetadataInput): string[] {
  const row = Array<string>(EXTF_ROW_LENGTH).fill("");
  const now = input.now ?? new Date();

  row[0] = "EXTF";
  row[1] = "510";
  row[2] = "21";
  row[3] = "Buchungsstapel";
  row[4] = "7";
  row[5] = formatDateTime14(now);
  row[7] = input.creator ?? "HS";
  row[10] = input.consultantNumber ?? "22031";
  row[11] = input.clientNumber ?? "7180";
  row[12] = formatYYYYMMDD(input.fiscalYearStart);
  row[13] = input.accountingReason ?? "4";
  row[14] = formatYYYYMMDD(input.periodStart);
  row[15] = formatYYYYMMDD(input.periodEnd);
  row[16] = input.batchName ?? "Übergabe von HS";
  row[18] = "1";
  row[19] = "0";
  row[21] = input.currency ?? "EUR";

  return row;
}
