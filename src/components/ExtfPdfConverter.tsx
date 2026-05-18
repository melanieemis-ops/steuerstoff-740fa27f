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

const responsiveCss = `
  .extf-page,
  .extf-page *,
  .extf-page *::before,
  .extf-page *::after {
    box-sizing: border-box;
  }

  .extf-page {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: clamp(16px, 4vw, 28px) clamp(12px, 4vw, 16px) 48px;
    color: #111827;
    overflow-x: hidden;
  }

  .extf-header {
    margin-bottom: 20px;
    min-width: 0;
  }

  .extf-kicker {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    font-weight: 700;
  }

  .extf-title {
    margin: 4px 0 8px;
    font-size: clamp(28px, 4vw, 42px);
    line-height: 1.05;
    overflow-wrap: anywhere;
  }

  .extf-lead {
    margin: 0;
    max-width: 760px;
    color: #4b5563;
    font-size: 16px;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }

  .extf-card {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: clamp(14px, 4vw, 18px);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    overflow: hidden;
  }

  .extf-section-title {
    margin: 0 0 14px;
    font-size: 20px;
    line-height: 1.2;
  }

  .extf-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    min-width: 0;
    width: 100%;
  }

  .extf-wide-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    min-width: 0;
    width: 100%;
    margin-top: 12px;
  }

  .extf-label {
    display: grid;
    gap: 6px;
    min-width: 0;
    max-width: 100%;
    font-size: 13px;
    font-weight: 650;
    color: #374151;
  }

  .extf-input,
  .extf-small-input {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 9px 10px;
    font-size: 16px;
    line-height: 1.35;
    background: #fff;
    color: #111827;
  }

  .extf-input:disabled {
    background: #f9fafb;
    color: #4b5563;
  }

  .extf-small-input {
    min-width: 105px;
    padding: 7px 8px;
    font-size: 14px;
  }

  .extf-checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    font-size: 14px;
    font-weight: 650;
    color: #374151;
    padding-top: 26px;
  }

  .extf-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    max-width: 100%;
  }

  .extf-button,
  .extf-secondary-button {
    max-width: 100%;
    border: 0;
    border-radius: 12px;
    padding: 11px 14px;
    font-size: 14px;
    font-weight: 750;
    cursor: pointer;
    background: #111827;
    color: #fff;
    white-space: normal;
  }

  .extf-secondary-button {
    background: #f3f4f6;
    color: #111827;
    border: 1px solid #e5e7eb;
  }

  .extf-button:disabled,
  .extf-secondary-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .extf-note {
    margin: 12px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
  }

  .extf-error {
    margin-top: 12px;
    color: #991b1b;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 12px;
  }

  .extf-message {
    margin-top: 12px;
    color: #92400e;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 12px;
  }

  .extf-table-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .extf-empty-state {
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    padding: 24px;
    color: #64748b;
    background: #f8fafc;
  }

  .extf-table-wrap {
    overflow-x: auto;
    max-width: 100%;
    width: 100%;
    -webkit-overflow-scrolling: touch;
  }

  .extf-table {
    border-collapse: collapse;
    width: 100%;
    min-width: 1180px;
    font-size: 13px;
  }

  @media (max-width: 720px) {
    html,
    body,
    #root {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    .extf-page {
      width: 100%;
      max-width: 100vw;
      padding-left: 12px;
      padding-right: 12px;
      overflow-x: hidden;
    }

    .extf-title {
      font-size: 30px;
    }

    .extf-lead {
      font-size: 15px;
    }

    .extf-card {
      border-radius: 16px;
      padding: 14px;
    }

    .extf-form-grid,
    .extf-wide-grid {
      grid-template-columns: 1fr !important;
      gap: 12px;
    }

    .extf-checkbox-label {
      padding-top: 4px;
    }

    .extf-actions {
      display: grid;
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    .extf-button,
    .extf-secondary-button {
      width: 100%;
      justify-content: center;
      text-align: center;
    }

    .extf-table {
      min-width: 1080px;
    }
  }
`;

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
        newRows.push(...bookings.map((booking, bookingIndex) => toUiBooking(booking, rows.length + newRows.length + bookingIndex + index)));
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
    <div className="extf-page">
      <style>{responsiveCss}</style>

      <header className="extf-header">
        <p className="extf-kicker">Steuerstoff</p>
        <h1 className="extf-title">PDF zu EXTF-CSV</h1>
        <p className="extf-lead">
          Lade Rechnungs-PDFs oder Kontoauszugs-PDFs hoch, prüfe die erkannten Buchungssätze und lade danach eine EXTF-CSV für den Import herunter.
        </p>
      </header>

      <section className="extf-card" style={{ marginBottom: 16 }}>
        <h2 className="extf-section-title">1. Grundeinstellungen</h2>
        <div className="extf-form-grid">
          <label className="extf-label">
            PDF-Art
            <select
              className="extf-input"
              value={form.pdfDocumentKind}
              onChange={(event) => setForm({ ...form, pdfDocumentKind: event.target.value as PdfDocumentKind })}
            >
              <option value="invoice">Rechnung / Einzelbeleg</option>
              <option value="bankStatement">Bankkontoauszug</option>
            </select>
          </label>

          <label className="extf-label">
            Standard-Art
            <select
              className="extf-input"
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value as VoucherKind })}
              disabled={form.pdfDocumentKind === "bankStatement"}
            >
              <option value="revenue">Einnahme: Bank/Kasse S an Erlöse</option>
              <option value="expense">Ausgabe: Bank/Kasse H an Aufwand</option>
            </select>
          </label>

          <label className="extf-label">
            Bank/Kasse Konto
            <input className="extf-input" value={form.bankAccount} onChange={(event) => setForm({ ...form, bankAccount: event.target.value })} />
          </label>

          <label className="extf-label">
            Erlöskonto
            <input className="extf-input" value={form.revenueAccount} onChange={(event) => setForm({ ...form, revenueAccount: event.target.value })} />
          </label>

          <label className="extf-label">
            Aufwandskonto
            <input className="extf-input" value={form.expenseAccount} onChange={(event) => setForm({ ...form, expenseAccount: event.target.value })} />
          </label>

          <label className="extf-label">
            Beraternummer
            <input className="extf-input" value={form.berater} onChange={(event) => setForm({ ...form, berater: event.target.value })} />
          </label>

          <label className="extf-label">
            Mandantennummer
            <input className="extf-input" value={form.mandant} onChange={(event) => setForm({ ...form, mandant: event.target.value })} />
          </label>

          <label className="extf-label">
            Wirtschaftsjahr Beginn
            <input type="date" className="extf-input" value={form.fiscalYearStart} onChange={(event) => setForm({ ...form, fiscalYearStart: event.target.value })} />
          </label>

          <label className="extf-label">
            Periode von
            <input type="date" className="extf-input" value={form.periodStart} onChange={(event) => setForm({ ...form, periodStart: event.target.value })} />
          </label>

          <label className="extf-label">
            Periode bis
            <input type="date" className="extf-input" value={form.periodEnd} onChange={(event) => setForm({ ...form, periodEnd: event.target.value })} />
          </label>

          <label className="extf-label">
            Währung
            <input className="extf-input" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} />
          </label>

          <label className="extf-label">
            Herkunft
            <input className="extf-input" value={form.creator} onChange={(event) => setForm({ ...form, creator: event.target.value })} />
          </label>

          <label className="extf-label">
            Kontenrahmen/Kz.
            <input className="extf-input" value={form.accountingReason} onChange={(event) => setForm({ ...form, accountingReason: event.target.value })} />
          </label>
        </div>

        <div className="extf-wide-grid">
          <label className="extf-label">
            Stapelbezeichnung
            <input className="extf-input" value={form.batchName} onChange={(event) => setForm({ ...form, batchName: event.target.value })} />
          </label>

          <label className="extf-label">
            Festschreibung
            <select
              className="extf-input"
              value={form.festschreibung}
              onChange={(event) => setForm({ ...form, festschreibung: event.target.value as "0" | "1" })}
            >
              <option value="0">0 - nicht festgeschrieben</option>
              <option value="1">1 - festgeschrieben</option>
            </select>
          </label>

          <label className="extf-checkbox-label">
            <input
              type="checkbox"
              checked={form.addUtf8Bom}
              onChange={(event) => setForm({ ...form, addUtf8Bom: event.target.checked })}
            />
            UTF-8 BOM in CSV schreiben
          </label>
        </div>
      </section>

      <section className="extf-card" style={{ marginBottom: 16 }}>
        <h2 className="extf-section-title">2. PDFs hochladen</h2>
        <div className="extf-actions">
          <label className="extf-button" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
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

          <button type="button" className="extf-secondary-button" onClick={clearRows} disabled={rows.length === 0 || isLoading}>
            Tabelle leeren
          </button>

          <button type="button" className="extf-button" onClick={handleDownload} disabled={validRows.length === 0 || isLoading}>
            EXTF-CSV herunterladen
          </button>

          {isLoading ? <span style={{ color: "#6b7280", fontWeight: 650 }}>PDFs werden gelesen …</span> : null}
        </div>

        <p className="extf-note">
          Hinweis: Das funktioniert direkt im Browser für Text-PDFs. Kontoauszüge werden automatisch erkannt, reine Scan-PDFs brauchen später zusätzlich OCR.
        </p>

        {error ? <div className="extf-error">{error}</div> : null}

        {messages.length > 0 ? (
          <div className="extf-message">
            <strong>Hinweise:</strong>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {messages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="extf-card">
        <div className="extf-table-head">
          <h2 className="extf-section-title" style={{ margin: 0 }}>3. Buchungssätze prüfen</h2>
          <span style={{ color: "#6b7280", fontSize: 14 }}>{validRows.length} gültige Zeile(n)</span>
        </div>

        {rows.length === 0 ? (
          <div className="extf-empty-state">
            Noch keine Buchungssätze. Lade oben eine oder mehrere PDF-Dateien hoch.
          </div>
        ) : (
          <div className="extf-table-wrap">
            <table className="extf-table">
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
                    <td style={tdStyle}><input className="extf-small-input" value={row.amount} onChange={(event) => updateRow(row.id, { amount: event.target.value })} /></td>
                    <td style={tdStyle}>
                      <select className="extf-small-input" style={{ minWidth: 70 }} value={row.sollHaben} onChange={(event) => updateRow(row.id, { sollHaben: event.target.value as SollHabenKennzeichen })}>
                        <option value="S">S</option>
                        <option value="H">H</option>
                      </select>
                    </td>
                    <td style={tdStyle}><input className="extf-small-input" value={row.account} onChange={(event) => updateRow(row.id, { account: event.target.value })} /></td>
                    <td style={tdStyle}><input className="extf-small-input" value={row.contraAccount} onChange={(event) => updateRow(row.id, { contraAccount: event.target.value })} /></td>
                    <td style={tdStyle}><input className="extf-small-input" style={{ minWidth: 70 }} value={row.buKey} onChange={(event) => updateRow(row.id, { buKey: event.target.value })} /></td>
                    <td style={tdStyle}><input type="date" className="extf-small-input" style={{ minWidth: 135 }} value={row.belegDate} onChange={(event) => updateRow(row.id, { belegDate: event.target.value })} /></td>
                    <td style={tdStyle}><input className="extf-small-input" style={{ minWidth: 140 }} value={row.belegfeld1} onChange={(event) => updateRow(row.id, { belegfeld1: event.target.value })} /></td>
                    <td style={tdStyle}><input className="extf-small-input" style={{ minWidth: 220 }} value={row.bookingText} onChange={(event) => updateRow(row.id, { bookingText: event.target.value })} /></td>
                    <td style={tdStyle}><input className="extf-small-input" style={{ minWidth: 90 }} value={row.kost1} onChange={(event) => updateRow(row.id, { kost1: event.target.value })} /></td>
                    <td style={tdStyle}><input className="extf-small-input" style={{ minWidth: 90 }} value={row.kost2} onChange={(event) => updateRow(row.id, { kost2: event.target.value })} /></td>
                    <td style={{ ...tdStyle, color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.documentFileName}>{row.documentFileName}</td>
                    <td style={tdStyle}><button type="button" className="extf-secondary-button" onClick={() => removeRow(row.id)}>Löschen</button></td>
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
