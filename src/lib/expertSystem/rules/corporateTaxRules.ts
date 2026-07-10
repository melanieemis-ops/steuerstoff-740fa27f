// Körperschaftsteuer — Regeln.
// Deckt: vGA (§ 8 Abs. 3 S. 2 KStG), verdeckte Einlage, Organschaft (§§ 14–17 KStG),
// steuerliches Einlagekonto (§ 27 KStG), offene Ausschüttung, Verlustvortrag (§ 8c KStG, § 10d EStG).

import type { RuleDef, RuleResult } from "./ruleTypes";

// Decision Tree für vGA — jede Stufe wird explizit im schemaSteps ausgewiesen.
export const vgaRule: RuleDef = {
  id: "kst.vGA",
  taxType: "koerperschaftsteuer",
  priority: 100,
  matches: ({ facts, scenario }) =>
    scenario === "hiddenProfitDistribution" ||
    (facts.corporation === true &&
      (facts.hiddenProfitDistribution === true ||
        (facts.shareholder === true && facts.disproportionateCompensation === true))),
  apply: ({ facts }): RuleResult => {
    const gfSuffix = facts.managingDirector === true ? "-Geschäftsführer" : "";
    const armsLength = facts.armsLengthFailed === true || facts.disproportionateCompensation === true;
    const narrative =
      `Die Kapitalgesellschaft (Körperschaft i.S.d. § 1 Abs. 1 Nr. 1 KStG) leistet an einen Gesellschafter${gfSuffix} eine Zahlung, die dem Fremdvergleich nicht standhält. ` +
      `Die überhöhte Zahlung führt zu einer Vermögensminderung bei der Gesellschaft, die durch das Gesellschaftsverhältnis veranlasst ist und sich auf die Höhe des Unterschiedsbetrags i.S.d. § 4 Abs. 1 EStG i.V.m. § 8 Abs. 1 KStG auswirkt, ohne auf einer offenen Gewinnverteilung zu beruhen. ` +
      `Damit sind alle Tatbestandsmerkmale einer verdeckten Gewinnausschüttung nach § 8 Abs. 3 Satz 2 KStG erfüllt. Der unangemessene Teil der Vergütung ist außerbilanziell dem Einkommen der Kapitalgesellschaft wieder hinzuzurechnen. Beim Gesellschafter liegen insoweit Einkünfte aus Kapitalvermögen nach § 20 Abs. 1 Nr. 1 Satz 2 EStG vor (Kapitalertragsteuer nach § 43 EStG).`;
    return {
      taxType: "koerperschaftsteuer",
      scenario: "hiddenProfitDistribution",
      subScenario: "vGA",
      legalRefs: [
        "§ 8 Abs. 3 Satz 2 KStG",
        "§ 8 Abs. 1 KStG",
        "§ 4 Abs. 1 EStG",
        "§ 20 Abs. 1 Nr. 1 Satz 2 EStG",
        "§ 43 EStG",
      ],
      confidence: 0.95,
      headline: "Verdeckte Gewinnausschüttung (§ 8 Abs. 3 Satz 2 KStG)",
      narrative,
      schemaSteps: [
        { id: "koerperschaft", label: "Körperschaft vorhanden?", result: facts.corporation === true ? "Ja — Kapitalgesellschaft (GmbH/AG/UG)." : "Nicht eindeutig belegt." },
        { id: "gesellschafter", label: "Gesellschafter (oder nahestehende Person) beteiligt?", result: facts.shareholder === true || facts.managingDirector === true ? "Ja — Gesellschafter" + gfSuffix + "." : "Nicht eindeutig belegt." },
        { id: "vermoegensminderung", label: "Vermögensminderung / verhinderte Vermögensmehrung?", result: "Ja — überhöhtes Gehalt mindert den Unterschiedsbetrag (§ 4 Abs. 1 EStG)." },
        { id: "veranlassung", label: "Veranlassung durch das Gesellschaftsverhältnis?", result: "Ja — ein ordentlicher und gewissenhafter Geschäftsleiter hätte die Zahlung an einen fremden Dritten nicht in dieser Höhe geleistet." },
        { id: "fremdvergleich", label: "Fremdvergleich (BFH-ständige Rechtsprechung)?", result: armsLength ? "Nicht bestanden — Vergütung ist unangemessen/unüblich." : "Zu prüfen." },
        { id: "korrektur", label: "Gewinnkorrektur außerbilanziell nach § 8 Abs. 3 Satz 2 KStG", result: "Der unangemessene Teil wird dem Einkommen der GmbH wieder hinzugerechnet." },
        { id: "ergebnis", label: "Ergebnis / Rechtsfolgen", result: "vGA liegt vor. GmbH: Hinzurechnung + KSt/GewSt. Gesellschafter: Kapitalertrag § 20 EStG, KapESt 25 %." },
      ],
    };
  },
};

