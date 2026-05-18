import { useMemo, useState, type CSSProperties } from "react";
import {
  derivePeriodFromBookings,
  parseGermanAmount,
  toExtfCsv,
  type DatevBookingInput,
  type SollHabenKennzeichen,
} from "../lib/datev/extfCsv";
import {
  DEFAULT_ACCOUNT_RULES,
  extractBookingsFromPdfText,
  type PdfDocumentKind,
  type VoucherKind,
} from "../lib/pdf/pdfAccountingExtractor";
import { readPdfText } from "../lib/pdf/readPdfText";

type ConverterForm = {
  pdfDocumentKind: PdfDocumentKind;
  kind: VoucherKind;
  bankAccount: string;
  revenueAccount: string;
  expenseAccount: string;
  berater: string;
  mandant: string;
  fiscalYearStart: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  creator: string;
  batchName: string;
  accountingReason: string;
  festschreibung: "0" | "1";
  addUtf8Bom: boolean;
};

type UiBooking = {
  id: string;
  amount: string;
  sollHaben: SollHabenKennzeichen;
  account: string;
  contraAccount: string;
  buKey: string;
  belegDate: string;
  belegfeld1: string;
  belegfeld2: string;
  bookingText: string;
  kost1: string;
  kost2: string;
  documentFileName: string;
};

const pageStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "clamp(16px, 4vw, 28px) clamp(12px, 4vw, 16px) 48px",
  color: "#111827",
  boxSizing: "border-box",
  overflowX: "hidden",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: "clamp(14px, 4vw, 18px)",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  boxSizing: "border-box",
  overflow: "hidden",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
  gap: 12,
  minWidth: 0,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  minWidth: 0,
  fontSize: 13,
  fontWeight: 650,
  color: "#374151",
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "9px 10px",
  fontSize: 16,
  background: "#fff",
  color: "#111827",
};

const smallInputStyle: CSSProperties = {
  ...inputStyle,
  minWidth: 105,
  padding: "7px 8px",
};

const buttonStyle: CSSProperties = {
  maxWidth: "100%",
  boxSizing: "border-box",
  border: 0,
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
  fontWeight: 750,
  cursor: "pointer",
  background: "#111827",
  color: "#fff",
  whiteSpace: "normal",
};

const secondaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "#f3f4f6",
  color: "#111827",
  border: "1px solid #e5e7eb",
};

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (!year || !month || !day || Number.isNaN(date.getTime())) {
    throw new Error(`Ungültiges Datum: ${value}`);
  }
  return date;
}

function defaultForm(): ConverterForm {
  const today = new Date();
  return {
    pdfDocumentKind: "invoice",
    kind: "revenue",
    bankAccount: "1200",
    revenueAccount: "8400",
    expenseAccount: "4930",
    berater: "22031",
    mandant: "7180",
    fiscalYearStart: `${today.getFullYear()}-01-01`,
    periodStart: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    periodEnd: isoDate(today),
    currency: "EUR",
    creator: "HS",
    batchName: "Übergabe von HS",
    accountingReason: "4",
    festschreibung: "0",
    addUtf8Bom: true,
  };
}

function toUiBooking(booking: DatevBookingInput, index: number): UiBooking {
  return {
    id: `${Date.now()}-${index}-${booking.documentFileName ?? "pdf"}`,
    amount: booking.amount.toFixed(2).replace(".", ","),
    sollHaben: booking.sollHaben,
    account: booking.account,
    contraAccount: booking.contraAccount,
    buKey: booking.buKey ?? "",
    belegDate: isoDate(booking.belegDate),
    belegfeld1: booking.belegfeld1 ?? "",
    belegfeld2: booking.belegfeld2 ?? "",
    bookingText: booking.bookingText ?? "",
    kost1: booking.kost1 ?? "",
    kost2: booking.kost2 ?? "",
    documentFileName: booking.documentFileName ?? "",
  };
}

