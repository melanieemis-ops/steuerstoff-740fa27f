export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "notice"; text: string };

export interface MagazineArticle {
  id: string;
  title: string;
  lead: string;
  highlights: { label: string; value: string }[];
  blocks: ArticleBlock[];
}

export const magazineArticles: MagazineArticle[] = [
  {
    id: "est-reform-2027",
    title: "Einkommensteuerreform 2027: Das sind die Pläne der Bundesregierung",
    lead: "Anfang Juli hat die Koalition ihre Reformpläne veröffentlicht – u. a. sollen Steuerpflichtige mit kleinen und mittleren Einkommen bei der Einkommensteuer entlastet werden. Die Reform soll zum 1.1.27 in Kraft treten und ab 2028 ihre volle Wirkung entfalten. Das Entlastungsvolumen soll ca. 10 Mrd. EUR pro Jahr betragen.",
    highlights: [
      { label: "Grundfreibetrag 2028", value: "12.900 EUR" },
      { label: "Kindergeld 2028", value: "272 EUR" },
      { label: "Arbeitnehmer-Pauschbetrag", value: "1.430 EUR" },
      { label: "Entlastungsvolumen", value: "≈ 10 Mrd. EUR / Jahr" },
    ],
    blocks: [
      { type: "heading", text: "Vorbemerkungen" },
      {
        type: "paragraph",
        text: "Vorerst handelt es sich „nur“ um die Ergebnisse des Koalitionsausschusses. Im anschließenden Gesetzgebungsverfahren müssen der Bundestag und der Bundesrat zustimmen. Mit etwaigen Änderungen bzw. Ergänzungen ist also durchaus zu rechnen.",
      },
      { type: "heading", text: "Die Pläne im Überblick" },
      {
        type: "paragraph",
        text: "Der steuerliche Grundfreibetrag (bis zu dieser Höhe muss keine Einkommensteuer gezahlt werden) liegt im Jahr 2026 bei 12.348 EUR. Für zusammen veranlagte Ehegatten verdoppelt sich der Betrag.",
      },
      {
        type: "paragraph",
        text: "Nach den Plänen der Bundesregierung soll der Grundfreibetrag voraussichtlich in zwei Stufen bis auf 12.900 EUR im Jahr 2028 erhöht werden.",
      },
      {
        type: "paragraph",
        text: "Auch das Kindergeld soll voraussichtlich in zwei Stufen von derzeit 259 EUR auf 272 EUR im Jahr 2028 angehoben werden.",
      },
      {
        type: "paragraph",
        text: "Beim Arbeitnehmer-Pauschbetrag ist ein Anstieg um 200 EUR auf 1.430 EUR im Gespräch.",
      },
      {
        type: "notice",
        text: "Die vorgenannten Beträge (Grundfreibetrag, Kindergeld und Arbeitnehmer-Pauschbetrag) sollen im Gesetzgebungsverfahren bzw. nach Vorliegen des Existenzminimumberichts final beziffert werden.",
      },
      {
        type: "paragraph",
        text: "Die steuerliche Entlastung soll insbesondere für Familien mit Kindern spürbar sein. So hat das BMF u. a. folgende Berechnung aufgestellt: Ab dem Jahr 2028 soll eine vierköpfige Familie mit zwei mittleren Einkommen (Haushaltseinkommen von ca. 60.000 EUR) im Vergleich zu heute um mehr als 600 EUR pro Jahr entlastet werden.",
      },
      {
        type: "paragraph",
        text: "Die Gegenfinanzierung soll vor allem über eine Veränderung bei der sogenannten Reichensteuer erfolgen. Diese soll wie folgt gesplittet werden: Ab einem zu versteuernden Einkommen (zvE) von 250.000 EUR soll ein Steuersatz von 45 % greifen. 47 % sollen dann ab einem zvE von 280.000 EUR gelten. Derzeit gelten 45 % ab einem zvE von 277.826 EUR.",
      },
      {
        type: "paragraph",
        text: "Der Pauschalsteuersatz bei einer geringfügigen Beschäftigung (Minijob) soll von 2 % auf 5 % angehoben werden.",
      },
      {
        type: "paragraph",
        text: "Für die Inanspruchnahme von Handwerkerleistungen für Renovierungs-, Erhaltungs- und Modernisierungsmaßnahmen gewährt der Fiskus eine Steuerermäßigung in Höhe von 20 % der Arbeitskosten (kein Material), maximal 1.200 EUR im Jahr. Diese Steuerermäßigung soll reduziert werden – und zwar auf 15 % und höchstens 900 EUR pro Jahr.",
      },
      {
        type: "paragraph",
        text: "In dem „Programm für Aufschwung und Beschäftigung“ sind unter dem Aufzählungspunkt „Arbeitsmarkt“ zwei weitere interessante steuerliche Aspekte aufgeführt:",
      },
      {
        type: "paragraph",
        text: "Für den steuerlich begünstigten Sonn- und Feiertagszuschlag sollen die Obergrenzen nach § 3b EStG bis zu einem Stundenlohn von 75 EUR (bislang 50 EUR) zum 1.1.27 erhöht werden.",
      },
      {
        type: "notice",
        text: "Gleichzeitig soll der steuerfreie Zuschlag im Regelungsbereich eines Tarifvertrags vollständig beitragsfrei gestellt werden.",
      },
      {
        type: "paragraph",
        text: "Um einen zügigen Wechsel von einem Job in den nächsten Job attraktiver zu machen, sollen Abfindungszahlungen steuerlich privilegiert werden, wenn zügig eine neue Erwerbstätigkeit aufgenommen wird.",
      },
      {
        type: "notice",
        text: "Der steuerliche Vorteil soll dabei umso größer sein, je schneller eine neue Beschäftigung aufgenommen wird. Konkretere Regelungen sind hierzu nicht aufgeführt.",
      },
    ],
  },
];