export const hiddenContributionRule: RuleDef = {
  id: "kst.hiddenContribution",
  taxType: "koerperschaftsteuer",
  priority: 90,
  matches: ({ facts, scenario }) =>
    scenario === "hiddenContribution" ||
    (facts.corporation === true && facts.hiddenContribution === true),
  apply: (): RuleResult => ({
    taxType: "koerperschaftsteuer",
    scenario: "hiddenContribution",
    subScenario: "hiddenContribution",
    legalRefs: ["§ 8 Abs. 3 Satz 3–6 KStG", "§ 4 Abs. 1 Satz 8 EStG", "§ 27 KStG"],
    confidence: 0.92,
    headline: "Verdeckte Einlage (§ 8 Abs. 3 S. 3 KStG)",
    narrative:
      "Ein Gesellschafter (oder nahestehende Person) wendet der Kapitalgesellschaft außerhalb der gesellschaftsrechtlichen Einlage einen einlagefähigen Vermögensvorteil zu, der durch das Gesellschaftsverhältnis veranlasst ist. Die verdeckte Einlage erhöht das Einkommen der Gesellschaft nicht (§ 8 Abs. 3 Satz 3 KStG), ist beim Gesellschafter nachträgliche Anschaffungskosten auf die Beteiligung und erhöht das steuerliche Einlagekonto (§ 27 KStG).",
    schemaSteps: [
      { id: "vorteil", label: "Einlagefähiger Vermögensvorteil zugewendet?" },
      { id: "veranlassung", label: "Veranlassung durch das Gesellschaftsverhältnis?" },
      { id: "au-berbilanziell", label: "Außerbilanzielle Kürzung bei der Körperschaft (§ 8 Abs. 3 S. 3 KStG)" },
      { id: "einlagekonto", label: "Erhöhung des steuerlichen Einlagekontos (§ 27 KStG)" },
      { id: "gesellschafter", label: "Beim Gesellschafter: nachträgliche Anschaffungskosten auf Beteiligung" },
    ],
  }),
};

export const organschaftRule: RuleDef = {
  id: "kst.organschaft",
  taxType: "koerperschaftsteuer",
  priority: 80,
  matches: ({ facts, scenario }) => scenario === "organschaft" || facts.organschaft === true,
  apply: (): RuleResult => ({
    taxType: "koerperschaftsteuer",
    scenario: "organschaft",
    subScenario: "organschaft",
    legalRefs: ["§§ 14–17 KStG", "§ 14 Abs. 1 KStG", "§ 2 Abs. 2 Satz 2 GewStG"],
    confidence: 0.92,
    headline: "Körperschaftsteuerliche Organschaft (§ 14 KStG)",
    narrative:
      "Bei einer körperschaftsteuerlichen Organschaft wird das Einkommen der Organgesellschaft dem Organträger zugerechnet. Voraussetzungen: (1) finanzielle Eingliederung von Beginn des Wirtschaftsjahres an (Stimmrechtsmehrheit), (2) wirksamer Gewinnabführungsvertrag i.S.d. § 291 Abs. 1 AktG auf mindestens fünf Jahre, (3) tatsächliche Durchführung des GAV, (4) Organträger ist ein gewerbliches Unternehmen. Gewerbesteuerlich gilt Entsprechendes über § 2 Abs. 2 Satz 2 GewStG.",
    schemaSteps: [
      { id: "eingliederung", label: "Finanzielle Eingliederung (Stimmrechtsmehrheit) vom Beginn des WJ an" },
      { id: "gav", label: "Wirksamer Gewinnabführungsvertrag (mind. 5 Jahre, § 291 AktG)" },
      { id: "durchfuehrung", label: "Tatsächliche Durchführung des GAV" },
      { id: "organtraeger", label: "Organträger ist inländisches gewerbliches Unternehmen" },
      { id: "zurechnung", label: "Einkommenszurechnung an den Organträger (§ 14 Abs. 1 KStG)" },
    ],
  }),
};

export const contributionAccountRule: RuleDef = {
  id: "kst.contributionAccount",
  taxType: "koerperschaftsteuer",
  priority: 70,
  matches: ({ facts, scenario }) =>
    scenario === "contributionAccount" || facts.taxContributionAccount === true,
  apply: (): RuleResult => ({
    taxType: "koerperschaftsteuer",
    scenario: "contributionAccount",
    subScenario: "contributionAccount",
    legalRefs: ["§ 27 KStG", "§ 28 KStG", "§ 20 Abs. 1 Nr. 1 Satz 3 EStG"],
    confidence: 0.92,
    headline: "Steuerliches Einlagekonto (§ 27 KStG)",
    narrative:
      "Im steuerlichen Einlagekonto nach § 27 KStG werden nicht in das Nennkapital geleistete Einlagen der Anteilseigner gesondert festgestellt. Leistungen der Kapitalgesellschaft, die den ausschüttbaren Gewinn übersteigen, gelten als Rückgewähr aus dem Einlagekonto (Einlagenrückgewähr) und sind beim Gesellschafter nach § 20 Abs. 1 Nr. 1 Satz 3 EStG steuerfrei — sie mindern jedoch die Anschaffungskosten der Beteiligung. Verwendungsreihenfolge und gesonderte Feststellung sind zwingend zu beachten.",
    schemaSteps: [
      { id: "feststellung", label: "Gesonderte Feststellung zum Schluss jedes Wirtschaftsjahres (§ 27 Abs. 2 KStG)" },
      { id: "verwendung", label: "Verwendungsreihenfolge: ausschüttbarer Gewinn vor Einlagekonto" },
      { id: "bescheinigung", label: "Steuerbescheinigung an Gesellschafter (§ 27 Abs. 3 KStG)" },
      { id: "gesellschafter", label: "Beim Gesellschafter: Einlagenrückgewähr, keine Kapitaleinkünfte" },
    ],
  }),
};

