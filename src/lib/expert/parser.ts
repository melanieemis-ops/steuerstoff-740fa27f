// Ebene 1 — Natural Language Parser.
// Extrahiert strukturierte Fakten aus dem Prompt. Trifft KEINE steuerliche
// Entscheidung. Reine Regex-Extraktion; bewusst konservativ.

import type { Facts } from "./types";

const RE = {
  unternehmerDE: /\b(unternehmer|firma|gmbh|kg|kaufmann|händler|selbstst(ä|ae)ndig)\b.*\b(deutschland|de|münchen|berlin|hamburg|köln|frankfurt|stuttgart)\b/i,
  unternehmerEU: /\b(unternehmer|firma|gmbh|s\.?a\.?|s\.?r\.?l|b\.?v\.?|sp\.?\s*z\.?o\.?o)\b.*\b(eu|niederlande|amsterdam|frankreich|paris|italien|rom|polen|warschau|spanien|madrid|österreich|wien|belgien|brüssel|dänemark)\b/i,
  unternehmerDrittland: /\b(unternehmer|firma)\b.*\b(usa|schweiz|zürich|china|uk|london|drittland)\b/i,
  arbeitnehmer: /\b(arbeitnehmer|angestellt|mitarbeiter|beschäftigt|lohn|gehalt|dienstverh(ä|ae)ltnis)\b/i,
  verein: /\b(verein|e\.?\s*v\.?|ggmbh|gug\b)\b/i,
  stiftung: /\b(stiftung)\b/i,
  gesellschafter: /\b(gesellschafter|anteilseigner|aktionär)\b/i,
  finanzamt: /\b(finanzamt|betriebspr(ü|ue)fung|außenpr(ü|ue)fung)\b/i,
  privatperson: /\b(privatperson|verbraucher|endverbraucher|b2c)\b/i,

  ustId: /\b(ust-?id(nr)?\.?|umsatzsteuer-?identifikationsnummer|vat[-\s]?id|gültige\s+ust)\b/i,
  rechnung: /\b(rechnung|invoice)\b/i,
  warenbewegung: /\b(transport|versand|versendet|verbringung|geliefert|liefert|abgeholt|befördert)\b/i,
  lieferung: /\b(lieferung|liefert|verkauft|verkauf|erwirbt|erwerb|kauft|kauf|ware|maschine|möbel|fahrzeug|auto|güter)\b/i,
  dienstleistung: /\b(dienstleistung|leistung|beratung|service|montage|reparatur|schulung|honorar)\b/i,
  grundstueck: /\b(grundst(ü|ue)ck|immobilie|geb(ä|ae)ude|wohnung|haus|tennishalle|halle|bauwerk)\b/i,
  werklieferung: /\bwerklieferung\b/i,
  werkleistung: /\bwerkleistung\b/i,
  reverseCharge: /\b(reverse\s*charge|steuerschuldnerschaft\s+des\s+leistungsempf|§\s*13b)\b/i,
  schenkung: /\b(schenkung|schenkt|unentgeltlich(e[nrs]?)?\s+(übertragung|zuwendung))\b/i,
  erbfall: /\b(erbe|erbfall|erbanfall|nachlass|verm(ä|ae)chtnis)\b/i,
  veraeusserung: /\b(ver(ä|ae)u(ß|ss)erung|verkauf(t)?)\b/i,
  vermietung: /\b(vermietung|vermietet|mieter|pacht|verpachtet)\b/i,
  arbeitsverhaeltnis: /\b(arbeitsverh(ä|ae)ltnis|dienstverh(ä|ae)ltnis|angestellt|beschäftigt)\b/i,
  bilanzierung: /\b(bilanz|bilanziert|handelsbilanz|steuerbilanz|abschluss|jahresabschluss)\b/i,
  spende: /\b(spende|spendet|zuwendung)\b/i,
  betriebsvermoegen: /\b(betriebsverm(ö|oe)gen|bv\b)\b/i,
  privatvermoegen: /\b(privatverm(ö|oe)gen|pv\b)\b/i,
  einspruch: /\b(einspruch|rechtsbehelf|widerspruch)\b/i,
  afa: /\b(afa\b|abschreibung|absetzung\s+für\s+abnutzung)\b/i,
  rueckstellung: /\b(r(ü|ue)ckstellung(en)?)\b/i,

  ausDE: /\b(aus|von|ab)\s+(deutschland|münchen|berlin|hamburg|köln|frankfurt|stuttgart|de\b)/i,
  nachDE: /\b(nach|in|bis)\s+(deutschland|münchen|berlin|hamburg|köln|frankfurt|stuttgart|de\b)/i,
  ausEU: /\b(aus|von|ab)\s+(amsterdam|paris|rom|warschau|madrid|wien|brüssel|niederlande|frankreich|italien|polen|spanien|österreich|belgien|eu\b)/i,
  nachEU: /\b(nach|in|bis)\s+(amsterdam|paris|rom|warschau|madrid|wien|brüssel|niederlande|frankreich|italien|polen|spanien|österreich|belgien|eu\b)/i,
  ausDrittland: /\b(aus|von)\s+(usa|schweiz|china|uk|london|zürich|drittland)/i,
  nachDrittland: /\b(nach|in)\s+(usa|schweiz|china|uk|london|zürich|drittland)/i,
};

