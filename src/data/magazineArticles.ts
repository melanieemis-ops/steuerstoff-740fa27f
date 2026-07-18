export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "notice"; variant?: "wichtig" | "merke" | "praxistipp"; text: string }
  | { type: "summary"; title: string; items: string[] }
  | {
      type: "keyNumbers";
      title: string;
      items: { big: string; label: string }[];
    }
  | { type: "legalStatus"; label: string; text: string }
  | {
      type: "change";
      number: number;
      title: string;
      lawRef: string;
      paragraphs: string[];
      list?: string[];
      practice?: string;
      effective?: string;
    }
  | { type: "editorial"; title: string; paragraphs: string[] }
  | {
      type: "checklist";
      title: string;
      storageKey: string;
      items: string[];
    }
  | {
      type: "sourceLink";
      title: string;
      text: string;
      buttonLabel: string;
      url: string;
      note?: string;
    };

export type ArticleFormat = "standard" | "special";

export interface MagazineArticle {
  id: string;
  slug?: string;
  category: string;
  issueLabel: string;
  /** Ausgabe-ID (z.B. "01", "02"), zur Zuordnung im Flipbook. */
  issue?: string;
  title: string;
  subtitle?: string;
  lead: string;
  highlights: { label: string; value: string }[];
  blocks: ArticleBlock[];
  format?: ArticleFormat;
  status?: string;
  statusLabel?: string;
  specialtyLabel?: string;
  pinned?: boolean;
  legalStatusDate?: string;
  publishedAt?: string;
  author?: string;
  readingTime?: number;
  tags?: string[];
}

