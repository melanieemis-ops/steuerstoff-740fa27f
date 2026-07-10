// Ebene 2 — Parser. Extrahiert strukturierte Fakten aus dem Prompt.
// Trifft KEINE steuerliche Entscheidung.

import { emptyFacts, type Facts, type Tri } from "../facts/factModel";
import { normalizeFacts } from "./factNormalizer";

const RE = {
  employee: /\b(arbeitnehmer|angestellte[rn]?|mitarbeiter|beschäftigt)\b/i,
  employer: /\b(arbeitgeber)\b/i,
  businessOwner: /\b(unternehmer|firma|gmbh|kg|ohg|selbstständig|selbstst(ä|ae)ndig)\b/i,
  shareholder: /\b(gesellschafter|anteilseigner|aktion(ä|ae)r)\b/i,
  corporation: /\b(gmbh|ag|ug|kapitalgesellschaft|k(ö|oe)rperschaft)\b/i,
  partnership: /\b(gbr|ohg|kg|personengesellschaft)\b/i,
  association: /\b(verein|e\.?\s*v\.?)\b/i,
  foundation: /\b(stiftung)\b/i,
  privatePerson: /\b(privatperson|verbraucher|endverbraucher|b2c)\b/i,
  taxAuthority: /\b(finanzamt|betriebspr(ü|ue)fung)\b/i,

  firstPlaceOfWork: /\b(erste[nrs]?\s+(tätigkeitsst(ä|ae)tte|arbeitsst(ä|ae)tte)|erste\s+t(ä|ae)tigkeitsst(ä|ae)tte)\b/i,
  privateCar: /\b(privat(er|en|em)?\s*(pkw|pkws|auto|kfz|fahrzeug)|eigenen?\s*(pkw|auto|fahrzeug))\b/i,
  publicTransport: /\b(bus|bahn|(ö|oe)pnv|(ö|oe)ffentliche[rn]?\s+verkehrsmitteln?)\b/i,
  homeOffice: /\b(homeoffice|home[-\s]?office|h(ä|ae)uslich(e[snr]?)?\s+arbeitszimmer)\b/i,

  invoice: /\b(rechnung|invoice)\b/i,
  invoiceWithoutVat: /\b(rechnung\s+ohne\s+(ust|umsatzsteuer|mwst)|netto[-\s]?rechnung)\b/i,
  vatId: /\b(ust-?id(nr)?\.?|umsatzsteuer-?identifikationsnummer|vat[-\s]?id)\b/i,
  reverseCharge: /\b(reverse\s*charge|§\s*13b|steuerschuldnerschaft\s+des\s+leistungsempf)/i,

  goodsSupplied: /\b(lieferung|liefert|verkauft|verkauf|kauft|kauf|ware|waren|maschine|m(ö|oe)bel|fahrzeug|auto|g(ü|ue)ter|erwerb|erwirbt)\b/i,
  service: /\b(dienstleistung|beratung|service|schulung|honorar)\b/i,
  goodsMovement: /\b(transport(iert)?|versand|versendet|verbringung|geliefert|liefert|abgeholt|bef(ö|oe)rdert)\b/i,
  workDelivery: /\bwerklieferung\b/i,
  workService: /\bwerkleistung\b/i,
  realEstate: /\b(grundst(ü|ue)ck|immobilie|geb(ä|ae)ude|wohnung|haus|halle|bauwerk)\b/i,
  gift: /\b(schenkung|schenkt|unentgeltlich(e[nrs]?)?\s+(übertragung|zuwendung))\b/i,
  inheritance: /\b(erbe|erbfall|erbanfall|nachlass|verm(ä|ae)chtnis)\b/i,
  rental: /\b(vermietung|vermietet|mieter|pacht|verpachtet)\b/i,
  sale: /\b(ver(ä|ae)u(ß|ss)erung|verkauf(t)?)\b/i,
  provision: /\b(r(ü|ue)ckstellung(en)?)\b/i,
  depreciation: /\b(afa\b|abschreibung)\b/i,
  donation: /\b(spende|spendet|zuwendung)\b/i,
  employment: /\b(arbeitsverh(ä|ae)ltnis|dienstverh(ä|ae)ltnis|lohn|gehalt)\b/i,
  benefitToShareholder: /\b(gesellschafter|anteilseigner).{0,40}\b(gehalt|verg(ü|ue)tung|leistung|zahlung|darlehen|bezug)\b/i,
  disproportionate: /\b(überh(ö|oe)ht(e|es|en|er)?|unangemessen(e|es|en|er)?|un(ü|ue)blich(e|es|en|er)?|deutlich\s+überh(ö|oe)ht)\b/i,

  // Bilanzierung
  balanceSheetDate: /\b(bilanzstichtag|jahresabschluss|zum\s+31\.\s*12\.|31\.12\.\d{2,4}|abschlussstichtag)\b/i,
  warranty: /\b(garantie(aufwendungen|leistungen|f(ä|ae)llen?|verpflichtungen?)?|gew(ä|ae)hrleistung|nachbesserung)\b/i,
  uncertainObligation: /\b(ungewisse[rn]?\s+verbindlichkeit(en)?|zu\s+rechnen|noch\s+nicht\s+fest|erwart(et|ete[nrs]?)\s+(aufwendungen|kosten|inanspruchnahme)|drohend(er|e[nrs]?)\s+verlust|risiko|prozessrisiko|inanspruchnahme)\b/i,
  economicallyCaused: /\b(wirtschaftlich\s+verursacht|verursacht\s+im\s+jahr|erfahrung(en)?\s+der\s+vergangenen)\b/i,

  managingDirector: /\b(gesch(ä|ae)ftsf(ü|ue)hrer(in)?|gesellschafter-gesch(ä|ae)ftsf(ü|ue)hrer)\b/i,
  hiddenProfitDistribution: /\b(verdeckte\s+gewinnaussch(ü|ue)ttung|vga\b|v\.?g\.?a\.?)\b/i,
  hiddenContribution: /\b(verdeckte\s+einlage)\b/i,
  armsLengthFailed: /\b(fremdvergleich|drittvergleich|unangemessen|überh(ö|oe)ht|un(ü|ue)blich)\b/i,
  taxContributionAccount: /\b(steuerlich(es|en)?\s+einlagekonto|§\s*27\s*kstg?)\b/i,
  organschaft: /\b(organschaft|organgesellschaft|organträger|ergebnisabf(ü|ue)hrungsvertrag|eav)\b/i,
  lossCarryforward: /\b(verlustvortrag|verlustabzug|§\s*10d\s*estg?|§\s*8c\s*kstg?|mantelkauf)\b/i,
  profitDistribution: /\b(gewinnaussch(ü|ue)ttung|dividende|aussch(ü|ue)ttung)\b/i,


  // Länder
  fromDE: /\b(aus|von|ab)\s+(deutschland|münchen|berlin|hamburg|köln|frankfurt|stuttgart)/i,
  toDE: /\b(nach|in|bis)\s+(deutschland|münchen|berlin|hamburg|köln|frankfurt|stuttgart)/i,
  fromEU: /\b(aus|von|ab)\s+(amsterdam|paris|rom|warschau|madrid|wien|br(ü|ue)ssel|niederlande|frankreich|italien|polen|spanien|(ö|oe)sterreich|belgien)/i,
  toEU: /\b(nach|in|bis)\s+(amsterdam|paris|rom|warschau|madrid|wien|br(ü|ue)ssel|niederlande|frankreich|italien|polen|spanien|(ö|oe)sterreich|belgien)/i,
  fromDL: /\b(aus|von)\s+(usa|schweiz|china|uk|london|z(ü|ue)rich|drittland)/i,
  toDL: /\b(nach|in)\s+(usa|schweiz|china|uk|london|z(ü|ue)rich|drittland)/i,
};

