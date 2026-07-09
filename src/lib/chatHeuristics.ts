// Lightweight heuristic "AI" answer engine for the steuerstoff Chat MVP.
// Replace generateAnswer() with a real API call later.

import { lookupLexicon } from "./taxLexicon";

export type ChatLink = { label: string; to: string };

export interface ChatAnswer {
  summary: string;
  reasoning?: string;
  /** Strukturierte Abgrenzungen (optional, statt langer Fließtext-Begründung). */
  sections?: { title: string; body: string }[];
  risks?: string[];
  followUps?: string[];
  nextStep?: string;
  links?: ChatLink[];
  knowledge?: string;
  /** Optionale Folgefrage am Ende ("Meinst du …?"). */
  clarify?: string;
  /** Kompakter Antworttyp — UI kann Prüfkarte schlanker rendern. */
  kind?: "info" | "case" | "npo" | "mvr";
}

const has = (q: string, ...terms: string[]) =>
  terms.some((t) => q.includes(t));

const REVIEW =
  "steuerstoff ist eine Arbeitshilfe und ersetzt keine verbindliche steuerliche Beratung. Bitte fachlich prüfen lassen.";

// ============================================================
// USt-Klassifizierung — bestimmt VOR § 13b die Sachverhaltsart
// (Lieferung, sonstige Leistung, ig. Erwerb, ig. Lieferung,
//  Werklieferung/-leistung, Reihengeschäft, Grundstück,
//  Ausfuhr, Einfuhr, unentgeltliche Wertabgabe, Verbringen).
// ============================================================

type UstType =
  | "innergemeinschaftlicher_erwerb"
  | "innergemeinschaftliche_lieferung"
  | "reverse_charge"
  | "werklieferung"
  | "werkleistung"
  | "reihengeschaeft"
  | "grundstueck"
  | "ausfuhr"
  | "einfuhr"
  | "unentgeltliche_wertabgabe"
  | "verbringen"
  | "lieferung_inland"
  | "sonstige_leistung"
  | "unbestimmt";

interface UstClassification {
  type: UstType;
  label: string;
  paragraph: string;
  reasoning: string;
  scheme: { title: string; body: string }[];
  followUps: string[];
  negative?: string;
  /** true, wenn alle klassifizierungsrelevanten Angaben im Prompt enthalten sind → keine Rückfragen stellen */
  complete?: boolean;
  /** Kompaktes Endergebnis bei vollständigem Sachverhalt */
  ergebnis?: string;
  /** Kurze, nachvollziehbare Erkennungsspur (Signale → Norm). */
  trail?: string;
}