export const magazineArticles: MagazineArticle[] = [
  {
    id: "jstg-2026-einkommensteuer",
    slug: "jstg-2026-einkommensteuer",
    category: "Gesetzgebung",
    issueLabel: "Spezial · Gesetzgebung",
    issue: "01",
    title: "Jahressteuergesetz 2026: Diese Änderungen plant das BMF",
    subtitle:
      "Neue Regeln für Grundstückskaufpreise, Lohnsteuer, Quellensteuerentlastung und erste Tätigkeitsstätten",
    format: "special",
    status: "referentenentwurf",
    statusLabel: "Referentenentwurf",
    specialtyLabel: "steuerstoff SPEZIAL",
    pinned: true,
    legalStatusDate: "2026-05-19",
    publishedAt: "2026-07-17",
    author: "Melanie Misakian",
    readingTime: 9,
    tags: [
      "JStG 2026",
      "Einkommensteuer",
      "Lohnsteuer",
      "§ 50c EStG",
      "Immobilien",
      "Gesetzgebung",
    ],
    lead:
      "Das BMF hat den Referentenentwurf des Jahressteuergesetzes 2026 veröffentlicht. Geplant sind unter anderem eine gesetzliche Kaufpreisaufteilung für bebaute Grundstücke, neue Meldepflichten bei der Lohnsteuer, höhere Freigrenzen bei § 50a und § 50c EStG sowie eine Verkürzung des Zuordnungszeitraums bei inländischen ersten Tätigkeitsstätten.",
    highlights: [
      { label: "Erste Tätigkeitsstätte", value: "48 → 24 Monate" },
      { label: "§ 50a Freigrenze", value: "250 → 500 €" },
      { label: "§ 50c antragslos", value: "10.000 → 100.000 €" },
      { label: "Kaufpreisaufteilung", value: "Neuer § 6f EStG" },
    ],
    blocks: [
      {
        type: "legalStatus",
        label: "Rechtsstand",
        text: "Der Beitrag behandelt den Referentenentwurf des Bundesministeriums der Finanzen vom 19. Mai 2026. Das Gesetzgebungsverfahren ist noch nicht abgeschlossen. Einzelne Inhalte, Anwendungszeitpunkte und Formulierungen können sich im weiteren Verfahren ändern.",
      },
      {
        type: "keyNumbers",
        title: "Die wichtigsten Zahlen",
        items: [
          {
            big: "48 → 24 Monate",
            label: "Dauerhafte Zuordnung zu einer inländischen ersten Tätigkeitsstätte",
          },
          {
            big: "250 → 500 €",
            label: "Freigrenze für Kleinhonorare nach § 50a EStG",
          },
          {
            big: "10.000 → 100.000 €",
            label: "Antragslose Quellensteuerentlastung nach § 50c EStG",
          },
          {
            big: "Neuer § 6f EStG",
            label: "Gesetzliche Aufteilung von Grundstückskaufpreisen",
          },
        ],
      },
      { type: "heading", text: "Einleitung" },
      {
        type: "paragraph",
        text: "Das Bundesministerium der Finanzen hat den Referentenentwurf eines Jahressteuergesetzes 2026 veröffentlicht. Der Entwurf bündelt zahlreiche Einzelmaßnahmen aus unterschiedlichen Bereichen des Steuerrechts.",
      },
      {
        type: "paragraph",
        text: "Nach Darstellung des Ministeriums besteht insbesondere Anpassungsbedarf an das Recht der Europäischen Union, an die Rechtsprechung des Europäischen Gerichtshofs sowie an Entscheidungen des Bundesfinanzhofs und des Bundesverfassungsgerichts.",
      },
      {
        type: "paragraph",
        text: "Daneben enthält der Entwurf Maßnahmen zur Digitalisierung, zum Bürokratieabbau, zur Vermeidung steuerlicher Gestaltungen sowie Änderungen von Verfahrens- und Zuständigkeitsregelungen.",
      },
      {
        type: "paragraph",
        text: "Besonders praxisrelevant sind die geplante Neuregelung der umsatzsteuerlichen Organschaft, die Erleichterung der Quellensteuerentlastung nach § 50c EStG, die Anpassung des Zinssatzes für die Vollverzinsung und die gesetzliche Regelung zur Aufteilung eines Gesamtkaufpreises für bebaute Grundstücke.",
      },
      {
        type: "paragraph",
        text: "Dieser erste Teil des steuerstoff-Spezials konzentriert sich auf die vorgesehenen Änderungen im Einkommensteuergesetz.",
      },
      { type: "heading", text: "Die geplanten Änderungen im Einkommensteuergesetz" },
      {
        type: "change",
        number: 1,
        title: "Grundlohn bei Sonn-, Feiertags- und Nachtzuschlägen",
        lawRef: "§ 3b Abs. 2 Satz 1 EStG",
        paragraphs: [
          "Als Reaktion auf das BFH-Urteil vom 10. August 2023, VI R 11/21, soll die bisherige Verwaltungspraxis zur Ermittlung des Grundlohns gesetzlich festgeschrieben werden.",
          "Für die Berechnung steuerfreier Sonn-, Feiertags- und Nachtzuschläge soll künftig grundsätzlich der steuerpflichtige und nicht nach § 40 EStG pauschal besteuerte laufende Arbeitslohn maßgebend sein.",
          "Einbezogen werden außerdem laufende steuerfreie Arbeitgeberbeträge nach § 3 Nr. 56 oder Nr. 63 EStG. Andere steuerfreie, nicht steuerbare oder pauschal besteuerte Bezüge sollen nicht in den maßgebenden Grundlohn einfließen.",
        ],
        practice:
          "Für die Lohnabrechnung wird damit deutlicher abgegrenzt, welche laufenden Vergütungsbestandteile in die Berechnung der steuerfreien Zuschläge eingehen.",
        effective: "Ab 1. Januar 2027",
      },
      {
        type: "change",
        number: 2,
        title: "Kaufpreisaufteilung bei bebauten Grundstücken",
        lawRef: "§ 6f EStG – neu",
        paragraphs: [
          "Mit dem neuen § 6f EStG soll die Aufteilung eines Gesamtkaufpreises für ein bebautes Grundstück auf Grund und Boden sowie Gebäude erstmals ausdrücklich gesetzlich geregelt werden.",
          "Eine im Kaufvertrag vorgenommene Aufteilung soll grundsätzlich anzuerkennen sein, wenn sie die tatsächlichen Wertverhältnisse nicht grundlegend verfehlt und wirtschaftlich haltbar erscheint.",
          "Kann keine geeignete vertragliche Aufteilung zugrunde gelegt werden, sollen Boden- und Gebäudewert zunächst gesondert ermittelt werden. Der Gesamtkaufpreis wird anschließend im Verhältnis dieser Werte auf Grund und Boden sowie Gebäude verteilt.",
          "Für die Wertermittlung soll die Immobilienwertermittlungsverordnung herangezogen werden. Der Gebäudewertanteil wird im Grundsatz aus dem marktangepassten vorläufigen Verfahrenswert des bebauten Grundstücks abzüglich des Bodenwerts ermittelt.",
          "Das BMF soll eine offizielle Arbeitshilfe zur vereinfachten Kaufpreisaufteilung bereitstellen. Ein abweichender Wert kann durch ein qualifiziertes Sachverständigengutachten nachgewiesen werden.",
        ],
        practice:
          "Die Aufteilung entscheidet insbesondere bei vermieteten Immobilien über die Höhe der abschreibungsfähigen Gebäudeanschaffungskosten. Der auf Grund und Boden entfallende Anteil ist nicht abschreibbar.",
        effective:
          "Für Anschaffungen aufgrund eines nach der Verkündung rechtswirksam abgeschlossenen Vertrags.",
      },
      {
        type: "change",
        number: 3,
        title: "Erste Tätigkeitsstätte",
        lawRef: "§ 9 Abs. 4 Satz 3 EStG",
        paragraphs: [
          "Der Zeitraum, ab dem bei einer Zuordnung zu einer inländischen Tätigkeitsstätte von Dauerhaftigkeit ausgegangen werden kann, soll von mehr als 48 Monaten auf mehr als 24 Monate verkürzt werden.",
          "Für Tätigkeitsstätten im Ausland soll es weiterhin beim Zeitraum von mehr als 48 Monaten bleiben.",
        ],
        practice:
          "Die Änderung kann die Abgrenzung zwischen einer ersten Tätigkeitsstätte und einer beruflich veranlassten Auswärtstätigkeit beeinflussen. Damit können sich Auswirkungen auf Fahrtkosten, Verpflegungsmehraufwendungen und Übernachtungskosten ergeben.",
        effective: "Ab 1. Januar 2027",
      },
      {
        type: "change",
        number: 4,
        title: "Kinder- und Ausbildungsfreibetrag bei EU-/EWR-Wohnsitz",
        lawRef: "§ 32 Abs. 6 Satz 4 und § 33a Abs. 2 Satz 2 EStG",
        paragraphs: [
          "Kinderfreibeträge und der Ausbildungsfreibetrag sollen künftig ungekürzt gewährt werden, wenn das Kind seinen Wohnsitz in einem Mitgliedstaat der Europäischen Union oder in einem Staat des Europäischen Wirtschaftsraums hat.",
          "Eine Kürzung entsprechend den Lebensverhältnissen des Wohnsitzstaats soll nur noch für Kinder möglich sein, deren Wohnsitz außerhalb der EU und des EWR liegt.",
        ],
        practice:
          "Die geplante Änderung kann sich auch auf noch offene Veranlagungs- und Rechtsbehelfsverfahren auswirken.",
        effective: "In allen offenen Fällen",
      },
      {
        type: "change",
        number: 5,
        title: "Tarifermäßigung bei außerordentlichen Einkünften",
        lawRef: "§ 34 Abs. 2 Nr. 1 EStG",
        paragraphs: [
          "Die Tarifermäßigung nach § 34 EStG soll bei bestimmten Veräußerungsgewinnen weiter eingeschränkt werden.",
          "Bereits bislang sind solche Veräußerungsgewinne von der Begünstigung ausgenommen, deren steuerpflichtiger Teil dem Teileinkünfteverfahren unterliegt.",
          "Dieser Ausschluss soll auf Veräußerungsgewinne erweitert werden, die ganz oder teilweise aus der Veräußerung von Investment- oder Spezial-Investmentanteilen stammen und für die eine Steuerbefreiung beziehungsweise Teilfreistellung nach dem Investmentsteuergesetz zur Anwendung kommt.",
          "Damit soll eine doppelte steuerliche Begünstigung vermieden werden.",
        ],
        effective: "Ab 1. Januar 2027",
      },
      {
        type: "change",
        number: 6,
        title: "Korrekturen der Lohnsteuerbescheinigung",
        lawRef: "§ 41b Abs. 1 EStG",
        paragraphs: [
          "Arbeitgeber sollen künftig verpflichtet sein, unzutreffende oder unvollständige Angaben der elektronischen Lohnsteuerbescheinigung innerhalb der gesetzlich festgelegten Korrekturfrist zu berichtigen.",
          "Die Korrektur soll grundsätzlich spätestens bis zum letzten Tag des Monats Februar erfolgen. Daneben bleiben Korrekturpflichten aufgrund anderer gesetzlicher Änderungsvorschriften bestehen.",
        ],
        practice:
          "Arbeitgeber und Lohnbüros sollten ihre Jahresabschlussprozesse und Kontrollschritte so organisieren, dass fehlerhafte oder unvollständige Meldedaten rechtzeitig erkannt werden.",
        effective: "Ab 1. Januar 2028",
      },
      {
        type: "change",
        number: 7,
        title: "Erweiterte Angaben in der Lohnsteuerbescheinigung",
        lawRef: "§ 41b Abs. 1 Satz 2 EStG",
        paragraphs: [
          "Der Datenumfang der elektronischen Lohnsteuerbescheinigung soll erheblich erweitert und stärker aufgegliedert werden.",
          "Vorgesehen sind insbesondere zusätzliche Angaben zu:",
        ],
        list: [
          "Kurzarbeitergeld, Mutterschaftsgeldzuschüssen, Infektionsschutzentschädigungen, Altersteilzeit-Aufstockungsbeträgen und Qualifizierungsgeld – jeweils nach Leistungszeitraum und Betrag,",
          "steuerfreien Reisekostenerstattungen, getrennt nach Fahrtkosten, Verpflegungsmehraufwendungen, Übernachtungskosten und Reisenebenkosten,",
          "steuerfreien Erstattungen bei doppelter Haushaltsführung, aufgeteilt nach Familienheimfahrten, Verpflegung, Unterkunft und sonstigen Mehraufwendungen,",
          "steuerfreien Arbeitgeberleistungen für die Betreuung nicht schulpflichtiger Kinder,",
          "nicht besteuerten Vorteilen aus der Übertragung von Vermögensbeteiligungen nach § 19a EStG,",
          "der Überlassung eines betrieblichen Kraftfahrzeugs durch das neue Kennzeichen ‚D‘,",
          "nach § 3 Nr. 21 EStG steuerfreien Einnahmen.",
        ],
        practice:
          "Die Änderungen erfordern voraussichtlich umfangreiche Anpassungen in Lohnabrechnungsprogrammen, Schnittstellen und betrieblichen Datenerfassungsprozessen.",
        effective: "Ab 1. Januar 2028",
      },
      {
        type: "change",
        number: 8,
        title: "Erweiterter Datenzugriff bei der Lohnsteuer-Nachschau",
        lawRef: "§ 42g Abs. 3 EStG",
        paragraphs: [
          "Im Rahmen einer Lohnsteuer-Nachschau sollen Amtsträger künftig ausdrücklich auf elektronisch gespeicherte Daten über die nachschaupflichtigen Sachverhalte zugreifen dürfen.",
          "Soweit erforderlich, darf dafür auch das im Unternehmen eingesetzte Datenverarbeitungssystem genutzt werden.",
          "Das Zugriffsrecht soll ausdrücklich elektronische Rechnungen im Sinne des § 14 Abs. 1 Satz 3 UStG sowie sonstige Rechnungen in elektronischen Formaten einschließen.",
        ],
        practice:
          "Unternehmen sollten Lohn-, Reisekosten-, Rechnungs- und Abrechnungssysteme so organisieren, dass relevante Daten nachvollziehbar, vollständig und prüfbar bereitgestellt werden können.",
        effective: "Ab 1. Januar 2027",
      },
      {
        type: "change",
        number: 9,
        title: "Höhere Freigrenze für Kleinhonorare",
        lawRef: "§ 50a Abs. 2 Satz 3 EStG",
        paragraphs: [
          "Die Freigrenze für kleine Einzelhonorare, bei denen kein Steuerabzug nach § 50a EStG vorzunehmen ist, soll von bisher 250 Euro auf 500 Euro angehoben werden.",
          "Die seit langer Zeit unveränderte Grenze soll damit an das gestiegene Vergütungsniveau angepasst werden.",
        ],
        practice:
          "Zu beachten ist, dass es sich um eine Freigrenze und nicht um einen Freibetrag handelt.",
        effective: "Ab 1. Januar 2027",
      },
      {
        type: "change",
        number: 10,
        title: "Antragslose Quellensteuerentlastung",
        lawRef: "§ 50c Abs. 2 Satz 1 Nr. 2 EStG",
        paragraphs: [
          "Die Freigrenze für das vereinfachte antragslose Freistellungsverfahren soll deutlich steigen.",
          "Vergütungsschuldner sollen unter den gesetzlichen Voraussetzungen künftig bei Zahlungen von insgesamt bis zu 100.000 Euro innerhalb eines Kalenderjahres ohne vorherige Freistellungsbescheinigung vom Steuerabzug nach § 50a EStG absehen können.",
          "Die bisherige Grenze beträgt 10.000 Euro.",
          "Die Erhöhung soll insbesondere Vergütungsschuldner entlasten, die mit wechselnden ausländischen Rechteinhabern oder anderen beschränkt steuerpflichtigen Vergütungsgläubigern arbeiten, beispielsweise Verlage oder Rundfunksender bei der Überlassung von Bildrechten.",
        ],
        practice:
          "Die Verzehnfachung der Freigrenze kann in geeigneten Fällen erheblichen Verwaltungsaufwand reduzieren. Die weiteren Tatbestandsvoraussetzungen des § 50c EStG müssen jedoch weiterhin vollständig erfüllt und dokumentiert werden.",
        effective: "Für Einkünfte, die nach dem 31. Dezember 2026 zufließen.",
      },
      {
        type: "change",
        number: 11,
        title: "Kein Freistellungsverfahren für bestimmte Aktienerträge",
        lawRef: "§ 50c Abs. 2 Satz 6 EStG – neu",
        paragraphs: [
          "Das Freistellungsverfahren soll für Kapitalerträge aus sammel- oder sonderverwahrt gehaltenen Aktien im Sinne des § 43 Abs. 1 Satz 1 Nr. 1a EStG ausgeschlossen werden.",
          "Betroffen sind insbesondere Fälle, in denen beschränkt steuerpflichtige Anteilseigner aufgrund einer qualifizierten Beteiligung bislang eine Freistellungsbescheinigung für Dividendenerträge nutzen konnten.",
          "Künftig soll zunächst Kapitalertragsteuer einbehalten werden. Eine Entlastung wäre anschließend nur noch im Erstattungsverfahren nach § 50c Abs. 3 EStG möglich.",
          "Der Entwurf begründet die Änderung mit der Missbrauchsanfälligkeit des bisherigen Freistellungsverfahrens.",
        ],
        practice:
          "Für betroffene Großaktionäre verschiebt sich die Entlastung damit vom Freistellungs- in das nachgelagerte Erstattungsverfahren. Das kann erhebliche Auswirkungen auf Liquidität und Verfahrensdauer haben.",
        effective: "Für Kapitalerträge, die nach dem 31. Dezember 2026 zufließen.",
      },
      {
        type: "editorial",
        title: "steuerstoff Einordnung",
        paragraphs: [
          "Der Referentenentwurf enthält keine einheitliche große Steuerreform, sondern zahlreiche fachlich und technisch geprägte Einzeländerungen.",
          "Für die tägliche Praxis stechen im Bereich der Einkommensteuer vor allem vier Themen hervor:",
          "1. Die neue Kaufpreisaufteilung nach § 6f EStG kann für Immobilienkäufe und Abschreibungsvolumen erhebliche Bedeutung gewinnen.",
          "2. Die Verkürzung von 48 auf 24 Monate bei inländischen Tätigkeitsstätten kann die Reisekostenbehandlung früher verändern als bisher.",
          "3. Die erweiterten Angaben in der Lohnsteuerbescheinigung führen zu neuen Daten- und Dokumentationsanforderungen bei Arbeitgebern und Lohnabrechnungsstellen.",
          "4. Die Anhebung der §-50c-Grenze auf 100.000 Euro kann das Verfahren bei bestimmten grenzüberschreitenden Lizenz- und Rechtevergütungen deutlich erleichtern.",
          "Da sich das Vorhaben noch im Referentenentwurfsstadium befindet, sollten bestehende Prozesse noch nicht allein auf Grundlage des Entwurfs umgestellt werden. Die betroffenen Bereiche sollten jedoch frühzeitig identifiziert und im weiteren Gesetzgebungsverfahren beobachtet werden.",
        ],
      },
      {
        type: "checklist",
        title: "Was sollte die Praxis jetzt beobachten?",
        storageKey: "steuerstoff-magazin-checklist-jstg-2026-v1",
        items: [
          "Kaufverträge für bebaute Grundstücke und vorhandene Kaufpreisaufteilungen überprüfen",
          "Inländische Tätigkeitszuordnungen mit einer geplanten Dauer von mehr als 24 Monaten identifizieren",
          "Lohnabrechnungssoftware auf die geplanten erweiterten Bescheinigungsdaten vorbereiten",
          "Prozesse für elektronische Unterlagen bei der Lohnsteuer-Nachschau dokumentieren",
          "Zahlungen nach § 50a EStG und deren Jahressummen auswerten",
          "Bestehende Freistellungsbescheinigungen für Dividendenerträge prüfen",
          "Gesetzgebungsverfahren und mögliche Änderungen am Entwurf beobachten",
        ],
      },
      {
        type: "sourceLink",
        title: "Amtliche Quelle",
        text: "Bundesministerium der Finanzen, Referentenentwurf eines Jahressteuergesetzes 2026, Bearbeitungsstand 19. Mai 2026.",
        buttonLabel: "Referentenentwurf beim BMF öffnen",
        url: "https://www.bundesfinanzministerium.de/Content/DE/Gesetzestexte/Gesetze_Gesetzesvorhaben/Abteilungen/Abteilung_IV/21_Legislaturperiode/2026-05-19-JStG2026/1-Referentenentwurf.pdf?__blob=publicationFile&v=2",
        note: "steuerstoff fasst den Inhalt redaktionell zusammen; maßgeblich bleibt die amtliche Quelle.",
      },
    ],
  },
  {
    id: "haeusliches-arbeitszimmer-aufzeichnung-bfh-2026",
    slug: "haeusliches-arbeitszimmer-aufzeichnung-bfh-2026",
    category: "Einkommensteuer",
    issueLabel: "Rechtsprechung · Einkommensteuer",
    issue: "01",
    title: "Häusliches Arbeitszimmer: Belege sammeln reicht nicht",
    subtitle:
      "Selbstständige müssen die Kosten einzeln, getrennt und zeitnah dokumentieren",
    status: "bfh-urteil",
    statusLabel: "BFH-Urteil",
    legalStatusDate: "2026-03-24",
    publishedAt: "2026-07-18",
    author: "Melanie Misakian",
    readingTime: 4,
    tags: [
      "Häusliches Arbeitszimmer",
      "§ 4 Abs. 7 EStG",
      "Betriebsausgaben",
      "EÜR",
      "BFH VIII R 6/24",
      "Selbstständige",
    ],
    lead:
      "Wer die tatsächlichen Kosten eines häuslichen Arbeitszimmers als Betriebsausgaben abziehen möchte, darf die Belege nicht einfach bis zur Steuererklärung sammeln. Der BFH verlangt von Selbstständigen eine laufende, gesonderte Dokumentation. Fehlt sie, kann der Betriebsausgabenabzug vollständig verloren gehen.",
    highlights: [
      { label: "Aufzeichnung", value: "einzeln & getrennt" },
      { label: "Zeitpunkt", value: "laufend statt rückwirkend" },
      { label: "Belegsammlung", value: "nicht ausreichend" },
      { label: "Rechtsfolge", value: "Abzug kann entfallen" },
    ],
    blocks: [
      {
        type: "summary",
        title: "Auf einen Blick",
        items: [
          "Die Kosten des häuslichen Arbeitszimmers müssen einzeln erfasst werden.",
          "Die Aufzeichnungen müssen getrennt von den übrigen Betriebsausgaben erfolgen.",
          "Die Erfassung muss zeitnah und nicht erst bei Erstellung der Steuererklärung vorgenommen werden.",
          "Eine bloße Sammlung von Rechnungen und Zahlungsbelegen genügt nicht.",
        ],
      },
      { type: "heading", text: "Worum ging es?" },
      {
        type: "paragraph",
        text: "Ein Freiberufler nutzte in seinem Eigenheim ein Arbeitszimmer im Dachgeschoss und zusätzlich eine Bibliothek im Erdgeschoss. In seiner Einkommensteuererklärung machte er unter anderem Abschreibungen und weitere Kosten für das häusliche Arbeitszimmer als Betriebsausgaben geltend.",
      },
      {
        type: "paragraph",
        text: "Das Finanzamt kürzte die Aufwendungen. Im anschließenden Verfahren stellte sich nicht nur die Frage nach der Höhe der Kosten, sondern bereits danach, ob sie wegen einer fehlerhaften Aufzeichnung überhaupt berücksichtigt werden durften.",
      },
      { type: "heading", text: "Was verlangt der BFH?" },
      {
        type: "paragraph",
        text: "Der Bundesfinanzhof bestätigte: Aufwendungen für ein häusliches Arbeitszimmer und dessen Ausstattung fallen bei Selbstständigen unter die besondere Aufzeichnungspflicht des § 4 Abs. 7 EStG.",
      },
      {
        type: "paragraph",
        text: "Damit der Betriebsausgabenabzug erhalten bleibt, müssen sämtliche Aufwendungen:",
      },
      {
        type: "list",
        items: [
          "einzeln,",
          "getrennt von den sonstigen Betriebsausgaben und",
          "zeitnah",
          "in einer besonderen Spalte der Ausgabenaufzeichnungen oder gebündelt in einem gesonderten schriftlichen oder digitalen Dokument",
        ],
      },
      {
        type: "paragraph",
        text: "aufgezeichnet werden.",
      },
      {
        type: "notice",
        variant: "wichtig",
        text: "Eine bloße Belegsammlung reicht nicht. Die Belege müssen laufend in einer gesonderten Aufzeichnung erfasst und dem Arbeitszimmer nachvollziehbar zugeordnet werden.",
      },
      { type: "heading", text: "Warum die spätere Kostenaufstellung nicht genügte" },
      {
        type: "paragraph",
        text: "Der Steuerpflichtige hatte die Belege zunächst nur gesammelt. Erst bei der Erstellung seiner Steuererklärung fertigte er eine Übersicht über die Gebäudekosten an. Nach Auffassung des BFH war das nicht zeitnah genug.",
      },
      {
        type: "paragraph",
        text: "Auch die Eintragung der Arbeitszimmerkosten in der Anlage EÜR konnte den Mangel nicht heilen. Dort wurden die Aufwendungen – abgesehen von den Abschreibungsbeträgen – lediglich als Gesamtsumme angegeben. Eine solche Summenangabe ersetzt keine Einzelaufzeichnung.",
      },
      { type: "heading", text: "Was bedeutet das für die Praxis?" },
      {
        type: "notice",
        variant: "praxistipp",
        text: "Am sichersten ist eine eigene Buchungsspalte, ein separates Aufwandskonto oder eine fortlaufend gepflegte digitale Liste. Erfasst werden sollten mindestens Datum, Zahlungsempfänger, Art der Ausgabe, Betrag und die nachvollziehbare Zuordnung zum Arbeitszimmer.",
      },
      {
        type: "paragraph",
        text: "Bei anteiligen Gebäudekosten sollte außerdem dokumentiert werden, wie der auf das Arbeitszimmer entfallende Anteil ermittelt wurde. So lässt sich die Berechnung später leichter prüfen und erklären.",
      },
      { type: "heading", text: "Die Rechtsfolge" },
      {
        type: "paragraph",
        text: "Wer die besondere Aufzeichnungspflicht nicht erfüllt, riskiert den vollständigen Ausschluss des Betriebsausgabenabzugs für die tatsächlichen Arbeitszimmerkosten. Es genügt daher nicht, dass die Ausgaben wirtschaftlich entstanden und durch Belege nachweisbar sind.",
      },
      {
        type: "notice",
        variant: "merke",
        text: "Nachweis und Aufzeichnung sind nicht dasselbe: Ein vorhandener Beleg beweist die Ausgabe, ersetzt aber nicht die gesetzlich verlangte gesonderte und zeitnahe Erfassung.",
      },
      { type: "heading", text: "Fazit" },
      {
        type: "paragraph",
        text: "Das Urteil macht aus einer vermeintlichen Formalie eine entscheidende Abzugsvoraussetzung. Selbstständige, die tatsächliche Kosten für ein häusliches Arbeitszimmer geltend machen, sollten die Aufwendungen deshalb von Beginn an separat und laufend dokumentieren – nicht erst beim Jahresabschluss oder bei der Steuererklärung.",
      },
      {
        type: "sourceLink",
        title: "Amtliche Quelle",
        text: "Bundesfinanzhof, Urteil vom 24. März 2026 – VIII R 6/24, veröffentlicht am 15. Mai 2026.",
        buttonLabel: "BFH-Entscheidung öffnen",
        url: "https://www.bundesfinanzhof.de/de/entscheidung/entscheidungen-online/detail/STRE202610098/",
        note: "steuerstoff fasst die Entscheidung redaktionell und verständlich zusammen; maßgeblich bleibt der vollständige amtliche Entscheidungstext.",
      },
    ],
  },
  {
    id: "est-reform-2027",
    category: "Einkommensteuer",
    issueLabel: "Ausgabe 01 · Einkommensteuer",
    issue: "01",
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
    issue: "01",
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
      { type: "notice", variant: "praxistipp", text: "Der Verkäufer hatte in dem entschiedenen Fall umfangreiche Prüf- und Dokumentationsmaßnahmen vorgenommen. Unter anderem hatte er:" },
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
