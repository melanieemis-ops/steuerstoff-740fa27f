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
    id: "ruecklage-allgemein",
    title: "Rücklage — Grundlagen und Abgrenzungen",
    short:
      "Allgemeine Rücklage, steuerliche Spezialrücklage, gemeinnützigkeitsrechtliche Rücklage (§ 62 AO) und Abgrenzung zur Rückstellung.",
    category: "Buchhaltung",
    source: "Internes Arbeitspapier — Begriffsabgrenzung Rücklage / Rückstellung.",
    keywords: /(^|\s)rücklage(n)?($|\s)|gewinnrücklage|kapitalrücklage|rückstellung\s+(und|vs|gegen)\s+rücklage|unterschied\s+rücklage/i,
    references: ["§ 62 AO", "§ 266 HGB", "§ 249 HGB"],
    body: `Eine Rücklage ist zurückbehaltenes Eigenkapital bzw. ein zweckgebundener oder freier Betrag, der nicht unmittelbar ausgeschüttet oder verwendet wird. Im steuerlichen Kontext muss man unterscheiden, welche Art von Rücklage gemeint ist.

1) Allgemeine Rücklage
- Eigenkapitalposition (Passivseite der Bilanz).
- Beispiele: Gewinnrücklage, Kapitalrücklage, gesetzliche Rücklage (§ 5a Abs. 3 GmbHG bei der UG).
- Dient der Stärkung des Eigenkapitals.

2) Steuerliche Spezialrücklage
- Spezialregelungen erlauben in bestimmten Fällen die Bildung steuerlicher Rücklagen oder Übertragungen, z. B. § 6b EStG (Reinvestitionsrücklage), § 7g EStG (Investitionsabzugsbetrag — keine echte Rücklage, sondern außerbilanzielle Kürzung) oder Ersatzbeschaffungsrücklage (R 6.6 EStR).
- Abhängig vom konkreten Steuertatbestand.

3) Gemeinnützigkeitsrechtliche Rücklage nach § 62 AO
- Relevant für Vereine, gGmbHs, gUGs, Stiftungen und sonstige NPOs.
- Arten: freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage, Rücklage zum Erwerb von Gesellschaftsrechten.
- Mittel, die in eine zulässige Rücklage eingestellt werden, gelten als verwendet und sind der zeitnahen Mittelverwendung entzogen.
- Dokumentation über Beschluss, Mittelverwendungsrechnung und Rücklagenspiegel.

4) Abgrenzung zur Rückstellung
- Rückstellung = Fremdkapital. Sie bildet ungewisse Verbindlichkeiten oder drohende Belastungen ab (Höhe oder Fälligkeit unsicher) — § 249 HGB.
- Rücklage = Eigenkapital bzw. Mittelbindung.
- Beispiele für Rückstellungen: Steuerrückstellung, Gewährleistungsrückstellung, Pensionsrückstellung, Prozesskostenrückstellung.

Review-Hinweis: Bei Mandantenfragen zuerst klären, ob eine allgemeine bilanzielle Rücklage, eine steuerliche Spezialrücklage oder eine § 62 AO-Rücklage gemeint ist.`,
  },
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
  // ===== Spenden-Crowdfunding / Förderkörperschaften =====
  {
    id: "spenden-crowdfunding-gegenleistung",
    title: "Spenden-Crowdfunding: Gegenleistungen Dritter",
    short:
      "Gegenleistung durch den Projektträger zerstört die Unentgeltlichkeit der Spende — Haftung der Plattform nach § 10b Abs. 4 EStG.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Steuerliche Risiken bei Gegenleistungen im Spenden-Crowdfunding.",
    keywords: /crowdfunding|reward|förderkörperschaft|gegenleistung.*spende|plattform.*spende|zuwendungsbestätigung.*haftung/i,
    references: ["§ 10b Abs. 4 EStG", "§ 55 AO", "§ 58 Nr. 1 AO"],
    body: `Plattformen, die als gemeinnützige Förderkörperschaft Spenden für steuerbegünstigte Projektträger sammeln, müssen die Unentgeltlichkeit jeder einzelnen Zuwendung sicherstellen.

Verlust des Spendencharakters:
- Erhält der Spender (C) vom Projektträger (B) eine Gegenleistung (Produkt, Merchandise, exklusive Vorteile, „Reward"), fehlt die Unentgeltlichkeit — auch wenn die Plattform selbst nichts leistet.
- Keine Teilentgeltlichkeit: Die Gegenleistung „infiziert" den gesamten Betrag, nicht nur den Mehrwert.
- Buchung im ideellen Bereich ist dann sachlich unzutreffend; Erfassung als „sonstige Zuwendung" bzw. durchlaufender Posten.

Sphärenwirkung Plattform:
- Solange die Plattform keine Provision/Gegenleistung erbringt, entsteht bei ihr kein eigener wirtschaftlicher Geschäftsbetrieb.
- Werden Mittel für die Herstellung von Rewards verwendet, liegt Mittelfehlverwendung vor.

Haftung nach § 10b Abs. 4 EStG:
- Ausstellerhaftung: 30 % des zugewendeten Betrags (zzgl. 15 % bei GewSt-Pflicht) bei objektiv unrichtiger Zuwendungsbestätigung, sofern Vorsatz oder grobe Fahrlässigkeit (z. B. ignorierte Reward-Hinweise, fehlende vertragliche Vorkehrungen).
- Veranlasserhaftung: bei Verwendung der Gelder für einen steuerpflichtigen wGB statt für den ideellen Zweck.
- Entlastung bei nachweislicher Unkenntnis (heimliche Absprache B/C), wenn die Unkenntnis nicht auf Organisationsmängeln beruht.

Handlungsempfehlungen:
- Strikte Kontentrennung zwischen bescheinigungsfähigen Spenden und Crowdfunding-Geldern ohne Spendencharakter.
- Technische Sperre gegen automatisierte Quittungen bei Reward-Projekten; sofortige Umbuchung bei Bekanntwerden einer Gegenleistung.
- Keine Bescheinigung bei Gegenleistung — auch nicht über Teilbeträge. Bei nachträglichem Bekanntwerden: Widerruf, Korrekturdatensatz, Haftungsanzeige ans Finanzamt.
- Vertragliche Absicherung: Verpflichtungserklärung des Projektträgers (keine Gegenleistung), Freistellungsklausel, dokumentierte Belehrung.

Fazit: Mischformen zwischen Spenden-Crowdfunding und Reward-Crowdfunding beherrschen nur klare Vertragsvorgaben und interne Kontrollmechanismen (Reward-Indikator-Sperre).`,
  },
  // ===== GoBD =====
  {
    id: "gobd-grundsaetze",
    title: "GoBD — Grundsätze ordnungsgemäßer Buchführung",
    short:
      "Nachvollziehbarkeit, Vollständigkeit, Richtigkeit, Zeitgerechtheit, Ordnung und Unveränderbarkeit als Kernpflichten jeder Buchhaltung.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil I) — Gärtner / Rühmann.",
    keywords: /gobd|grundsätze ordnungsgemäßer buchführung|nachvollziehbar|unveränderbar|zeitgerecht/i,
    references: [
      "§ 145 Abs. 1 AO",
      "§ 146 Abs. 1 und 4 AO",
      "§ 238 Abs. 1 HGB",
      "§ 239 Abs. 2 und 3 HGB",
      "BMF-Schreiben GoBD",
    ],
    body: `Die GoBD konkretisieren die Grundsätze ordnungsgemäßer Buchführung für DV-gestützte Systeme. Sechs Kernanforderungen:

1) Nachvollziehbarkeit / Nachprüfbarkeit (§ 145 Abs. 1 AO, § 238 Abs. 1 HGB, GoBD Rn. 30–35 und 145–150)
   - Ein sachverständiger Dritter muss sich in angemessener Zeit einen Überblick über Geschäftsvorfälle und Lage des Unternehmens verschaffen können.
   - Geschäftsvorfälle in Entstehung und Abwicklung verfolgbar (progressiv vom Beleg zur Bilanz, retrograd zurück).

2) Vollständigkeit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 36–43)
   - Alle buchungspflichtigen Geschäftsvorfälle lückenlos erfassen — keine Unterdrückung, keine Auswahl.

3) Richtigkeit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 44)
   - Aufzeichnungen müssen den tatsächlichen Verhältnissen entsprechen (richtige Konten, Beträge, Zeiträume, USt-Sätze, Währungen).

4) Zeitgerechtheit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 45–52)
   - Unbare Geschäftsvorfälle: Erfassung innerhalb von 10 Tagen unkritisch; periodengerechte Buchung bis zum Ablauf des Folgemonats.
   - Kassenbewegungen: täglich.
   - Belegsicherung (laufende Nummerierung, Ablage) muss zeitnah erfolgen, auch wenn die Verbuchung später nachgeholt wird.

5) Ordnung (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 53–57)
   - Systematische, übersichtliche Ablage von Daten und Belegen; klare Trennung von baren und unbaren Vorgängen, sachliche und chronologische Ordnung.

6) Unveränderbarkeit (§ 146 Abs. 4 AO, § 239 Abs. 3 HGB, Rn. 58–60 und 107–112)
   - Festgeschriebene Daten dürfen nicht unbemerkt geändert oder gelöscht werden.
   - Änderungen müssen protokolliert sein, der ursprüngliche Inhalt bleibt erkennbar.
   - Excel-Tabellen ohne Änderungsprotokoll erfüllen diese Anforderung typischerweise nicht.

Verstöße können zur formellen Ordnungswidrigkeit der Buchführung führen — Folge: Schätzungsbefugnis der Finanzverwaltung (§ 162 AO), Hinzuschätzungen, Verwerfen der Buchführung.`,
  },
  {
    id: "gobd-belegfunktion-verfahrensdoku",
    title: "GoBD — Belegfunktion und Verfahrensdokumentation",
    short:
      "Keine Buchung ohne Beleg, Grund-/Journal-/Kontenfunktion sichern, Verfahrensdokumentation als Pflichtbestandteil.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil I) — Belegwesen, IKS, Verfahrensdokumentation.",
    keywords: /belegfunktion|verfahrensdokumentation|journalfunktion|kontenfunktion|grundaufzeichnung|iks|internes kontrollsystem/i,
    references: ["§ 146 AO", "§ 257 HGB", "GoBD Rn. 61 ff., 151 ff."],
    body: `Belegfunktion (Grundsatz „Keine Buchung ohne Beleg")
- Jeder Geschäftsvorfall ist durch einen Originalbeleg oder einen geeigneten Eigenbeleg nachzuweisen.
- Pflichtinhalte des Belegs: eindeutige Belegnummer, Belegdatum, Geschäftspartner, Betrag und Währung, ggf. Fremdwährungskurs, USt-Satz, hinreichende Erläuterung des Geschäftsvorfalls.
- Mitgeltende Unterlagen (Verträge, Lieferscheine, Bestellungen) sind über eindeutige Verknüpfungen (Index, Barcode, Referenznummer) auffindbar zu machen.

Grund-/Journal-/Kontenfunktion
- Grundaufzeichnungsfunktion: vollständige und unveränderbare Erfassung jedes Geschäftsvorfalls zeitnah nach Entstehung.
- Journalfunktion: chronologische Darstellung aller gebuchten Geschäftsvorfälle (Buchungsprotokoll).
- Kontenfunktion: systematische, sachliche Ordnung auf Bestands- und Ertragskonten — Verdichtung nur zulässig, wenn die Einzelposten jederzeit reproduzierbar bleiben.

Bearbeitung von Belegen
- Belegsicherung sofort (laufende Nummerierung, Eingangsstempel, geordnete Ablage).
- Konvertierung von Papier in digitale Form ist zulässig, wenn bildliche und inhaltliche Übereinstimmung gewährleistet und die ursprüngliche Form vernichtet werden darf (Verfahrensdokumentation zur ersetzenden Erfassung notwendig).
- Eigenbelege nur in Ausnahmefällen, mit klarer Begründung und Unterschrift.

Internes Kontrollsystem (IKS)
- Maßnahmen, die Vollständigkeit, Richtigkeit und Unveränderbarkeit der Aufzeichnungen sicherstellen: Funktionstrennung, Vier-Augen-Prinzip, Zugriffsschutz, Abstimm- und Kontrollroutinen, Protokollierung.
- IKS ist Teil der Buchführungspflicht — fehlt es, ist die formelle Ordnungsmäßigkeit gefährdet.

Verfahrensdokumentation (GoBD Rn. 151 ff.)
- Pflichtbestandteil jeder DV-gestützten Buchführung; muss Aufbau, Inhalt und Ablauf des Verfahrens vollständig und schlüssig erläutern.
- Mindestbestandteile: allgemeine Beschreibung, Anwender- und technische Dokumentation, Betriebsdokumentation, Beschreibung des IKS.
- Änderungen der Verfahren sind mit Versionsstand und Geltungszeitraum zu dokumentieren (historisierte Dokumentation).
- Typische Prüfungsschwerpunkte: ersetzendes Scannen, E-Mail-Eingang, Kassensysteme, Schnittstellen zwischen Vor- und Hauptsystemen, Archivierung.

Konsequenz: Fehlt oder ist die Verfahrensdokumentation unzureichend, kann dies allein die Ordnungsmäßigkeit der Buchführung in Frage stellen, sofern dadurch die Nachvollziehbarkeit und Nachprüfbarkeit der Geschäftsvorfälle beeinträchtigt ist (BMF: nicht jede Lücke ist automatisch ein Mangel).`,
  },
  {
    id: "gobd-datenanalyse-kassen",
    title: "GoBD — Datenanalyse und Kassendaten",
    short:
      "Quantitative Prüfungsmethoden (Ziffern-, Zeitreihen-, Strukturanalyse) und Anforderungen an die Auswertung digitaler Kassendaten.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil III) — Datenanalyse und Kassendaten.",
    keywords: /datenanalyse|ziffernanalyse|benford|kassendaten|tse|zeitreihenanalyse|power\s*bi|prüfungsmethode/i,
    references: ["§ 146a AO", "§ 147 Abs. 6 AO", "KassenSichV", "GoBD Rn. 81–89"],
    body: `Datenanalyse durch quantitative Prüfungsmethoden
- Phasen: Zieldefinition → Datenbeschaffung & -qualitätsprüfung → Analyse → Visualisierung → Bericht und Archivierung.
- Datenqualität ist Voraussetzung: Vollständigkeit, Formatkonsistenz, eindeutige Schlüssel, Nachvollziehbarkeit der Herkunft.
- Klassische Verfahren: Ziffernanalyse (z. B. Benford-Verteilung der führenden Ziffern), Zeitreihenanalyse (Trends, Saisonalitäten, Ausreißer), Lagemaße (Mittelwert, Median, Quantil), Konfidenzniveau zur Beurteilung von Auffälligkeiten.
- Visualisierung: Balken-/Säulen-, Linien-, Kreis-, Wasserfalldiagramme; Dashboards (z. B. Power BI) zur kontinuierlichen Überwachung.
- Nutzen in der Steuerberatung: frühzeitige Identifikation von Buchungsanomalien, Kassendifferenzen, manipulationsverdächtigen Mustern, Vorbereitung auf Betriebsprüfung.

Kassendaten (§ 146a AO, KassenSichV)
- Elektronische Aufzeichnungssysteme benötigen eine zertifizierte technische Sicherheitseinrichtung (TSE): Sicherheitsmodul, Speichermedium, einheitliche digitale Schnittstelle (DSFinV-K).
- Jede Einzelaufzeichnung muss vollständig, richtig, zeitgerecht und unveränderbar sein; nachträgliche Stornos sind als solche zu kennzeichnen.
- Belegausgabepflicht: bei jedem Geschäftsvorfall muss ein Beleg zur Verfügung stehen (auch elektronisch).
- Mitteilungspflicht nach § 146a Abs. 4 AO über eingesetzte/abgeschaffte Kassensysteme (ELSTER-Meldung).
- Prüfungsschwerpunkte: Signaturvalidierung, Belegabbrüche, Lücken in der Transaktionsnummer, Z-Bon-Vollständigkeit, Stornoquote, Trinkgeldverbuchung.
- Risiko: nicht ordnungsgemäße Kassenführung → Schätzungsbefugnis nach § 162 AO; Hinzuschätzungen oft auf Basis quantitativer Analysen (Chi-Quadrat-Test, Strukturvergleich).

Praxisempfehlung
- Vor Betriebsprüfung eigene Datenanalyse fahren (Z3-Zugriff simulieren), Auffälligkeiten dokumentieren und im Vorfeld erläutern.
- Datenanalyse-Routinen in der Kanzlei standardisieren und in die Verfahrensdokumentation aufnehmen.`,
  },
  {
    id: "ki-agenten-langdock",
    title: "KI-Agenten in Langdock — Aufbau und Einsatz im Kanzleialltag",
    short:
      "Spezialisierte Chatbots mit Anweisungen, Skills und Wissensquellen — stark bei Konvertierung, Importvorbereitung und Vorprüfung.",
    category: "DATEV",
    source: "Internes Team-Handout — KI-Agenten in Langdock.",
    keywords: /langdock|ki[- ]?agent|qm[- ]?chatbot|kontoauszug[- ]?converter|buchungsvorlauf[- ]?converter|mt940|camt\.?053/i,
    body: `Ein KI-Agent in Langdock ist ein vorkonfigurierter Chatbot mit hinterlegten Anweisungen, Skills und Wissensordnern. Vorteil gegenüber freiem Prompten: einheitliche Ergebnisse, geringere Einstiegshürde, formularbasierte Eingaben.

Arbeitslogik
- Pflichtfelder (Berater-/Mandantennummer, Vorgangsart, Zielformat) füllen.
- Anhänge entscheiden über die Qualität: PDFs, CSV, Excel, Exportdaten, idealerweise GDPdU-Daten.
- Optionale Hinweise im Freitext für Fallbesonderheiten ergänzen.
- Ergebnis lesen, fachlich prüfen, Folgeschritte ableiten.

Typische Agenten
- QM-Chatbot: interne QM- und Wissenssuche in natürlicher Sprache.
- Dokumentenübersetzer: Verträge, Belege, PDFs übersetzen.
- Kontoauszug-Converter: PDF/CSV → MT940 oder CAMT.053 (PayPal/Stripe oft mit Pseudo-IBAN; bei Stripe Datumsformat beachten).
- Buchungsvorlauf-Converter: Fremddaten → DATEV-Buchungsvorlauf; Matching mit Debitorenliste.
- Anlagevermögens-Converter: Anlagenverzeichnis aus Fremdsystemen für DATEV-Import vorbereiten.
- Fachagenten: Anhang, WP-Anfragen, Jahresabschluss, Fremdwährung, Einkommensteuer, Gesellschafterdarlehen, Tax-Compliance/NPO.
- Organigramm-Agent laut Hinweis derzeit nicht zuverlässig — nicht nutzen.

Ergebnislogik
- Risikoeinstufung, Folgeprompts, Hinweise auf fehlende Unterlagen, Arbeitspapier-Struktur für die Akte.
- Subagenten delegieren Spezialprüfungen im Hintergrund.

Qualitätsregeln
- Fachliche Endkontrolle bleibt immer beim Menschen.
- Saubere Eingaben → kritische Prüfung → Rückmeldung von Fehlern an die Agenten-Pflege.`,
  },
  {
    id: "datev-prochecklisten",
    title: "DATEV ProChecklisten — laufende Nutzung und Mandatswissen",
    short:
      "Checkliste während der Arbeit nutzen, nicht erst am Ende abhaken. Standardprozess + Mandatswissen + Vertretungssicherheit.",
    category: "DATEV",
    source: "Internes Team-Handout — DATEV ProChecklisten.",
    keywords: /procheck|prochecklist|checkliste.*datev|datev.*checkliste|vorgangsmappe.*check/i,
    body: `ProCheck ist ein laufendes Arbeitswerkzeug, kein Pflicht-Häkchen am Ende. Ideal: Checkliste während der Bearbeitung geöffnet halten und Punkte direkt abhaken.

Zugang
- Direkt über ProCheck, über Schnellinfos beim Mandanten, über Karteikarten/Leistungsbereiche oder aus Fachanwendungen (z. B. Kanzlei-Rechnungswesen).
- Darstellungen: Baumstruktur (hierarchisch) oder Prozesslandschaft/Kacheln (visuell).

Prozessaufbau
- Prozessinformation, Prozesspunkte, Rollen, Teilinformationen, Ziel/Nutzen, Verknüpfungen (DMS, Vorlagen, Leitfäden), Historie.
- Verknüpfungen direkt aus dem Prozess öffnen — System kennt oft schon Mandant, Leistung, Zeitraum.

Wissens- und QM-Plattform
- Bildet auch Strategie-, Abrechnungs-, Datenschutz- und Unterstützungsprozesse ab.
- Suche: Volltext, letzte Änderungen, Verknüpfungen, Zuständigkeiten.
- QM-Chatbot in Langdock ergänzt die klassische Suche, aber nur so aktuell wie die letzte QM-Datenbasis.

Mandatswissen ergänzen
- Prozessgrundlage und Checklistenbasis sind standardisiert und nicht beliebig veränderbar.
- Mandantenhinweise, Notizen, fallbezogene Besonderheiten, Zuständigkeiten sind ergänzbar.
- Wiederholungen: monatlich/jährlich direkt möglich; quartalsweise/halbjährlich über gezielte Monate lösen.

Notiz vs. Detailinformation
- Notiz: gilt nur für die konkrete Checkliste/diesen Zeitraum, situativ.
- Detailinformation: dauerhaft, läuft in Folge-Checklisten mit.
- Faustregel: einmalig = Notiz, dauerhaft = Detailinformation.

Qualitätsmaßstab
- Eine gute Checkliste enthält Datenherkunft, Vorsysteme, Importlogik, Bearbeitungsbesonderheiten, dauerhafte Hinweise, Verknüpfungen, Zuständigkeiten und Vertretungswissen.
- Test: Eine Vertretung kann das Mandat damit sicher und nachvollziehbar bearbeiten.`,
  },
  {
    id: "kassen-datenanalyse",
    title: "Kassenprozesse, Datenanalyse und prüfbare Kassendaten",
    short:
      "IKS, Risikoanalyse, Statistik, Benford/Chi-Quadrat, Visualisierung sowie DSFinV-K- und TSE-Datenexport.",
    category: "Buchhaltung",
    source: "Internes Team-Handout — Kassenprozesse, Datenanalyse und prüfbare Kassendaten.",
    keywords: /dsfinv|tse[- ]?archiv|kassennachschau|benford|chi[- ]?quadrat|kassendaten|kassenrisik|stornoquote|z[- ]?bon/i,
    references: ["§ 146a AO", "§ 147 Abs. 6 AO", "KassenSichV", "DSFinV-K"],
    body: `Leitgedanke: Erst Prozessqualität, dann Datenanalyse. Schlechte Daten werden durch Analyse nicht gut.

IKS und Risikoanalyse
- Gesamtrisiko ist mandatsindividuell: Kneipe, Kiosk, Restaurant und Filialbetrieb haben andere Risiken.
- Vorgehen: Risiko identifizieren → Folge beschreiben → Eintrittswahrscheinlichkeit → Auswirkung → Gesamtrisiko → Maßnahme/Kontrolle.
- Typische Risikofelder: unberechtigter Zugriff, fehlende Funktionstrennung, fehlerhafte/unvollständige Erfassung, Stornos, Kassendifferenzen, TSE-/Meldepflichten.

Kontrollen und Verantwortlichkeiten
- Rollen, Rechte, Prüfintervalle, klare Zuständigkeiten.
- Datenexport vor Außenprüfung organisieren — nicht erst dann.
- TSE-Ausfälle/Offline-Status wahrnehmen, dokumentieren, nachverfolgen.

Statistik-Grundlagen
- Mittelwert ist anfällig für Ausreißer; Median und Quantile sind oft aussagekräftiger.
- Verteilung schlägt eine einzelne Kennzahl.
- Boxplot: Lage, Quartile, Streuung, Ausreißer für Vergleiche von Monaten, Filialen, Kassen.

Ziffernanalysen
- Benford-Verteilung der führenden Ziffer ist ein starkes Indiz — aber nur bei geeigneten, sauberen Datensätzen.
- Chi-Quadrat vergleicht Erwartung mit Beobachtung; Freiheitsgrade und Signifikanzniveau einordnen.
- Merksatz: statistische Auffälligkeit + weitere Sachverhaltsfeststellungen = belastbarer Prüfungsansatz.

DSFinV-K, TSE und Datenexport
- Fachliche Exportdaten (DSFinV-K), technische Archivdaten (TSE) und organisatorische Aufbewahrung müssen zusammenpassen.
- Lücken in fortlaufenden Nummern oder Signaturfolgen sind regelmäßig erklärungsbedürftig.

Minimalstandard für die Kanzlei
- Mandat risikoorientiert einordnen, Datenverfügbarkeit und Exportfähigkeit sicherstellen, Grundprüfung auf Lücken und Plausibilität, Auffälligkeiten dokumentieren.`,
  },
  {
    id: "dms-dokumentenmanagement",
    title: "DMS — Dokumentenmanagement in der Kanzlei",
    short:
      "Revisionssicherheit, Ablageknigge, Status, Suche, Vorgangsmappen, Ein-/Auschecken.",
    category: "DATEV",
    source: "Internes Meeting-Handout — DMS Dokumentenmanagementsystem.",
    keywords: /\bdms\b|dokumentenmanagement|ablagekn|vorgangsmappe|einchecken|auschecken|zur erledigung/i,
    body: `Grundprinzipien
- Revisionssicherheit: alle Änderungen nachvollziehbar, jede Version bleibt abrufbar, frühere Fassungen werden nicht überschrieben.
- Nur fachlich und rechtlich zulässige Inhalte ablegen. Sensible/belastende Informationen gehören nicht in Aktennotizen.

Zugriff
- Mandantenbezogen: Schnellinfo zeigt alle Dokumente mit Betreff, Veranlagungsjahr, Status, Bearbeitung.
- Mandantenübergreifend: „Zur Erledigung“ ist die zentrale Arbeitsliste — mehrmals täglich prüfen und schlank halten.

Bearbeitung
- Status über kontextbezogene Links rechts effizient setzen; nicht benötigte Status ausblenden.
- Falsch zugeordnete Dokumente an den zuständigen Mitarbeiter weiterleiten.
- Notizen und Aufgaben direkt am Dokument anlegen; Aufgaben sind mandatsbezogen sichtbar.
- Öffnen per Viewer (Auge) für Sichtprüfung — geöffnete Dokumente werden ausgecheckt. Vor Arbeitsende kontrollieren, dass alles wieder eingecheckt ist.

Suche und Ablage
- Schnellsuche: Beschreibung und Attribute. Volltextsuche: zusätzlich Dokumentinhalt.
- Ablagestruktur nicht als primären Suchweg nutzen.
- Ablageknigge konsequent wählen; „Sonstiges“ nur mit aussagekräftiger Beschreibung.
- Attribute pflegen: Auftrag, Jahr, Monat, Bearbeiter, Status, Stichworte; bei mehrjährigem Bezug weitere Jahre ergänzen.

Weitere Funktionen
- Anpinnen, Kopieren (unabhängig vs. verknüpft), Löschen erfolgt zunächst in einen Zwischenstatus.
- Übergabe an andere DATEV-Anwendungen oder Export zur lokalen Speicherung.

Neue Dokumente, Dummys, Vorgangsmappen
- Nur vorgesehene Kanzlei-Vorlagen verwenden; Absenderangaben korrekt wählen.
- Dummy-Dokument anlegen, wenn Unterlagen ohne E-Mail-Trägerdokument eingehen — sonst fehlen sie in „Zur Erledigung“.
- Vorgangsmappen für Jahresabschlüsse: vordefinierte Struktur; nicht benötigte Unterordner erst nach Prüfung entfernen.`,
  },
  {
    id: "datev-rewe-tipps",
    title: "DATEV Kanzlei-Rechnungswesen — Tipps und Tricks",
    short:
      "Arbeitsplatz und Rechnungswesen-Programm an eigene Arbeitsweise anpassen, schneller buchen, Forderungen im Blick.",
    category: "DATEV",
    source: "Internes Lernvideo-Handout — DATEV Kanzlei-Rechnungswesen Tipps und Tricks.",
    keywords: /kanzlei[- ]?rechnungswesen|datev arbeitsplatz|musterbest|buchungsperiode|festschreibung|gebucht[- ]?bis/i,
    body: `Ihre Arbeitsweise ist Programm
- DATEV Arbeitsplatz: Mandanten suchen, sortieren, gruppieren und filtern. Spalten konfigurieren — z. B. Festschreibungsanzeige (grün/gelb), UStVA-Rhythmus (M/Q), Gebucht-bis-Datum, zuletzt übermittelte Zeiträume.
- Arbeitsblatt „Heute“ zeigt zuletzt bearbeitete Leistungen und ist anpassbar.
- Kanzlei-Rechnungswesen: Navigationsbereich um häufig genutzte Funktionen/Auswertungen erweitern (z. B. konsolidierte UStVA, Kreditor anlegen). Anpassung ist benutzerbezogen.

Buchen
- Buchungen ändern/berichtigen: schnelle Korrekturwege statt Stornieren-und-Neubuchen; Buchungen ausschneiden und einfügen.
- Einstellungen Buchungszeile: Tastenkürzel und Spaltenlogik nutzen.
- Buchungstexte und Konto-Notizen: Kontenbeschriftung mit „k÷“ (Ziffernblock) in den Buchungstext übernehmen.

Forderungen im Blick
- OPOS-Auswertungen und Mahnwesen aus dem Rechnungswesen heraus steuern; Altersstruktur regelmäßig prüfen.

Helfer für den Alltag
- Tastenkürzel, individuelle Listenfilter, persönliche Favoriten — viele kleine Schritte sparen täglich Zeit.

Musterbestände nutzen
- DATEV-Musterkanzlei (Muster GmbH) zum Üben neuer Funktionen, ohne Echtdaten zu gefährden.

Buchungsperiode abschließen
- Festschreibung sauber durchführen, Stand der Buchführung dokumentieren, vor Abgabe der UStVA prüfen.`,
  },
  {
    id: "automatisierungsservice-rechnungen",
    title: "Automatisierungsservice Rechnungen — Voraussetzungen und AS1",
    short:
      "Voraussetzungen, Aktivierung, Symbolik (grün/gelb/rot), echte Automatisierung über die Spalte AS1 messen.",
    category: "DATEV",
    source: "Internes Team-Handout — Automatisierungsservice Rechnungen (Kanzlei-Rechnungswesen).",
    keywords: /automatisierungsservice|as1[- ]?spalte|robotersymbol|e[- ]?rechnung.*automatik|automatisierungsgrad/i,
    body: `Zielbild
- Der Automatisierungsservice unterstützt die Verarbeitung von Eingangs- und Ausgangsrechnungen im DATEV-Rechnungswesen.
- Er lebt von Datenhistorie, wiederkehrenden Mustern und einer sauberen digitalen Prozesskette.

Voraussetzungen
- Regelmäßige Sendung ins Rechenzentrum (aktuelle Datenbasis).
- Ausreichende Dokumentenhistorie (offiziell mind. zwei Jahre, praktisch zählt Wiederkehr und Menge).
- OPOS aktiviert und tatsächlich genutzt.
- Behandlungsform „Standard“ (ggf. vor Aktivierung von „Erweitert“ umstellen).
- SKR03 oder SKR04, keine Branchenpakete, kein selbstbuchender Mandant.
- Digitale Belege werden bereits gebucht.

Stammdaten und E-Rechnungen
- System schlägt bei neuen Geschäftspartnern vorbefüllte Stammdaten vor.
- Bei E-Rechnungen können neue Geschäftspartner im Hintergrund automatisch angelegt werden (Einstellung in „Eigenschaften → Digitale Belege“).
- Sonderfälle wie Tankstellen-Filialen sind Prozessentscheidungen — nicht jeder Lieferant muss perfekt zusammengeführt werden.

Aktivierung
- In Kanzlei-Rechnungswesen über „Bestand → Automatisierungsservices“; System prüft Voraussetzungen.
- Robotersymbol in der Statuszeile zeigt nur an, dass mindestens ein Service aktiv ist.
- Pragmatisch testen und beobachten statt theoretisch zerdenken; bei fehlendem Mehrwert wieder deaktivieren.

Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung erforderlich.
- Rot: kein Vorschlag bzw. Fehler → Sachverhalt klären.

AS1-Spalte und echter Automatisierungsgrad
- Spalte AS1 ist standardmäßig nicht sichtbar; je Bestand über Rechtsklick → „Einstellungen Liste“ aktivieren.
- Zeigt, welche Buchungen wirklich vollautomatisch verarbeitet wurden (kein menschlicher Eingriff).
- Sobald ein Buchungssatz erneut geöffnet, bestätigt oder verändert wird, verschwindet die Kennzeichnung für Vollautomatik.
- AS1 ist sichtbar in Primanota/passender Ansicht, nicht im Grundblatt.

Team-Empfehlung
- Systemvorschläge nicht aus Gewohnheit bekämpfen — Prozesse so aufsetzen, dass das System möglichst oft recht hat.
- Manuelle Eingriffe reduzieren, AS1 regelmäßig auswerten, Mehrwert pro Bestand kritisch bewerten.`,
  },
];

// Hilfsmittel für die Wissensbasis-Suche (analyze.ts)
export function findKnowledgeEntry(text: string): KBEntry | null {
  for (const e of KNOWLEDGE_BASE) if (e.keywords.test(text)) return e;
  return null;
}
