// Kuratierte, fachlich geprüfte Beispielantworten für die Seite "Neue Anfrage".
// Diese Antworten dürfen ausschließlich verwendet werden, wenn eine Nutzerin bewusst
// eine Beispielkarte anklickt (selectedExampleId gesetzt) und Titel, Themenbereich sowie
// Beschreibung seit der Auswahl unverändert sind. Sie dürfen niemals über Keyword-
// Erkennung ausgewählt werden.

export type CuratedExample = {
  id: string;
  title: string;
  topic: string;
  description: string;
  answer: string;
  explanation: string;
  references: string[];
  lastReviewed: string;
};

const REVIEWED = "14.07.2026";

export const EXAMPLES_BY_TOPIC: Record<string, CuratedExample[]> = {
  USt: [
    {
      id: "ust-strom",
      title: "Wie viel Umsatzsteuer fällt auf Strom an?",
      topic: "USt",
      description: "Wie hoch ist der Umsatzsteuersatz für die Lieferung von Strom?",
      answer:
        "Auf die Lieferung von Strom fallen in Deutschland regelmäßig 19 % Umsatzsteuer an.",
      explanation:
        "Strom gehört nicht zu den Lieferungen, für die der ermäßigte Umsatzsteuersatz gilt. Deshalb ist grundsätzlich der Regelsteuersatz von 19 % anzuwenden. Besonderheiten können sich nur in speziellen grenzüberschreitenden oder gesetzlich geregelten Fällen ergeben.",
      references: ["§ 12 Abs. 1 UStG", "§ 3g UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "ust-reverse-charge",
      title: "Was bedeutet Reverse Charge?",
      topic: "USt",
      description: "Wann schuldet der Leistungsempfänger die Umsatzsteuer nach § 13b UStG?",
      answer:
        "Beim Reverse-Charge-Verfahren schuldet nicht der leistende Unternehmer, sondern der Leistungsempfänger die Umsatzsteuer.",
      explanation:
        "Das Verfahren gilt nur in den gesetzlich geregelten Fällen des § 13b UStG. Ein typischer Fall ist eine im Inland steuerpflichtige B2B-Dienstleistung eines im Ausland ansässigen Unternehmers. Der Leistungsempfänger berechnet und meldet die Umsatzsteuer selbst. Ist er zum Vorsteuerabzug berechtigt, kann er denselben Betrag grundsätzlich zugleich als Vorsteuer abziehen. Die Rechnung darf keine deutsche Umsatzsteuer ausweisen und muss den erforderlichen Hinweis zur Steuerschuldnerschaft enthalten.",
      references: ["§ 13b UStG", "§ 3a Abs. 2 UStG", "§ 15 Abs. 1 Satz 1 Nr. 4 UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "ust-rechnung-anschrift",
      title: "Vorsteuerabzug aus einer Rechnung",
      topic: "USt",
      description:
        "Eine Eingangsrechnung enthält keine vollständige Anschrift des Leistungsempfängers. Ist der Vorsteuerabzug möglich?",
      answer:
        "Der Vorsteuerabzug setzt grundsätzlich eine ordnungsgemäße Rechnung nach §§ 14 und 14a UStG voraus. Fehlt eine erforderliche Anschrift oder ist der Leistungsempfänger nicht eindeutig identifizierbar, sollte vor dem Vorsteuerabzug eine Rechnungsberichtigung angefordert werden.",
      explanation:
        "Ob die vorhandene Anschrift ausreicht, muss anhand der konkreten Rechnung geprüft werden. Eine nur verkürzte, aber eindeutige Anschrift ist nicht automatisch schädlich. Fehlt eine Pflichtangabe tatsächlich, kann die Rechnung grundsätzlich berichtigt werden. Eine pauschale Ablehnung oder Anerkennung ohne Prüfung der Rechnung ist nicht sachgerecht.",
      references: ["§ 14 Abs. 4 UStG", "§ 15 Abs. 1 Satz 1 Nr. 1 UStG"],
      lastReviewed: REVIEWED,
    },
  ],
  NPO: [
    {
      id: "npo-mitgliedsbeitraege",
      title: "Echte oder unechte Mitgliedsbeiträge?",
      topic: "NPO",
      description:
        "Ein Verein erhebt Mitgliedsbeiträge und gewährt seinen Mitgliedern dafür konkrete Einzelleistungen. Wie sind die Beiträge steuerlich einzuordnen?",
      answer:
        "Mitgliedsbeiträge sind echte Mitgliedsbeiträge, wenn sie der Erfüllung des allgemeinen Vereinszwecks dienen und das Mitglied keine konkrete, individuell zurechenbare Gegenleistung erhält.",
      explanation:
        "Erhält das Mitglied für seinen Beitrag konkrete Einzelleistungen, zum Beispiel bestimmte Kurse, Eintrittsrechte oder andere unmittelbare Vorteile, kann ein unechter Mitgliedsbeitrag und damit ein umsatzsteuerlicher Leistungsaustausch vorliegen. Die Bezeichnung als „Mitgliedsbeitrag“ ist nicht entscheidend. Maßgeblich ist der wirtschaftliche Inhalt.",
      references: ["§ 1 Abs. 1 Nr. 1 UStG", "UStAE Abschnitt 1.4", "§§ 55 ff. AO"],
      lastReviewed: REVIEWED,
    },
    {
      id: "npo-vereinsfest",
      title: "Einnahmen aus einem Vereinsfest",
      topic: "NPO",
      description:
        "Ein gemeinnütziger Verein veranstaltet ein öffentliches Sommerfest mit Speisen- und Getränkeverkauf. Welcher steuerlichen Sphäre sind die Einnahmen zuzuordnen?",
      answer:
        "Der öffentliche Verkauf von Speisen und Getränken bei einem Vereinsfest ist regelmäßig dem steuerpflichtigen wirtschaftlichen Geschäftsbetrieb zuzuordnen.",
      explanation:
        "Das Fest wird nicht allein deshalb zum Zweckbetrieb, weil der Erlös für gemeinnützige Zwecke verwendet wird. Einnahmen und Ausgaben sind getrennt vom ideellen Bereich zu erfassen. Ob Körperschaft- und Gewerbesteuer entstehen, hängt unter anderem von der jährlichen Einnahmengrenze des § 64 Abs. 3 AO ab. Die umsatzsteuerliche Behandlung ist unabhängig davon gesondert zu prüfen.",
      references: ["§ 14 AO", "§ 64 AO", "§§ 65 bis 68 AO", "§ 1 Abs. 1 Nr. 1 UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "npo-spende-werbung",
      title: "Spende mit Gegenleistung",
      topic: "NPO",
      description:
        "Ein Unternehmen zahlt einem Verein 2.000 Euro und erhält dafür eine gut sichtbare Werbefläche. Darf eine Zuwendungsbestätigung ausgestellt werden?",
      answer:
        "Für die Zahlung von 2.000 Euro darf keine Zuwendungsbestätigung ausgestellt werden, soweit das Unternehmen dafür eine Werbeleistung erhält.",
      explanation:
        "Eine Spende muss freiwillig und ohne Gegenleistung erfolgen. Die vereinbarte Werbefläche spricht für Sponsoring und damit für einen Leistungsaustausch. Der Verein muss prüfen, ob eine Rechnung mit Umsatzsteuer auszustellen ist und welchem steuerlichen Bereich die Einnahme zuzuordnen ist. Nur ein eindeutig abtrennbarer, ohne Gegenleistung gewährter zusätzlicher Betrag könnte gesondert als Spende behandelt werden.",
      references: ["§ 10b EStG", "§ 50 EStDV", "§ 1 Abs. 1 Nr. 1 UStG", "§ 64 Abs. 6 Nr. 1 AO"],
      lastReviewed: REVIEWED,
    },
  ],
  SKR03: [
    {
      id: "skr03-bewirtung",
      title: "Bewirtungskosten buchen",
      topic: "SKR03",
      description:
        "Eine geschäftliche Restaurantrechnung über 119 Euro brutto soll im SKR03 gebucht werden. Welche Konten kommen infrage?",
      answer:
        "Bei einer ordnungsgemäßen geschäftlichen Bewirtung sind 70 % des angemessenen Nettoaufwands als Betriebsausgabe abziehbar und 30 % nicht abziehbar. Die Vorsteuer ist bei erfüllten Voraussetzungen grundsätzlich vollständig abziehbar.",
      explanation:
        "Bei 119 Euro brutto ergeben sich bei 19 % Umsatzsteuer:\n- Nettoaufwand: 100 Euro\n- abziehbare Betriebsausgabe: 70 Euro\n- nicht abziehbarer Aufwand: 30 Euro\n- Vorsteuer: 19 Euro\n\nTypische SKR03-Konten:\n- 4650 Bewirtungskosten\n- 4654 Nicht abzugsfähige Bewirtungskosten\n- 1576 Abziehbare Vorsteuer 19 %\n- 1200 Bank oder entsprechendes Kreditorenkonto\n\nDie Kontennummern sind vor Verwendung mit dem aktuellen Mandantenkontenplan abzugleichen.",
      references: ["§ 4 Abs. 5 Satz 1 Nr. 2 EStG", "§ 15 Abs. 1a UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "skr03-bankgebuehren",
      title: "Bankgebühren zuordnen",
      topic: "SKR03",
      description:
        "Auf dem betrieblichen Bankkonto wurden monatliche Kontoführungsgebühren belastet. Wie werden diese im SKR03 gebucht?",
      answer:
        "Betriebliche Kontoführungs- und Bankgebühren werden im SKR03 regelmäßig als Nebenkosten des Geldverkehrs erfasst.",
      explanation:
        "Typischer Buchungsvorschlag:\n4970 Nebenkosten des Geldverkehrs an 1200 Bank\n\nKlassische Bankgebühren enthalten regelmäßig keine gesondert abziehbare Umsatzsteuer. Bei Gebühren externer Dienstleister oder besonderen Zusatzleistungen ist der Beleg gesondert zu prüfen. Der aktuelle Mandantenkontenplan hat Vorrang.",
      references: ["§ 4 Abs. 4 EStG", "§ 4 Nr. 8 UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "skr03-laptop",
      title: "Anschaffung eines Laptops",
      topic: "SKR03",
      description:
        "Ein betrieblicher Laptop wird für 1.500 Euro netto gekauft. Wie erfolgt die Buchung im SKR03?",
      answer:
        "Ein Laptop für 1.500 Euro netto ist grundsätzlich als abnutzbares bewegliches Anlagevermögen zu aktivieren und über seine Nutzungsdauer abzuschreiben.",
      explanation:
        "Die Nettoanschaffungskosten liegen über der GWG-Grenze von 800 Euro. Ein sofortiger GWG-Abzug ist daher nicht möglich.\n\nTypischer Buchungsvorschlag:\n0480 Betriebs- und Geschäftsausstattung 1.500 Euro\n1576 Abziehbare Vorsteuer 19 % 285 Euro\nan 1200 Bank beziehungsweise Kreditor 1.785 Euro\n\nAnschließend erfolgt die Abschreibung nach der steuerlich zulässigen Nutzungsdauer. Die konkrete Kontierung und Abschreibungsmethode sind mit dem aktuellen Mandantenkontenplan abzugleichen.",
      references: ["§ 6 Abs. 1 Nr. 1 EStG", "§ 6 Abs. 2 EStG", "§ 7 EStG", "§ 15 UStG"],
      lastReviewed: REVIEWED,
    },
  ],
  SKR42: [
    {
      id: "skr42-mitgliedsbeitrag",
      title: "Mitgliedsbeiträge buchen",
      topic: "SKR42",
      description:
        "Ein gemeinnütziger Verein erhält echte Mitgliedsbeiträge. Wie werden diese im SKR42 und in der passenden Sphäre erfasst?",
      answer:
        "Echte Mitgliedsbeiträge eines gemeinnützigen Vereins sind dem ideellen Bereich zuzuordnen und lösen grundsätzlich keine Umsatzsteuer aus.",
      explanation:
        "Im SKR42 ist das dafür vorgesehene Konto für echte Mitgliedsbeiträge zu verwenden. Zusätzlich ist die Kostenstelle beziehungsweise Sphärenkennzeichnung für den ideellen Bereich zu setzen, beispielsweise KOST 1 = ideeller Bereich nach dem eingerichteten Kanzlei- oder Mandantensystem. Erhält das Mitglied eine konkrete Gegenleistung, muss die Einordnung neu geprüft werden.",
      references: ["§ 1 Abs. 1 Nr. 1 UStG", "UStAE Abschnitt 1.4", "§§ 55 ff. AO"],
      lastReviewed: REVIEWED,
    },
    {
      id: "skr42-spende",
      title: "Spende ohne Gegenleistung",
      topic: "SKR42",
      description:
        "Ein Verein erhält eine Geldspende über 500 Euro. Welche Kontierung und Sphärenzuordnung ist im SKR42 passend?",
      answer:
        "Eine echte Geldspende ohne Gegenleistung ist dem ideellen Bereich zuzuordnen und unterliegt grundsätzlich nicht der Umsatzsteuer.",
      explanation:
        "Im SKR42 ist das vorgesehene Spendenkonto zusammen mit der Sphärenkennzeichnung für den ideellen Bereich zu verwenden. Eine Zuwendungsbestätigung darf nur ausgestellt werden, wenn die gemeinnützigkeitsrechtlichen und formellen Voraussetzungen erfüllt sind. Die konkrete Kontonummer ist dem aktuellen SKR42-Mandantenkontenplan zu entnehmen.",
      references: ["§ 10b EStG", "§ 50 EStDV", "§ 63 Abs. 5 AO"],
      lastReviewed: REVIEWED,
    },
    {
      id: "skr42-zweckbetrieb",
      title: "Einnahmen im Zweckbetrieb",
      topic: "SKR42",
      description:
        "Eine gemeinnützige Körperschaft erzielt Einnahmen aus einer steuerbegünstigten Zweckbetriebstätigkeit. Wie erfolgt die Kontierung im SKR42?",
      answer:
        "Einnahmen aus einer Tätigkeit, die die Voraussetzungen eines Zweckbetriebs erfüllt, sind der Sphäre Zweckbetrieb zuzuordnen.",
      explanation:
        "Im SKR42 ist ein Erlöskonto des Zweckbetriebs und die entsprechende Sphärenkennzeichnung zu verwenden, beispielsweise KOST 1 = Zweckbetrieb nach dem eingerichteten System. Der ermäßigte Umsatzsteuersatz von 7 % gilt nicht automatisch für jede Zweckbetriebsleistung. Die konkrete Leistung und die Voraussetzungen des § 12 Abs. 2 Nr. 8 Buchstabe a UStG müssen gesondert geprüft werden.",
      references: ["§§ 65 bis 68 AO", "§ 12 Abs. 2 Nr. 8 Buchstabe a UStG"],
      lastReviewed: REVIEWED,
    },
  ],
  DATEV: [
    {
      id: "datev-fehlender-beleg",
      title: "Fehlender Beleg in DATEV Unternehmen online",
      topic: "DATEV",
      description:
        "Eine Bankbuchung ist vorhanden, der zugehörige Beleg fehlt jedoch. Wie sollte der Vorgang bearbeitet und dokumentiert werden?",
      answer:
        "Die Bankbewegung sollte nicht ungeprüft endgültig auf ein Aufwandskonto gebucht werden. Der Beleg ist anzufordern und der Vorgang bis zur Klärung nachvollziehbar zu kennzeichnen.",
      explanation:
        "Sinnvolle Schritte:\n1. Belegsuche in DATEV Unternehmen online und DMS\n2. Abgleich mit Lieferant, Betrag und Buchungstext\n3. Rückfrage an den Mandanten\n4. vorläufige Erfassung auf einem festgelegten Klärungs- oder Verrechnungskonto, sofern die Kanzleirichtlinie dies vorsieht\n5. Dokumentation der Rückfrage\n6. Umbuchung nach Eingang des Belegs\n\nEin Vorsteuerabzug darf erst erfolgen, wenn die gesetzlichen Voraussetzungen und eine geeignete Rechnung vorliegen.",
      references: ["§ 15 UStG", "§§ 146, 147 AO", "GoBD"],
      lastReviewed: REVIEWED,
    },
    {
      id: "datev-opos-abweichung",
      title: "Offene Posten stimmen nicht überein",
      topic: "DATEV",
      description:
        "Die Debitoren-OPOS-Liste weicht vom Saldo des Sachkontos ab. Welche Prüfungsschritte sind sinnvoll?",
      answer:
        "Die OPOS-Liste und das zugehörige Sach- beziehungsweise Abstimmkonto müssen zum selben Stichtag systematisch abgeglichen werden.",
      explanation:
        "Zu prüfen sind insbesondere:\n- korrekte Eröffnungsbestände\n- Buchungen ohne Debitoren- oder Kreditorenkonto\n- doppelte oder fehlende Rechnungen\n- Zahlungen mit falscher OPOS-Zuordnung\n- nicht verrechnete Gutschriften\n- manuelle Sachkontenbuchungen\n- unterschiedliche Auswertungsstichtage\n- Fremdwährungs- und Rundungsdifferenzen\n- nicht festgeschriebene oder fehlerhafte Stapel\n\nDie Differenz darf nicht pauschal ausgebucht werden. Zuerst ist ihre Ursache zu ermitteln und zu dokumentieren.",
      references: ["§§ 238, 239 HGB", "§§ 146, 147 AO", "GoBD"],
      lastReviewed: REVIEWED,
    },
    {
      id: "datev-extf-import",
      title: "Buchungsstapel importieren",
      topic: "DATEV",
      description:
        "Eine EXTF-Datei soll in DATEV Rechnungswesen importiert werden. Welche Pflichtfelder und Formate sind zu beachten?",
      answer:
        "Vor dem EXTF-Import müssen Kopfzeile, Wirtschaftsjahr, Zeitraum, Kontenrahmen und sämtliche Buchungsfelder auf das Zielmandat abgestimmt werden.",
      explanation:
        "Zu kontrollieren sind insbesondere:\n- Mandant und Wirtschaftsjahresbeginn\n- Buchungszeitraum\n- Umsatz ohne Tausendertrennzeichen\n- Soll-/Haben-Kennzeichen\n- Konto und Gegenkonto\n- Belegdatum im erwarteten Format\n- BU-Schlüssel beziehungsweise Steuerschlüssel\n- Belegfeld und Buchungstext\n- KOST 1 und KOST 2, soweit erforderlich\n- zulässige Zeichencodierung und Spaltenreihenfolge\n\nVor dem endgültigen Import ist eine kleine Testdatei zu validieren. Fehlerhafte Datensätze dürfen nicht stillschweigend übersprungen werden.",
      references: ["DATEV-EXTF-Schnittstellenbeschreibung", "GoBD", "§§ 146, 147 AO"],
      lastReviewed: REVIEWED,
    },
  ],
  Abgrenzung: [
    {
      id: "abgrenzung-hosting",
      title: "Hostingrechnung über den Jahreswechsel",
      topic: "Abgrenzung",
      description:
        "Rechnung über 1.200 Euro netto für den Zeitraum 01.10.2025 bis 30.09.2026. Welche Abgrenzung ist zum 31.12.2025 erforderlich?",
      answer:
        "Zum 31.12.2025 ist ein aktiver Rechnungsabgrenzungsposten von 900 Euro zu bilden. 300 Euro entfallen als Aufwand auf das Jahr 2025.",
      explanation:
        "Der Leistungszeitraum umfasst zwölf Monate vom 01.10.2025 bis 30.09.2026. Drei Monate gehören zu 2025 und neun Monate zu 2026:\n- Aufwand 2025: 1.200 Euro × 3/12 = 300 Euro\n- ARAP 31.12.2025: 1.200 Euro × 9/12 = 900 Euro\n\nDie Umsatzsteuer wird nicht zeitanteilig über den ARAP verteilt. Der Vorsteuerabzug richtet sich nach den umsatzsteuerlichen Voraussetzungen.",
      references: ["§ 250 Abs. 1 HGB", "§ 5 Abs. 5 Satz 1 Nr. 1 EStG", "§ 15 UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "abgrenzung-miete-eingang",
      title: "Im Voraus erhaltene Miete",
      topic: "Abgrenzung",
      description:
        "Die Miete für Januar 2026 geht bereits im Dezember 2025 ein. Wie ist der Betrag zum Jahresende abzugrenzen?",
      answer:
        "Die im Dezember 2025 erhaltene Miete für Januar 2026 ist zum 31.12.2025 als passiver Rechnungsabgrenzungsposten auszuweisen.",
      explanation:
        "Die Einnahme ist vor dem Bilanzstichtag zugeflossen, stellt aber Ertrag für einen bestimmten Zeitraum nach dem Bilanzstichtag dar. Der PRAP wird im Januar 2026 ertragswirksam aufgelöst. Die umsatzsteuerliche Behandlung ist davon getrennt nach den Regelungen zur Steuerentstehung zu beurteilen.",
      references: ["§ 250 Abs. 2 HGB", "§ 5 Abs. 5 Satz 1 Nr. 2 EStG", "§§ 13, 20 UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "abgrenzung-ausstehende-rechnung",
      title: "Ausstehende Rechnung",
      topic: "Abgrenzung",
      description:
        "Eine im Dezember 2025 erbrachte Leistung wird erst im Februar 2026 abgerechnet. Wie ist der Aufwand im Jahresabschluss zu berücksichtigen?",
      answer:
        "Der Aufwand gehört wirtschaftlich in das Jahr 2025, weil die Leistung im Dezember 2025 erbracht wurde.",
      explanation:
        "Sind Verpflichtung und Betrag hinreichend sicher, ist zum 31.12.2025 eine sonstige Verbindlichkeit zu erfassen. Ist die Verpflichtung oder ihre Höhe noch ungewiss, kommt eine Rückstellung für ungewisse Verbindlichkeiten in Betracht. Der Vorsteuerabzug setzt grundsätzlich den Besitz der Rechnung voraus und kann daher regelmäßig erst nach Rechnungseingang erfolgen.",
      references: ["§ 249 Abs. 1 HGB", "§ 252 Abs. 1 Nr. 5 HGB", "§ 5 EStG", "§ 15 Abs. 1 UStG"],
      lastReviewed: REVIEWED,
    },
  ],
  Buchhaltung: [
    {
      id: "buchhaltung-zweifelhafte-forderung",
      title: "Zweifelhafte Kundenforderung",
      topic: "Buchhaltung",
      description:
        "Ein Kunde hat trotz mehrfacher Mahnung eine Rechnung über 5.000 Euro noch nicht bezahlt. Wie ist die Forderung zum Bilanzstichtag zu bewerten?",
      answer:
        "Bestehen konkrete Zweifel an der Einbringlichkeit, ist die Forderung als zweifelhaft zu behandeln und in Höhe des voraussichtlichen Ausfalls einzelwertzuberichtigen.",
      explanation:
        "Eine bloße Zahlungsverzögerung genügt nicht automatisch für eine vollständige Abschreibung. Zu berücksichtigen sind unter anderem Mahnverlauf, Zahlungszusagen, Bonität und ein mögliches Insolvenzverfahren. Umsatzsteuerlich erfolgt eine Berichtigung erst, wenn das Entgelt ganz oder teilweise uneinbringlich geworden ist.",
      references: ["§ 252 Abs. 1 Nr. 4 HGB", "§ 6 Abs. 1 Nr. 2 EStG", "§ 17 Abs. 2 Nr. 1 UStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "buchhaltung-darlehensrate",
      title: "Darlehensrate buchen",
      topic: "Buchhaltung",
      description:
        "Eine Darlehensrate besteht aus Tilgung und Zinsen. Wie werden die beiden Bestandteile gebucht?",
      answer: "Eine Darlehensrate ist in Tilgung, Zinsen und gegebenenfalls Gebühren aufzuteilen.",
      explanation:
        "Die Tilgung mindert die Darlehensverbindlichkeit und ist kein Aufwand. Der Zinsanteil wird als Zinsaufwand erfasst. Zusätzliche Bank- oder Bearbeitungsgebühren sind getrennt nach ihrem wirtschaftlichen Inhalt zu buchen.\n\nBuchungslogik:\nDarlehensverbindlichkeit\nZinsaufwand\ngegebenenfalls Bankgebühren\nan Bank\n\nMaßgeblich ist der Tilgungsplan beziehungsweise Kontoauszug des Kreditgebers.",
      references: ["§ 4 Abs. 4 EStG", "§§ 246, 252 HGB"],
      lastReviewed: REVIEWED,
    },
    {
      id: "buchhaltung-anlageverkauf",
      title: "Anlagegut wird verkauft",
      topic: "Buchhaltung",
      description:
        "Ein vollständig oder teilweise abgeschriebenes betriebliches Fahrzeug wird verkauft. Welche Buchungen sind erforderlich?",
      answer:
        "Beim Verkauf muss das Anlagegut ausgebucht und der Verkaufserlös erfasst werden. Die Differenz zwischen Nettoverkaufserlös und Restbuchwert führt zu einem Buchgewinn oder Buchverlust.",
      explanation:
        "Vor der Ausbuchung ist die Abschreibung bis zum Verkaufszeitpunkt zu berücksichtigen. Anschließend werden Anschaffungskosten und kumulierte Abschreibungen aus dem Anlagenbestand entfernt. Ist der Verkauf umsatzsteuerpflichtig, wird Umsatzsteuer auf den Verkaufspreis ausgewiesen. Sonderfälle wie eine Geschäftsveräußerung im Ganzen sind gesondert zu prüfen.",
      references: ["§§ 6, 7 EStG", "§ 1 Abs. 1 Nr. 1 UStG", "§ 1 Abs. 1a UStG"],
      lastReviewed: REVIEWED,
    },
  ],
  Sonstiges: [
    {
      id: "sonstiges-firmenwagen",
      title: "Private Nutzung eines Firmenwagens",
      topic: "Sonstiges",
      description:
        "Ein betriebliches Fahrzeug wird auch privat genutzt. Welche Methoden kommen für die Ermittlung der privaten Nutzung infrage?",
      answer:
        "Die private Nutzung eines betrieblichen Fahrzeugs kann grundsätzlich pauschal nach der Ein-Prozent-Methode oder nach den tatsächlichen Kosten anhand eines ordnungsgemäßen Fahrtenbuchs bewertet werden.",
      explanation:
        "Die Ein-Prozent-Methode setzt bei einem Unternehmer grundsätzlich voraus, dass das Fahrzeug zu mehr als 50 % betrieblich genutzt wird. Alternativ kann der private Anteil anhand der tatsächlichen Kosten und eines ordnungsgemäßen Fahrtenbuchs ermittelt werden. Für Elektro- und bestimmte Hybridfahrzeuge sowie für Fahrten zwischen Wohnung und Betriebsstätte gelten zusätzliche Regelungen.",
      references: ["§ 6 Abs. 1 Nr. 4 EStG", "§ 4 Abs. 5 Satz 1 Nr. 6 EStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "sonstiges-gewerbeanmeldung",
      title: "Gewerbeanmeldung",
      topic: "Sonstiges",
      description:
        "Eine selbstständige gewerbliche Tätigkeit wird aufgenommen. Welche steuerlichen und behördlichen Schritte sind erforderlich?",
      answer:
        "Eine gewerbliche Tätigkeit ist bei der zuständigen Gemeinde beziehungsweise dem Gewerbeamt anzumelden. Zusätzlich ist die steuerliche Erfassung elektronisch über ELSTER vorzunehmen.",
      explanation:
        "Zu prüfen beziehungsweise zu erledigen sind insbesondere:\n- Gewerbeanmeldung\n- Fragebogen zur steuerlichen Erfassung\n- Einkommen- oder Körperschaftsteuer\n- Gewerbesteuer\n- Umsatzsteuer und Kleinunternehmerregelung\n- Gewinnermittlungsart\n- Buchführungs- und Aufzeichnungspflichten\n- IHK- oder HWK-Zugehörigkeit\n- gegebenenfalls Berufsgenossenschaft\n- erforderliche Erlaubnisse für regulierte Tätigkeiten\n\nOb tatsächlich ein Gewerbe oder eine freiberufliche Tätigkeit vorliegt, muss anhand der konkreten Tätigkeit beurteilt werden.",
      references: ["§ 14 GewO", "§ 138 AO", "§ 18 EStG", "§ 15 EStG"],
      lastReviewed: REVIEWED,
    },
    {
      id: "sonstiges-reisekosten",
      title: "Reisekosten einer Dienstreise",
      topic: "Sonstiges",
      description:
        "Eine Arbeitnehmerin ist für zwei Tage beruflich auswärts tätig. Welche Fahrt-, Übernachtungs- und Verpflegungskosten können berücksichtigt werden?",
      answer:
        "Bei einer beruflich veranlassten Auswärtstätigkeit können Fahrtkosten, notwendige Übernachtungskosten und gesetzliche Verpflegungspauschalen berücksichtigt werden.",
      explanation:
        "Für eine zweitägige Inlandsdienstreise mit einer Übernachtung gelten grundsätzlich:\n- 14 Euro für den Anreisetag\n- 14 Euro für den Abreisetag\n\nInsgesamt ergeben sich damit grundsätzlich 28 Euro Verpflegungspauschale. Für einen vollen Abwesenheitstag von 24 Stunden gelten 28 Euro. Vom Arbeitgeber oder auf dessen Veranlassung gestellte Mahlzeiten führen zu einer Kürzung. Fahrt- und Übernachtungskosten werden getrennt nach den tatsächlichen beziehungsweise gesetzlich zulässigen Beträgen berücksichtigt.",
      references: [
        "§ 9 Abs. 1 Satz 3 Nr. 4a und Nr. 5a EStG",
        "§ 9 Abs. 4a EStG",
        "§ 3 Nr. 13 beziehungsweise Nr. 16 EStG",
      ],
      lastReviewed: REVIEWED,
    },
  ],
};

export const CURATED_TOPICS = [
  "USt",
  "NPO",
  "SKR03",
  "SKR42",
  "DATEV",
  "Abgrenzung",
  "Buchhaltung",
  "Sonstiges",
] as const;

export function findCuratedExample(id: string): CuratedExample | undefined {
  for (const topic of Object.keys(EXAMPLES_BY_TOPIC)) {
    const hit = EXAMPLES_BY_TOPIC[topic].find((e) => e.id === id);
    if (hit) return hit;
  }
  return undefined;
}