function classifyUst(q: string): UstClassification | null {
  if (!hasUstTriggers(q)) return null;


  const hasWare = /\b(ware|gegenst|liefer|lieferung|transport|versand|maschine|geraet|gerät|hardware|material|palette|container)\b/i.test(q);
  const hasDienst = /\b(dienstleistung|beratung|reparatur|softwarelizen|lizenz|schulung|werkleistung|montage(?!\s*mit)|honorar|design|marketing|übersetzung|uebersetzung)\b/i.test(q);
  const nachDE = /\b(nach\s+deutschland|nach\s+de\b|ins\s+inland|inland)\b/i.test(q);
  const ausDE = /\b(aus\s+deutschland|von\s+deutschland|ins\s+ausland|nach\s+(österreich|oesterreich|frankreich|italien|spanien|niederlande|polen|belgien|eu-?ausland))\b/i.test(q);
  const euCtx = /\b(eu-?ausland|innergemein|frankreich|italien|spanien|niederlande|polen|belgien|österreich|oesterreich|irland|luxemburg|tschechien|slowakei|schweden|dänemark|daenemark|finnland|portugal|griechenland|ungarn)\b/i.test(q);
  const drittland = /\b(drittland|schweiz|usa|uk|großbritannien|grossbritannien|china|japan|türkei|tuerkei)\b/i.test(q);
  const b2b = /\b(unternehmer|b2b|ust-?id|ustid|umsatzsteuer-?identifikationsnummer)\b/i.test(q);
  const grundstueck = /\b(grundst|immobilie|gebäude|gebaeude|wohnung|bauleistung|bauträger|bautraeger)\b/i.test(q);
  const werkMitMaterial = /\bwerklieferung|montage\s+mit\s+material|einbau\s+mit\s+material\b/i.test(q);
  const werkOhneMaterial = /\bwerkleistung|reparatur|montage(?!\s*mit\s*material)|installation\b/i.test(q);
  const reihe = /\breihengesch|kettengesch|drei(ecks|-ecks?)gesch/i.test(q);
  const verbringen = /\bverbringen|eigene ware ins ausland|innergemeinschaftliches verbringen\b/i.test(q);
  const uwa = /\bunentgeltlich|privatnutzung|privatentnahme|wertabgabe\b/i.test(q);
  const rechnungOhneUst = /\brechnung\s+ohne\s+(ust|mwst|umsatzsteuer|steuer)|ohne\s+(ausgewiesene\s+)?(ust|mwst|umsatzsteuer)\b/i.test(q);
  const transportNachDE = /\b(transport|versand|bef(ö|oe)rder|versendet|geliefert|gelangt)[^.]*\b(nach\s+de(utschland)?|ins\s+inland)\b/i.test(q)
    || /\bvon\s+(den\s+niederlanden|niederlande|frankreich|italien|spanien|polen|belgien|österreich|oesterreich|irland|luxemburg|tschechien|slowakei|schweden|dänemark|daenemark|finnland|portugal|griechenland|ungarn)\s+nach\s+de(utschland)?\b/i.test(q);
  const bothUstId = /\b(beide|jeweils|jeder)[^.]*ust-?id/i.test(q)
    || (/(ust-?id|ustid|umsatzsteuer-?identifikationsnummer)/i.test(q) && b2b);

  // Kurze, menschlich lesbare Signal-Spur für die Antwort ("Erkennung: …").
  const signals: string[] = [];
  if (hasWare && !hasDienst) signals.push("Ware/Lieferung");
  else if (hasDienst && !hasWare) signals.push("sonstige Leistung");
  else if (hasWare && hasDienst) signals.push("Ware + Leistung");
  if (nachDE) signals.push("→ Deutschland");
  if (ausDE) signals.push("aus Deutschland →");
  if (euCtx) signals.push("EU-Ausland");
  if (drittland) signals.push("Drittland");
  if (b2b) signals.push("B2B");
  if (bothUstId) signals.push("beide USt-IdNr.");
  if (grundstueck) signals.push("Grundstück");
  if (reihe) signals.push("Reihe/Dreieck");
  if (werkMitMaterial) signals.push("Werk mit Material");
  else if (werkOhneMaterial) signals.push("Werk ohne Material");
  const buildTrail = (norm: string) =>
    `Erkennung: ${signals.length ? signals.join(" · ") : "USt-Sachverhalt"} → ${norm}`;

  const baseScheme = (extra: { title: string; body: string }[] = []) => [

    { title: "1. Sachverhaltsart", body: "" }, // filled per type
    { title: "2. Steuerbarkeit", body: "§ 1 Abs. 1 UStG prüfen (Leistung im Inland, gegen Entgelt, im Rahmen des Unternehmens)." },
    { title: "3. Ort", body: "§§ 3, 3a–3g UStG — Ortsbestimmung je nach Leistungsart." },
    { title: "4. Steuerbefreiung / -pflicht", body: "§ 4 UStG (z. B. Nr. 1b ig. Lieferung, Nr. 1a Ausfuhr, Nr. 9a Grundstück) oder Steuerpflicht 7 %/19 %." },
    { title: "5. Steuerschuldner", body: "§ 13a UStG Regel, § 13b UStG nur bei ausdrücklich normierten Fällen." },
    { title: "6. Bemessungsgrundlage", body: "§ 10 UStG — Entgelt ohne USt." },
    { title: "7. Steuerbetrag", body: "§ 12 UStG — Regelsatz 19 %, ermäßigt 7 %." },
    { title: "8. Vorsteuerabzug", body: "§ 15 UStG — ordnungsgemäße Rechnung (§ 14 UStG), Verwendung für steuerpflichtige Ausgangsumsätze." },
    ...extra,
  ];

  // 1) Innergemeinschaftlicher Erwerb — Ware aus EU-Ausland nach DE, B2B
  if (hasWare && euCtx && !hasDienst && !drittland && !reihe && !uwa) {
    const scheme = baseScheme();
    scheme[0].body = "Warenbewegung aus einem anderen EU-Mitgliedstaat nach Deutschland an einen Unternehmer für sein Unternehmen → innergemeinschaftlicher Erwerb (§ 1a UStG).";
    scheme[4].body = "Steuerschuldner ist der Erwerber (§ 13a Abs. 1 Nr. 2 UStG). Kein § 13b UStG — dieser gilt nur für sonstige Leistungen und einzelne Sonderfälle.";
    scheme[2].body = "Ort des Erwerbs: Ende der Beförderung/Versendung (§ 3d Satz 1 UStG) — hier Deutschland.";
    const complete = b2b && bothUstId && (transportNachDE || nachDE);
    if (complete) {
      scheme[3].body = "Steuerpflichtig 19 % (§ 12 Abs. 1 UStG) bzw. 7 % (§ 12 Abs. 2 UStG) — keine Befreiung einschlägig.";
      scheme[5].body = "Bemessungsgrundlage: Entgelt der Rechnung (§ 10 Abs. 1 UStG) ohne USt.";
      scheme[6].body = "Erwerbsteuer 19 % auf das Entgelt (§ 12 Abs. 1 UStG).";
      scheme[7].body = "Vorsteuerabzug in gleicher Höhe (§ 15 Abs. 1 Satz 1 Nr. 3 UStG), soweit für steuerpflichtige Ausgangsumsätze verwendet → wirtschaftlich neutral.";
    }
    return {
      type: "innergemeinschaftlicher_erwerb",
      label: "Innergemeinschaftlicher Erwerb",
      paragraph: "§ 1a UStG",
      trail: buildTrail("§ 1a UStG (ig. Erwerb)"),
      reasoning:
        "Ware gelangt aus einem EU-Mitgliedstaat nach Deutschland an einen Unternehmer für sein Unternehmen. Das ist ein ig. Erwerb (§ 1a UStG), kein Reverse Charge nach § 13b UStG.",
      scheme,
      followUps: complete
        ? []
        : [
            "Ist die USt-IdNr. des Erwerbers dem Lieferer mitgeteilt worden?",
            "Wurde der Erwerb im Inland (Deutschland) beendet?",
            "Erfolgt der Erwerb ausschließlich für das Unternehmen?",
          ],
      negative: "Reverse Charge nach § 13b UStG bewusst NICHT anwenden — bei Warenbewegung greift § 1a UStG (ig. Erwerb).",
      complete,
      ergebnis: complete
        ? "Innergemeinschaftlicher Erwerb im Inland steuerbar (§ 1 Abs. 1 Nr. 5, § 3d S. 1 UStG) und steuerpflichtig (19 %). Steuerschuldner ist der deutsche Erwerber (§ 13a Abs. 1 Nr. 2 UStG); zugleich Vorsteuerabzug in gleicher Höhe nach § 15 Abs. 1 S. 1 Nr. 3 UStG → Zahllast 0. Meldepflichten: Erwerb in UStVA (Zeilen ig. Erwerbe 19 %), Lieferer meldet ig. Lieferung in ZM."
        : undefined,
    };

  }

  // 2) Innergemeinschaftliche Lieferung
  if (hasWare && ausDE && euCtx) {
    const scheme = baseScheme();
    scheme[0].body = "Warenlieferung aus Deutschland in einen anderen EU-Mitgliedstaat an einen Unternehmer → innergemeinschaftliche Lieferung (§ 6a UStG).";
    scheme[3].body = "Steuerbefreit nach § 4 Nr. 1b i. V. m. § 6a UStG bei gültiger USt-IdNr. des Abnehmers, Nachweisen (Gelangensbestätigung), Meldung ZM.";
    const complete = b2b && bothUstId;
    return {
      type: "innergemeinschaftliche_lieferung",
      label: "Innergemeinschaftliche Lieferung",
      paragraph: "§ 6a UStG, § 4 Nr. 1b UStG",
      trail: buildTrail("§ 6a UStG (ig. Lieferung)"),
      reasoning: "Ware verlässt Deutschland in Richtung EU-Ausland an einen Unternehmer — steuerfreie ig. Lieferung, kein § 13b UStG.",
      scheme,
      followUps: complete
        ? []
        : [
            "Liegt die gültige USt-IdNr. des Abnehmers vor (qualifizierte Bestätigungsanfrage)?",
            "Ist die Gelangensbestätigung / der Belegnachweis vollständig?",
            "Zusammenfassende Meldung (ZM) fristgerecht eingereicht?",
          ],
      complete,
      ergebnis: complete
        ? "Steuerbare Lieferung (§ 1 Abs. 1 Nr. 1 UStG), steuerfrei als ig. Lieferung (§ 4 Nr. 1b i. V. m. § 6a UStG). Rechnung ohne USt mit Hinweis auf Steuerbefreiung (§ 14 Abs. 4 Nr. 8 UStG). Beleg- und Buchnachweis (§§ 17a ff. UStDV) sowie ZM-Meldung (§ 18a UStG) erforderlich."
        : undefined,
    };

  }

  // 3) Reihengeschäft
  if (reihe) {
    const scheme = baseScheme();
    scheme[0].body = "Mehrere Unternehmer schließen Umsatzgeschäfte über denselben Gegenstand, der unmittelbar vom ersten Lieferer an den letzten Abnehmer gelangt → Reihengeschäft (§ 3 Abs. 6a UStG).";
    scheme[2].body = "Nur eine Lieferung ist die 'bewegte' Lieferung (Ort Beginn der Beförderung), die übrigen sind 'ruhende' Lieferungen (§ 3 Abs. 7 UStG).";
    return {
      type: "reihengeschaeft",
      label: "Reihengeschäft",
      paragraph: "§ 3 Abs. 6a, § 3 Abs. 7 UStG",
      trail: buildTrail("§ 3 Abs. 6a UStG (Reihengeschäft)"),
      reasoning: "Beteiligte, Transportverantwortung und USt-IdNr. entscheiden über die bewegte Lieferung — § 13b UStG greift hier nicht automatisch.",
      scheme,
      followUps: [
        "Wer transportiert / beauftragt den Transport?",
        "Welche USt-IdNr. verwendet der mittlere Unternehmer?",
        "Handelt es sich um ein innergemeinschaftliches Dreiecksgeschäft (§ 25b UStG)?",
      ],
    };

  }

  // 4) Werklieferung / Werkleistung
  if (werkMitMaterial) {
    const scheme = baseScheme();
    scheme[0].body = "Werklieferung: Unternehmer stellt aus selbst beschafftem Hauptstoff ein Werk her → Lieferung (§ 3 Abs. 4 UStG).";
    return {
      type: "werklieferung",
      label: "Werklieferung",
      paragraph: "§ 3 Abs. 4 UStG",
      trail: buildTrail("§ 3 Abs. 4 UStG (Werklieferung)"),
      reasoning: "Wird der Hauptstoff vom leistenden Unternehmer beschafft, liegt eine Lieferung vor — Ortsbestimmung nach Lieferungsregeln.",
      scheme,
      complete: true,
      followUps: [],
    };
  }
  if (werkOhneMaterial) {
    const scheme = baseScheme();
    scheme[0].body = "Werkleistung: Bearbeitung/Verarbeitung fremder Gegenstände → sonstige Leistung (§ 3 Abs. 9 UStG).";
    const complete = b2b && (euCtx || drittland || nachDE || ausDE);
    return {
      type: "werkleistung",
      label: "Werkleistung",
      paragraph: "§ 3 Abs. 9 UStG",
      trail: buildTrail("§ 3 Abs. 9 UStG (Werkleistung / sonstige Leistung)"),
      reasoning: "Wird kein Hauptstoff geliefert, liegt eine sonstige Leistung vor. § 13b UStG nur, wenn Empfänger Unternehmer und Leistender im Ausland ansässig ist.",
      scheme,
      complete,
      followUps: complete ? [] : ["Wo ist der Leistende ansässig?", "Empfänger Unternehmer (B2B)?"],
    };

  }

  // 5) Grundstück
  if (grundstueck) {
    const scheme = baseScheme();
    scheme[0].body = "Grundstücksbezogene Leistung / Grundstücksumsatz — Ort nach § 3a Abs. 3 Nr. 1 UStG (Belegenheitsort); Umsatz ggf. steuerfrei nach § 4 Nr. 9a UStG mit Optionsmöglichkeit § 9 UStG.";
    return {
      type: "grundstueck",
      label: "Grundstücksleistung / Grundstücksumsatz",
      paragraph: "§ 3a Abs. 3 Nr. 1, § 4 Nr. 9a, § 9, § 13b Abs. 2 Nr. 3 UStG",
      trail: buildTrail("§ 3a Abs. 3 Nr. 1 UStG (Grundstück)"),
      reasoning: "Bei Grundstücken gelten Sonderregeln (Belegenheitsort, § 4 Nr. 9a Befreiung, Option, ggf. § 13b Abs. 2 Nr. 3).",
      scheme,
      followUps: ["Verkauf oder Vermietung?", "Wird zur Steuerpflicht optiert (§ 9 UStG)?", "Empfänger Unternehmer?"],
    };

  }

  // 6) Ausfuhr / Einfuhr
  if (hasWare && drittland && ausDE) {
    const scheme = baseScheme();
    scheme[0].body = "Ausfuhrlieferung ins Drittland (§ 6 UStG), steuerfrei nach § 4 Nr. 1a UStG bei Belegnachweis (Ausfuhrnachweis, Buchnachweis).";
    return {
      type: "ausfuhr", label: "Ausfuhrlieferung", paragraph: "§ 6, § 4 Nr. 1a UStG",
      reasoning: "Ware verlässt das Zollgebiet der EU — steuerfreie Ausfuhrlieferung.", scheme,
      followUps: ["Liegt Ausfuhrnachweis (MRN/EAD) vor?", "Buchnachweis vollständig?"],
    };
  }
  if (hasWare && drittland && nachDE) {
    const scheme = baseScheme();
    scheme[0].body = "Einfuhr aus dem Drittland → Einfuhrumsatzsteuer (§ 1 Abs. 1 Nr. 4 UStG), Vorsteuerabzug nach § 15 Abs. 1 Nr. 2 UStG.";
    return {
      type: "einfuhr", label: "Einfuhr / EUSt", paragraph: "§ 1 Abs. 1 Nr. 4, § 15 Abs. 1 Nr. 2 UStG",
      reasoning: "Bei Wareneinfuhr aus Drittland entsteht EUSt beim Zoll — kein § 13b UStG.", scheme,
      followUps: ["Zollbeleg / EUSt-Bescheid vorhanden?"],
    };
  }

  // 7) Verbringen
  if (verbringen) {
    const scheme = baseScheme();
    scheme[0].body = "Innergemeinschaftliches Verbringen eigener Ware ins EU-Ausland → einer ig. Lieferung gleichgestellt (§ 3 Abs. 1a UStG).";
    return {
      type: "verbringen", label: "Innergemeinschaftliches Verbringen", paragraph: "§ 3 Abs. 1a UStG",
      reasoning: "Eigene Ware wird ohne Umsatz ins EU-Ausland verbracht — als ig. Lieferung/ig. Erwerb zu behandeln.", scheme,
      followUps: ["Zweck der Verbringung (dauerhaft / vorübergehend)?"],
    };
  }

  // 8) Unentgeltliche Wertabgabe
  if (uwa) {
    const scheme = baseScheme();
    scheme[0].body = "Unentgeltliche Wertabgabe (§ 3 Abs. 1b / Abs. 9a UStG) — Gleichstellung mit entgeltlicher Lieferung/Leistung.";
    return {
      type: "unentgeltliche_wertabgabe", label: "Unentgeltliche Wertabgabe", paragraph: "§ 3 Abs. 1b, Abs. 9a UStG",
      reasoning: "Privatnutzung / Entnahme aus dem Unternehmen — Bemessungsgrundlage § 10 Abs. 4 UStG.", scheme,
      followUps: ["Vorsteuerabzug bei Anschaffung möglich gewesen?", "Nutzungsanteil dokumentiert?"],
    };
  }

  // 9) Reverse Charge — nur wenn wirklich sonstige Leistung / § 13b-Fall
  const explicitRC = /\breverse\s*charge|§\s*13b|13b\s*ustg\b/i.test(q);
  if (explicitRC || (hasDienst && (euCtx || drittland) && b2b)) {
    const scheme = baseScheme();
    scheme[0].body = "Sonstige Leistung eines im Ausland ansässigen Unternehmers an einen inländischen Unternehmer → Reverse Charge (§ 13b Abs. 1/Abs. 2 UStG).";
    scheme[4].body = "Steuerschuldner ist der Leistungsempfänger (§ 13b Abs. 5 UStG). Rechnung ohne USt mit Hinweis 'Steuerschuldnerschaft des Leistungsempfängers'.";
    return {
      type: "reverse_charge",
      label: "Reverse Charge",
      paragraph: "§ 13b UStG",
      reasoning:
        "Nur bei ausdrücklich in § 13b UStG genannten Fällen (v. a. sonstige Leistungen ausländischer Unternehmer, Bauleistungen B2B, Schrott, Gebäudereinigung, Emissionshandel).",
      scheme,
      followUps: [
        "Handelt es sich wirklich um eine sonstige Leistung (nicht Ware)?",
        "Ist der Leistende im Ausland ansässig?",
        "Empfänger inländischer Unternehmer?",
      ],
    };
  }

  // 10) Kein spezifischer Typ erkannt, aber USt-Trigger vorhanden
  //     → USt-Workflow trotzdem starten (keine allgemeine „Welche Steuerart?"-Rückfrage).
  return {
    type: "unbestimmt",
    label: "Umsatzsteuerlicher Sachverhalt — Klassifizierung erforderlich",
    paragraph: "§ 1 UStG (Systematik)",
    reasoning:
      "Umsatzsteuerliche Begriffe im Prompt erkannt. Die konkrete Sachverhaltsart (Lieferung, sonstige Leistung, ig. Erwerb § 1a, ig. Lieferung § 6a, Reverse Charge § 13b, Ausfuhr § 6, Einfuhr, Reihen-/Dreiecksgeschäft) ist noch nicht eindeutig — bitte die entscheidungserheblichen Angaben ergänzen.",
    scheme: [
      { title: "1. Was wurde geleistet?", body: "Ware (Lieferung, § 3 Abs. 1 UStG) oder Dienstleistung (sonstige Leistung, § 3 Abs. 9 UStG)?" },
      { title: "2. Warenweg / Leistungsort", body: "Woher / wohin? Inland, EU-Ausland oder Drittland? Ort nach §§ 3, 3a–3g UStG." },
      { title: "3. Beteiligte", body: "B2B mit gültigen USt-IdNr.? Ansässigkeit des Leistenden / Empfängers?" },
      { title: "4. Rechnungsangaben", body: "USt ausgewiesen? Hinweis auf § 13b oder ig. Lieferung? § 14 UStG." },
      { title: "5. Erst dann Norm", body: "§ 1a (ig. Erwerb) vs. § 13b (RC) vs. § 6a (ig. Lieferung) vs. § 25b (Dreieck) vs. § 6 (Ausfuhr) usw." },
    ],
    followUps: [
      "Handelt es sich um Ware oder Dienstleistung?",
      "Aus welchem Land wird geliefert / geleistet, wohin?",
      "Sind beide Beteiligte Unternehmer (USt-IdNr.)?",
    ],
    negative:
      "Bitte nicht vorschnell auf § 13b UStG schließen — bei Warenbewegungen ist regelmäßig § 1a UStG (ig. Erwerb) einschlägig.",
  };
}


