export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "notice"; variant?: "wichtig" | "merke" | "praxistipp"; text: string }
  | { type: "summary"; title: string; items: string[] };

export interface MagazineArticle {
  id: string;
  category: string;
  issueLabel: string;
  title: string;
  lead: string;
  highlights: { label: string; value: string }[];
  blocks: ArticleBlock[];
}

export const magazineArticles: MagazineArticle[] = [
  {
    id: "est-reform-2027",
    category: "Einkommensteuer",
    issueLabel: "Ausgabe 01 · Einkommensteuer",
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
      { type: "paragraph", text: "Vorerst handelt es sich „nur“ um die Ergebnisse des Koalitionsausschusses. Im anschließenden Gesetzgebungsverfahren müssen der Bundestag und der Bundesrat zustimmen. Mit etwaigen Änderungen bzw. Ergänzungen ist also durchaus zu rechnen." },
      { type: "heading", text: "Die Pläne im Überblick" },
      { type: "paragraph", text: "Der steuerliche Grundfreibetrag (bis zu dieser Höhe muss keine Einkommensteuer gezahlt werden) liegt im Jahr 2026 bei 12.348 EUR. Für zusammen veranlagte Ehegatten verdoppelt sich der Betrag." },
      { type: "paragraph", text: "Nach den Plänen der Bundesregierung soll der Grundfreibetrag voraussichtlich in zwei Stufen bis auf 12.900 EUR im Jahr 2028 erhöht werden." },
      { type: "paragraph", text: "Auch das Kindergeld soll voraussichtlich in zwei Stufen von derzeit 259 EUR auf 272 EUR im Jahr 2028 angehoben werden." },
      { type: "paragraph", text: "Beim Arbeitnehmer-Pauschbetrag ist ein Anstieg um 200 EUR auf 1.430 EUR im Gespräch." },
      { type: "notice", text: "Die vorgenannten Beträge (Grundfreibetrag, Kindergeld und Arbeitnehmer-Pauschbetrag) sollen im Gesetzgebungsverfahren bzw. nach Vorliegen des Existenzminimumberichts final beziffert werden." },
      { type: "paragraph", text: "Die steuerliche Entlastung soll insbesondere für Familien mit Kindern spürbar sein. So hat das BMF u. a. folgende Berechnung aufgestellt: Ab dem Jahr 2028 soll eine vierköpfige Familie mit zwei mittleren Einkommen (Haushaltseinkommen von ca. 60.000 EUR) im Vergleich zu heute um mehr als 600 EUR pro Jahr entlastet werden." },
      { type: "paragraph", text: "Die Gegenfinanzierung soll vor allem über eine Veränderung bei der sogenannten Reichensteuer erfolgen. Diese soll wie folgt gesplittet werden: Ab einem zu versteuernden Einkommen (zvE) von 250.000 EUR soll ein Steuersatz von 45 % greifen. 47 % sollen dann ab einem zvE von 280.000 EUR gelten. Derzeit gelten 45 % ab einem zvE von 277.826 EUR." },
      { type: "paragraph", text: "Der Pauschalsteuersatz bei einer geringfügigen Beschäftigung (Minijob) soll von 2 % auf 5 % angehoben werden." },
      { type: "paragraph", text: "Für die Inanspruchnahme von Handwerkerleistungen für Renovierungs-, Erhaltungs- und Modernisierungsmaßnahmen gewährt der Fiskus eine Steuerermäßigung in Höhe von 20 % der Arbeitskosten (kein Material), maximal 1.200 EUR im Jahr. Diese Steuerermäßigung soll reduziert werden – und zwar auf 15 % und höchstens 900 EUR pro Jahr." },
      { type: "paragraph", text: "In dem „Programm für Aufschwung und Beschäftigung“ sind unter dem Aufzählungspunkt „Arbeitsmarkt“ zwei weitere interessante steuerliche Aspekte aufgeführt:" },
      { type: "paragraph", text: "Für den steuerlich begünstigten Sonn- und Feiertagszuschlag sollen die Obergrenzen nach § 3b EStG bis zu einem Stundenlohn von 75 EUR (bislang 50 EUR) zum 1.1.27 erhöht werden." },
      { type: "notice", text: "Gleichzeitig soll der steuerfreie Zuschlag im Regelungsbereich eines Tarifvertrags vollständig beitragsfrei gestellt werden." },
      { type: "paragraph", text: "Um einen zügigen Wechsel von einem Job in den nächsten Job attraktiver zu machen, sollen Abfindungszahlungen steuerlich privilegiert werden, wenn zügig eine neue Erwerbstätigkeit aufgenommen wird." },
      { type: "notice", text: "Der steuerliche Vorteil soll dabei umso größer sein, je schneller eine neue Beschäftigung aufgenommen wird. Konkretere Regelungen sind hierzu nicht aufgeführt." },
    ],
  },
  {
    id: "ust-gelangensbestaetigung-bfh",
    category: "Umsatzsteuer",
    issueLabel: "Ausgabe 01 · Umsatzsteuer",
    title: "Innergemeinschaftliche Lieferung: BFH lockert Anforderungen an die Gelangensbestätigung",
    lead: "Der Nachweis, dass eine Ware tatsächlich in einen anderen EU-Mitgliedstaat gelangt ist, gehört zu den zentralen Voraussetzungen für die Steuerfreiheit einer innergemeinschaftlichen Lieferung. In der Praxis spielt dabei vor allem die Gelangensbestätigung eine wichtige Rolle.\n\nDer Bundesfinanzhof hat nun jedoch klargestellt: Für den Vertrauensschutz muss die Gelangensbestätigung nicht zwingend vorliegen. Entscheidend ist vielmehr, ob der Unternehmer im Zeitpunkt der Lieferung sorgfältig gehandelt und die Angaben des Abnehmers gewissenhaft geprüft hat.",
    highlights: [
      { label: "Gelangensbestätigung", value: "wichtig, nicht zwingend" },
      { label: "Vertrauensschutz", value: "Sorgfalt im Lieferzeitpunkt" },
      { label: "BFH-Urteile", value: "V R 3/25 · V R 39/25" },
      { label: "Kaution / Papiere", value: "nicht generell nötig" },
    ],
    blocks: [
      {
        type: "summary",
        title: "Auf einen Blick",
        items: [
          "Gelangensbestätigung bleibt wichtig, ist aber nicht immer zwingend.",
          "Vertrauensschutz richtet sich nach der Sorgfalt im Lieferzeitpunkt.",
          "Eine zugesagte Ausfuhr und umfassende Prüfungen können entscheidend sein.",
          "Umsatzsteuer-Kaution oder Einbehalt der Fahrzeugpapiere sind nicht generell erforderlich.",
        ],
      },
      { type: "heading", text: "1. Voraussetzungen der Steuerfreiheit" },
      { type: "paragraph", text: "Innergemeinschaftliche Lieferungen können nach § 4 Nr. 1 Buchst. b UStG in Verbindung mit § 6a UStG von der Umsatzsteuer befreit sein." },
      { type: "paragraph", text: "Voraussetzung ist insbesondere, dass:" },
      { type: "list", items: [
        "der Gegenstand der Lieferung in einen anderen EU-Mitgliedstaat befördert oder versendet wird,",
        "der Abnehmer die erforderlichen persönlichen Voraussetzungen erfüllt,",
        "die Lieferung ordnungsgemäß dokumentiert wird und",
        "der Unternehmer die Voraussetzungen der Steuerbefreiung nachweisen kann.",
      ]},
      { type: "paragraph", text: "Nach § 6a Abs. 3 UStG liegt die Nachweispflicht beim liefernden Unternehmer. Er muss durch geeignete Belege dokumentieren, dass die Ware tatsächlich in das übrige Gemeinschaftsgebiet gelangt ist." },
      { type: "paragraph", text: "Als besonders eindeutiger Nachweis gilt die sogenannte Gelangensbestätigung. Dabei bestätigt der Abnehmer, dass er den gelieferten Gegenstand im anderen Mitgliedstaat erhalten hat." },
      { type: "subheading", text: "Vertrauensschutz trotz unrichtiger Angaben" },
      { type: "paragraph", text: "Hat ein Unternehmer eine Lieferung steuerfrei behandelt, obwohl die gesetzlichen Voraussetzungen tatsächlich nicht erfüllt waren, kann die Steuerbefreiung unter bestimmten Voraussetzungen dennoch erhalten bleiben." },
      { type: "paragraph", text: "Nach § 6a Abs. 4 Satz 1 UStG ist dies möglich, wenn:" },
      { type: "list", items: [
        "die fehlerhafte Beurteilung auf unrichtigen Angaben des Abnehmers beruht und",
        "der Unternehmer die Unrichtigkeit auch bei Beachtung der Sorgfalt eines ordentlichen Kaufmanns nicht erkennen konnte.",
      ]},
      { type: "paragraph", text: "Die Finanzverwaltung vertritt hierzu bislang eine eher strenge Auffassung. Danach soll sich die Frage des Vertrauensschutzes grundsätzlich erst stellen, wenn der Unternehmer seinen formellen Nachweispflichten vollständig nachgekommen ist." },
      { type: "notice", variant: "wichtig", text: "Nach der Verwaltungsauffassung setzt der Vertrauensschutz voraus, dass die vorgeschriebenen Nachweise ihrer Art nach vollständig geführt wurden." },
      { type: "heading", text: "2. Die BFH-Entscheidung" },
      { type: "subheading", text: "2.1 Der zugrunde liegende Fall" },
      { type: "paragraph", text: "Im Jahr 2018 bot ein Unternehmer einen Pkw über eine Internetplattform zum Verkauf an. Kaufinteresse zeigte eine Gesellschaft mit Sitz in Rumänien." },
      { type: "paragraph", text: "Der Verkäufer überprüfte die Umsatzsteuer-Identifikationsnummer der Gesellschaft beim Bundeszentralamt für Steuern und erhielt eine qualifizierte Bestätigung. Zusätzlich ließ er sich einen Handelsregisterauszug vorlegen, aus dem sich die Vertretungsberechtigung des Geschäftsführers ergab." },
      { type: "paragraph", text: "Der Pkw wurde beim Verkäufer abgeholt und bar bezahlt. Der Abholer wies sich mit einem Lichtbildausweis aus, von dessen Vorderseite der Verkäufer eine Kopie anfertigte." },
      { type: "paragraph", text: "Im Kaufvertrag verpflichtete sich der Käufer unter anderem dazu," },
      { type: "list", items: [
        "das Fahrzeug nach Rumänien zu verbringen,",
        "es zeitnah in Deutschland abzumelden und",
        "anschließend eine Gelangensbestätigung zu übersenden.",
      ]},
      { type: "paragraph", text: "Trotz mehrfacher telefonischer und schriftlicher Aufforderung wurde die Gelangensbestätigung nicht zurückgeschickt. Später stellte sich heraus, dass der Pkw nicht dauerhaft nach Rumänien gelangt war, sondern erneut im Inland zugelassen wurde." },
      { type: "paragraph", text: "Finanzamt und Finanzgericht lehnten die Steuerbefreiung zunächst ab. Der Bundesfinanzhof bewertete den Fall jedoch anders und gewährte dem Verkäufer Vertrauensschutz." },
      { type: "subheading", text: "2.2 Die Kernaussage des BFH" },
      { type: "paragraph", text: "Nach Auffassung des BFH setzt der Vertrauensschutz nicht voraus, dass dem Unternehmer bereits eine Gelangensbestätigung vorliegt." },
      { type: "paragraph", text: "Der BFH betont, dass die Gelangensbestätigung zwar ein besonders geeigneter und leicht überprüfbarer Nachweis ist. Sie ist jedoch nicht der einzig zulässige Nachweis." },
      { type: "paragraph", text: "Entscheidend ist außerdem, dass bereits im Zeitpunkt der Lieferung beurteilt werden muss, ob der Unternehmer sorgfältig gehandelt hat. Eine Gelangensbestätigung kann naturgemäß erst ausgestellt werden, nachdem der Gegenstand tatsächlich im anderen Mitgliedstaat angekommen ist." },
      { type: "paragraph", text: "Daher darf das spätere Fehlen der Bestätigung nicht automatisch dazu führen, dass der Vertrauensschutz ausgeschlossen wird." },
      { type: "paragraph", text: "Der BFH entschied hierzu in den Urteilen vom 18.12.2025:" },
      { type: "list", items: ["V R 3/25", "V R 39/25"] },
      { type: "subheading", text: "Versicherung des Abnehmers kann genügen" },
      { type: "paragraph", text: "Hat der Abnehmer zugesagt, die Ware in einen anderen Mitgliedstaat zu transportieren und anschließend eine Gelangensbestätigung zu übersenden, kann auch diese Erklärung bei der Prüfung des Vertrauensschutzes berücksichtigt werden." },
      { type: "notice", variant: "merke", text: "Eine schriftliche Versicherung des Abnehmers über die beabsichtigte Verbringung in das übrige Gemeinschaftsgebiet kann ein wichtiger Bestandteil der Nachweisführung sein." },
      { type: "subheading", text: "Keine Pflicht zur Umsatzsteuer-Kaution" },
      { type: "paragraph", text: "Das Finanzamt hatte argumentiert, der Verkäufer hätte die Umsatzsteuer zunächst als Sicherheit einbehalten können. Die Rückzahlung hätte dann erst nach Eingang der Gelangensbestätigung erfolgen sollen." },
      { type: "paragraph", text: "Alternativ hätte der Verkäufer die Zulassungsbescheinigung Teil II bis zur Vorlage der Bestätigung zurückbehalten können." },
      { type: "paragraph", text: "Der BFH lehnte diese Anforderungen ab. Die derzeitige Rechtslage verpflichtet den liefernden Unternehmer nicht dazu," },
      { type: "list", items: [
        "eine Kaution in Höhe der möglichen Umsatzsteuer zu verlangen oder",
        "Fahrzeugpapiere bis zum Eingang der Gelangensbestätigung einzubehalten.",
      ]},
      { type: "paragraph", text: "Solche zusätzlichen Sicherungsmaßnahmen können daher nicht allgemein zur Voraussetzung des Vertrauensschutzes gemacht werden." },
      { type: "notice", variant: "praxistipp", text: "Der Verkäufer hatte in dem entschiedenen Fall umfangreiche Prüf- und Dokumentationsmaßnahmen vorgenommen. Unter anderem hatte er die USt-IdNr. qualifiziert bestätigen lassen, einen Handelsregisterauszug angefordert, die Identität des Abholers geprüft, eine Ausweiskopie erstellt, die Ausfuhr nach Rumänien vertraglich vereinbart und die Übersendung einer Gelangensbestätigung ausdrücklich festgehalten." },
      { type: "paragraph", text: "Der Verkäufer hatte in dem entschiedenen Fall umfangreiche Prüf- und Dokumentationsmaßnahmen vorgenommen. Unter anderem hatte er:" },
      { type: "list", items: [
        "die Umsatzsteuer-Identifikationsnummer qualifiziert bestätigen lassen,",
        "einen Handelsregisterauszug angefordert,",
        "die Identität des Abholers geprüft,",
        "eine Ausweiskopie erstellt,",
        "die Ausfuhr nach Rumänien vertraglich vereinbart und",
        "die Übersendung einer Gelangensbestätigung ausdrücklich festgehalten.",
      ]},
      { type: "paragraph", text: "Diese sorgfältige Vorgehensweise war für die Entscheidung des BFH von erheblicher Bedeutung." },
      { type: "paragraph", text: "Unternehmen sollten daher ihre internen Abläufe und Vertragsunterlagen überprüfen. Insbesondere kann es sinnvoll sein, in Kaufverträgen oder Allgemeinen Geschäftsbedingungen ausdrücklich festzuhalten, dass:" },
      { type: "list", items: [
        "der Liefergegenstand in einen bestimmten EU-Mitgliedstaat verbracht wird,",
        "der Abnehmer die Ankunft schriftlich bestätigt und",
        "geeignete Transport- und Identitätsnachweise zur Verfügung gestellt werden.",
      ]},
      { type: "heading", text: "Fazit" },
      { type: "paragraph", text: "Die Gelangensbestätigung bleibt für innergemeinschaftliche Lieferungen ein besonders wichtiger Nachweis. Ihr Fehlen führt jedoch nicht zwangsläufig zum Verlust des Vertrauensschutzes." },
      { type: "paragraph", text: "Maßgeblich ist, ob der Unternehmer alle ihm zumutbaren Prüfungen vorgenommen, die Angaben des Abnehmers sorgfältig kontrolliert und den Vorgang nachvollziehbar dokumentiert hat." },
      { type: "paragraph", text: "Die BFH-Rechtsprechung stärkt damit die Position sorgfältig handelnder Unternehmer – sie ist jedoch kein Freibrief für eine lückenhafte Nachweisführung." },
    ],
  },
];
