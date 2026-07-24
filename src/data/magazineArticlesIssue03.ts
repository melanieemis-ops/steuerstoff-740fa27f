import { magazineArticles as existingMagazineArticles } from "./magazineArticles";
import type {
  ArticleBlock,
  ArticleFormat,
  MagazineArticle,
} from "./magazineArticles";

export type { ArticleBlock, ArticleFormat, MagazineArticle } from "./magazineArticles";

/**
 * Neue Ausgabe 03: Familienstiftung.
 *
 * Die technische ID der bisherigen Ausgabe-03-Seite bleibt aus
 * Kompatibilitätsgründen erhalten, damit die bestehende Flipbook-Zuordnung
 * nicht an mehreren Stellen geändert werden muss. Inhalt, Slug und Metadaten
 * wurden vollständig ersetzt.
 */
const familyFoundationArticle: MagazineArticle = {
  id: "e-rechnung-fehler-bmf-2025",
  slug: "familienstiftung-destinataere-besteuerung-2026",
  category: "Einkommensteuer",
  issueLabel: "Ausgabe 03 · Familienstiftung",
  issue: "03",
  title: "Steuerfalle Familienstiftung",
  subtitle: "Wann und wie der Fiskus bei Destinatären steuerlich zugreift",
  author: "Melanie Misakian",
  readingTime: 15,
  legalStatusDate: "2026-07-24",
  publishedAt: "2026-07-24",
  status: "rechtsprechung",
  statusLabel: "BFH-Rechtsprechung",
  tags: [
    "Familienstiftung",
    "Destinatär",
    "§ 20 Abs. 1 Nr. 9 EStG",
    "Kapitalertragsteuer",
    "§ 22 EStG",
    "Teileinkünfteverfahren",
    "BFH VIII R 25/21",
    "Stiftung",
  ],
  lead:
    "Familienstiftungen werden häufig errichtet, um Familienvermögen langfristig zu bündeln, die Unternehmens- oder Vermögensnachfolge zu regeln und erbrechtliche Konflikte zu vermeiden.\n\nDas Vermögen gehört nach seiner Übertragung nicht mehr dem Stifter oder den Familienmitgliedern, sondern der Stiftung. Die Stiftung kann jedoch nach Maßgabe ihrer Satzung den Stifter, dessen Ehegatten, Kinder, Enkel oder andere Familienangehörige finanziell unterstützen.\n\nDamit stellt sich eine für die Praxis entscheidende Frage: Wie werden Zahlungen der Familienstiftung an ihre Destinatäre besteuert?",
  highlights: [
    { label: "Kapitalertragsteuer", value: "25 %" },
    { label: "Sparer-Pauschbetrag", value: "1.000 €" },
    { label: "BFH-Urteil", value: "VIII R 25/21" },
    { label: "Rechtsstand", value: "24.07.2026" },
  ],
  blocks: [
    {
      type: "summary",
      title: "Wovon die Besteuerung abhängt",
      items: [
        "aus welchem Anlass die Zahlung erfolgt,",
        "ob sie aus erwirtschafteten Überschüssen stammt,",
        "ob der Empfänger eine Gegenleistung erbringt,",
        "ob die Stiftung körperschaftsteuerpflichtig oder steuerbefreit ist und",
        "ob sich die Stiftung im Inland oder im Ausland befindet.",
      ],
    },
    { type: "heading", text: "1. Wer ist Destinatär einer Stiftung?" },
    {
      type: "paragraph",
      text: "Als Destinatäre werden die Personen bezeichnet, die nach der Stiftungssatzung Leistungen der Stiftung erhalten können.",
    },
    {
      type: "paragraph",
      text: "Bei einer Familienstiftung gehören hierzu typischerweise:",
    },
    {
      type: "list",
      items: [
        "der Stifter,",
        "dessen Ehegatte,",
        "Kinder und Enkel,",
        "weitere Abkömmlinge,",
        "gegebenenfalls deren Ehegatten oder",
        "andere ausdrücklich in der Satzung bestimmte Familienangehörige.",
      ],
    },
    {
      type: "paragraph",
      text: "Der Kreis der Destinatäre kann sich laufend verändern. Durch Geburten können neue Begünstigte hinzukommen. Durch Tod, Scheidung oder den Eintritt anderer in der Satzung geregelter Voraussetzungen können Personen aus dem Kreis ausscheiden.",
    },
    {
      type: "paragraph",
      text: "Ein Destinatär muss nicht zwingend einen einklagbaren Anspruch gegen die Stiftung besitzen. Häufig entscheidet der Stiftungsvorstand oder ein anderes Stiftungsorgan nach pflichtgemäßem Ermessen darüber, ob, wann und in welcher Höhe eine Zuwendung erfolgt.",
    },
    { type: "heading", text: "2. Grundfall: Einkünfte aus Kapitalvermögen" },
    {
      type: "paragraph",
      text: "Leistungen einer nicht von der Körperschaftsteuer befreiten Stiftung können beim Destinatär zu Einkünften aus Kapitalvermögen nach § 20 Abs. 1 Nr. 9 EStG führen.",
    },
    {
      type: "paragraph",
      text: "Voraussetzung ist, dass die Leistung wirtschaftlich mit einer Gewinnausschüttung einer Kapitalgesellschaft vergleichbar ist. Die Regelung gilt auch für vergleichbare ausländische Stiftungen, die weder ihren Sitz noch ihre Geschäftsleitung in Deutschland haben.",
    },
    { type: "subheading", text: "Die aktuelle BFH-Rechtsprechung" },
    {
      type: "paragraph",
      text: "Lange wurde in der Praxis darauf abgestellt, ob der Destinatär unmittelbar oder mittelbar Einfluss auf das Ausschüttungsverhalten der Stiftung nehmen kann.",
    },
    {
      type: "paragraph",
      text: "Der BFH hat diese Sichtweise mit Urteil vom 1. Oktober 2024, VIII R 25/21, deutlich erweitert.",
    },
    {
      type: "paragraph",
      text: "Danach kann die wirtschaftliche Stellung des Destinatärs bereits dann derjenigen eines Anteilseigners entsprechen, wenn:",
    },
    {
      type: "list",
      items: [
        "der Empfänger nach der Stiftungssatzung zum Kreis der begünstigungsfähigen Personen gehört,",
        "er für die Zuwendung keine Gegenleistung erbringen muss und",
        "sich die Leistung als Verteilung eines von der Stiftung erwirtschafteten Überschusses darstellt.",
      ],
    },
    {
      type: "paragraph",
      text: "Zusätzliche Vermögens-, Stimm-, Abberufungs- oder Organisationsrechte sind nicht erforderlich. Auch ein Rechtsanspruch auf die Zahlung ist nicht notwendig.",
    },
    {
      type: "notice",
      variant: "merke",
      text: "Fehlende Einflussmöglichkeiten schützen einen Destinatär nicht automatisch vor der Einordnung als Kapitaleinkünfte.",
    },
    {
      type: "paragraph",
      text: "Auch einmalige Zuwendungen können unter § 20 Abs. 1 Nr. 9 EStG fallen. Im entschiedenen Fall erhielt der Begünstigte von einer Schweizer Familienstiftung einmalig Geld und Aktien als „Starthilfe“. Obwohl der Stiftungsrat allein über Empfänger, Zeitpunkt und Höhe der Zahlung entschied, behandelte der BFH die Zuwendung als steuerpflichtigen Kapitalertrag.",
    },
    { type: "heading", text: "3. Kapitalertragsteuer bei inländischen Stiftungen" },
    {
      type: "paragraph",
      text: "Handelt es sich um eine steuerpflichtige Kapitalleistung einer inländischen Stiftung, muss die Stiftung grundsätzlich Kapitalertragsteuer einbehalten.",
    },
    {
      type: "summary",
      title: "Der Steuerabzug",
      items: [
        "Kapitalertragsteuer: 25 %",
        "Solidaritätszuschlag: 5,5 % der Kapitalertragsteuer",
        "Kirchensteuer: gegebenenfalls 8 % oder 9 % der Kapitalertragsteuer",
      ],
    },
    {
      type: "paragraph",
      text: "Der Solidaritätszuschlag beträgt grundsätzlich 5,5 % seiner Bemessungsgrundlage. Bruchteile eines Cents bleiben dabei außer Ansatz.",
    },
    {
      type: "paragraph",
      text: "Die Stiftung nimmt den Steuerabzug für Rechnung des Destinatärs vor. Die einbehaltene Steuer ist grundsätzlich bis zum 10. des Folgemonats an das zuständige Finanzamt abzuführen.",
    },
    { type: "subheading", text: "Beispiel 1: Einmalige Zahlung" },
    {
      type: "paragraph",
      text: "Eine nicht steuerbegünstigte inländische Familienstiftung zahlt am 16. Januar 2026 einmalig 12.500,00 € brutto an einen konfessionslosen Destinatär.",
    },
    {
      type: "keyNumbers",
      title: "Berechnung",
      items: [
        { big: "12.500,00 €", label: "Bruttoleistung" },
        { big: "– 3.125,00 €", label: "Kapitalertragsteuer: 25 %" },
        { big: "– 171,87 €", label: "Solidaritätszuschlag: 5,5 %" },
        { big: "9.203,13 €", label: "Auszahlung an den Destinatär" },
      ],
    },
    {
      type: "paragraph",
      text: "Die Stiftung führt insgesamt 3.296,87 € an das Finanzamt ab.",
    },
    { type: "heading", text: "4. Kein unmittelbarer Freistellungsauftrag" },
    {
      type: "paragraph",
      text: "Für viele Bank- und Kapitalerträge kann ein Freistellungsauftrag erteilt werden. Dadurch wird der Sparer-Pauschbetrag bereits beim Steuerabzug berücksichtigt.",
    },
    {
      type: "paragraph",
      text: "Bei Leistungen einer Familienstiftung nach § 43 Abs. 1 Satz 1 Nr. 7a EStG ist eine solche unmittelbare Abstandnahme vom Steuerabzug über einen gewöhnlichen Freistellungsauftrag grundsätzlich nicht vorgesehen.",
    },
    {
      type: "paragraph",
      text: "Die Stiftung muss den Steuerabzug daher regelmäßig auch dann zunächst vornehmen, wenn der Destinatär seinen Sparer-Pauschbetrag noch nicht ausgeschöpft hat. Das bedeutet jedoch nicht, dass der Sparer-Pauschbetrag endgültig verloren geht.",
    },
    { type: "heading", text: "5. Steuererklärung kann sich lohnen" },
    {
      type: "paragraph",
      text: "Hat die Stiftung Kapitalertragsteuer einbehalten, ist die Einkommensteuer auf die Kapitalerträge grundsätzlich abgegolten. Der Destinatär muss die Zuwendung deshalb normalerweise nicht nochmals in seiner Einkommensteuererklärung angeben.",
    },
    {
      type: "paragraph",
      text: "Trotzdem kann die Abgabe der Anlage KAP sinnvoll sein.",
    },
    { type: "subheading", text: "5.1 Überprüfung des Steuerabzugs" },
    {
      type: "paragraph",
      text: "Nach § 32d Abs. 4 EStG kann der Destinatär eine Überprüfung des Steuerabzugs beantragen.",
    },
    {
      type: "paragraph",
      text: "Das bietet sich insbesondere an, wenn:",
    },
    {
      type: "list",
      items: [
        "der Sparer-Pauschbetrag noch nicht vollständig ausgeschöpft wurde,",
        "der Steuerabzug fehlerhaft berechnet wurde,",
        "anrechenbare ausländische Steuern vorliegen oder",
        "die Zahlung steuerlich falsch eingeordnet wurde.",
      ],
    },
    {
      type: "summary",
      title: "Sparer-Pauschbetrag",
      items: [
        "1.000 € bei Einzelveranlagung",
        "2.000 € bei zusammenveranlagten Ehegatten",
      ],
    },
    { type: "subheading", text: "5.2 Günstigerprüfung" },
    {
      type: "paragraph",
      text: "Liegt der persönliche Steuersatz des Destinatärs unter 25 %, kann außerdem ein Antrag auf Günstigerprüfung nach § 32d Abs. 6 EStG gestellt werden.",
    },
    {
      type: "paragraph",
      text: "Das Finanzamt prüft dann, ob die tarifliche Besteuerung der Kapitalerträge günstiger ist als die Abgeltungsteuer. Ist die tarifliche Besteuerung günstiger, wird die Differenz erstattet. Ist sie ungünstiger, bleibt es bei der Abgeltungsteuer.",
    },
    {
      type: "paragraph",
      text: "Beide Anträge können nebeneinander gestellt werden.",
    },
    { type: "heading", text: "6. Besonders wichtig bei minderjährigen Destinatären" },
    {
      type: "paragraph",
      text: "Gerade bei Kindern und Jugendlichen kann eine Einkommensteuererklärung zu einer erheblichen Erstattung führen.",
    },
    { type: "subheading", text: "Beispiel 2: Minderjähriger Destinatär" },
    {
      type: "paragraph",
      text: "Wie in Beispiel 1 erhält ein 15-jähriger Destinatär im Jahr 2026 eine Stiftungsleistung von 12.500,00 €. Er verfügt über keine weiteren Einkünfte. Die Stiftung hat 3.125,00 € Kapitalertragsteuer und 171,87 € Solidaritätszuschlag einbehalten.",
    },
    {
      type: "paragraph",
      text: "Die gesetzlichen Vertreter geben für das Kind eine Einkommensteuererklärung ab und beantragen die Günstigerprüfung.",
    },
    {
      type: "keyNumbers",
      title: "Vereinfachte Berechnung",
      items: [
        { big: "12.500,00 €", label: "Leistungen der Stiftung" },
        { big: "– 1.000,00 €", label: "Sparer-Pauschbetrag" },
        { big: "11.500,00 €", label: "Einkünfte aus Kapitalvermögen" },
        { big: "11.464,00 €", label: "Zu versteuerndes Einkommen nach 36 € Sonderausgaben-Pauschbetrag" },
      ],
    },
    {
      type: "paragraph",
      text: "Der Grundfreibetrag beträgt im Jahr 2026 12.348 €. Das zu versteuernde Einkommen liegt damit unter dem Grundfreibetrag. Die tarifliche Einkommensteuer beträgt im vereinfachten Beispiel 0 €.",
    },
    {
      type: "summary",
      title: "Erstattung",
      items: [
        "Tarifliche Einkommensteuer und Soli: 0,00 €",
        "Einbehaltene Kapitalertragsteuer: 3.125,00 €",
        "Einbehaltener Solidaritätszuschlag: 171,87 €",
        "Steuererstattung: 3.296,87 €",
      ],
    },
    {
      type: "notice",
      variant: "praxistipp",
      text: "Bei minderjährigen Destinatären sollte jedes Jahr geprüft werden, ob eine eigene Einkommensteuererklärung sinnvoll ist.",
    },
    {
      type: "paragraph",
      text: "Dabei dürfen allerdings weitere Einkünfte des Kindes, etwa Zinsen, Dividenden, Vermietungseinkünfte oder Arbeitslohn, nicht außer Betracht bleiben.",
    },
    { type: "heading", text: "7. Ausländische Familienstiftungen" },
    {
      type: "paragraph",
      text: "§ 20 Abs. 1 Nr. 9 Satz 2 EStG erfasst auch Leistungen vergleichbarer ausländischer Stiftungen.",
    },
    {
      type: "paragraph",
      text: "Zunächst ist durch einen sogenannten Rechtstypenvergleich zu prüfen, ob die ausländische Stiftung in ihren wesentlichen Strukturen mit einer deutschen Körperschaft, Personenvereinigung oder Vermögensmasse vergleichbar ist.",
    },
    {
      type: "paragraph",
      text: "Bei einer ausländischen Stiftung besteht jedoch häufig kein inländischer Schuldner, der einen deutschen Kapitalertragsteuerabzug vornehmen kann.",
    },
    {
      type: "paragraph",
      text: "In diesem Fall wird dem Destinatär gegebenenfalls der volle Bruttobetrag ausgezahlt. Er muss die ausländische Stiftungsleistung dann grundsätzlich selbst in seiner deutschen Einkommensteuererklärung angeben.",
    },
    {
      type: "notice",
      variant: "wichtig",
      text: "„Es wurde keine Kapitalertragsteuer einbehalten“ bedeutet bei einer ausländischen Stiftung nicht, dass die Zahlung steuerfrei ist.",
    },
    {
      type: "paragraph",
      text: "Zusätzlich können bei ausländischen Familienstiftungen die Zurechnungsregelungen des Außensteuergesetzes, Doppelbesteuerungsabkommen und ausländische Quellensteuern zu prüfen sein.",
    },
    { type: "heading", text: "8. Wann können sonstige Einkünfte vorliegen?" },
    {
      type: "paragraph",
      text: "Greift § 20 Abs. 1 Nr. 9 EStG nicht, können wiederkehrende Leistungen der Stiftung unter bestimmten Voraussetzungen als sonstige Einkünfte nach § 22 Nr. 1 EStG steuerpflichtig sein.",
    },
    {
      type: "paragraph",
      text: "Das kommt insbesondere in Betracht, wenn:",
    },
    {
      type: "list",
      items: [
        "die Stiftung von der Körperschaftsteuer befreit ist,",
        "sich die Zahlung nicht als Ausschüttung erwirtschafteter Überschüsse darstellt oder",
        "die besonderen Voraussetzungen des § 20 Abs. 1 Nr. 9 EStG aus anderen Gründen nicht vorliegen.",
      ],
    },
    {
      type: "paragraph",
      text: "Allein die fehlende Einflussmöglichkeit des Destinatärs genügt nach der neueren BFH-Rechtsprechung nicht mehr, um § 20 EStG auszuschließen.",
    },
    { type: "subheading", text: "Kein Kapitalertragsteuerabzug" },
    {
      type: "paragraph",
      text: "Bei sonstigen Einkünften nach § 22 EStG nimmt die Stiftung grundsätzlich keinen Kapitalertragsteuerabzug vor.",
    },
    {
      type: "paragraph",
      text: "Der Destinatär erhält die Zahlung zunächst brutto, muss sie aber in seiner Einkommensteuererklärung angeben. Die Besteuerung erfolgt mit seinem persönlichen Einkommensteuersatz.",
    },
    { type: "heading", text: "9. Volle Besteuerung oder begünstigte Leibrente?" },
    {
      type: "paragraph",
      text: "Wiederkehrende Stiftungsleistungen nach § 22 Nr. 1 EStG werden grundsätzlich in voller Höhe besteuert.",
    },
    {
      type: "paragraph",
      text: "Nur wenn eine steuerlich anzuerkennende Leibrente vorliegt, wird lediglich der gesetzlich bestimmte Ertragsanteil angesetzt. Dafür müssen die zu erwartenden Leistungen zahlen- oder wertmäßig einigermaßen zuverlässig bestimmbar sein.",
    },
    {
      type: "paragraph",
      text: "Hängt die Höhe der Zahlung beispielsweise von den jährlichen Stiftungserträgen, dem Jahresüberschuss, der Rendite des Stiftungsvermögens oder einer anderen variablen Bemessungsgrundlage ab, liegt regelmäßig keine begünstigte Leibrente vor.",
    },
    {
      type: "paragraph",
      text: "Der BFH hat bestätigt, dass variable Destinatärsvergütungen in voller Höhe als sonstige Einkünfte zu versteuern sein können, wenn ihre Höhe wegen der Abhängigkeit vom Einkommen der Stiftung nicht im Voraus bestimmbar ist.",
    },
    {
      type: "notice",
      variant: "merke",
      text: "Eine lebenslange Zahlung ist nicht automatisch eine steuerlich begünstigte Leibrente.",
    },
    { type: "heading", text: "10. Sonderfall Teileinkünfteverfahren" },
    {
      type: "paragraph",
      text: "Stammen sonstige Bezüge nach § 22 Nr. 1 Satz 2 EStG von einer nicht von der Körperschaftsteuer befreiten Stiftung, kann § 3 Nr. 40 Buchst. i EStG eingreifen.",
    },
    {
      type: "paragraph",
      text: "Dann bleiben grundsätzlich 40 % der Bezüge steuerfrei. Nur 60 % werden mit dem persönlichen Einkommensteuersatz versteuert.",
    },
    {
      type: "paragraph",
      text: "Die Regelung soll berücksichtigen, dass die Erträge bereits auf Ebene der Stiftung mit Körperschaftsteuer belastet wurden. Der BFH hat die Anwendung der entsprechenden Teilfreistellung auf Destinatszahlungen bestätigt.",
    },
    {
      type: "paragraph",
      text: "Seit der Entscheidung VIII R 25/21 ist dieser Anwendungsbereich bei klassischen Leistungen einer nicht steuerbefreiten Familienstiftung allerdings enger zu beurteilen. Gehört der Empfänger zum satzungsmäßigen Begünstigtenkreis, erbringt er keine Gegenleistung und erhält er erwirtschaftete Überschüsse, spricht regelmäßig viel für Kapitaleinkünfte nach § 20 Abs. 1 Nr. 9 EStG.",
    },
    {
      type: "notice",
      variant: "wichtig",
      text: "Zwischen Abgeltungsteuer und Teileinkünfteverfahren besteht kein Wahlrecht. Die steuerliche Einordnung ergibt sich aus dem tatsächlichen Sachverhalt und der Stiftungssatzung.",
    },
    {
      type: "paragraph",
      text: "Ein bloßer Belastungsvergleich von 25 % Abgeltungsteuer mit 60 % des persönlichen Steuersatzes entscheidet daher nicht über die anzuwendende Einkunftsart.",
    },
    { type: "heading", text: "11. Zahlungen einer steuerbefreiten Stiftung" },
    {
      type: "paragraph",
      text: "Ist die Stiftung von der Körperschaftsteuer befreit, scheidet § 20 Abs. 1 Nr. 9 EStG grundsätzlich aus.",
    },
    {
      type: "paragraph",
      text: "Wiederkehrende Leistungen können dann nach § 22 Nr. 1 EStG steuerpflichtig sein. Das Teileinkünfteverfahren ist bei Leistungen einer steuerbefreiten Stiftung grundsätzlich nicht anwendbar.",
    },
    { type: "subheading", text: "Beispiel 3: Variable Zahlung einer steuerbefreiten Stiftung" },
    {
      type: "paragraph",
      text: "Eine steuerbefreite Stiftung zahlt einer Destinatärin im Jahr 2026 insgesamt 20.000 €. Die Zahlung richtet sich nach einem bestimmten Anteil der jährlich erwirtschafteten Stiftungserträge. Sie ist deshalb nicht im Voraus zuverlässig bestimmbar.",
    },
    {
      type: "paragraph",
      text: "Die Zahlungen können als wiederkehrende Bezüge nach § 22 Nr. 1 EStG in voller Höhe steuerpflichtig sein. Eine Besteuerung lediglich mit dem Ertragsanteil scheidet wegen der variablen Höhe grundsätzlich aus.",
    },
    {
      type: "keyNumbers",
      title: "Vereinfachte Ermittlung",
      items: [
        { big: "20.000 €", label: "Einnahmen" },
        { big: "– 102 €", label: "Werbungskosten-Pauschbetrag" },
        { big: "19.898 €", label: "Steuerpflichtige sonstige Einkünfte" },
      ],
    },
    {
      type: "paragraph",
      text: "Diese Einkünfte unterliegen dem persönlichen Einkommensteuersatz der Destinatärin.",
    },
    { type: "heading", text: "12. Vergütung für Tätigkeiten ist gesondert zu beurteilen" },
    {
      type: "paragraph",
      text: "Nicht jede Zahlung an einen Destinatär ist automatisch eine Destinatärsleistung.",
    },
    {
      type: "paragraph",
      text: "Erbringt der Begünstigte eine konkrete berufliche oder wirtschaftliche Gegenleistung für die Stiftung, ist die Vergütung der jeweils einschlägigen Einkunftsart zuzuordnen.",
    },
    {
      type: "summary",
      title: "Beispiele",
      items: [
        "Anstellung bei der Stiftung: Einkünfte aus nichtselbstständiger Arbeit nach § 19 EStG",
        "Steuerberatung oder Rechtsberatung: Einkünfte aus selbstständiger Arbeit nach § 18 EStG",
        "Gewerbliche Dienstleistungen: Einkünfte aus Gewerbebetrieb nach § 15 EStG",
        "Vermietung eines Gebäudes an die Stiftung: Einkünfte aus Vermietung und Verpachtung nach § 21 EStG",
        "Darlehen an die Stiftung: Einkünfte aus Kapitalvermögen nach § 20 EStG",
      ],
    },
    {
      type: "paragraph",
      text: "Die tätigkeitsbezogene Vergütung muss von der gegenleistungslosen Destinatärszuwendung getrennt werden.",
    },
    { type: "subheading", text: "Beispiel 4: Destinatär und Steuerberater" },
    {
      type: "paragraph",
      text: "Ein Destinatär erhält von einer inländischen Familienstiftung eine gegenleistungslose Zuwendung aus den erwirtschafteten Überschüssen von 15.000 €. Zusätzlich erstellt er als selbstständiger Steuerberater die Steuererklärungen der Stiftung. Dafür erhält er ein angemessenes Honorar von 10.000 €.",
    },
    {
      type: "summary",
      title: "Steuerliche Einordnung",
      items: [
        "Destinatärszuwendung von 15.000 €: Einkünfte aus Kapitalvermögen nach § 20 Abs. 1 Nr. 9 EStG",
        "Steuerberatungshonorar von 10.000 €: Betriebseinnahmen nach § 18 EStG",
      ],
    },
    {
      type: "paragraph",
      text: "Die beiden Zahlungen dürfen steuerlich nicht miteinander vermischt werden.",
    },
    { type: "heading", text: "13. Leistungen bei Auflösung der Stiftung" },
    {
      type: "paragraph",
      text: "Bei der Auflösung einer Stiftung muss zwischen laufenden Ausschüttungen und der Auskehrung des Liquidationsvermögens unterschieden werden.",
    },
    {
      type: "paragraph",
      text: "Der BFH entschied für die frühere Rechtslage des Jahres 2005, dass die Auszahlung des Liquidationsendvermögens an den alleinigen Anfallberechtigten nicht mit einer gewöhnlichen Gewinnausschüttung vergleichbar war.",
    },
    {
      type: "paragraph",
      text: "Seit 2007 verweist § 20 Abs. 1 Nr. 9 EStG jedoch zusätzlich auf § 20 Abs. 1 Nr. 2 EStG. Damit können nach heutiger Rechtslage auch bestimmte Bezüge anlässlich der Auflösung einer Stiftung ertragsteuerlich erfasst werden. Daneben kann der Erwerb des Anfallberechtigten schenkungsteuerliche Folgen nach § 7 Abs. 1 Nr. 9 ErbStG auslösen.",
    },
    {
      type: "paragraph",
      text: "Liquidationsfälle müssen deshalb stets gesondert und unter Berücksichtigung des aktuellen Gesetzeswortlauts geprüft werden.",
    },
    { type: "heading", text: "14. Praxis-Checkliste" },
    {
      type: "checklist",
      title: "Zahlungen an Destinatäre richtig prüfen",
      storageKey: "steuerstoff-magazin-checklist-familienstiftung-2026-v1",
      items: [
        "Ist die Stiftung körperschaftsteuerpflichtig oder steuerbefreit?",
        "Befindet sich Sitz oder Geschäftsleitung im Inland?",
        "Handelt es sich bei einer ausländischen Stiftung um einen vergleichbaren Rechtstyp?",
        "Stammt die Zahlung aus erwirtschafteten Überschüssen oder aus dem Vermögensstamm?",
        "Gehört der Empfänger nach der Satzung zum begünstigten Personenkreis?",
        "Besteht ein Rechtsanspruch oder entscheidet das Stiftungsorgan nach Ermessen?",
        "Erbringt der Empfänger eine Gegenleistung?",
        "Ist der Empfänger kirchensteuerpflichtig?",
        "Wurde der Sparer-Pauschbetrag bereits anderweitig genutzt?",
        "Liegt der persönliche Steuersatz unter 25 %?",
        "Muss die Stiftung Kapitalertragsteuer einbehalten?",
        "Ist eine Kapitalertragsteuer-Anmeldung erforderlich?",
        "Wurde eine Steuerbescheinigung ausgestellt?",
        "Muss der Destinatär die Zahlung in seiner Steuererklärung angeben?",
        "Sollte eine Günstigerprüfung oder Überprüfung des Steuerabzugs beantragt werden?",
        "Sind bei Auslandsstiftungen zusätzlich das AStG oder ein DBA zu prüfen?",
      ],
    },
    { type: "heading", text: "Fazit" },
    {
      type: "paragraph",
      text: "Leistungen einer Familienstiftung sind beim Destinatär keineswegs automatisch steuerfrei.",
    },
    {
      type: "paragraph",
      text: "Bei einer nicht von der Körperschaftsteuer befreiten Stiftung liegen regelmäßig Einkünfte aus Kapitalvermögen vor, wenn der Empfänger zum satzungsmäßigen Begünstigtenkreis gehört, keine Gegenleistung erbringt und eine Beteiligung an den erwirtschafteten Überschüssen erhält.",
    },
    {
      type: "notice",
      variant: "wichtig",
      text: "Seit dem BFH-Urteil vom 1. Oktober 2024 ist klar: Einfluss auf die Stiftung ist keine zwingende Voraussetzung für die Besteuerung als Kapitalertrag.",
    },
    {
      type: "paragraph",
      text: "Bei inländischen Stiftungen muss deshalb häufig bereits bei Auszahlung Kapitalertragsteuer einbehalten werden. Eine Einkommensteuererklärung kann für den Destinatär dennoch sinnvoll sein – insbesondere bei nicht ausgeschöpftem Sparer-Pauschbetrag, niedrigem persönlichem Steuersatz oder minderjährigen Begünstigten.",
    },
    {
      type: "paragraph",
      text: "Andere Einkunftsarten kommen vor allem bei steuerbefreiten Stiftungen, besonderen Versorgungsleistungen oder konkreten Tätigkeiten des Destinatärs für die Stiftung in Betracht.",
    },
    {
      type: "paragraph",
      text: "Die entscheidenden Unterlagen bleiben deshalb stets die Stiftungssatzung, der Zuwendungsbeschluss, die Herkunft der ausgezahlten Mittel und die rechtlichen Beziehungen zwischen Stiftung und Destinatär.",
    },
    {
      type: "legalStatus",
      label: "Rechtsstand",
      text: "24. Juli 2026. Dieser Beitrag dient der allgemeinen fachlichen Information und ersetzt keine Prüfung des konkreten Einzelfalls.",
    },
    {
      type: "sourceLink",
      title: "§ 20 EStG – Einkünfte aus Kapitalvermögen",
      text: "Gesetzestext, insbesondere § 20 Abs. 1 Nr. 9 EStG.",
      buttonLabel: "Gesetz öffnen",
      url: "https://www.gesetze-im-internet.de/estg/__20.html",
      note: "Maßgeblich ist der jeweils geltende Gesetzeswortlaut.",
    },
    {
      type: "sourceLink",
      title: "Kapitalertragsteuer und Steuerabzug",
      text: "Gesetzestexte zu §§ 32d, 43, 43a, 44 und 44a EStG.",
      buttonLabel: "§ 43 EStG öffnen",
      url: "https://www.gesetze-im-internet.de/estg/__43.html",
      note: "Maßgeblich ist der jeweils geltende Gesetzeswortlaut.",
    },
    {
      type: "sourceLink",
      title: "BFH zur Schweizer Familienstiftung",
      text: "BFH, Urteil vom 1. Oktober 2024 – VIII R 25/21.",
      buttonLabel: "BFH-Entscheidung öffnen",
      url: "https://www.bundesfinanzhof.de/de/entscheidung/entscheidungen-online/detail/STRE202410209/",
      note: "steuerstoff fasst die Entscheidung redaktionell zusammen; maßgeblich bleibt der vollständige amtliche Entscheidungstext.",
    },
    {
      type: "sourceLink",
      title: "BFH zur Leibrente und variablen Leistungen",
      text: "BFH, Beschluss vom 16. Juni 2020 – X B 153/19.",
      buttonLabel: "BFH-Entscheidung öffnen",
      url: "https://www.bundesfinanzhof.de/de/entscheidung/entscheidungen-online/detail/STRE202050202/",
      note: "steuerstoff fasst die Entscheidung redaktionell zusammen; maßgeblich bleibt der vollständige amtliche Entscheidungstext.",
    },
    {
      type: "sourceLink",
      title: "BFH zur Auflösung einer Stiftung",
      text: "BFH, Urteil vom 28. Februar 2018 – VIII R 30/15.",
      buttonLabel: "BFH-Entscheidung öffnen",
      url: "https://www.bundesfinanzhof.de/de/entscheidung/entscheidungen-online/detail/STRE201810091/",
      note: "steuerstoff fasst die Entscheidung redaktionell zusammen; maßgeblich bleibt der vollständige amtliche Entscheidungstext.",
    },
  ],
};

export const magazineArticles: MagazineArticle[] = existingMagazineArticles.map(
  (article) =>
    article.id === "e-rechnung-fehler-bmf-2025"
      ? familyFoundationArticle
      : article,
);