const NUM = /(\d{1,3}(?:[\.\s]\d{3})*|\d+)(?:,\d+)?/;

function num(text: string, keyRe: RegExp): number | undefined {
  const re = new RegExp(keyRe.source + "[^\\d]{0,30}" + NUM.source, "i");
  const m = text.match(re);
  if (!m) return undefined;
  const raw = m[m.length - 1]?.replace(/[\.\s]/g, "").replace(",", ".");
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export function parseFacts(prompt: string): Facts {
  const text = prompt;
  const lower = prompt.toLowerCase();

  const f: Facts = {
    raw: { text, lower },
    entities: {
      unternehmerDE: RE.unternehmerDE.test(lower),
      unternehmerEU: RE.unternehmerEU.test(lower),
      unternehmerDrittland: RE.unternehmerDrittland.test(lower),
      arbeitnehmer: RE.arbeitnehmer.test(lower),
      verein: RE.verein.test(lower),
      stiftung: RE.stiftung.test(lower),
      gesellschafter: RE.gesellschafter.test(lower),
      finanzamt: RE.finanzamt.test(lower),
      privatperson: RE.privatperson.test(lower),
    },
    orte: {
      ausDE: RE.ausDE.test(lower),
      nachDE: RE.nachDE.test(lower),
      ausEU: RE.ausEU.test(lower),
      nachEU: RE.nachEU.test(lower),
      ausDrittland: RE.ausDrittland.test(lower),
      nachDrittland: RE.nachDrittland.test(lower),
    },
    zeit: {
      jahr: num(lower, /\b(jahr|vz|veranlagungszeitraum|kalenderjahr)\b/i),
    },
    betraege: {
      entgelt: num(lower, /\b(entgelt|nettobetrag)\b/i),
      kaufpreis: num(lower, /\b(kaufpreis|preis)\b/i),
      lohn: num(lower, /\b(lohn|gehalt|bruttolohn)\b/i),
      gewinn: num(lower, /\b(gewinn|jahres(ü|ue)berschuss)\b/i),
      umsatz: num(lower, /\b(umsatz|nettoumsatz)\b/i),
      ak: num(lower, /\b(anschaffungskosten|ak\b)\b/i),
    },
    steuerFakten: {
      rechnung: RE.rechnung.test(lower),
      ustId: RE.ustId.test(lower),
      warenbewegung: RE.warenbewegung.test(lower),
      lieferung: RE.lieferung.test(lower),
      dienstleistung: RE.dienstleistung.test(lower),
      grundstueck: RE.grundstueck.test(lower),
      schenkung: RE.schenkung.test(lower),
      erbfall: RE.erbfall.test(lower),
      veraeusserung: RE.veraeusserung.test(lower),
      vermietung: RE.vermietung.test(lower),
      arbeitsverhaeltnis: RE.arbeitsverhaeltnis.test(lower),
      bilanzierung: RE.bilanzierung.test(lower),
      spende: RE.spende.test(lower),
      betriebsvermoegen: RE.betriebsvermoegen.test(lower),
      privatvermoegen: RE.privatvermoegen.test(lower),
      werklieferung: RE.werklieferung.test(lower),
      werkleistung: RE.werkleistung.test(lower),
      reverseCharge: RE.reverseCharge.test(lower),
      einspruch: RE.einspruch.test(lower),
      afa: RE.afa.test(lower),
      rueckstellung: RE.rueckstellung.test(lower),
    },
  };

  return f;
}
