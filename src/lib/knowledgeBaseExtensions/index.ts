// Sammel-Import aller KB-Erweiterungen. Jede Datei registriert ihren Eintrag
// per KNOWLEDGE_BASE.push(...) als Seiteneffekt. Diese Datei muss überall
// importiert werden, wo die Wissensdatenbank sichtbar genutzt wird.
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
import "@/lib/knowledgeBaseExtensions/abschreibung-afa-wertminderungen-hgb-estg-ifrs";
import "@/lib/knowledgeBaseExtensions/abschreibung-ausserplanmaessige-wertminderung-afaa";
import "@/lib/knowledgeBaseExtensions/abschreibung-gebaeude-aussergewoehnliche-abnutzung-afaa";
import "@/lib/knowledgeBaseExtensions/abschreibung-gemischt-genutzte-gebaeude-afa";
import "@/lib/knowledgeBaseExtensions/abschreibung-sonderabschreibungen-7a-7b-7g-estg";
import "@/lib/knowledgeBaseExtensions/abschreibung-umlaufvermoegen-niederstwertprinzip";
import "@/lib/knowledgeBaseExtensions/aktuell-jahressteuergesetz-2026-referentenentwurf";
import "@/lib/knowledgeBaseExtensions/aktuell-steuerberater-haftung-ki-einsatz";
import "@/lib/knowledgeBaseExtensions/ao-berichtigung-aenderung-steuerbescheide-129-176";
import "@/lib/knowledgeBaseExtensions/ao-betriebspruefung-mitwirkungspflichten-rechte-pruefer";
import "@/lib/knowledgeBaseExtensions/ao-schaetzung-besteuerungsgrundlagen-verfahrensrecht";
import "@/lib/knowledgeBaseExtensions/ao-schaetzungsbefugnis-betriebspruefung-kasse-methoden";
import "@/lib/knowledgeBaseExtensions/aufbewahrungspflichten-ao";
import "@/lib/knowledgeBaseExtensions/bilanzierung-grundlagen-steuerlicher-bilanzenzusammenhang";
import "@/lib/knowledgeBaseExtensions/eigenverbrauch-unentgeltliche-wertabgaben-lieferungen";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-entfernungspauschale-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-gewerblicher-grundstueckshandel";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-grundstueckseigentuemer-update-2025-2026-paragraf-21";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-haeusliches-arbeitszimmer-betriebsvermoegen-taetigkeitsaufgabe-grundstuecksveraeusserung";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-kinderbetreuungskosten-getrennte-eltern-haushaltszugehoerigkeit";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-teilentgeltliche-grundstuecksuebertragung-23-estg";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-vorsorgepauschale-ab-2026";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-bewertung-mitunternehmeranteile-97-bewg";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-familienheim-eigennutzung-rueckforderungsrechte";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-festsetzungsverjaehrung";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-gesetzliche-erbfolge";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-steuerstrafrechtliche-risiken-ehegatten";
import "@/lib/knowledgeBaseExtensions/ertragsteuer-anschaffungsnaher-aufwand-6-abs-1-nr-1a-estg";
import "@/lib/knowledgeBaseExtensions/gewerbesteuer-anrechnung-steuerermaessigung-35-estg";
import "@/lib/knowledgeBaseExtensions/gewerbesteuer-berechnung-rueckstellung";
import "@/lib/knowledgeBaseExtensions/gewerbesteuer-einheitlicher-gewerbebetrieb-hinzuerwerb-bfh-x-r-8-23";
import "@/lib/knowledgeBaseExtensions/grunderwerbsteuer-aktuelle-entwicklung-2026-rechtsprechung";
import "@/lib/knowledgeBaseExtensions/grunderwerbsteuer-nahe-angehoerige-sperrfrist-personengesellschaft";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-geleistete-erhaltene-anzahlungen";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-hgb-ueberblick";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-immaterielle-vermoegensgegenstaende-auftragsforschung";
import "@/lib/knowledgeBaseExtensions/kfz-dienstwagen-1-prozent";
import "@/lib/knowledgeBaseExtensions/koerperschaftsteuer-darlehen-betriebspruefung-8b-abs-3-kstg";
import "@/lib/knowledgeBaseExtensions/koerperschaftsteuer-gmbh-grundlagen-steuerliche-besonderheiten";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-arbeitnehmersparzulage";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aufmerksamkeiten";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-auslandsaufenthalt";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aussenpruefung";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-elektronische-lohnsteuerbescheinigung";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-faelligkeit-lohnsteuer-sozialversicherungsbeitraege";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohn-und-gehaltsabrechnung";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohnsteuerbescheinigung-erstellung-korrektur-inhalt";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-minijob-arbeitsrechtliche-aspekte";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-minijob-pauschalbeitraege";
import "@/lib/knowledgeBaseExtensions/npo-gemeinnuetzigkeit-bfh-demokratie-verfassungsschutz-zweckbetrieb-krankenhaus";
import "@/lib/knowledgeBaseExtensions/npo-gemeinnuetzigkeit-grundlagen-rechtsprechung-gesetzgebung-2026";
import "@/lib/knowledgeBaseExtensions/npo-gemeinnuetzigkeit-unternehmensverbundene-stiftung-bfh-v-r-11-24";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-bilanzierung-beteiligungen-idw-rs-fab-18";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-gmbh-und-co-kg-grundlagen";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-grundlagen-steuerliche-besonderheiten";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-sonderbetriebsvermoegen-beispiele";
import "@/lib/knowledgeBaseExtensions/rechtsformen-vergleich-gmbh-personengesellschaft";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-betriebspruefung";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-kuenstlersozialabgabe-2027";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-minijob-widerruf-rentenversicherungsbefreiung-ab-juli-2026";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-pruefpflichten-steuerberater-geschaeftsfuehrer-status";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-unfallversicherung-homeoffice-mobiles-arbeiten-mittagspause-2026";
import "@/lib/knowledgeBaseExtensions/sozialversicherungspflicht-lehrkraefte-uebergangsregelung-2027";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-anzahlungen-vorauszahlungen";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-reverse-charge-vida-ab-1-juli-2028";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-vorsteuerabzug-verspaetete-rechnung-eug-2026";

for (const entry of KNOWLEDGE_BASE) {
  const keywords = entry.keywords;
  if (keywords instanceof RegExp) {
    entry.keywords = keywords.source;
    continue;
  }
  if (Array.isArray(keywords)) {
    entry.keywords = keywords
      .map((keyword) => (keyword instanceof RegExp ? keyword.source : String(keyword)))
      .filter(Boolean)
      .join("|");
  }
}
