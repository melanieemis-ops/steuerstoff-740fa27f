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
  {
    id: "steuern-grundlagen",
    title: "Steuern — Grundlagen und Systematik",
    short:
      "Was Steuern sind, Abgrenzung zu Gebühren/Beiträgen, Steuerarten im deutschen Steuersystem.",
    category: "Buchhaltung",
    source: "Allgemeines Grundlagenwissen (interne Aufbereitung).",
    keywords: /(was\s+(ist|sind)\s+(eine\s+)?steuer)|steuerarten|steuersystem|steuerrecht\s+grundlagen|abgabenarten|grundbegriffe\s+steuer/i,
    references: ["§ 3 AO"],
    body: `Steuern sind Geldleistungen, die ein öffentlich-rechtliches Gemeinwesen (Bund, Länder, Gemeinden) zur Erzielung von Einnahmen allen auferlegt, bei denen der gesetzliche Tatbestand zutrifft — ohne Anspruch auf eine konkrete Gegenleistung (Legaldefinition § 3 Abs. 1 AO).

Abgrenzung zu anderen Abgaben:
- Gebühr: Entgelt für eine konkrete Amtshandlung (z. B. Passgebühr).
- Beitrag: Entgelt für die Möglichkeit der Inanspruchnahme einer Leistung (z. B. IHK-Beitrag).
- Sonderabgabe: Finanzierung gruppennütziger Zwecke.

Einteilung der Steuern:
1) Nach Bemessungsgrundlage
   - Ertragsteuern: Einkommensteuer, Körperschaftsteuer, Gewerbesteuer.
   - Verkehrsteuern: Umsatzsteuer, Grunderwerbsteuer, Versicherungsteuer.
   - Substanzsteuern: Grundsteuer, Erbschaft-/Schenkungsteuer.
   - Verbrauchsteuern: Energiesteuer, Tabaksteuer, Kaffeesteuer.

2) Nach Steuergläubiger
   - Bundessteuern (z. B. Energiesteuer, Versicherungsteuer).
   - Landessteuern (z. B. Erbschaftsteuer, Grunderwerbsteuer).
   - Gemeindesteuern (z. B. Grundsteuer, Gewerbesteuer).
   - Gemeinschaftsteuern (USt, ESt, KSt — Ertrag wird aufgeteilt).

3) Nach Überwälzbarkeit
   - Direkte Steuern: Steuerschuldner = Steuerträger (ESt, KSt).
   - Indirekte Steuern: werden überwälzt (USt, Verbrauchsteuern).

Wichtige Steuerarten in der Praxis:
- Einkommensteuer (EStG) — natürliche Personen.
- Körperschaftsteuer (KStG) — juristische Personen, 15 % + SolZ.
- Gewerbesteuer (GewStG) — Gewerbebetriebe, Hebesatz der Gemeinde.
- Umsatzsteuer (UStG) — 19 %/7 %, indirekt, EU-harmonisiert.
- Lohnsteuer — Erhebungsform der ESt, Arbeitgeber haftet.
- Erbschaft-/Schenkungsteuer (ErbStG) — siehe eigener Eintrag.
- Grunderwerbsteuer, Grundsteuer, Kfz-Steuer, Kapitalertragsteuer.

Grundprinzipien:
- Gesetzmäßigkeit der Besteuerung (Art. 20 Abs. 3 GG, § 3 Abs. 1 AO).
- Gleichmäßigkeit (Art. 3 GG).
- Leistungsfähigkeitsprinzip.
- Bestimmtheitsgrundsatz.

Verfahrensrechtlicher Rahmen: Abgabenordnung (AO) — Mantelgesetz für alle Steuerarten (Festsetzung, Erhebung, Vollstreckung, Rechtsbehelfe).`,
  },
  {
    id: "erbschaftsteuer-grundlagen",
    title: "Erbschaft- und Schenkungsteuer — Grundlagen",
    short:
      "Steuerpflicht, Steuerklassen, Freibeträge, Bewertung und Tarif nach ErbStG.",
    category: "Buchhaltung",
    source: "Interne Musterlösung Übungsklausur ErbSt/Bewertung (Rechtsstand 2024).",
    keywords: /erbschaftsteuer|erbst\b|schenkungsteuer|erbstg|nachlass|erbanfall|§\s*15\s*erbstg|§\s*16\s*erbstg|freibetrag\s+erbe/i,
    references: ["§§ 1, 3, 9, 10, 15, 16, 19 ErbStG", "§§ 11, 151, 182 ff. BewG", "§ 1922 BGB"],
    body: `Die Erbschaft- und Schenkungsteuer erfasst den unentgeltlichen Vermögensübergang von Todes wegen (§ 3 ErbStG) bzw. unter Lebenden (§ 7 ErbStG).

Steuerpflicht:
- Unbeschränkt steuerpflichtig (§ 2 Abs. 1 Nr. 1 ErbStG), wenn Erblasser/Schenker oder Erwerber zum Zeitpunkt der Steuerentstehung Inländer ist (Wohnsitz/gewöhnlicher Aufenthalt im Inland, § 8/§ 9 AO).
- Beschränkt steuerpflichtig: nur Inlandsvermögen.
- Steuer entsteht mit dem Tod des Erblassers bzw. Ausführung der Schenkung (§ 9 ErbStG). Dieser Tag ist Bewertungsstichtag (§ 11 ErbStG).

Steuerklassen (§ 15 ErbStG):
- StKl I: Ehegatten, Lebenspartner, Kinder, Stiefkinder, Enkel, bei Erbfall auch Eltern/Großeltern.
- StKl II: Geschwister, Nichten/Neffen, Stiefeltern, Schwiegerkinder, geschiedene Ehegatten.
- StKl III: alle übrigen Erwerber.

Persönliche Freibeträge (§ 16 ErbStG):
- Ehegatte/Lebenspartner: 500.000 €.
- Kinder/Stiefkinder: 400.000 €.
- Enkel: 200.000 € (400.000 €, wenn Elternteil verstorben).
- Eltern bei Erbfall: 100.000 €.
- StKl II/III: 20.000 €.
Zusätzlich: Versorgungsfreibetrag (§ 17 ErbStG), Hausrat-/Pkw-Freibetrag (§ 13 Abs. 1 Nr. 1 ErbStG: 41.000 € Hausrat / 12.000 € andere bewegliche Gegenstände in StKl I).

Steuertarif (§ 19 ErbStG): progressiv nach Erwerb und StKl, z. B. StKl I bis 600.000 € = 15 %, bis 6 Mio. € = 19 %, bis 13 Mio. € = 23 %.

Bewertung (BewG):
- Anteile an nicht notierten Kapitalgesellschaften: gemeiner Wert; vorrangig IDW-S1/vereinfachtes Ertragswertverfahren; Substanzwert als Mindestwert (§ 11 Abs. 2 BewG). Gesonderte Feststellung nach § 151 Abs. 1 Nr. 3 BewG.
- Grundbesitz: gesonderte Feststellung nach § 151 Abs. 1 Nr. 1 BewG; je nach Grundstücksart Vergleichs-, Ertrags- oder Sachwertverfahren (§§ 182 ff. BewG).
- Niedrigerer gemeiner Wert kann nach § 198 BewG durch Gutachten nachgewiesen werden.

Begünstigungen:
- §§ 13a/13b ErbStG: Begünstigung von Betriebsvermögen, qualifizierten Kapitalgesellschafts­anteilen (Mindestbeteiligung > 25 %) und land-/forstwirtschaftlichem Vermögen; Verschonungsabschlag 85 % oder 100 %, Lohnsummenregelung, Behaltensfrist.
- § 13d ErbStG: 10 %-Abschlag für zu Wohnzwecken vermietete Grundstücke.
- § 13 Abs. 1 Nr. 4b/c ErbStG: Familienheim für Ehegatten/Kinder.

Nachlassverbindlichkeiten (§ 10 Abs. 5 ErbStG):
- Erblasserschulden (z. B. Hypotheken).
- Erbfallschulden (Pflichtteile, Vermächtnisse, Beerdigungs- und Nachlassregelungskosten; Pauschbetrag 10.300 €).

Berechnungsschema:
Wert des Vermögensanfalls (Aktiva, jeweils gesondert bewertet)
./. sachliche Befreiungen (§ 13 ErbStG)
./. Nachlassverbindlichkeiten (§ 10 Abs. 5 ErbStG)
= Bereicherung (§ 10 Abs. 1 ErbStG)
./. persönlicher Freibetrag (§ 16 ErbStG)
./. Versorgungsfreibetrag (§ 17 ErbStG)
= steuerpflichtiger Erwerb (abgerundet auf volle 100 €, § 10 Abs. 1 S. 6 ErbStG)
× Steuersatz § 19 ErbStG
= festzusetzende Erbschaftsteuer

Praxisbeispiel (Auszug Musterlösung 2024): Enkel erbt nach verstorbenem Vater Vermögen mit GmbH-Anteil 22 %, gemischt genutztem Grundstück, EFH, Hausrat, Pkw, Bankguthaben. Bereicherung 3.421.081 € ./. Freibetrag 400.000 € = stpfl. Erwerb 3.021.000 € × 19 % = 573.990 € ErbSt.

Vorerwerbe (§ 14 ErbStG): Erwerbe innerhalb von 10 Jahren von derselben Person werden zusammengerechnet.`,
  },
  {
    id: "datev-esteuern-prozess",
    title: "DATEV eSteuern — digitaler Einkommensteuerprozess",
    short:
      "Vollmacht, vorausgefüllte Steuererklärung, Steuerkonto online, Bescheiddatenabgleich und DIVA 2 im Überblick.",
    category: "DATEV",
    source: "Internes Handout NPO-Team — DATEV eSteuern.",
    keywords: /esteuern|vorausgefüllte? steuererklärung|steuerkonto\s+online|bescheiddaten|diva\s*2|vollmachtsdatenbank/i,
    body: `Der DATEV eSteuern-Einkommensteuerprozess ermöglicht eine weitgehend papierlose Bearbeitung von der Vorbereitung bis zum Bescheid.

Bausteine
- Vollmacht / Vollmachtsdatenbank: Grundlage für alle digitalen Abrufe.
- Vorausgefüllte Steuererklärung (VaSt): Lohnsteuerbescheinigungen, Rentenbezüge, Vorsorgeaufwendungen elektronisch übernehmen.
- Steuerkonto online: offene Beträge, geleistete Zahlungen, Sollstellungen / Vorauszahlungen abrufen.
- Post, Fristen und Bescheide: Bescheiddatenabgleich; automatische Anzeige von Abweichungen Erklärung ↔ Bescheid.
- DIVA 2: digitale Zustellung von Bescheiden und Finanzamtsdokumenten ins DMS.

Voraussetzungen
- Hinterlegte Vollmacht, gesetztes Vollmachtszeichen.
- Abruffreigabe für VaSt und Steuerkonto online.
- Mandant beim Finanzamt registriert.
- Bei Abruffehlern zuerst Registrierung, Vollmacht und Freigaben prüfen — nicht nur Warnhinweise.

Steuerkonto online — Abrufweg
Mandant auswählen → Rechtsklick „Abfrage ausgewählter Mandant“ → offene Beträge / geleistete Zahlungen / Sollstellungen wählen.

Bescheiddatenabgleich
- Bescheiddaten früh prüfen.
- Abweichungen zur abgegebenen Erklärung werden markiert; Einspruchsfristen im Auge behalten.

DIVA 2
- Digitaler Eingang von Finanzamtsdokumenten.
- Ablage automatisiert in DMS, Verknüpfung zum Mandantenakt.

Team-Workflow
1) Vorbereitung: Vollmacht/Freigaben prüfen, VaSt + Steuerkonto online ziehen.
2) Bearbeitung: Erklärung erstellen, digitale Optionen aktiv mitdenken.
3) Nachgelagert: Bescheiddatenabgleich, DIVA 2-Eingang prüfen, Fristen sichern.`,
  },
  {
    id: "datev-lerndateien",
    title: "DATEV Lerndateien & Buchungsvorschläge",
    short:
      "Kriterien richtig wählen, Sternchen-Platzhalter, automatisiertes Buchen, AS1-Spalte und Aufräumen bestehender Bestände.",
    category: "DATEV",
    source: "Internes Handout — Lerndateien, Buchungsvorschläge & Automatisierung.",
    keywords: /lerndatei|buchungsvorschlag|automatisches buchen|sternchen.*platzhalter|alt\s*\+\s*-|strg\s*\+\s*l/i,
    body: `Grundsatz: So wenig Kriterien wie möglich, so viel wie nötig. Eine Lerndatei soll den wiederkehrenden Sachverhalt präzise treffen.

Anlegen
- Wege: Funktion oben im Programm, Shortcut Alt + -, oder STRG + L.
- Oben: Was soll gebucht werden (Konto, Personenkonto, Aufteilung).
- Unten: Wann soll die Lerndatei greifen (Kriterien je Rechnungskreis).

Geeignete Kriterien
- Wiederkehrende Begriffe im Verwendungszweck.
- Stabile Auftraggeber/Geschäftspartner kombiniert mit weiteren Kriterien.
- Transaktionstypen bei PayPal/Amazon.
- Ware/Leistung bei Eingangs- und Ausgangsrechnungen.

Riskante Kriterien
- Datum, Monat, Zeitraum (z. B. 06/23).
- Rechnungsnummern, laufende Referenzen.
- Wechselnde Beträge, zufällige Zeichenketten.
- Zu kurze Stichwörter (z. B. nur „AAG“).
- Nur der Auftraggeber, wenn unterschiedliche Sachverhalte möglich sind.

Sternchen-Platzhalter
- *Einzahlung* — beliebiger Text vor/nach „Einzahlung“.
- *Erstattung*AAG* — beide Stichwörter müssen vorkommen.
- *Beitr*ge* — deckt „Beiträge“ und „Beitraege“ ab.
- Zu viele Sternchen oder zu kurze Textteile machen die Lerndatei gefährlich breit.

Lerndateien testen: Transaktionen reimportieren und Vorschläge prüfen.

Buchungsvorschläge — Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung.
- Rot: kein Vorschlag/Fehler → Sachverhalt klären.

Automatisiertes Buchen
- Erst aktivieren, wenn Vorschläge stabil greifen und erste Zeiträume plausibel geprüft sind.
- AS1-Spalte zeigt den tatsächlichen Vollautomatisierungsgrad; standardmäßig ausgeblendet, über Listen-Einstellungen aktivieren.
- Sobald ein Buchungssatz erneut geöffnet oder verändert wird, entfällt die AS1-Kennzeichnung.

Pflege bestehender Bestände
- Übernommene Bestände kritisch prüfen: leere, redundante oder zu allgemeine Lerndateien aufräumen.
- Lerndateien, die nur einmal greifen, verschwenden Pflegeaufwand.

Neue Prüfungslogik
- Weg von der Einzelfallkontrolle jedes Belegs, hin zu risikoorientierter Stichprobe und gezielter Kontrolle der gelben/roten Fälle.`,
  },
  {
    id: "kfz-wertabgabe-1prozent",
    title: "Kfz-Wertabgabe nach 1-%-Methode",
    short:
      "Berechnung der privaten Kfz-Nutzung, USt-Aufteilung # 8921 0 / # 8924 0 und Kostendeckelung.",
    category: "DATEV",
    source: "Internes Arbeitspapier — JA Vorlage Unentgeltliche Wertabgaben Kfz.",
    keywords:
      /(1\s*%|1-%|ein\s*prozent)[-\s]*methode|kfz.?wertabgabe|private\s+kfz.?nutzung|bruttolistenpreis|kostendeckelung|8921|8924|fahrten\s+wohnung.?betrieb|firmenwagen/i,
    references: ["# 8921 0", "# 8924 0", "# 4679 0", "# 4680 0", "§ 6 Abs. 1 Nr. 4 EStG"],
    body: `Die 1-%-Methode pauschaliert den privaten Nutzungsanteil eines betrieblichen Fahrzeugs. Voraussetzung ist regelmäßig eine betriebliche Nutzung von mehr als 50 %.

1) 1-%-Wert (Privatfahrten)
- Bruttolistenpreis auf volle 100 € abgerundet × 1 % × Nutzungsmonate.
- 20-%-Abschlag für nicht vorsteuerbelastete Kosten kürzt die Bemessungsgrundlage USt.
- USt 19 % auf die verbleibende BMG vor Kostendeckelung.

2) Fahrten Wohnung / Betrieb (0,03 %)
- 0,03 % vom Bruttolistenpreis × Entfernungskilometer × Nutzungsmonate.
- Abzüglich Arbeitstage × Entfernung × 0,30 € (Entfernungspauschale).
- Differenz = nicht abzugsfähige Betriebsausgaben → außerbilanzielle Korrektur
  per # 4679 0 an # 4680 0.

3) Kostendeckelung
- Mit Vorsteuer belastete Fahrzeugkosten netto = Gesamtfahrzeugkosten netto
  abzüglich nicht mit Vorsteuer belastete Kosten.
- Maximalwert für die USt-Bemessungsgrundlage = 50 % der mit Vorsteuer belasteten
  Fahrzeugkosten netto.
- Tatsächliche BMG # 8921 0 = Minimum aus 1-%-BMG und 50-%-Deckel.

4) DATEV-Konten
- # 8921 0 Unentgeltliche Wertabgaben Kfz 19 % USt.
- # 8924 0 Unentgeltliche Wertabgaben Kfz ohne USt.
- Differenz zwischen 1-%-Wert + Fahrten W/B und BMG # 8921 0 wird auf # 8924 0
  ausgewiesen.

5) Typische Vorsteuer-Einordnung
- Ohne Vorsteuer: Kfz-Steuer, Kfz-Versicherung, Schuldzinsen (regelmäßig).
- Mit Vorsteuer: Kraftstoff, Reparaturen, Wagenpflege (ordnungsgemäße Rechnung).
- Versicherungsentschädigungen als negativer Betrag erfassen.

Hinweis: Berechnung ist Arbeitshilfe — Bruttolistenpreis, Nutzungsmonate,
Vorsteueranteile und DATEV-Buchungen fachlich prüfen.`,
  },
  {
    id: "gobd",
    title: "GoBD – digitale Buchführung und Aufbewahrung",
    short:
      "Grundsätze für elektronische Buchführung, digitale Belege, Aufbewahrung, Verfahrensdokumentation und Datenzugriff.",
    category: "DATEV",
    source: "BMF-Schreiben zu den GoBD; kanzleiinterne Arbeitshinweise.",
    keywords: /gobd|verfahrensdokumentation|belegprinzip|unveränderbarkeit|datenzugriff|z1\s|z2\s|z3\s/i,
    references: ["BMF-Schreiben GoBD", "§ 145 ff. AO", "§ 147 Abs. 6 AO", "§ 238 ff. HGB"],
    body: `Die GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff) sind ein BMF-Schreiben. Sie konkretisieren, wie elektronische Buchführung und digitale Belegverarbeitung aus Sicht der Finanzverwaltung ordnungsgemäß und prüfbar sein müssen.

1) Für wen relevant
- Alle Buchführungs- und Aufzeichnungspflichtigen (HGB, AO, EStG).
- Auch EÜR-Fälle, wenn Aufzeichnungen elektronisch geführt werden.
- Praktisch: jede Kanzlei, jeder Mandant mit DATEV Unternehmen online, jede Kasse, jedes Vorsystem.

2) Kernanforderungen
- Nachvollziehbarkeit und Nachprüfbarkeit
- Vollständigkeit
- Richtigkeit
- zeitgerechte Erfassung
- Ordnung
- Unveränderbarkeit
- Belegfunktion ("keine Buchung ohne Beleg")

3) Verfahrensdokumentation
- Pflicht: schriftliche Beschreibung aller IT-gestützten Prozesse rund um steuerrelevante Daten.
- Inhalte: allgemeine Beschreibung, Anwender-/Technik-Dokumentation, Betriebsdokumentation, internes Kontrollsystem.
- Muss jederzeit prüfbar sein und mit der gelebten Praxis übereinstimmen.

4) Unveränderbarkeit / Belegprinzip
- Einmal erfasste Buchungen und archivierte Belege dürfen nicht unbemerkt geändert werden.
- Änderungen sind protokolliert und nachvollziehbar (Journal, Versionierung).
- Belege sind im Ursprungsformat revisionssicher zu archivieren.

5) Datenzugriff (§ 147 Abs. 6 AO)
- Z1: unmittelbarer Zugriff der Finanzverwaltung auf das System (read-only).
- Z2: mittelbarer Zugriff – Auswertung durch das Unternehmen.
- Z3: Datenträgerüberlassung (z. B. GDPdU-/IDEA-Export).

6) Typische Kanzlei-Prüfpunkte
- Liegt eine aktuelle Verfahrensdokumentation vor?
- Werden digitale Belege unveränderbar archiviert (z. B. DATEV Unternehmen online, DMS)?
- Gibt es ein Kassensystem oder Vorsystem? TSE vorhanden?
- Werden Belege zeitnah erfasst (Belegdatum vs. Buchungsdatum)?
- Ist der Datenzugriff für eine Betriebsprüfung möglich (Export, Berechtigungen)?
- Aufbewahrungsfristen (i. d. R. 10 Jahre Buchungsbelege, 6 Jahre Handels-/Geschäftsbriefe) eingehalten?

Hinweis: GoBD-Verstöße können zur Verwerfung der Buchführung und zu Hinzuschätzungen führen (§ 162 AO). Frühzeitige Dokumentation und revisionssichere Archivierung sind die wichtigste Prävention.`,
  },
  {
    id: "erbschaftsteuer-merksaetze",
    title: "Erbschaftsteuer & Bewertung — Merksätze",
    short:
      "Erbanfall, Vor-/Nacherbschaft, Nachlassverbindlichkeiten, Familienheim, nicht notierte Anteile und Grundbesitzbewertung.",
    category: "Jahresabschluss",
    source: "Internes Handout — ErbSt / EStG / Bilanzierung / UmwStG.",
    keywords: /erbanfall|vorerbe|nacherbe|nachlassverbindlich|familienheim|gemischte schenkung|erbfallkostenpauschale|gemeiner wert|substanzwert|grundbesitzwert|ertragswertverfahren|bodenrichtwert|denkmalgeschützt/i,
    references: [
      "§§ 1, 3, 6, 7, 9, 10, 11, 12, 13, 20 ErbStG",
      "§§ 11, 151, 182–198 BewG",
      "§ 1922 BGB",
    ],
    body: `1) Erwerb von Todes wegen
- Erbanfall durch Gesamtrechtsnachfolge (§§ 1922 BGB, 1 Abs. 1 Nr. 1, 3 Abs. 1 Nr. 1 ErbStG).
- ErbSt entsteht mit dem Tod des Erblassers (§ 9 Abs. 1 Nr. 1 ErbStG); Bewertungsstichtag ist der Todestag (§ 11 ErbStG).
- Unbeschränkte Steuerpflicht bei Inländer­eigenschaft (§ 2 Abs. 1 ErbStG).
- Steuerschuldner ist der Erwerber (§ 20 Abs. 1 ErbStG).
- Steuerpflichtiger Erwerb = Bereicherung (Vermögensanfall ./. abzugsfähige Nachlassverbindlichkeiten, § 10 Abs. 1 ErbStG).

2) Vor-/Nacherbe & Nachlassverbindlichkeiten
- Steuerlich gilt nur der Vorerbe als Erbe (§ 6 Abs. 1 ErbStG); der Nacherbe erwirbt steuerlich vom Vorerben (§ 6 Abs. 2 S. 1 ErbStG).
- Abzugsfähig nur Schulden, die vom Erblasser herrühren und ihn wirtschaftlich belastet haben (§ 10 Abs. 5 Nr. 1 ErbStG).
- Betagte Vermächtnisse (fällig erst mit Tod des Beschwerten) wie Nacherbschaft behandelt (§ 6 Abs. 4 ErbStG); beim ersten Erbfall keine wirtschaftliche Belastung.
- Erbfallkostenpauschale 10.300 € ohne Nachweis (§ 10 Abs. 5 Nr. 3 S. 2 ErbStG).

3) Schenkung & Familienheim
- Freigebige Zuwendung = Vermögensmehrung beim Bedachten + Vermögens­minderung beim Zuwendenden (§ 7 Abs. 1 Nr. 1 ErbStG).
- Gemischte Schenkung wird bei Wertabweichung > ca. 20–25 % zur Gegenleistung vermutet.
- Familienheim­begünstigung setzt Eigentum oder Miteigentum (auch Gesamthand in GbR) voraus (§ 13 Abs. 1 Nr. 4a–c ErbStG).

4) Nicht notierte Anteile & Grundbesitz
- Nicht notierte Anteile: gemeiner Wert (§ 11 Abs. 2 BewG); Substanzwert als Mindestwert (§ 11 Abs. 2 S. 3 BewG).
- Gesonderte Feststellung nach § 151 Abs. 1 S. 1 Nr. 3 BewG.
- Betriebsgrundstücke: gesondert festgestellte Grundbesitzwerte (§ 12 Abs. 3 ErbStG).
- Gemischt genutzte Grundstücke (weder Wohn- noch Gewerbe > 80 %): Ertragswertverfahren (§ 182 Abs. 3 Nr. 2 BewG).
- Bodenwert = Fläche × angepasster Bodenrichtwert (§ 184 Abs. 2 BewG).
- Mietabweichung > 20 %: übliche Miete zwingend (§ 186 Abs. 2 BewG); Leerstand → übliche Miete ansetzen.
- Umlagefähige Betriebskosten nicht im Rohertrag (§ 186 Abs. 1 S. 2 BewG).
- Reinertrag = Rohertrag ./. pauschale Bewirtschaftungskosten (§ 187 BewG); Gebäudereinertrag = Reinertrag ./. Bodenwertverzinsung (§ 185 Abs. 2 BewG); Gebäudeertragswert = Gebäudereinertrag × Vervielfältiger (§ 185 Abs. 3 BewG).
- Ertragswert = Boden + Gebäudeertragswert (§ 184 Abs. 3 BewG); Bodenwert als Mindestwert, niedrigerer gemeiner Wert nur mit Nachweis (§ 198 BewG).
- 85 % steuerfrei: denkmalgeschützt, unrentierlich, der Allgemeinheit zugänglich (§ 13 Abs. 1 Nr. 2 ErbStG).`,
  },
  {
    id: "betriebsaufgabe-euer",
    title: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    short:
      "Aufgabeerklärung (§ 16 Abs. 3b EStG), Übergang zur Bilanzierung, Fünftelregelung und Behandlung der stillen Reserven.",
    category: "Jahresabschluss",
    source: "Internes Handout — EStG / Betriebsaufgabe.",
    keywords: /betriebsaufgabe|aufgabeerklärung|aufgabegewinn|übergangsgewinn|fünftelregel|teilwert|einlage aus privatvermögen|§\s*16\s*estg|§\s*18\s*abs\.?\s*3\s*estg|§\s*34\s*estg/i,
    references: [
      "§ 4 Abs. 1, 3 EStG",
      "§ 6 Abs. 1 Nr. 5 EStG",
      "§ 11 EStG",
      "§ 15 Abs. 1 EStG",
      "§ 16 Abs. 3, 3b EStG",
      "§ 18 Abs. 3 EStG",
      "§ 34 Abs. 1, 2 Nr. 1 EStG",
      "§§ 7, 8, 9 GewStG",
    ],
    body: `1) Gewerbebetrieb & EÜR
- Einzelhandel ist regelmäßig Gewerbebetrieb (§ 15 Abs. 1 S. 1 Nr. 1 EStG); EÜR nach § 4 Abs. 3 EStG mit Zu-/Abflussprinzip (§ 11 EStG).
- Gewerbeertrag = Gewinn (§ 7 GewStG) zzgl. Hinzurechnungen (§ 8 GewStG), abzgl. Kürzungen (§ 9 GewStG).

2) Aufgabeerklärung
- Aufgabeerklärung wirkt nur bei rechtzeitigem Eingang beim Finanzamt (§ 16 Abs. 3b EStG); Rückwirkung scheitert bei Überschreiten der 3-Monatsfrist.

3) Übergang EÜR → Bilanzierung
- Forderungen erhöhen den Übergangsgewinn (kein Zufluss in EÜR, in der Bilanz zu aktivieren).
- Verbindlichkeiten mindern den Übergangsgewinn (kein Abfluss in EÜR, in der Bilanz zu passivieren).
- Bei Betriebsaufgabe zwingend Übergang zum Betriebsvermögensvergleich (§ 18 Abs. 3 S. 2 EStG) — Ziel: vollständige Erfassung stiller Reserven.

4) Aufgabegewinn
- Außerordentliche Einkünfte (§ 34 Abs. 2 Nr. 1 EStG), Fünftelregelung (§ 34 Abs. 1 EStG).
- Aufgabe = Veräußerung/Entnahme aller wesentlichen Betriebsgrundlagen (§ 16 Abs. 3 EStG); bei Freiberuflern über § 18 Abs. 3 EStG.
- Auch zeitnah entnommene Wirtschaftsgüter einbeziehen (§ 16 Abs. 3 S. 8 EStG).

5) Einlage & Teilwert
- Zuführung aus Privatvermögen = Einlage (§ 4 Abs. 1 S. 8 EStG).
- Mehr als 3 Jahre zwischen Anschaffung und Einlage → Teilwert zwingend (§ 6 Abs. 1 Nr. 5 S. 1 EStG); Teilwert ist neue AfA-Bemessungsgrundlage.

6) Arzt / Freiberufler
- Einkünfte aus selbständiger Arbeit (§ 18 Abs. 1 Nr. 1 EStG); keine Buchführungspflicht nach HGB (§§ 1, 238 HGB), EÜR zulässig.
- Steuerfreie Heilbehandlungen (§ 4 Nr. 14 UStG) führen zu Netto-Einnahmen.

7) GmbH-Anteile im Betriebsvermögen
- Subsidiarität (§ 20 Abs. 8 EStG): Dividenden sind Betriebseinnahmen, keine Kapitaleinkünfte.
- KapESt entfaltet im BV keine Abgeltungswirkung (§ 43 Abs. 5 S. 2 EStG).
- Teileinkünfteverfahren (§ 3 Nr. 40 EStG) bei Beteiligungen im BV.`,
  },
  {
    id: "bilanzierung-immaterielle-rueckstellungen",
    title: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    short:
      "Aktivierungs(verbot/wahlrecht), Herstellungskosten, FIFO/LIFO, drohende Verluste, latente Steuern, IAB, Sammelposten, Krypto.",
    category: "Jahresabschluss",
    source: "Internes Handout — Bilanzierung / IAB / Krypto / latente Steuern.",
    keywords: /immateriell|herstellungskosten|fifo|lifo|teilwertabschreibung|drohverlust|latente steuer|iab|investitionsabzugsbetrag|§\s*7g|sammelposten|krypto|§\s*274|§\s*248|§\s*249|§\s*255/i,
    references: [
      "§§ 246, 247, 248 Abs. 2, 249, 252, 255, 266, 274 HGB",
      "§ 5 Abs. 1, 2, 4a EStG",
      "§ 6 Abs. 1 Nr. 2, 2a, 5, 6 EStG",
      "§ 7 Abs. 1, 4 EStG",
      "§ 7g EStG",
      "§ 15 UStG",
      "BMF 10.05.2022 (Kryptowerte)",
    ],
    body: `1) Immaterielle WG / Herstellungskosten
- Aktivierungswahlrecht für selbst geschaffene immaterielle WG des AV handelsrechtlich (§ 248 Abs. 2 HGB); steuerlich Aktivierungsverbot (§ 5 Abs. 2 EStG) → passive latente Steuern (§ 274 HGB).
- Forschung nicht aktivierbar, Entwicklung aktivierbar (§ 255 Abs. 2a HGB).
- Vertriebskosten nie Teil der HK (§ 255 Abs. 2 S. 4 HGB); MEK/MGK/FEK/FGK Pflicht (§ 255 Abs. 2 HGB).

2) Vorräte
- FIFO steuerlich unzulässig, LIFO zulässig (§ 6 Abs. 1 Nr. 2a EStG); UV-Teilwertabschreibung als Wahlrecht (§ 6 Abs. 1 Nr. 2 S. 2 EStG).

3) Rückstellungen & schwebende Geschäfte
- Drohverluste handelsrechtlich Rückstellung (§ 249 Abs. 1 S. 1 HGB), steuerlich unzulässig (§ 5 Abs. 4a EStG).
- Schwebende Geschäfte werden nicht bilanziert, solange Leistung und Gegenleistung gleichwertig sind (Realisationsprinzip, § 252 Abs. 1 Nr. 4 HGB).

4) Latente Steuern (§ 274 HGB)
- Temporäre Differenz zwischen Handels- und Steuerbilanz × Steuersatz.
- Passive latente Steuern: Ansatzpflicht.
- Aktive latente Steuern: Ansatzwahlrecht.

5) IAB (§ 7g EStG)
- Rein steuerlich; Auflösung/Hinzurechnung fristgerecht, sonst Rückgängigmachung.
- Hinzurechnung/Übertragung max. 50 % der tatsächlichen Anschaffungskosten (netto).
- Geplante kürzere Nutzungsdauer ändert die AfA nicht (§ 7 Abs. 1, Abs. 4 EStG).

6) Sammelposten (§ 6 Abs. 2a EStG)
- Kein Einzelabgang; AfA stur 1/5 p. a. unabhängig von Schaden/Verkauf einzelner WG.

7) Vorsteuer & Anlagevermögen
- Aktivierung des AV und Passivierung der Verbindlichkeit bereits bei Erwerb (§ 246 HGB; § 5 EStG).
- Vorsteuerabzug bei ordnungsgemäßer Rechnung im Leistungs-/Rechnungszeitraum (§ 15 UStG), unabhängig von Zahlung.

8) Kryptowährungen
- Wirtschaftsgüter; Ansatz mit Anschaffungskosten (§§ 246 HGB, 5/6 EStG).
- Krypto-Zahlung oder Krypto-zu-Krypto = Tausch; Erlös = Marktwert der erhaltenen Gegenleistung (§ 6 Abs. 6 EStG; BMF 10.05.2022).`,
  },
  {
    id: "anteilstausch-umwstg",
    title: "Anteilstausch nach § 21 UmwStG",
    short:
      "Kein Rückwirkungszeitraum; Wertansatz gemeiner Wert vs. Buchwert; Voraussetzungen für Buchwertansatz.",
    category: "Jahresabschluss",
    source: "Internes Handout — UmwStG / Anteilstausch.",
    keywords: /anteilstausch|umwstg|§\s*21\s*umwstg|einbringung\s+(von\s+)?anteilen|buchwertansatz/i,
    references: ["§ 21 UmwStG", "§§ 2, 20 Abs. 5/6 UmwStG"],
    body: `1) Zeitpunkt / Rückwirkung
- Steuerlich wirkt der Anteilstausch ab Übergang Nutzen und Lasten — keine Rückwirkung wie bei Verschmelzungen (§§ 2, 20 Abs. 5/6 UmwStG gelten nicht).

2) Wertansatz
- Grundsatz: gemeiner Wert bei der übernehmenden GmbH → beim Einbringenden Veräußerungsgewinn.
- Buchwertansatz auf Antrag möglich (§ 21 Abs. 1 S. 2 UmwStG), wenn die gesetzlichen Voraussetzungen nach Einbringung erfüllt sind (insb. mehrheitsvermittelnde Beteiligung, qualifizierter Anteilstausch).

3) Praxisfolgen
- Buchwertansatz = steuerneutral; gemeiner Wert = Veräußerungsgewinn mit Folgen für KSt/GewSt/ESt.
- 7-jährige Sperrfristen nach § 22 UmwStG bei nachfolgender Anteilsveräußerung beachten.`,
  },
  {
    id: "reverse-charge-grundschema",
    title: "Reverse Charge (§ 13b UStG) — Grundschema & Anwendungsfälle",
    short:
      "Leistender stellt netto, Empfänger schuldet die USt; Vorsteuerabzug gleichzeitig möglich.",
    category: "Umsatzsteuer",
    source: "Internes Handout — Rückstellungen / USt / Mitunternehmerschaft.",
    keywords: /§\s*13b|reverse[\s-]?charge|bauleistung\b|werklieferung\s+ausland|schrott|altgold|co2[\s-]?zertifikat|§\s*25b/i,
    references: [
      "§ 13b Abs. 1, 2 UStG",
      "§ 15 UStG",
      "§ 25b UStG",
      "UStAE 13b.1 ff.",
    ],
    body: `1) Grundschema
- Leistender Unternehmer stellt Netto-Rechnung mit Hinweis "Steuerschuldnerschaft des Leistungsempfängers".
- Leistungsempfänger schuldet die USt und kann sie bei Vorsteuerabzugsberechtigung zeitgleich abziehen (§ 15 UStG) → grundsätzlich liquiditätsneutral.

2) Anwendungsfälle (§ 13b Abs. 2 UStG)
- Nr. 1: Werklieferungen / sonstige Leistungen eines im Ausland ansässigen Unternehmers (i. V. m. § 13b Abs. 1 UStG für ig. sonstige Leistungen nach § 3a Abs. 2 UStG).
- Nr. 4: Bauleistungen, wenn der Empfänger selbst nachhaltig Bauleistungen erbringt.
- Nr. 5: Gas, Elektrizität, Wärme/Kälte unter besonderen Voraussetzungen.
- Nr. 7–11: Schrott, bestimmte Metalle, Altgold, Mobilfunkgeräte/Tablets ab Schwelle, CO₂-Zertifikate.
- Dreiecksgeschäfte: Vereinfachung nach § 25b UStG prüfen.

3) Beispiel Bauleistung
- Subunternehmer (Ausland) berechnet 50.000 € netto an deutschen Generalunternehmer (Bauleistender).
- Empfänger schuldet 9.500 € USt (§ 13b UStG) und zieht sie als Vorsteuer (§ 15 UStG) → liquiditätsneutral.`,
  },
  {
    id: "reihengeschaeft",
    title: "Reihengeschäft (§ 3 Abs. 6, 7 UStG)",
    short:
      "Mehrere Umsatzgeschäfte, eine Warenbewegung; nur eine Lieferung ist die bewegte, alle anderen ruhen.",
    category: "Umsatzsteuer",
    source: "Internes Handout — Reihengeschäft (UStAE 3.14).",
    keywords: /reihengeschäft|bewegte lieferung|ruhende lieferung|ustae 3\.14|§\s*3\s*abs\.?\s*6|§\s*3\s*abs\.?\s*7/i,
    references: [
      "§ 3 Abs. 6, 7 UStG",
      "§ 6a UStG",
      "UStAE 3.14 Abs. 3–11",
    ],
    body: `1) Voraussetzung
- Mehrere Unternehmer schließen Umsatzgeschäfte über denselben Gegenstand ab; nur eine Warenbewegung.

2) Zuordnung der bewegten Lieferung (UStAE 3.14)
- Nur eine Lieferung ist die bewegte (§ 3 Abs. 6 UStG); alle anderen sind ruhende Lieferungen (§ 3 Abs. 7 UStG).
- Maßgeblich, wer den Transport veranlasst:
  • Transport durch ersten Lieferer (A) → A→B bewegt.
  • Transport durch Zwischenhändler (B) → grundsätzlich A→B bewegt (Vermutung); B kann mit USt-IdNr. seines Abgangslandes die bewegte Lieferung auf B→C verlagern.
  • Transport durch letzten Abnehmer (C) → B→C bewegt.

3) Ortsbestimmung
- Bewegte Lieferung: Beginn der Beförderung/Versendung.
- Ruhende Lieferung: Ort der Verschaffung der Verfügungsmacht.

4) Steuerbefreiung
- Bewegte Lieferung kann als innergemeinschaftliche Lieferung (§ 6a UStG) steuerfrei sein, wenn die Voraussetzungen (USt-IdNr., belegmäßige Nachweise, ZM) erfüllt sind.
- Ruhende Lieferung regelmäßig im jeweiligen Belegenheitsstaat steuerbar.

5) Beispiel A → B → C, Transport durch B ins EU-Ausland
- A → B: bewegte Lieferung, Ort DE, ig. Lieferung (§ 6a UStG).
- B → C: ruhende Lieferung, Ort im EU-Bestimmungsland, dort steuerbar.`,
  },
  {
    id: "mitunternehmerschaft",
    title: "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG)",
    short:
      "Initiative + Risiko; gesonderte und einheitliche Feststellung; Sonder- und Ergänzungsbilanzen.",
    category: "Jahresabschluss",
    source: "Internes Handout — Mitunternehmerschaft.",
    keywords: /mitunternehmer|mitunternehmerschaft|sonderbilanz|ergänzungsbilanz|gesamthandsbilanz|§\s*15\s*abs\.?\s*1\s*nr\.?\s*2|atypisch still|kommanditist|komplementär/i,
    references: [
      "§ 15 Abs. 1 Nr. 2 EStG",
      "§ 180 AO",
      "§§ 118, 166 HGB",
    ],
    body: `1) Voraussetzungen
- Mitunternehmerinitiative (Geschäftsführung / Kontrollrechte, §§ 118, 166 HGB) und
- Mitunternehmerrisiko (Beteiligung an Gewinn, Verlust und stillen Reserven incl. Firmenwert).
- Beides muss grundsätzlich kumulativ erfüllt sein.

2) Typische Fälle
- OHG, KG, GbR, atypisch stille Gesellschaft.
- Komplementär: Initiative (+), Risiko (+).
- Kommanditist: Initiative über Kontrollrechte (§ 166 HGB), Risiko über Gewinn-/Verlustbeteiligung; kann Mitunternehmer sein.
- Typisch stiller Gesellschafter: regelmäßig kein Mitunternehmer.

3) Rechtsfolgen
- Einkünfte aus Gewerbebetrieb (§ 15 Abs. 1 Nr. 2 EStG).
- Gesonderte und einheitliche Feststellung (§ 180 AO).
- Steuerliches Gesamtergebnis = Gesamthandsbilanz + Sonderbilanzen + Ergänzungsbilanzen.

4) Sonder- vs. Ergänzungsbilanz
- Sonderbilanz: Wirtschaftsgüter im Sonderbetriebsvermögen (z. B. an die Gesellschaft überlassenes Grundstück, Gesellschafterdarlehen). Sonderbetriebseinnahmen/-ausgaben (Miete, AfA, Zinsen) erhöhen/mindern den Gewinnanteil des jeweiligen Gesellschafters.
- Ergänzungsbilanz: individuelle Korrektur der Wertansätze in der Gesamthandsbilanz für einzelne Gesellschafter (z. B. Mehr-/Minderzahlung beim Eintritt) → spezielle AfA nur bei diesem Gesellschafter.`,
  },
  {
    id: "npo-ruecklagen-pruefhinweise",
    title: "NPO — Rücklagen, Audit-Risiken und offene Punkte",
    short:
      "Konkrete Planung, projektbezogene/Investitions-/Infrastruktur-/Audit-Rücklagen, Darlegungslast, Nachforderungen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes NPO-Arbeitspapier — Rücklagen, offene Punkte, Nachweise.",
    keywords: /projektbezogene rücklage|investitionsrücklage|ersatzbeschaffungsrücklage|infrastrukturrücklage|audit[-\s]?rücklage|rückforderung|darlegungslast|rücklagenspiegel|offene punkte|nachforderung|krankenversicherung\s+verein|fahrtenbuch\s+verein/i,
    references: [
      "§ 55 Abs. 1 Nr. 5 AO",
      "§ 62 Abs. 1 Nr. 1–4 AO",
      "§ 63 Abs. 4 AO",
    ],
    body: `1) Grundsatz / Darlegungslast
- Die Körperschaft trägt die Darlegungslast für die Voraussetzungen jeder Rücklagenbildung.
- Mit Ausnahme der freien Rücklage (§ 62 Abs. 1 Nr. 3 AO) müssen Rücklagen auf konkrete, geplante und satzungsgemäße Zwecke bezogen sein.
- Erforderlich: Beschluss, konkreter Zweck, Zeitplan, Kostenrahmen, Umsetzungsstand, transparente Abbildung in Rücklagenspiegel und MVR.

2) Projektbezogene Rücklage
- Zulässig für konkrete satzungsgemäße Projekte — auch wenn Erstattung (z. B. Fördermittel) beantragt ist, sofern Durchführung glaubhaft und Mittel in angemessenem Zeitraum benötigt werden.
- Auflösung, sobald Grund entfällt oder Erstattung erfolgt.

3) Investitions-/Ersatzbeschaffungsrücklage (§ 62 Abs. 1 Nr. 2 AO)
- Höhe grundsätzlich an der regulären AfA des zu ersetzenden WG orientiert.
- Höherer Bedarf nur mit Nachweis (Angebote, Kostenvoranschläge, Preissteigerungen, technische Anforderungen).

4) Infrastruktur-/Plattformrücklage
- Laufende Plattform-/Hosting-/Personalkosten → eher Betriebsmittelrücklage (§ 62 Abs. 1 Nr. 1 AO).
- Geplante technische Erneuerung / Systemumstellung → Investitions-/Ersatzbeschaffungsrücklage.
- Keine pauschale "Sicherheitsreserve" — konkret begründen.

5) Rücklage für Audit-/Rückforderungsrisiken
- Möglich als Betriebsmittelrücklage bei tatsächlicher Unsicherheit über Rückforderungen.
- Risikobetrag aus konkretem Fördervertrag, Erfahrungswerten und risikobehafteten Positionen herleiten — pauschale Prozentsätze sind kritisch.
- Bei hinreichend konkreter Verpflichtung Abgrenzung zur bilanziellen Rückstellung (§ 249 HGB) prüfen.

6) Offene Punkte / Nachforderungen
- Bei Zeitdruck dokumentierte Zwischenfreigabe mit klar benannten offenen Punkten besser als Stillstand.
- Typische Nachforderungen: Versicherungsbeleg/Beitragshöhe, Beschluss/Vertrag, Funktion der Person im Verein, Fahrzeug-Nutzungsvereinbarung & Fahrtenbuch, Darlehensvertrag, konkrete Investitions-/Erweiterungsplanung.

7) Merksätze
- Rücklage nur stehen lassen, wenn Zweck, Planung, Beschluss und Dokumentation belastbar sind.
- Nicht auf die Bezeichnung des Belegs schauen, sondern auf den wirtschaftlichen Charakter der Zahlung.
- Übernahme personenbezogener Kosten (z. B. KV-Beiträge) ohne klare Grundlage = Risiko für Mittelverwendung, Vergütung, Lohnsteuer und SV.`,
  },
];

// Hilfsmittel für die Wissensbasis-Suche (analyze.ts)
export function findKnowledgeEntry(text: string): KBEntry | null {
  for (const e of KNOWLEDGE_BASE) if (e.keywords.test(text)) return e;
  return null;
}