function toDatevBooking(row: UiBooking, currency: string, festschreibung: "0" | "1"): DatevBookingInput {
  return {
    amount: parseGermanAmount(row.amount),
    sollHaben: row.sollHaben,
    account: row.account.trim(),
    contraAccount: row.contraAccount.trim(),
    buKey: row.buKey.trim() || undefined,
    belegDate: parseDateInput(row.belegDate),
    belegfeld1: row.belegfeld1.trim() || undefined,
    belegfeld2: row.belegfeld2.trim() || undefined,
    bookingText: row.bookingText.trim() || row.documentFileName,
    currency: currency || "EUR",
    kost1: row.kost1.trim() || undefined,
    kost2: row.kost2.trim() || undefined,
    documentFileName: row.documentFileName,
    festschreibung,
  };
}

function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ExtfPdfConverter() {
  const [form, setForm] = useState<ConverterForm>(() => defaultForm());
  const [rows, setRows] = useState<UiBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const validRows = useMemo(
    () => rows.filter((row) => row.amount && row.account && row.contraAccount && row.belegDate),
    [rows],
  );

  async function handleFiles(files: FileList | null): Promise<void> {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setError("");
    setMessages([]);

    const newRows: UiBooking[] = [];
    const newMessages: string[] = [];

    for (const [index, file] of selectedFiles.entries()) {
      try {
        const text = await readPdfText(file);
        const bookings = extractBookingsFromPdfText({
          fileName: file.name,
          text,
          documentKind: form.pdfDocumentKind,
          options: {
            kind: form.kind,
            bankAccount: form.bankAccount,
            revenueAccount: form.revenueAccount,
            expenseAccount: form.expenseAccount,
            currency: form.currency,
            accountRules: DEFAULT_ACCOUNT_RULES,
            statementYear: parseDateInput(form.periodStart).getFullYear(),
          },
        });
        newRows.push(...bookings.map((booking, bookingIndex) => toUiBooking(booking, rows.length + newRows.length + bookingIndex)));
      } catch (caughtError) {
        newMessages.push(caughtError instanceof Error ? caughtError.message : `${file.name}: PDF konnte nicht gelesen werden.`);
      }
    }

    if (newRows.length > 0) {
      const bookings = newRows.map((row) => toDatevBooking(row, form.currency, form.festschreibung));
      const period = derivePeriodFromBookings(bookings);
      setRows((current) => [...current, ...newRows]);
      setForm((current) => ({
        ...current,
        fiscalYearStart: isoDate(period.fiscalYearStart),
        periodStart: isoDate(period.periodStart),
        periodEnd: isoDate(period.periodEnd),
      }));
    }

    setMessages(newMessages);
    if (newRows.length === 0 && newMessages.length > 0) {
      setError("Es wurde kein Buchungssatz erzeugt. Schau dir die Hinweise unten an.");
    }
    setIsLoading(false);
  }

  function updateRow(id: string, patch: Partial<UiBooking>): void {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string): void {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function clearRows(): void {
    setRows([]);
    setMessages([]);
    setError("");
  }

  function handleDownload(): void {
    setError("");

    try {
      if (validRows.length === 0) {
        setError("Bitte erst mindestens einen gültigen Buchungssatz erzeugen oder eintragen.");
        return;
      }

      const bookings = validRows.map((row) => toDatevBooking(row, form.currency, form.festschreibung));
      const csv = toExtfCsv({
        addUtf8Bom: form.addUtf8Bom,
        metadata: {
          consultantNumber: form.berater,
          clientNumber: form.mandant,
          fiscalYearStart: parseDateInput(form.fiscalYearStart),
          periodStart: parseDateInput(form.periodStart),
          periodEnd: parseDateInput(form.periodEnd),
          creator: form.creator,
          batchName: form.batchName,
          accountingReason: form.accountingReason,
          currency: form.currency,
        },
        bookings,
      });

      downloadTextFile(`extf-${form.periodStart}-bis-${form.periodEnd}.csv`, csv);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "CSV konnte nicht erzeugt werden.");
    }
  }

  return (
    <div style={pageStyle}>
      <header style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14, fontWeight: 700 }}>Steuerstoff</p>
        <h1 style={{ margin: "4px 0 8px", fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.05 }}>
          PDF zu EXTF-CSV
        </h1>
        <p style={{ margin: 0, maxWidth: 760, color: "#4b5563", fontSize: 16, lineHeight: 1.55 }}>
          Lade Rechnungs-PDFs oder Kontoauszugs-PDFs hoch, prüfe die erkannten Buchungssätze und lade danach eine EXTF-CSV für den Import herunter.
        </p>
      </header>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>1. Grundeinstellungen</h2>
        <div style={gridStyle}>
          <label style={labelStyle}>
            PDF-Art
            <select
              style={inputStyle}
              value={form.pdfDocumentKind}
              onChange={(event) => setForm({ ...form, pdfDocumentKind: event.target.value as PdfDocumentKind })}
            >
              <option value="invoice">Rechnung / Einzelbeleg</option>
              <option value="bankStatement">Bankkontoauszug</option>
            </select>
          </label>

          <label style={labelStyle}>
            Standard-Art
            <select
              style={inputStyle}
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value as VoucherKind })}
              disabled={form.pdfDocumentKind === "bankStatement"}
            >
              <option value="revenue">Einnahme: Bank/Kasse S an Erlöse</option>
              <option value="expense">Ausgabe: Bank/Kasse H an Aufwand</option>
            </select>
          </label>

          <label style={labelStyle}>
            Bank/Kasse Konto
            <input style={inputStyle} value={form.bankAccount} onChange={(event) => setForm({ ...form, bankAccount: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Erlöskonto
            <input style={inputStyle} value={form.revenueAccount} onChange={(event) => setForm({ ...form, revenueAccount: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Aufwandskonto
            <input style={inputStyle} value={form.expenseAccount} onChange={(event) => setForm({ ...form, expenseAccount: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Beraternummer
            <input style={inputStyle} value={form.berater} onChange={(event) => setForm({ ...form, berater: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Mandantennummer
            <input style={inputStyle} value={form.mandant} onChange={(event) => setForm({ ...form, mandant: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Wirtschaftsjahr Beginn
            <input type="date" style={inputStyle} value={form.fiscalYearStart} onChange={(event) => setForm({ ...form, fiscalYearStart: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Periode von
            <input type="date" style={inputStyle} value={form.periodStart} onChange={(event) => setForm({ ...form, periodStart: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Periode bis
            <input type="date" style={inputStyle} value={form.periodEnd} onChange={(event) => setForm({ ...form, periodEnd: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Währung
            <input style={inputStyle} value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} />
          </label>

          <label style={labelStyle}>
            Herkunft
            <input style={inputStyle} value={form.creator} onChange={(event) => setForm({ ...form, creator: event.target.value })} />
          </label>

          <label style={labelStyle}>
            Kontenrahmen/Kz.
            <input style={inputStyle} value={form.accountingReason} onChange={(event) => setForm({ ...form, accountingReason: event.target.value })} />
          </label>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", minWidth: 0 }}>
          <label style={labelStyle}>
            Stapelbezeichnung
            <input style={inputStyle} value={form.batchName} onChange={(event) => setForm({ ...form, batchName: event.target.value })} />
          </label>

          <label style={{ ...labelStyle, alignContent: "end" }}>
            Festschreibung
            <select
              style={inputStyle}
              value={form.festschreibung}
              onChange={(event) => setForm({ ...form, festschreibung: event.target.value as "0" | "1" })}
            >
              <option value="0">0 - nicht festgeschrieben</option>
              <option value="1">1 - festgeschrieben</option>
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 650, color: "#374151", paddingTop: 26 }}>
            <input
              type="checkbox"
              checked={form.addUtf8Bom}
              onChange={(event) => setForm({ ...form, addUtf8Bom: event.target.checked })}
            />
            UTF-8 BOM in CSV schreiben
          </label>
        </div>
      </section>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>2. PDFs hochladen</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", maxWidth: "100%" }}>
          <label style={{ ...buttonStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
            PDFs auswählen
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              style={{ display: "none" }}
              onChange={(event) => {
                void handleFiles(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
            />
          </label>

          <button type="button" style={secondaryButtonStyle} onClick={clearRows} disabled={rows.length === 0 || isLoading}>
            Tabelle leeren
          </button>

          <button type="button" style={buttonStyle} onClick={handleDownload} disabled={validRows.length === 0 || isLoading}>
            EXTF-CSV herunterladen
          </button>

          {isLoading ? <span style={{ color: "#6b7280", fontWeight: 650 }}>PDFs werden gelesen …</span> : null}
        </div>

        <p style={{ margin: "12px 0 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          Hinweis: Das funktioniert direkt im Browser für Text-PDFs. Kontoauszüge werden automatisch erkannt, reine Scan-PDFs brauchen später zusätzlich OCR.
        </p>

        {error ? <div style={{ marginTop: 12, color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 12 }}>{error}</div> : null}

        {messages.length > 0 ? (
          <div style={{ marginTop: 12, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 12 }}>
            <strong>Hinweise:</strong>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {messages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </div>
        ) : null}
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>3. Buchungssätze prüfen</h2>
          <span style={{ color: "#6b7280", fontSize: 14 }}>{validRows.length} gültige Zeile(n)</span>
        </div>

        {rows.length === 0 ? (
          <div style={{ border: "1px dashed #cbd5e1", borderRadius: 14, padding: 24, color: "#64748b", background: "#f8fafc" }}>
            Noch keine Buchungssätze. Lade oben eine oder mehrere PDF-Dateien hoch.
          </div>
        ) : (
          <div style={{ overflowX: "auto", maxWidth: "100%", WebkitOverflowScrolling: "touch" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1180, fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={thStyle}>Betrag</th>
                  <th style={thStyle}>S/H</th>
                  <th style={thStyle}>Konto</th>
                  <th style={thStyle}>Gegenkonto</th>
                  <th style={thStyle}>BU</th>
                  <th style={thStyle}>Belegdatum</th>
                  <th style={thStyle}>Belegfeld 1</th>
                  <th style={thStyle}>Text</th>
                  <th style={thStyle}>KOST1</th>
                  <th style={thStyle}>KOST2</th>
                  <th style={thStyle}>PDF</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td style={tdStyle}><input style={smallInputStyle} value={row.amount} onChange={(event) => updateRow(row.id, { amount: event.target.value })} /></td>
                    <td style={tdStyle}>
                      <select style={{ ...smallInputStyle, minWidth: 70 }} value={row.sollHaben} onChange={(event) => updateRow(row.id, { sollHaben: event.target.value as SollHabenKennzeichen })}>
                        <option value="S">S</option>
                        <option value="H">H</option>
                      </select>
                    </td>
                    <td style={tdStyle}><input style={smallInputStyle} value={row.account} onChange={(event) => updateRow(row.id, { account: event.target.value })} /></td>
                    <td style={tdStyle}><input style={smallInputStyle} value={row.contraAccount} onChange={(event) => updateRow(row.id, { contraAccount: event.target.value })} /></td>
                    <td style={tdStyle}><input style={{ ...smallInputStyle, minWidth: 70 }} value={row.buKey} onChange={(event) => updateRow(row.id, { buKey: event.target.value })} /></td>
                    <td style={tdStyle}><input type="date" style={{ ...smallInputStyle, minWidth: 135 }} value={row.belegDate} onChange={(event) => updateRow(row.id, { belegDate: event.target.value })} /></td>
                    <td style={tdStyle}><input style={{ ...smallInputStyle, minWidth: 140 }} value={row.belegfeld1} onChange={(event) => updateRow(row.id, { belegfeld1: event.target.value })} /></td>
                    <td style={tdStyle}><input style={{ ...smallInputStyle, minWidth: 220 }} value={row.bookingText} onChange={(event) => updateRow(row.id, { bookingText: event.target.value })} /></td>
                    <td style={tdStyle}><input style={{ ...smallInputStyle, minWidth: 90 }} value={row.kost1} onChange={(event) => updateRow(row.id, { kost1: event.target.value })} /></td>
                    <td style={tdStyle}><input style={{ ...smallInputStyle, minWidth: 90 }} value={row.kost2} onChange={(event) => updateRow(row.id, { kost2: event.target.value })} /></td>
                    <td style={{ ...tdStyle, color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.documentFileName}>{row.documentFileName}</td>
                    <td style={tdStyle}><button type="button" style={secondaryButtonStyle} onClick={() => removeRow(row.id)}>Löschen</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const thStyle: CSSProperties = {
  padding: "10px 8px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  color: "#374151",
  fontWeight: 800,
};

const tdStyle: CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
};
