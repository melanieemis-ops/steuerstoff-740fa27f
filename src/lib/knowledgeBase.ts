// Interne Wissensbasis für steuerstoff
// Quelle: kanzleiinterne Arbeitspapiere und Fachunterlagen (nicht öffentlich).
// Die zugrundeliegenden PDFs werden bewusst NICHT mit der App ausgeliefert.
// Hier sind ausschließlich die inhaltlichen Kernaussagen als bearbeiteter
// Fließtext hinterlegt, damit die App Wissens- und Fallfragen beantworten kann.

export interface KBEntry {
  id: string;
  title: string;
  short: string;
  category:
    | "NPO / Gemeinnützigkeit"
    | "Umsatzsteuer"
    | "Jahresabschluss"
    | "Buchhaltung"
    | "DATEV"
    | "SKR03"
    | "SKR42"
    | "Rückfragen";
  body: string;
  /** Interner Quellenhinweis (nicht öffentlich verlinkt). */
  source: string;
  /** Trigger für Wissensfrage-Erkennung in analyze.ts. */
  keywords: RegExp;
  references?: string[];
}

export const KNOWLEDGE_BASE: KBEntry[] = [
  {
    id: "npo-sphaeren",
    title: "Die vier Sphären gemeinnütziger Körperschaften",
    short:
      "Ideeller Bereich, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb — Wirkung und Abgrenzung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Handout — Sphären, Risiken, Abschlusslogik (NPO).",
    keywords: /sphär|ideeller bereich|vermögensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|wgb\b/i,
    references: ["§§ 14, 64–68 AO", "§ 12 Abs. 2 Nr. 8a UStG"],
    body: `Gemeinnützige Körperschaften werden steuerlich in vier Sphären gegliedert:

1) Ideeller Bereich — unmittelbare Verfolgung des Satzungszwecks ohne Gegenleistung (Spenden, Mitgliedsbeiträge). KSt- und GewSt-frei, mangels Leistungsaustausch grundsätzlich keine USt.

2) Vermögensverwaltung — passive Nutzung vorhandenen Vermögens (Zinsen, Mieten, Wertpapiere). KSt-/GewSt-frei; USt im Einzelfall, z. B. bei Vermietung.

3) Zweckbetrieb (§§ 65–68 AO) — wirtschaftliche Tätigkeit, die eng und notwendig mit dem Satzungszweck verbunden ist. KSt-/GewSt-frei, USt regelmäßig 7 % (§ 12 Abs. 2 Nr. 8a UStG).

4) Wirtschaftlicher Geschäftsbetrieb — marktbezogene Tätigkeit ohne unmittelbaren Zweckbezug (Verkauf, Sponsoring, Werbung, Gaststätte). USt 19 %, KSt/GewSt grundsätzlich pflichtig (Freigrenze 45.000 € Einnahmen, § 64 Abs. 3 AO).

Merksätze:
- Kein Leistungsaustausch = kein Umsatz.
- Wettbewerb ist ein starkes Indiz für Steuerpflicht.
- Die Sphäre ergibt sich aus dem Sachverhalt, nicht aus der Kontobezeichnung.`,
  },
  {
    id: "zeitnahe-mittelverwendung",
    title: "Zeitnahe Mittelverwendung (§ 55 Abs. 1 Nr. 5 AO)",
    short:
      "Verwendungspflicht innerhalb von zwei Folgejahren, 45.000-€-Ausnahme, Nachweis über Mittelverwendungsrechnung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Zeitnahe Mittelverwendung und Mittelverwendungsrechnung.",
    keywords: /zeitnahe? mittelverwendung|mittelverwendungsrechnung|§\s*55\s*ao|45\.?000\s*€/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO", "§ 62 AO", "§ 63 Abs. 4 AO"],
    body: `Gemeinnützige Körperschaften müssen ihre Mittel zeitnah für die satzungsmäßigen Zwecke verwenden. Maßgeblich ist § 55 Abs. 1 Nr. 5 AO.

Fristen:
- Verwendung spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren (seit Ehrenamtsstärkungsgesetz, gilt für Zuflüsse nach dem 31.12.2011).
- Ausnahme für kleine Körperschaften: kumulierte Einnahmen aller Sphären ≤ 45.000 € — keine Pflicht zur zeitnahen Mittelverwendung; trotzdem Nachweis erforderlich, dass Altmittel aus Jahren ≤ 45.000 € stammen.

Was sind „Mittel“:
- Spenden, Mitgliedsbeiträge, Zuschüsse, Bruttoeinnahmen des ideellen Bereichs.
- Gewinne aus Zweckbetrieb und wirtschaftlichem Geschäftsbetrieb.
- Überschüsse der Vermögensverwaltung.
- Nicht: Grundstockvermögen / Einlagen der Stifter bei Stiftungen.

Nachweis: Mittelverwendungsrechnung (MVR) als Nebenrechnung zum Jahresabschluss; freie Gestaltung, aber Saldo-/Globalbetrachtung über alle zeitnah zu verwendenden Mittel. Pflichtbestandteile: Mittelvortrag aus den zwei Vorjahren, Rücklagenspiegel, Verwendungsüberhang.

Verstoß: keine sofortige Aberkennung der Gemeinnützigkeit. Das Finanzamt kann nach § 63 Abs. 4 AO eine angemessene Verwendungsfrist (oft bis zu drei Jahren) setzen. Erst wiederholte oder schwere Verstöße gefährden die Gemeinnützigkeit.`,
  },
  {
    id: "freie-ruecklage",
    title: "Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO)",
    short:
      "Bis zu 1/3 des VV-Überschusses + 10 % der sonstigen zeitnah zu verwendenden Mittel; Nachholung in zwei Folgejahren.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Zusatzarbeitspapier — Freie Rücklage gUG → gGmbH.",
    keywords: /freie? rücklage|§\s*62\s*abs\.?\s*1\s*nr\.?\s*3|§\s*62\s*ao/i,
    references: ["§ 62 Abs. 1 Nr. 3 AO", "§ 55 AO", "§ 5a Abs. 3 GmbHG"],
    body: `Die freie Rücklage nach § 62 Abs. 1 Nr. 3 AO ist die flexibelste Rücklagenart. Ihre Bildung gilt als zulässige Mittelverwendung; die zugeführten Mittel sind dem Gebot der zeitnahen Mittelverwendung entzogen.

Jährliche Höchstzuführung:
- Bis zu einem Drittel des Überschusses aus der Vermögensverwaltung.
- Zusätzlich bis zu 10 % der sonstigen zeitnah zu verwendenden Mittel (ideeller Bereich, Zweckbetrieb, wGB).
- Nicht ausgeschöpfte Höchstbeträge können in den zwei Folgejahren nachgeholt werden.

Gesamthöhe der freien Rücklage ist unbegrenzt; sie kann dauerhaft erhalten bleiben und z. B. für Darlehen, Beteiligungen, Investitionen oder Kapitalerhöhungen aus Gesellschaftsmitteln verwendet werden.

Nicht zulässig: Verlustabdeckung in Vermögensverwaltung oder wGB aus der freien Rücklage.

Sonderfall gUG → gGmbH: Die gesetzliche Rücklage nach § 5a Abs. 3 GmbHG (25 % des Jahresüberschusses bis 25.000 €) verstößt nach Auffassung der Finanzverwaltung nicht gegen § 55 AO. Für die Kapitalerhöhung aus Gesellschaftsmitteln müssen die Mittel zuvor zulässig in eine § 62 AO-Rücklage (insbesondere die freie Rücklage) eingestellt sein. Beschluss und Zuführung lückenlos dokumentieren.`,
  },
  {
    id: "ruecklagen-katalog",
    title: "Rücklagen nach § 62 AO — Überblick",
    short:
      "Zweckgebundene, Wiederbeschaffungs-, freie und Beteiligungs­rücklage — Voraussetzungen, Nachweise, Auflösung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Interne NPO-Checkliste (Rücklagen) und Arbeitspapier Mittelverwendung.",
    keywords: /rücklage|zweckgebunden|wiederbeschaffung|betriebsmittelrücklage|§\s*62/i,
    references: ["§ 62 AO", "§ 63 Abs. 4 AO"],
    body: `§ 62 AO kennt vier Rücklagenarten:

1) Zweckgebundene Rücklage (Abs. 1 Nr. 1) — für ein konkret geplantes, definiertes Vorhaben. Voraussetzungen: konkrete Zeit- und Finanzierungs­vorstellungen, dokumentierter Beschluss. Auflösungspflicht, sobald das Projekt aufgegeben oder abgeschlossen ist; frei werdende Mittel unterliegen wieder der zeitnahen Verwendung.

2) Betriebsmittelrücklage (Unterfall Nr. 1) — Liquiditätssicherung für periodisch wiederkehrende Ausgaben (Gehälter, Miete, Energie). Höhe orientiert sich am Bedarf eines angemessenen Zeitraums (i. d. R. 3–12 Monate).

3) Wiederbeschaffungsrücklage (Abs. 1 Nr. 2) — für die Ersatzbeschaffung von Wirtschaftsgütern. Höhe regelmäßig an der jährlichen AfA orientiert; höhere Beträge nur mit nachvollziehbarem Mehrbedarf.

4) Freie Rücklage (Abs. 1 Nr. 3) — siehe eigener Eintrag.

5) Rücklage zum Erwerb von Gesellschaftsrechten (Abs. 1 Nr. 4) — zur Erhaltung der prozentualen Beteiligungs­quote bei Kapitalerhöhungen.

Formales:
- Beschluss des zuständigen Organs.
- Bildung und Verwendung in der MVR und im Rücklagenspiegel transparent abbilden.
- Bei Wegfall des Rücklagengrundes: unverzügliche Auflösung.

Audit-Risiken: dauerhaft hohe Mittelbestände ohne erkennbares Projekt, langjährig unveränderte Rücklagen, pauschal angesetzte Audit-/Rückforderungs­rücklagen ohne Vertragsgrundlage.`,
  },
  {
    id: "darlehen-npo",
    title: "Darlehensvergabe durch gemeinnützige Organisationen",
    short:
      "Aus zeitnah zu verwendenden Mitteln nur zur unmittelbaren Zweckverwirklichung; sonst aus freier Rücklage zu marktüblichen Konditionen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Darlehensvergabe durch gemeinnützige Organisationen.",
    keywords: /darlehen|kredit\s+(an|von)\s+(verein|stiftung|tochter|ggmbh|gug)/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO", "§ 58 Nr. 1 AO", "§ 62 Abs. 1 Nr. 3 AO"],
    body: `Die Vergabe von Darlehen ist kein gemeinnütziger Zweck. Zulässigkeit hängt entscheidend von der Herkunft der Mittel ab.

Aus zeitnah zu verwendenden Mitteln nur zulässig, wenn:
- das Darlehen unmittelbar einen Satzungszweck verwirklicht (Schuldnerberatung, Stipendien, Instrumente für Nachwuchskünstler) und zinslos/zinsverbilligt vergeben wird, oder
- es an eine andere steuerbegünstigte Körperschaft im Rahmen des § 58 Nr. 1 AO geht und diese die Mittel ihrerseits zeitnah satzungsgemäß verwendet.

Aus nicht zeitnah zu verwendenden Mitteln (insb. freie Rücklage, Vermögens­zuführungen):
- für Vermögensanlage, Kapitalausstattung von Tochtergesellschaften, Liquiditätshilfen.
- An nicht-gemeinnützige Empfänger zwingend marktüblich verzinst — sonst verdeckte Gewinnausschüttung oder Mittel­fehlverwendung.

Rückflüsse: Tilgungen und Zinsen müssen, sobald sie der Körperschaft zufließen, wieder zeitnah für satzungsgemäße Zwecke verwendet werden.

Dokumentation: schriftlicher Vertrag mit Laufzeit, Tilgung, Verzinsung; Beschluss des Organs; Eintrag in MVR/Rücklagenspiegel.`,
  },
  {
    id: "reverse-charge-npo",
    title: "Reverse Charge bei gemeinnützigen Körperschaften (§ 13b UStG)",
    short:
      "Auch ideeller Bereich, Kleinunternehmer und ausschließlich steuerfreie NPOs schulden die USt — Vorsteuerabzug meist ausgeschlossen.",
    category: "Umsatzsteuer",
    source: "Beitrag von Maydell, npoR 2022, 190 — interne Verarbeitung.",
    keywords: /reverse[\s-]?charge|§\s*13b|ausländische[rn]?\s+(dienstleister|unternehmer|leistung)|leistung\s+aus\s+dem\s+ausland/i,
    references: ["§ 13b UStG", "§ 3a Abs. 2 UStG", "§ 15 Abs. 2 UStG", "§ 19 UStG"],
    body: `Reverse Charge ist für gemeinnützige Körperschaften eine besondere Falle, weil:

1) Seit 2011 ist die Ortsbestimmung des § 3a Abs. 2 UStG auch dann anwendbar, wenn die Leistung ausschließlich für den nichtunternehmerischen / ideellen Bereich bezogen wird. Eine sonstige Leistung eines ausländischen Unternehmers an eine NPO mit USt-IdNr. oder eine NPO, die im Übrigen Unternehmerin ist, ist regelmäßig im Inland steuerbar.

2) Auch Kleinunternehmer (§ 19 UStG) und ausschließlich steuerfrei tätige NPOs schulden die USt nach § 13b UStG. Die Kleinunternehmer­regelung gilt nicht für ausländische Leistende.

3) Eine bereits in Rechnung gestellte ausländische USt mindert die Bemessungs­grundlage nicht — sie erhöht sie nach h. M., weil sie Teil der Gegenleistung ist.

4) Der Vorsteuerabzug ist regelmäßig ausgeschlossen, weil die Eingangsleistungen für den ideellen Bereich, steuerfreie Umsätze oder den unentgeltlichen Zweckbetrieb verwendet werden (§ 15 Abs. 2 UStG). Daher wird Reverse Charge bei NPOs faktisch zur echten Kostenbelastung.

Typische Risikofälle: Werbeleistungen großer Tech-Anbieter mit Sitz in Irland/USA, Freelancer im Ausland, Webentwicklung, SaaS, Beratungsleistungen, Hilfspersonen bei Auslands­projekten (§ 57 Abs. 1 S. 2 AO). Achtung: Eine USt-IdNr. löst auch bei nichtunternehmerisch tätigen Körperschaften die Ortsverlagerung ins Inland aus (§ 3a Abs. 2 S. 3 UStG) — daher nicht unüberlegt beantragen.

Ausnahmen vom Empfängerort: grundstücksbezogene Leistungen (§ 3a Abs. 3 Nr. 1 UStG) — Ort liegt dort, wo das Grundstück liegt; ausländische Bauleistung am inländischen Grundstück löst stets deutsche USt aus.`,
  },
  {
    id: "vermietung-vv-wgb",
    title: "Vermietung: Vermögensverwaltung vs. wirtschaftlicher Geschäftsbetrieb",
    short:
      "Langfristige Raumvermietung = VV; Kurzfristigkeit, Sonderleistungen oder Inventardominanz kippen in den wGB.",
    category: "Umsatzsteuer",
    source: "Internes Arbeitspapier — Vermietung von Immobilien und Mobilien.",
    keywords: /vermiet|verpacht|co[-\s]?working|betriebsvorrichtung|§\s*4\s*nr\.?\s*12|§\s*9\s*ustg/i,
    references: ["§ 14 AO", "§ 4 Nr. 12 UStG", "§ 9 UStG", "§ 12 Abs. 2 Nr. 8a UStG", "§ 15a UStG"],
    body: `Ertragsteuerliche Einordnung:
- Vermögensverwaltung (§ 14 S. 3 AO): langfristige Vermietung unbeweglichen Vermögens ohne wesentliche Nebenleistungen.
- Wirtschaftlicher Geschäftsbetrieb (§ 14 S. 1 AO): Kurzfristigkeit, ständiger Mieterwechsel, Sonderleistungen (Reinigung während Mietzeit, Personalgestellung, Bewirtung), oder Einzel­vermietung beweglicher Wirtschaftsgüter.
- Sachinbegriff (möblierte Räume / vollausgestattetes Büro) bleibt VV, solange keine aktiven Zusatzleistungen erbracht werden.

Co-Working:
- Service-Pakete, Empfang, IT, Community → wGB (19 % USt).
- Reine Langfristüberlassung möblierter Räume mit Nebenkosten kann VV sein.

Umsatzsteuer:
- Grundsatz: steuerfrei nach § 4 Nr. 12 Buchst. a UStG.
- Zwingend steuerpflichtig: kurzfristige Beherbergung, Fahrzeug­abstellplätze, Betriebsvorrichtungen.
- Option nach § 9 UStG nur, wenn Mieter Unternehmer ist und das Grundstück (mindestens 95 %, Bagatellgrenze) für vorsteuer­abzugs­berechtigte Umsätze nutzt. Teiloption auf abgrenzbare Gebäudeteile zulässig.
- Altfallregelung § 27 Abs. 2 UStG: bei Baubeginn vor 11.11.1993 entfällt die Einschränkung des § 9 Abs. 2 UStG — Option auch bei Vermietung an Ärzte/NPOs möglich. Entfällt bei sanierungsbedingtem „Neubau“.

Steuersatz bei NPOs:
- VV und Zweckbetrieb: ermäßigt 7 % (§ 12 Abs. 2 Nr. 8a UStG).
- wGB: regulär 19 %.

Betriebsvorrichtungen: nach neuer Rechtsprechung kann die Überlassung gemeinsam mit dem Gebäude als einheitliche Nebenleistung steuerfrei werden — mit Folge, dass die Vorsteuer aus deren Anschaffung verloren geht. Bei Inventar­dominanz: sonstige Leistung eigener Art, 19 %.

§ 15a UStG: Nutzungsänderung (z. B. Wechsel zu steuerfreiem Mieter) löst Vorsteuer­berichtigung über 10 Jahre aus.`,
  },
  {
    id: "57-abs-3-ao",
    title: "§ 57 Abs. 3 AO — Servicegesellschaften und EuGH-Vorlage",
    short:
      "Doppeltes Satzungserfordernis abgelehnt; BFH hat 2025 die Europarechts­konformität der Norm dem EuGH vorgelegt.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rechtsentwicklung Servicegesellschaften § 57 Abs. 3 AO (BFH V R 22/23).",
    keywords: /§\s*57\s*abs\.?\s*3|servicegesellschaft|planmäßiges zusammenwirken|kostenteilungsgemeinschaft|§\s*4\s*nr\.?\s*29/i,
    references: ["§ 57 Abs. 3 AO", "§ 4 Nr. 29 UStG", "BFH 22.05.2025 – V R 22/23"],
    body: `§ 57 Abs. 3 AO erlaubt seit dem JStG 2020 das „planmäßige Zusammenwirken“ mehrerer steuerbegünstigter Körperschaften. Eine Servicegesellschaft (z. B. gGmbH für Buchhaltung, IT, Personal) kann selbst gemeinnützig sein, wenn die Kooperation in ihrer Satzung verankert ist.

Doppeltes Satzungserfordernis: Die Finanzverwaltung hatte gefordert, dass die Kooperation auch in den Satzungen der Leistungs­empfänger steht. FG Hamburg (26.09.2023 – 5 K 11/23) und tendenziell auch der BFH lehnen dies ab — die Satzung der leistenden Körperschaft genügt.

EuGH-Vorlage (BFH 22.05.2025 – V R 22/23): Der BFH zweifelt, ob § 57 Abs. 3 AO mit dem EU-Beihilferecht (Art. 107, 108 AEUV) vereinbar ist. Die Norm wurde ohne Notifizierung bei der Kommission eingeführt. Vorlagefragen: (1) Beihilfe? (2) Neutralisieren die gemeinnützigkeits­rechtlichen Beschränkungen den selektiven Vorteil? (3) Notifizierungs­pflichtige Neu- oder Umgestaltung?

Praxis bis zur EuGH-Entscheidung:
- Bestehende Strukturen: Verrechnungspreise nach Fremdvergleich dokumentieren, ggf. Rückstellungen für Steuernach­zahlungen bilden, hilfsweise Kriterien einer Kostenteilungs­gemeinschaft nach § 4 Nr. 29 UStG prüfen.
- Neugründungen: Vorrangig Kostenteilungs­gemeinschaft nach § 4 Nr. 29 UStG strukturieren — sie beruht direkt auf EU-Recht (Art. 132 Abs. 1 Buchst. f MwStSystRL) und ist nicht vom Beihilferisiko betroffen (BFH 04.09.2024 – XI R 37/21).
- Hybridmodelle: Servicegesellschaft, deren Geschäftsmodell zugleich § 4 Nr. 29 UStG erfüllt.
- USt-Härtefallklauseln in Verträgen aufnehmen.`,
  },
  {
    id: "tatigkeitsbericht",
    title: "Tätigkeitsbericht und tatsächliche Geschäftsführung",
    short:
      "Pflicht­nachweis der satzungs­gemäßen Mittelverwendung; Abgleich mit Buchhaltung und Sphären­zuordnung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes NPO-Handout (Abschnitt 5).",
    keywords: /tätigkeitsbericht|tatsächliche geschäftsführung/i,
    references: ["§ 63 AO"],
    body: `Der Tätigkeitsbericht weist die tatsächliche Geschäftsführung nach (§ 63 AO). Er muss zur Buchhaltung, zur Mittelverwendung und zur Sphären­zuordnung passen.

Im Mandat prüfen:
- Liegt für das Geschäftsjahr ein Tätigkeitsbericht vor?
- Sind die wesentlichen Tätigkeiten beschrieben und einer Sphäre zuzuordnen?
- Werden Investitionen, Rücklagenbildung und größere Mittel­bewegungen erläutert?

Risiken: Fehlt der Bericht oder weicht er von der Buchhaltung ab, drohen Rückfragen des Finanzamts, im Wiederholungsfall Aberkennung der Gemeinnützigkeit.`,
  },
  // ===== NPO / Mittelverwendungsrechnung — vertiefende Wissenskarten =====
  {
    id: "mvr-zeitnahe-mittelverwendung",
    title: "Zeitnahe Mittelverwendung",
    short:
      "Mittel gemeinnütziger Körperschaften müssen grundsätzlich zeitnah für steuerbegünstigte satzungsmäßige Zwecke verwendet werden.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Mittelverwendung (Kapitel 1).",
    keywords: /zeitnahe?\s+mittelverwendung|selbstlosigkeit|zwei[-\s]?jahres[-\s]?frist/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO"],
    body: `Grundsatz der Selbstlosigkeit (§ 55 AO): Eine gemeinnützige Körperschaft darf in erster Linie keine eigenwirtschaftlichen Zwecke verfolgen. Daraus folgt die Pflicht, die ihr zufließenden Mittel zeitnah für die steuerbegünstigten satzungsmäßigen Zwecke einzusetzen.

Zwei-Jahres-Frist: Mittel müssen spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren verwendet werden (§ 55 Abs. 1 Nr. 5 S. 3 AO). Beispiel: Zufluss 2024 → Verwendung bis Ende 2026.

Zweck der Regelung: Vermeidung unzulässiger Mittelhortung. Die Mittel sollen tatsächlich dem geförderten Zweck zugutekommen und nicht dauerhaft im Vermögen der Körperschaft verbleiben.

Review-Hinweis: Die zeitnahe Mittelverwendung ist über eine Mittelverwendungsrechnung (MVR) nachzuweisen. Ein positiver Verwendungsüberhang führt nicht automatisch zum Verlust der Gemeinnützigkeit, kann aber Anlass für eine Verwendungsauflage des Finanzamts (§ 63 Abs. 4 AO) sein.`,
  },
  {
    id: "mvr-45000-grenze",
    title: "45.000-€-Grenze",
    short:
      "Kleine Körperschaften mit Einnahmen bis 45.000 € sind nach der hinterlegten Logik von der Pflicht zur zeitnahen Mittelverwendung ausgenommen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Mittelverwendung, Schwellenprüfung.",
    keywords: /45\.?000|kleine körperschaft|bagatellgrenze\s+mittelverwendung/i,
    references: ["§ 55 Abs. 1 Nr. 5 S. 4 AO"],
    body: `Liegen die jährlichen Einnahmen einer Körperschaft insgesamt bei höchstens 45.000 €, entfällt die Pflicht zur zeitnahen Mittelverwendung.

Kumulierte Betrachtung — einzubeziehen sind die Einnahmen aller vier Sphären:
- ideeller Bereich (Spenden, Beiträge, Zuschüsse, Bruttoeinnahmen),
- Zweckbetrieb,
- Vermögensverwaltung,
- steuerpflichtiger wirtschaftlicher Geschäftsbetrieb.

Praxis: Die Befreiung greift jahresbezogen. Wer einmal die Schwelle überschreitet, fällt für dieses Jahr aus der Befreiung. Eine freiwillige Mittelverwendungsrechnung ist auch unterhalb der Grenze sinnvoll, weil sie bei späterem Wachstum nahtlos fortgeführt werden kann und Mittelherkunftsnachweise erleichtert.

Review-Hinweis: Befreiung nicht mit Aufzeichnungspflichten verwechseln. Tätigkeitsbericht, ordnungsgemäße Buchführung und Sphärenabgrenzung sind weiterhin erforderlich.`,
  },
  {
    id: "mvr-mittelbegriff",
    title: "Mittelbegriff",
    short:
      "Mittel umfassen grundsätzlich sämtliche Vermögenswerte der Körperschaft.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Definition Mittel.",
    keywords: /mittelbegriff|was sind mittel|grundstockvermögen/i,
    references: ["§ 55 Abs. 1 AO", "§ 62 Abs. 3 AO"],
    body: `„Mittel" im Sinne des § 55 AO sind grundsätzlich sämtliche Vermögenswerte der Körperschaft, insbesondere:

- Spenden,
- Mitgliedsbeiträge,
- Zuschüsse,
- Gewinne aus Zweckbetrieb,
- Gewinne aus steuerpflichtigem wirtschaftlichem Geschäftsbetrieb,
- Überschüsse aus Vermögensverwaltung,
- Bruttoeinnahmen des ideellen Bereichs.

Ausnahme: Das Grundstockvermögen einer Stiftung sowie Stiftungseinlagen und ausdrücklich der Vermögensausstattung gewidmete Zuwendungen unterliegen nicht der zeitnahen Mittelverwendung (§ 62 Abs. 3 AO). Sie sind in der MVR getrennt auszuweisen.

Review-Hinweis: Bei Sachzuwendungen ist der gemeine Wert maßgeblich. Die Zweckbindung muss aus Spendenaufruf, Zuwendungsvereinbarung oder Stiftungsgeschäft eindeutig hervorgehen.`,
  },
  {
    id: "mvr-zulaessige-verwendung",
    title: "Zulässige Mittelverwendung",
    short:
      "Mittelverwendung ist zulässig, wenn sie satzungsmäßigen steuerbegünstigten Zwecken dient.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Zulässige Verwendung.",
    keywords: /zulässige? mittelverwendung|mittelweitergabe|§\s*58\s*nr\.?\s*1/i,
    references: ["§ 55 AO", "§ 58 Nr. 1 AO"],
    body: `Eine Mittelverwendung gilt als zulässig (= zweckentsprechend), wenn sie unmittelbar oder mittelbar die satzungsmäßigen steuerbegünstigten Zwecke fördert.

Typische zulässige Verwendungen:
- Ausgaben im ideellen Bereich (Projektkosten, ehrenamtliche Aufwandsentschädigungen, Öffentlichkeitsarbeit für den Zweck),
- Ausgaben im Zweckbetrieb (§§ 65–68 AO),
- nutzungsgebundenes Anlagevermögen im ideellen Bereich / Zweckbetrieb (z. B. Therapieräume, Lehrmittel),
- Mittelweitergabe an andere steuerbegünstigte Körperschaften nach § 58 Nr. 1 AO,
- Darlehensvergabe nur in engen Fällen, wenn die Darlehensvergabe selbst der unmittelbaren Zweckverwirklichung dient (z. B. Schuldnerberatung, Stipendiendarlehen).

Nicht zweckentsprechend: Ausgaben in Vermögensverwaltung und steuerpflichtigem wGB, sonstiges (nicht nutzungsgebundenes) Anlagevermögen, kommerzielle Darlehen aus zeitnah zu verwendenden Mitteln.

Review-Hinweis: Bei Mittelweitergabe Freistellungsbescheid bzw. Anlage zum KSt-Bescheid des Empfängers in Akte halten.`,
  },
  {
    id: "mvr-ruecklagen-62-uebersicht",
    title: "Rücklagen nach § 62 AO",
    short:
      "Zulässige Rücklagen entziehen Mittel der zeitnahen Mittelverwendungspflicht.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rücklagenarten § 62 AO.",
    keywords: /§\s*62\s*ao|rücklagen?\s*nach\s*§\s*62|betriebsmittelrücklage|wiederbeschaffungsrücklage/i,
    references: ["§ 62 Abs. 1 AO", "§ 62 Abs. 3 AO"],
    body: `Mittel, die in eine zulässige Rücklage nach § 62 AO eingestellt werden, gelten als verwendet und unterliegen für die Dauer der Rücklagenbildung nicht mehr der zeitnahen Mittelverwendung.

Übersicht der Rücklagenarten:
1) Zweckgebundene Rücklage (§ 62 Abs. 1 Nr. 1 AO) — für konkret geplante Projekte.
2) Betriebsmittelrücklage (Unterfall Nr. 1) — Liquiditätssicherung für periodisch wiederkehrende Ausgaben (i. d. R. 3–12 Monate).
3) Wiederbeschaffungsrücklage (§ 62 Abs. 1 Nr. 2 AO) — Ersatzbeschaffung von Wirtschaftsgütern, regelmäßig in Höhe der AfA.
4) Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO) — siehe eigener Eintrag.
5) Rücklage zum Erwerb von Gesellschaftsrechten (§ 62 Abs. 1 Nr. 4 AO) — zur Erhaltung der Beteiligungsquote.

Daneben: Vermögenszuführungen nach § 62 Abs. 3 AO (Erbschaft, ausdrückliche Vermögensausstattung, Spendenaufruf zur Vermögensaufstockung, Sachzuwendung zur Vermögensbildung).

Review-Hinweis: Jede Rücklage benötigt Beschluss, Zweck, Dokumentation und Auflösung bei Wegfall des Grundes.`,
  },
  {
    id: "mvr-freie-ruecklage",
    title: "Freie Rücklage",
    short:
      "Die freie Rücklage ist flexibel, aber die jährliche Zuführung ist begrenzt.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Freie Rücklage (Bemessungsgrundlagen).",
    keywords: /freie? rücklage|§\s*62\s*abs\.?\s*1\s*nr\.?\s*3|nachholung\s+freie\s+rücklage/i,
    references: ["§ 62 Abs. 1 Nr. 3 AO"],
    body: `Bemessung der jährlichen Höchstzuführung:
- bis zu 1/3 des Überschusses der Vermögensverwaltung,
- zuzüglich bis zu 10 % der sonstigen zeitnah zu verwendenden Mittel (ideeller Bereich, Zweckbetrieb, wGB).

Wichtige Regeln:
- Keine Doppelberücksichtigung: Mittel der Vermögensverwaltung dürfen nicht zusätzlich in die Bemessungsgrundlage der 10 %-Rücklage einbezogen werden.
- Nachholung: Nicht ausgeschöpfte Höchstbeträge können in den zwei folgenden Jahren nachgeholt werden.
- Unterdeckungen der Vermögensverwaltung sind in spätere Jahre vortragbar und mindern dort die Bemessungsgrundlage.

Gesamthöhe ist unbegrenzt. Verwendung später z. B. für Darlehen, Beteiligungen, Investitionen, Kapitalerhöhungen aus Gesellschaftsmitteln.

Review-Hinweis: Zuführung und Berechnungsgrundlage in der MVR transparent dokumentieren. Eine unterlassene Zuführung kann nur innerhalb der 2-Jahres-Nachholung aufgeholt werden.`,
  },
  {
    id: "mvr-mittelverwendungsrechnung",
    title: "Mittelverwendungsrechnung",
    short:
      "Die MVR dokumentiert die zeitnahe und satzungsgemäße Mittelverwendung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Aufbau MVR.",
    keywords: /mittelverwendungsrechnung|mvr\b|nebenrechnung\s+jahresabschluss/i,
    references: ["§ 55 AO", "§ 63 AO"],
    body: `Die Mittelverwendungsrechnung (MVR) ist Nebenrechnung zum Jahresabschluss und dient dem Nachweis, dass die Körperschaft ihre Mittel zeitnah und satzungsgemäß verwendet hat.

Format: Es gibt kein gesetzlich vorgeschriebenes Schema. In der Praxis verbreitet sind:
- bilanzorientierte Darstellung (Vermögensvergleich; Gegenüberstellung der zeitnah zu verwendenden Mittel und ihrer Verwendung),
- kapitalflussorientierte Darstellung (Mittelzu- und -abflüsse im Jahr).

Pflichtbestandteile in der Praxis:
- Saldobetrachtung / Globalbetrachtung über alle zeitnah zu verwendenden Mittel,
- Abstimmung mit dem Rücklagenspiegel,
- Ausweis offener Mittelvorträge mit Fristen,
- Verwendungsüberhang als Ergebniskennzahl.

Review-Hinweis: Die MVR ist Teil der Akte und sollte beim Finanzamt auf Anforderung kurzfristig vorgelegt werden können.`,
  },
  {
    id: "mvr-ruecklagenspiegel",
    title: "Rücklagenspiegel",
    short:
      "Der Rücklagenspiegel zeigt Bildung, Entwicklung und Auflösung gemeinnützigkeitsrechtlicher Rücklagen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rücklagenspiegel.",
    keywords: /rücklagenspiegel/i,
    references: ["§ 62 AO"],
    body: `Der Rücklagenspiegel stellt für jede Rücklage je Geschäftsjahr dar:
- Anfangsbestand,
- Zuführung,
- Entnahme / Auflösung,
- Endbestand,
- Zweck,
- Vorstands- bzw. Geschäftsführungsbeschluss (Datum),
- Nachweise (Projektplan, Finanzierungsplan, Belege).

Er ergänzt die Mittelverwendungsrechnung und macht die Rücklagenentwicklung über mehrere Jahre nachvollziehbar.

Review-Hinweis: Auflösungen sind zwingend zu dokumentieren — frei werdende Mittel unterliegen wieder der zeitnahen Mittelverwendung. Dauerhaft unveränderte Rücklagen oder pauschale Sammelpositionen ohne Zweck sind Audit-Risiko.`,
  },
  {
    id: "mvr-verwendungsueberhang",
    title: "Verwendungsüberhang",
    short:
      "Ein positiver Verwendungsüberhang kann auf nicht zeitnah verwendete Mittel hinweisen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Auswertung MVR.",
    keywords: /verwendungsüberhang|nicht\s+zeitnah\s+verwendete\s+mittel/i,
    references: ["§ 55 AO", "§ 63 Abs. 4 AO"],
    body: `Der Verwendungsüberhang ist eine rechnerische Kennzahl der MVR:
Zeitnah zu verwendende Mittel − zweckentsprechende Verwendung − zulässige Rücklagen − Vermögenszuführungen § 62 Abs. 3 AO − offener Mittelvortrag (innerhalb Frist).

Interpretation:
- Positiver Überhang: Hinweis auf nicht zeitnah verwendete Mittel → Prüfbedarf.
- Negativer Überhang: Es wurden mehr Mittel zweckentsprechend verwendet als rechnerisch erforderlich (z. B. Auflösung von Vorjahresmitteln).

Folgen: Ein positiver Überhang führt nicht automatisch zur Aberkennung der Gemeinnützigkeit. Das Finanzamt kann nach § 63 Abs. 4 AO eine angemessene Verwendungsauflage (oft bis zu drei Jahren) erteilen. Erst wiederholte oder schwere Verstöße gefährden die Gemeinnützigkeit.

Review-Hinweis: Der Überhang ist Arbeitswert und ersetzt keine fachliche Würdigung — insbesondere Mittelherkunft, Sphärenzuordnung und Rücklagengründe sind zu prüfen.`,
  },
  {
    id: "mvr-vorstandsbeschluesse",
    title: "Vorstandsbeschlüsse und Dokumentation",
    short:
      "Rücklagen sollten durch Beschlüsse und Nachweise dokumentiert werden.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Dokumentationsstandards Rücklagen.",
    keywords: /vorstandsbeschluss|rücklagenbeschluss|dokumentation\s+rücklage/i,
    references: ["§ 62 AO", "§ 63 AO"],
    body: `Jede Rücklagenbildung sollte durch das zuständige Organ (Vorstand, Geschäftsführung) formal beschlossen und dokumentiert werden.

Mindestbestandteile der Dokumentation:
- Rücklagenbeschluss mit Datum,
- Projektbeschreibung (Zweck, Inhalt),
- Finanzierungsplan (geplante Kosten, Mittelherkunft),
- Zeitplan (geplanter Verwendungs- bzw. Ersatzzeitpunkt),
- Auflösungsdokumentation bei Wegfall des Rücklagengrundes,
- Review durch Steuerberater / Wirtschaftsprüfer.

Praxisempfehlung: Beschlussvorlage als wiederverwendbares Template in der Mandatsakte führen. Im Rücklagenspiegel jede Position mit Beschlussdatum verknüpfen — fehlt das Datum, ist die Position fachlich nicht belastbar.`,
  },
];

// Hilfsmittel für die Wissensbasis-Suche (analyze.ts)
export function findKnowledgeEntry(text: string): KBEntry | null {
  for (const e of KNOWLEDGE_BASE) if (e.keywords.test(text)) return e;
  return null;
}