export const profitDistributionRule: RuleDef = {
  id: "kst.profitDistribution",
  taxType: "koerperschaftsteuer",
  priority: 50,
  matches: ({ facts, scenario }) =>
    scenario === "profitDistribution" ||
    (facts.corporation === true &&
      facts.profitDistribution === true &&
      facts.hiddenProfitDistribution !== true),
  apply: (): RuleResult => ({
    taxType: "koerperschaftsteuer",
    scenario: "profitDistribution",
    subScenario: "profitDistribution",
    legalRefs: ["§ 8 Abs. 3 Satz 1 KStG", "§ 20 Abs. 1 Nr. 1 EStG", "§ 43 EStG", "§ 43a EStG"],
    confidence: 0.9,
    headline: "Offene Gewinnausschüttung",
    narrative:
      "Offene Ausschüttungen der Kapitalgesellschaft auf Basis eines ordentlichen Gewinnverwendungsbeschlusses mindern das Einkommen der Gesellschaft nicht (§ 8 Abs. 3 Satz 1 KStG). Beim Gesellschafter liegen Einkünfte aus Kapitalvermögen nach § 20 Abs. 1 Nr. 1 EStG vor; die Gesellschaft hat 25 % Kapitalertragsteuer zzgl. SolZ einzubehalten (§§ 43, 43a EStG).",
    schemaSteps: [
      { id: "beschluss", label: "Ordentlicher Gewinnverwendungsbeschluss" },
      { id: "einkommen", label: "Keine Einkommensminderung bei der Gesellschaft (§ 8 Abs. 3 S. 1 KStG)" },
      { id: "gesellschafter", label: "Kapitalertrag § 20 Abs. 1 Nr. 1 EStG beim Gesellschafter" },
      { id: "kapest", label: "Kapitalertragsteuer 25 % + SolZ (§§ 43, 43a EStG)" },
    ],
  }),
};

export const lossCarryforwardRule: RuleDef = {
  id: "kst.lossCarryforward",
  taxType: "koerperschaftsteuer",
  priority: 60,
  matches: ({ facts, scenario }) => scenario === "lossCarryforward" || facts.lossCarryforward === true,
  apply: (): RuleResult => ({
    taxType: "koerperschaftsteuer",
    scenario: "lossCarryforward",
    subScenario: "lossCarryforward",
    legalRefs: ["§ 10d EStG", "§ 8 Abs. 1 KStG", "§ 8c KStG", "§ 8d KStG"],
    confidence: 0.9,
    headline: "Verlustvortrag / Verlustabzug (§ 10d EStG, § 8c KStG)",
    narrative:
      "Verluste einer Kapitalgesellschaft werden nach § 10d EStG i.V.m. § 8 Abs. 1 KStG festgestellt und vor- bzw. rückgetragen. Mindestbesteuerung: bis 1 Mio. € (Sockelbetrag) uneingeschränkt, darüber hinaus nur 60 % des übersteigenden Gesamtbetrags. Bei einem schädlichen Beteiligungserwerb > 50 % innerhalb von fünf Jahren gehen nicht genutzte Verluste nach § 8c Abs. 1 KStG unter, es sei denn, die Konzernklausel, die Stille-Reserven-Klausel oder der fortführungsgebundene Verlustvortrag nach § 8d KStG greift.",
    schemaSteps: [
      { id: "feststellung", label: "Verlustfeststellung nach § 10d Abs. 4 EStG" },
      { id: "mindestbesteuerung", label: "Mindestbesteuerung (1 Mio. € + 60 %)" },
      { id: "anteilseignerwechsel", label: "Schädlicher Beteiligungserwerb i.S.d. § 8c KStG?" },
      { id: "ausnahmen", label: "Konzern-/Stille-Reserven-Klausel oder § 8d KStG?" },
    ],
  }),
};

export const CORPORATE_TAX_RULES: RuleDef[] = [
  vgaRule,
  hiddenContributionRule,
  organschaftRule,
  contributionAccountRule,
  lossCarryforwardRule,
  profitDistributionRule,
];