function classifyUstSachverhalt(q: string): ChatAnswer | null {
  const c = classifyUst(q);
  if (!c) return null;
  const sections = [
    { title: "Sachverhaltsart", body: `${c.label} (${c.paragraph})` },
    ...c.scheme,
    { title: "9. Ergebnis", body: c.ergebnis ?? c.reasoning },
  ];
  if (c.negative) sections.push({ title: "Nicht anwenden", body: c.negative });
  return {
    kind: "case",
    summary: c.complete
      ? `USt-Prüfung abgeschlossen: ${c.label} (${c.paragraph}).`
      : `USt-Prüfung: ${c.label} (${c.paragraph}).`,
    reasoning: c.reasoning,
    sections,
    followUps: c.complete ? undefined : c.followUps,
    nextStep: c.complete
      ? "Buchung/Meldung ableiten: UStVA (ig. Erwerbe 19 %, Vorsteuer), ZM des Lieferers, Belegnachweise archivieren."
      : "Erst nach vollständiger Klassifizierung Buchung/Meldung ableiten (UStVA, ZM, ggf. § 18 Abs. 4c UStG).",
    knowledge: "Umsatzsteuer / Prüfschema",
    links: [
      { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      { label: "Strukturierte Anfrage anlegen", to: "/neue-anfrage" },
    ],
  };
}


// --- Meta-Intent „steuerstoff_info“ ---
function isSteuerstoffInfoQuery(q: string): boolean {
  const s = q.trim();
  if (!s) return false;
  // direkte Hilfe-Trigger
  if (/^(hilfe|einführung|einfuehrung|app erklären|app erklaeren)\??$/.test(s)) return true;
  // Fragen rund um die App / „du“
  const aboutApp =
    /\bsteuerstoff\b/.test(s) ||
    /\bdiese[r]?\s+app\b/.test(s) ||
    /\bdas\s+hier\b/.test(s) ||
    /\bder\s+steuerstoff\s+chat\b/.test(s);
  const askVerb =
    /^(was\s+(ist|kann|macht|bringt|bietet|leistet))\b/.test(s) ||
    /^(wofür|wofuer|wozu)\b/.test(s) ||
    /^(wie\s+(benutze|nutze|funktioniert))\b/.test(s) ||
    /^(erklär|erklaer|zeig|hilf)\b/.test(s) ||
    /\bwelche\s+funktionen\b/.test(s) ||
    /^was\s+kannst\s+du\b/.test(s);
  return aboutApp && askVerb;
}

function steuerstoffInfoAnswer(): ChatAnswer {
  return {
    kind: "info",
    summary:
      "steuerstoff ist dein steuerlicher KI-Arbeitsassistent für deutsche Steuerkanzleien. Du kannst einfache Fragen stellen oder konkrete Sachverhalte prüfen lassen – z. B. NPO-Sphären, SKR42-Konten, Mittelverwendung, Rücklagen, Kfz-Wertabgaben, Umsatzsteuer oder Jahresabschluss-Themen.",
    sections: [
      { title: "Steuer-Chat", body: "Einfache Fragen oder Sachverhalte beschreiben — steuerstoff gibt eine erste Einordnung, nennt offene Punkte und verweist auf passende Module." },
      { title: "NPO-Prüfassistent", body: "Sphären, Zweckbetrieb, Vermögensverwaltung, wirtschaftlicher Geschäftsbetrieb, Spenden, Zuschüsse, Mittelweitergabe und gemeinnützigkeitsrechtliche Risiken." },
      { title: "Mittelverwendungsrechner", body: "Zeitnahe Mittelverwendung, 45.000-€-Grenze, Rücklagen nach § 62 AO, Mittelvortrag, Rücklagenspiegel, Verwendungsüberhang." },
      { title: "SKR-Konverter", body: "SKR03-Konten und Buchungstexte in passende SKR42-Konten überführen — mit NPO-Sphärenlogik." },
      { title: "Kfz-Wertabgaben-Rechner", body: "Private Kfz-Nutzung nach 1-%-Methode, Fahrten Wohnung/Betrieb (0,03 %), USt-Aufteilung und Kostendeckelung." },
      { title: "Wissensdatenbank", body: "Handouts, Kanzlei-Standards, Steuerwissen, DATEV-Logiken, NPO-Wissen und Prüfhinweise." },
      { title: "Rückfragen & Review", body: "Mandantenrückfragen, interne Prüfnotizen, To-do-Listen und Review-Hinweise strukturiert erzeugen." },
      { title: "DATEV / Buchhaltung", body: "Buchungsvorschläge, Belegprüfung, OPOS, SKR-Logik, USt-Hinweise und Jahresabschlussvorbereitung." },
    ],
    nextStep:
      "steuerstoff ersetzt keine Steuerberatung — hilft aber dabei, Sachverhalte zu sortieren, Rückfragen zu formulieren, Buchungsvorschläge vorzubereiten und Review-Punkte zu dokumentieren.",
    links: [
      { label: "Neue Frage stellen", to: "/chat" },
      { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
      { label: "SKR-Konverter öffnen", to: "/skr-konverter" },
      { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
      { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      { label: "Kfz-Wertabgabe berechnen", to: "/kfz-wertabgabe" },
    ],
    knowledge: "Über steuerstoff",
  };
}

// Trigger-Wörter, die den USt-Workflow zwingend aktivieren.
const UST_TRIGGERS: RegExp[] = [
  /\brechnung(en)?\b/i,
  /\b(umsatzsteuer|ust|mwst|mehrwertsteuer)\b/i,
  /\bvorsteuer\b/i,
  /\b(ust-?id(nr)?\.?|ustid|umsatzsteuer-?identifikationsnummer)\b/i,
  /\breverse\s*charge\b/i,
  /§\s*13b|13b\s*ustg/i,
  /§\s*1a|1a\s*ustg/i,
  /§\s*3a|3a\s*ustg/i,
  /§\s*6a|6a\s*ustg/i,
  /\binnergemeinschaftlich(e[nrs]?)?\s+(erwerb|lieferung|verbringen)\b/i,
  /\big\.?\s*(erwerb|lieferung)\b/i,
  /\b(ware|waren|lieferung|liefer(n|t|ung)|dienstleistung|werklieferung|werkleistung)\b/i,
  /\b(eu-?ausland|eu\b|drittland)\b/i,
  /\b(niederlande|österreich|oesterreich|frankreich|polen|italien|spanien|belgien|luxemburg|tschechien|slowakei|schweden|dänemark|daenemark|finnland|portugal|griechenland|ungarn|irland)\b/i,
  /\bdeutschland|inland\b/i,
  /\b(transport|versand|bef(ö|oe)rder|versendet|gelangt|geliefert)\b/i,
  /\bleistungsort|ort\s+der\s+leistung\b/i,
  /\bsteuerschuldner(schaft)?\b/i,
  /\bbemessungsgrundlage\b/i,
  /\bausfuhrlieferung\b/i,
  /\berwerb\b/i,
  /\b(ausfuhr|einfuhr|eust|einfuhrumsatzsteuer)\b/i,
];

function ustTriggerCount(q: string): number {
  let n = 0;
  for (const r of UST_TRIGGERS) if (r.test(q)) n++;
  return n;
}

// Fachbegriffe, die für sich allein den USt-Workflow zwingend auslösen.
const UST_STRONG = /\b(umsatzsteuer|ust\b|mwst|mehrwertsteuer|vorsteuer|reverse\s*charge|innergemein|ig\.?\s*(erwerb|lieferung)|ust-?id|werklieferung|werkleistung|ausfuhrlieferung|ausfuhr|einfuhr|eust|leistungsort|steuerschuldner(schaft)?|bemessungsgrundlage)\b|§\s*(13b|1a|3a|6a)|(?:^|[^a-z])(13b|1a|3a|6a)\s*ustg/i;

function hasUstTriggers(q: string): boolean {
  // Ein starker Kernbegriff reicht, sonst mindestens zwei allgemeine Trigger.
  if (UST_STRONG.test(q)) return true;
  return ustTriggerCount(q) >= 2;
}


export function generateAnswer(rawQuestion: string): ChatAnswer {
  const q = rawQuestion.toLowerCase().trim();

  // --- 0) Meta-Fragen über die App selbst (vor Lexikon + Fallback) ---
  if (isSteuerstoffInfoQuery(q)) return steuerstoffInfoAnswer();

  // --- 0b) USt-Trigger erkannt → direkt USt-Workflow, keine allgemeine Rückfrage ---
  if (hasUstTriggers(q)) {
    const ust = classifyUstSachverhalt(q);
    if (ust) return ust;
  }

  // --- 1) Lexikon / Begriffsfrage (vor allen Spezialmodulen) ---
  const lex = lookupLexicon(rawQuestion);
  if (lex) return lex;




  // --- Allgemeine Steuerlehre: "Was sind Steuern?" / Steuerarten ---
  if (
    /^(was\s+(ist|sind))\s+(eine\s+)?steuer/i.test(rawQuestion.trim()) ||
    has(q, "steuerarten", "steuersystem", "abgabenarten") ||
    (has(q, "unterschied") && has(q, "gebühr", "gebuehr", "beitrag")) ||
    has(q, "direkte steuer", "indirekte steuer")
  ) {
    return {
      kind: "info",
      summary:
        "Steuern sind Geldleistungen, die ein öffentlich-rechtliches Gemeinwesen ohne Anspruch auf konkrete Gegenleistung von allen erhebt, bei denen der gesetzliche Tatbestand zutrifft (§ 3 Abs. 1 AO).",
      sections: [
        {
          title: "Abgrenzung",
          body:
            "Gebühr = Entgelt für konkrete Amtshandlung. Beitrag = Entgelt für die Möglichkeit der Inanspruchnahme einer Leistung. Sonderabgabe = Finanzierung gruppennütziger Zwecke. Nur die Steuer ist gegenleistungslos.",
        },
        {
          title: "Nach Bemessungsgrundlage",
          body:
            "Ertragsteuern (ESt, KSt, GewSt), Verkehrsteuern (USt, GrESt), Substanzsteuern (GrSt, ErbSt), Verbrauchsteuern (Energie, Tabak).",
        },
        {
          title: "Nach Steuergläubiger",
          body:
            "Bundessteuern, Landessteuern (z. B. ErbSt, GrESt), Gemeindesteuern (GrSt, GewSt) und Gemeinschaftsteuern (USt, ESt, KSt — Aufkommen wird aufgeteilt).",
        },
        {
          title: "Direkt vs. indirekt",
          body:
            "Direkt: Steuerschuldner = Steuerträger (ESt, KSt). Indirekt: Last wird überwälzt (USt, Verbrauchsteuern).",
        },
      ],
      clarify:
        "Möchtest du zu einer bestimmten Steuerart vertiefen (z. B. ESt, KSt, USt, GewSt, ErbSt)?",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: "Steuern — Grundlagen",
    };
  }

  // --- Erbschaft-/Schenkungsteuer ---
  if (has(q, "erbschaftsteuer", "erbschaft-steuer", "schenkungsteuer", "erbstg", "nachlass", "erbanfall") || /\berbst\b/i.test(q)) {
    return {
      kind: "info",
      summary:
        "Die Erbschaft- und Schenkungsteuer erfasst den unentgeltlichen Vermögensübergang von Todes wegen (§ 3 ErbStG) bzw. unter Lebenden (§ 7 ErbStG). Bewertungsstichtag ist der Tag der Steuerentstehung (§§ 9, 11 ErbStG).",
      sections: [
        {
          title: "Steuerklassen (§ 15 ErbStG)",
          body:
            "I: Ehegatten, Kinder, Enkel, bei Erbfall auch Eltern. II: Geschwister, Nichten/Neffen, Schwiegerkinder. III: alle übrigen Erwerber.",
        },
        {
          title: "Persönliche Freibeträge (§ 16 ErbStG)",
          body:
            "Ehegatte 500.000 €, Kinder 400.000 €, Enkel 200.000 € (400.000 € bei verstorbenem Elternteil), Eltern bei Erbfall 100.000 €, StKl II/III 20.000 €.",
        },
        {
          title: "Bewertung",
          body:
            "Anteile nicht notierter Kapitalgesellschaften: gemeiner Wert mit Substanzwert als Mindestwert (§ 11 BewG). Grundbesitz: Vergleichs-, Ertrags- oder Sachwertverfahren (§§ 182 ff. BewG). Gesonderte Feststellung nach § 151 BewG.",
        },
        {
          title: "Begünstigungen",
          body:
            "§§ 13a/13b ErbStG: Betriebsvermögen / Kapitalanteile > 25 %. § 13d ErbStG: 10 %-Abschlag für zu Wohnzwecken vermietete Grundstücke. § 13 Abs. 1 Nr. 4b/c: Familienheim.",
        },
      ],
      followUps: [
        "Welche Steuerklasse liegt vor?",
        "Welche Vermögensarten gehören zum Nachlass (Grundbesitz, GmbH-Anteile, Bankguthaben)?",
        "Gibt es Vorerwerbe innerhalb von 10 Jahren (§ 14 ErbStG)?",
      ],
      nextStep: "Schema: Vermögensanfall ./. Nachlassverbindlichkeiten = Bereicherung ./. Freibetrag = stpfl. Erwerb × Tarif § 19 ErbStG.",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: "Erbschaftsteuer",
    };
  }

  // --- Kfz-Wertabgabe / 1-%-Methode ---
  if (
    has(
      q,
      "kfz-wertabgabe",
      "kfz wertabgabe",
      "1%-methode",
      "1 % methode",
      "1%methode",
      "1-%-methode",
      "1 prozent methode",
      "ein prozent methode",
      "private kfz-nutzung",
      "private kfz nutzung",
      "bruttolistenpreis",
      "kostendeckelung",
      "8921",
      "8924",
      "fahrten wohnung betrieb",
      "fahrten wohnung-betrieb",
      "firmenwagen",
    )
  ) {
    return {
      kind: "info",
      summary:
        "Dafür kann ich den Kfz-Wertabgaben-Rechner öffnen. Er rechnet 1-%-Methode, Fahrten Wohnung/Betrieb (0,03 %), USt-Aufteilung auf # 8921 0 / # 8924 0 und die Kostendeckelung nach Arbeitspapier.",
      nextStep:
        "Bruttolistenpreis, Nutzungsmonate, Entfernung und Arbeitstage erfassen — anschließend Kostendeckelung prüfen.",
      links: [
        { label: "Kfz-Wertabgabe berechnen", to: "/kfz-wertabgabe" },
        { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      ],
      knowledge: "Kfz-Wertabgabe",
    };
  }

  // --- SKR ---
  if (has(q, "skr03", "skr 03", "skr42", "skr 42", "skr", "konto ", "kontierung", "buchungstext")) {
    const skrMatch = q.match(/skr\s*0?3?\s*(\d{3,5})/);
    const konto = skrMatch?.[1];
    return {
      summary: konto
        ? `SKR03 ${konto} lässt sich häufig auf ein passendes SKR42-Konto übertragen. Bitte Sphäre, NPO-Zuordnung und individuellen Kontenrahmen prüfen.`
        : "Für SKR03 ↔ SKR42 Zuordnungen empfiehlt sich der SKR-Konverter mit Mapping-Vorschlag und Buchungstextanalyse.",
      reasoning:
        "Die Konvertierung hängt vom Buchungsinhalt, der Sphärenzuordnung (ideell, Zweckbetrieb, wirtschaftlich) und vom Mandanten-Kontenrahmen ab.",
      followUps: ["Welche Sphäre ist betroffen?", "Liegt ein abweichender Mandanten-Kontenplan vor?"],
      nextStep: "Im SKR-Konverter Konto und Buchungstext prüfen.",
      links: [{ label: "Im SKR-Konverter öffnen", to: "/skr-konverter" }],
      knowledge: "SKR-Konverter",
    };
  }

  // --- NPO-Kontext-Trigger (für Mittelverwendung / § 62 / Rücklagen) ---
  const npoContext = has(
    q,
    "verein",
    "ggmbh",
    "gug",
    "stiftung",
    "gemeinnützig",
    "gemeinnuetzig",
    "npo",
    "mittelverwendung",
    "§ 55",
    "§ 62",
    "§55",
    "§62",
    "rücklagenspiegel",
    "verwendungsüberhang",
    "verwendungsueberhang",
    "zuflussjahr",
    "zwei-jahres-frist",
    "zeitnah",
    "wiederbeschaffung",
    "betriebsmittelrücklage",
    "betriebsmittelruecklage",
    "freie rücklage",
    "freie ruecklage",
  );

  // --- Rückstellung vs. Rücklage (allgemeine Abgrenzungsfrage) ---
  if (has(q, "rückstellung", "rueckstellung") && has(q, "rücklage", "ruecklage", "unterschied")) {
    return {
      kind: "info",
      summary:
        "Rücklage und Rückstellung sind nicht dasselbe — der Unterschied liegt in Bilanzposition und Anlass.",
      sections: [
        {
          title: "Rücklage",
          body:
            "Teil des Eigenkapitals. Zurückbehaltene Mittel zur Stärkung der Organisation oder für künftige Zwecke. Beispiele: Gewinnrücklage, Kapitalrücklage, gemeinnützigkeitsrechtliche Rücklagen nach § 62 AO.",
        },
        {
          title: "Rückstellung",
          body:
            "Fremdkapital. Sie bildet ungewisse Verbindlichkeiten oder drohende Belastungen ab (Höhe oder Fälligkeit unsicher). Beispiele: Steuerrückstellung, Gewährleistungsrückstellung, Pensionsrückstellung.",
        },
      ],
      clarify:
        "Soll ich die Abgrenzung im NPO-Kontext (§ 62 AO) oder bei einer Kapitalgesellschaft vertiefen?",
      links: [
        { label: "NPO-Rücklage prüfen", to: "/npo-pruefassistent" },
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
      ],
      knowledge: "Bilanzielle Abgrenzung",
    };
  }

  // --- Allgemeine Rücklagen-Wissensfrage (NICHT NPO-Kontext) ---
  if (has(q, "rücklage", "ruecklage", "gewinnrücklage", "kapitalrücklage") && !npoContext) {
    return {
      kind: "info",
      summary:
        "Eine Rücklage ist zurückbehaltenes Eigenkapital bzw. ein zweckgebundener oder freier Betrag, der nicht unmittelbar ausgeschüttet oder verwendet wird. Im steuerlichen Kontext muss man unterscheiden, welche Art von Rücklage gemeint ist.",
      sections: [
        {
          title: "1. Allgemeine Rücklage",
          body:
            "Eigenkapitalposition, z. B. Gewinnrücklage oder Kapitalrücklage. Dient der Stärkung des Eigenkapitals.",
        },
        {
          title: "2. Steuerliche Spezialrücklage",
          body:
            "Steuerliche Sonderregelung möglich, z. B. Rücklagen im Zusammenhang mit Reinvestitionen — abhängig vom konkreten Steuertatbestand.",
        },
        {
          title: "3. Gemeinnützigkeitsrechtliche Rücklage nach § 62 AO",
          body:
            "Relevant für Vereine, gGmbHs, Stiftungen und NPOs — z. B. freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage. Muss dokumentiert und häufig im Rücklagenspiegel dargestellt werden.",
        },
        {
          title: "4. Rückstellung ist nicht Rücklage",
          body:
            "Rückstellung betrifft ungewisse Verbindlichkeiten oder drohende Belastungen (Fremdkapital). Rücklage ist grundsätzlich Eigenkapital bzw. Mittelbindung.",
        },
      ],
      clarify:
        "Meinst du eine allgemeine steuerliche Rücklage oder eine Rücklage bei einer gemeinnützigen Organisation?",
      links: [
        { label: "NPO-Rücklage prüfen", to: "/npo-pruefassistent" },
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
        { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      ],
      knowledge: "Rücklage — Grundlagen",
    };
  }

  // --- Mittelverwendung / NPO-Rücklagen (nur bei NPO-Kontext) ---
  if (
    npoContext &&
    has(
      q,
      "mittelverwendung",
      "rücklage",
      "ruecklage",
      "freie rücklage",
      "betriebsmittelrücklage",
      "rücklagenspiegel",
      "verwendungsüberhang",
      "zuflussjahr",
      "zwei-jahres-frist",
      "zeitnah",
      "§ 55",
      "§ 62",
    )
  ) {
    return {
      kind: "mvr",
      summary:
        "Mittel gemeinnütziger Körperschaften müssen grundsätzlich zeitnah verwendet werden: Zufluss im Jahr X bis Ende des zweiten Folgejahres (X+2) für satzungsmäßige Zwecke.",
      reasoning:
        "Ausnahmen bilden zulässige Rücklagen nach § 62 AO (freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage). Diese sind im Rücklagenspiegel zu dokumentieren.",
      risks: [
        "Ein positiver Verwendungsüberhang kann auf eine nicht zeitnahe Mittelverwendung hinweisen und sollte geprüft werden.",
        "Ein Verstoß führt nicht automatisch sofort zum Verlust der Gemeinnützigkeit — das Finanzamt kann nach § 63 Abs. 4 AO eine Verwendungsauflage erteilen.",
      ],
      followUps: [
        "Wann ist der Mittelzufluss erfolgt?",
        "Sind bereits Rücklagen gebildet und dokumentiert?",
      ],
      nextStep: "Im Mittelverwendungsrechner Zufluss, Verwendung und Rücklagen erfassen.",
      links: [{ label: "Im Mittelverwendungsrechner berechnen", to: "/mittelverwendungsrechner" }],
      knowledge: "NPO / Mittelverwendung",
    };
  }

  // --- NPO-Sphäre / Spende / Sponsoring ---
  if (
    has(
      q,
      "verein",
      "ggmbh",
      "stiftung",
      "spende",
      "mitgliedsbeitrag",
      "mitgliedsbeiträge",
      "zuschuss",
      "sphäre",
      "sphaere",
      "zweckbetrieb",
      "vermögensverwaltung",
      "vermoegensverwaltung",
      "wirtschaftlicher geschäftsbetrieb",
      "gemeinnützig",
      "sponsoring",
      "logo",
    )
  ) {
    if (has(q, "mitgliedsbeitr")) {
      return {
        summary:
          "Echte Mitgliedsbeiträge eines Vereins gehören regelmäßig zum ideellen Bereich.",
        reasoning:
          "Werden mit dem Beitrag konkrete Gegenleistungen abgegolten (Kurse, Eintritt, Nutzung, Sonderleistungen), kann anteilig Zweckbetrieb oder wirtschaftlicher Geschäftsbetrieb vorliegen.",
        followUps: [
          "Bekommen Mitglieder konkrete Leistungen für den Beitrag?",
          "Gibt es unterschiedliche Beitragsklassen mit Zusatzleistungen?",
        ],
        nextStep: "Im NPO-Prüfassistenten Sphärenzuordnung dokumentieren.",
        links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
        knowledge: "NPO / Sphären",
      };
    }
    if (has(q, "logo", "sponsoring", "werbung", "gegenleistung")) {
      return {
        summary:
          "Logo-Nennung mit aktiver Werbewirkung spricht eher für Sponsoring bzw. Leistungsaustausch — eine Spendenbescheinigung wäre kritisch.",
        reasoning:
          "Reine Duldung der Namensnennung kann ideell bleiben; aktive Werbung führt regelmäßig zum wirtschaftlichen Geschäftsbetrieb oder Zweckbetrieb (Sponsoringerlass).",
        risks: [
          "Unzulässige Spendenbescheinigung → Haftung nach § 10b EStG.",
          "Umsatzsteuerpflicht der Sponsoringleistung.",
        ],
        followUps: [
          "Liegt ein Sponsoringvertrag vor?",
          "Wie aktiv ist die Werbewirkung (verlinktes Logo, Werbeflächen, Social Posts)?",
        ],
        nextStep: "Im NPO-Prüfassistenten Sphäre und USt prüfen.",
        links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
        knowledge: "NPO / Sponsoring",
      };
    }
    return {
      summary:
        "Für NPO-Sachverhalte ist die Sphärenzuordnung (ideell, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb) zentral.",
      reasoning:
        "Die Zuordnung steuert Ertragsteuer, Umsatzsteuer, Mittelverwendung und Spendenfähigkeit.",
      followUps: [
        "Welche Rechtsform liegt vor?",
        "Gibt es eine Gegenleistung?",
        "Wer ist Empfänger / Geldgeber?",
      ],
      nextStep: "Im NPO-Prüfassistenten strukturieren.",
      links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
      knowledge: "NPO",
    };
  }

  // --- USt Strom ---
  if (has(q, "strom") && has(q, "umsatzsteuer", "ust", "mwst")) {
    return {
      summary:
        "Auf Stromlieferungen fällt in Deutschland regelmäßig der allgemeine Umsatzsteuersatz von 19 % an.",
      reasoning: "Stromlieferung ist keine begünstigte Leistung nach § 12 Abs. 2 UStG.",
      followUps: ["Liegt eine Rechnung mit ausgewiesener USt vor?", "Ist der Leistungsempfänger vorsteuerabzugsberechtigt?"],
      nextStep: "Rechnung und Leistungszeitraum prüfen.",
      knowledge: "Umsatzsteuer",
    };
  }

  // --- Umsatzsteuer: Pflicht-Klassifizierung VOR § 13b ---
  const ustAnswer = classifyUstSachverhalt(q);
  if (ustAnswer) return ustAnswer;

  // --- Sommerfest / gemischter Sachverhalt ---
  if (has(q, "sommerfest", "fest mit eintritt", "getränkeverkauf", "getraenkeverkauf")) {
    return {
      summary:
        "Ein Sommerfest mit Eintritt und Getränkeverkauf führt regelmäßig zum wirtschaftlichen Geschäftsbetrieb bzw. ggf. Zweckbetrieb (z. B. gesellige Veranstaltung).",
      risks: [
        "Überschreiten der 45.000-€-Grenze (§ 64 Abs. 3 AO).",
        "Umsatzsteuerpflicht für Eintritt und Getränkeverkauf.",
      ],
      followUps: ["Höhe der Einnahmen?", "Welcher Verein / welche Sphärenstruktur?"],
      nextStep: "Im NPO-Prüfassistenten Sphäre, Freigrenze und USt prüfen.",
      links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
      knowledge: "NPO / wirtschaftlicher Geschäftsbetrieb",
    };
  }

  // --- Fallback ---
  return {
    summary:
      "Die Frage konnte heuristisch nicht eindeutig zugeordnet werden. Eine kurze Präzisierung (Rechtsform, Steuerart, Sachverhalt) hilft.",
    followUps: [
      "Um welche Steuerart geht es (USt, ErtragSt, Gemeinnützigkeit)?",
      "Wer ist beteiligt (Mandant, Empfänger, Geldgeber)?",
      "Welche Beträge und Zeiträume liegen vor?",
    ],
    nextStep: "Strukturierte Anfrage in 'Neue Anfrage' erfassen.",
    links: [{ label: "Neue Anfrage öffnen", to: "/neue-anfrage" }],
  };
}

export const REVIEW_HINT = REVIEW;