function tri(match: boolean): Tri {
  return match ? true : "unknown";
}

function numAfter(text: string, keyRe: RegExp): number | undefined {
  const re = new RegExp(keyRe.source + "[^\\d]{0,30}(\\d{1,4}(?:[\\.,]\\d+)?)", "i");
  const m = text.match(re);
  if (!m) return undefined;
  const n = Number(m[m.length - 1].replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function numBefore(text: string, keyRe: RegExp): number | undefined {
  const re = new RegExp("(\\d{1,4}(?:[\\.,]\\d+)?)[^\\d]{0,15}" + keyRe.source, "i");
  const m = text.match(re);
  if (!m) return undefined;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function parse(prompt: string): Facts {
  const f = emptyFacts(prompt);
  const t = prompt;

  f.employee = tri(RE.employee.test(t));
  f.employer = tri(RE.employer.test(t));
  f.businessOwner = tri(RE.businessOwner.test(t));
  f.shareholder = tri(RE.shareholder.test(t));
  f.corporation = tri(RE.corporation.test(t));
  f.partnership = tri(RE.partnership.test(t));
  f.association = tri(RE.association.test(t));
  f.foundation = tri(RE.foundation.test(t));
  f.privatePerson = tri(RE.privatePerson.test(t));
  f.taxAuthority = tri(RE.taxAuthority.test(t));

  f.firstPlaceOfWork = tri(RE.firstPlaceOfWork.test(t));
  f.privateCar = tri(RE.privateCar.test(t));
  f.publicTransport = tri(RE.publicTransport.test(t));
  f.homeOffice = tri(RE.homeOffice.test(t));

  f.invoice = tri(RE.invoice.test(t));
  f.invoiceWithoutVat = tri(RE.invoiceWithoutVat.test(t));
  f.vatIdAvailable = tri(RE.vatId.test(t));
  f.reverseChargeMentioned = tri(RE.reverseCharge.test(t));

  f.goodsSupplied = tri(RE.goodsSupplied.test(t));
  f.service = tri(RE.service.test(t));
  f.goodsMovement = tri(RE.goodsMovement.test(t));
  f.workDelivery = tri(RE.workDelivery.test(t));
  f.workService = tri(RE.workService.test(t));
  f.realEstate = tri(RE.realEstate.test(t));
  f.gift = tri(RE.gift.test(t));
  f.inheritance = tri(RE.inheritance.test(t));
  f.rental = tri(RE.rental.test(t));
  f.saleTransaction = tri(RE.sale.test(t));
  f.provision = tri(RE.provision.test(t));
  f.depreciation = tri(RE.depreciation.test(t));
  f.donation = tri(RE.donation.test(t));
  f.employmentRelation = tri(RE.employment.test(t));
  f.benefitToShareholder = tri(RE.benefitToShareholder.test(t));
  f.disproportionateCompensation = tri(RE.disproportionate.test(t));

  f.balanceSheetDate = tri(RE.balanceSheetDate.test(t));
  f.warranty = tri(RE.warranty.test(t));
  f.uncertainObligation = tri(RE.uncertainObligation.test(t));
  f.economicallyCaused = tri(RE.economicallyCaused.test(t));

  f.managingDirector = tri(RE.managingDirector.test(t));
  f.hiddenProfitDistribution = tri(RE.hiddenProfitDistribution.test(t));
  f.hiddenContribution = tri(RE.hiddenContribution.test(t));
  f.armsLengthFailed = tri(RE.armsLengthFailed.test(t));
  f.taxContributionAccount = tri(RE.taxContributionAccount.test(t));
  f.organschaft = tri(RE.organschaft.test(t));
  f.lossCarryforward = tri(RE.lossCarryforward.test(t));
  f.profitDistribution = tri(RE.profitDistribution.test(t));


  // Länder-Flow
  if (RE.fromDE.test(t)) f.departureCountry = "DE";
  else if (RE.fromEU.test(t)) f.departureCountry = "EU";
  else if (RE.fromDL.test(t)) f.departureCountry = "DL";
  if (RE.toDE.test(t)) f.destinationCountry = "DE";
  else if (RE.toEU.test(t)) f.destinationCountry = "EU";
  else if (RE.toDL.test(t)) f.destinationCountry = "DL";

  // Zahlen
  const km =
    numBefore(t, /\bkm\b/i) ??
    numAfter(t, /\b(entfernung|einfach(e[rn]?)?\s*entfernung|strecke)\b/i);
  if (km !== undefined) f.oneWayDistanceKm = km;

  const days =
    numBefore(t, /\b(arbeitstage[n]?|tage[n]?)\b/i) ??
    numAfter(t, /\b(an\s+)?(arbeitstage[n]?|tage[n]?)\b/i);
  if (days !== undefined) f.workDays = days;

  // Explizite Fachbegriffe
  const explicit: string[] = [];
  if (/\bentfernungspauschale\b/i.test(t)) explicit.push("entfernungspauschale");
  if (/\bverdeckte\s+gewinnaussch(ü|ue)ttung\b/i.test(t)) explicit.push("vGA");
  if (/\bvorsteuerabzug\b/i.test(t)) explicit.push("vorsteuerabzug");
  if (/\bfestsetzungsverj(ä|ae)hrung\b/i.test(t)) explicit.push("festsetzungsverjährung");
  if (/\bfreie\s+r(ü|ue)cklage\b/i.test(t)) explicit.push("freieRücklage");
  if (/\bhinzurechnung\b/i.test(t)) explicit.push("hinzurechnung");
  if (/\br(ü|ue)ckstellung/i.test(t)) explicit.push("rückstellung");
  if (/\bgarantie/i.test(t)) explicit.push("garantie");
  f.explicitTerms = explicit;

  // Bilanzstichtag-Jahr extrahieren
  const my = t.match(/31\.\s*12\.\s*(\d{4})/);
  if (my) f.balanceSheetYear = Number(my[1]);

  // Rückstellungs-/Aufwandsbetrag: "18.000 €" / "18000 EUR"
  const am = t.match(/(\d{1,3}(?:\.\d{3})+|\d{3,7})(?:,(\d{1,2}))?\s*(€|eur)/i);
  if (am) {
    const int = am[1].replace(/\./g, "");
    const dec = am[2] ?? "0";
    const val = Number(`${int}.${dec}`);
    if (Number.isFinite(val)) f.provisionAmount = val;
  }


  return normalizeFacts(f);
}
