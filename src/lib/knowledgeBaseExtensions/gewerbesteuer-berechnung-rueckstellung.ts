import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const gewerbesteuerBerechnungRueckstellung: KBEntry = {
  id: "gewerbesteuer-berechnung-rueckstellung",
  title: "Gewerbesteuer: Berechnung und Gewerbesteuerrückstellung",
  short:
    "Kompaktes Berechnungsschema zu Gewerbeertrag, Hinzurechnungen, Kürzungen, Verlustabzug, Freibeträgen, Messbetrag, Hebesatz und Rückstellung.",
  category: "Gewerbesteuer",
  type: "praxis",
  taxType: "gewerbesteuer",
  subCase: "berechnung-rueckstellung",
  source:
    "Eigenständig zusammengefasste Darstellung auf Grundlage des GewStG, EStG, BewG, der GewStDV und GewStR; Rechtsstand 2026.",
  keywords:
    "gewerbesteuer berechnung|gewerbesteuerrückstellung|gewerbeertrag|hinzurechnung § 8 gewstg|kürzung § 9 gewstg|gewerbeverlust § 10a gewstg|freibetrag 24500|freibetrag 200000|steuermesszahl 3,5|hebesatz|gewerbesteuermessbetrag|vorauszahlungen|rückstellung buchen",
  references: [
    "§§ 7 bis 11, 14 und 16 GewStG",
    "§ 4 Abs. 5b und § 35 EStG",
    "§§ 121a und 133 BewG",
    "§ 20 GewStDV",
    "R 10a GewStR",
  ],
  importance: 5,
  body: `Die Gewerbesteuer wird nicht unmittelbar aus dem handelsrechtlichen Jahresüberschuss berechnet. Ausgangspunkt ist der steuerliche Gewinn aus Gewerbebetrieb. Dieser wird um gewerbesteuerliche Hinzurechnungen und Kürzungen sowie um einen vorhandenen Gewerbeverlust korrigiert. Erst danach werden Freibetrag, Steuermesszahl und kommunaler Hebesatz angewendet. [1]

Unterkategorie: Berechnung und Rückstellung

1. Grundschema

Gewinn aus Gewerbebetrieb
+ Hinzurechnungen nach § 8 GewStG
- Kürzungen nach § 9 GewStG
= Gewerbeertrag
- vortragsfähiger Gewerbeverlust nach § 10a GewStG
= Zwischensumme
- Abrundung auf volle 100 EUR
- rechtsformabhängiger Freibetrag
= maßgebender Gewerbeertrag
× 3,5 % Steuermesszahl
= Gewerbesteuermessbetrag
× Hebesatz der Gemeinde
= Gewerbesteuer. [1]

2. Ausgangsbetrag

Der Gewinn aus Gewerbebetrieb wird nach den Vorschriften des EStG oder KStG ermittelt. Maßgeblich sind bei
- Einzelunternehmen die gewerblichen Einkünfte,
- Personengesellschaften die gesondert und einheitlich festgestellten gewerblichen Einkünfte,
- Kapitalgesellschaften grundsätzlich das körperschaftsteuerliche Einkommen.

Ein handelsrechtlicher Jahresüberschuss ist deshalb zunächst an die steuerlichen Vorschriften anzupassen. Nicht abziehbare Betriebsausgaben müssen hinzugerechnet werden. Dazu gehören insbesondere die als Aufwand erfasste Gewerbesteuer und ihre Nebenleistungen. Gewerbesteuer ist nach § 4 Abs. 5b EStG keine abzugsfähige Betriebsausgabe. [2]

Beispiel:
Gewinn laut GuV 83.000 EUR
+ gebuchte Gewerbesteuer 14.000 EUR
+ nicht abziehbarer Anteil der Bewirtungskosten 3.000 EUR
= steuerlicher Gewinn aus Gewerbebetrieb 100.000 EUR.

3. Hinzurechnungen nach § 8 Nr. 1 GewStG

Bestimmte Finanzierungsaufwendungen werden zunächst mit gesetzlich festgelegten Anteilen erfasst:
- Schuldzinsen: 100 %,
- Renten und dauernde Lasten: 100 %,
- Gewinnanteile stiller Gesellschafter: 100 %,
- Mieten, Pachten und Leasing für bewegliche Wirtschaftsgüter: 20 %,
- begünstigte Elektro- und Hybridfahrzeuge sowie bestimmte Fahrräder: 10 %,
- Mieten, Pachten und Erbbauzinsen für unbewegliche Wirtschaftsgüter: 50 %,
- Lizenzen und Rechte: 25 %.

Von der Summe wird ein Freibetrag von 200.000 EUR abgezogen. Nur 25 % des positiven Restbetrags werden dem Gewinn hinzugerechnet. [2]

Beispiel:
Maßgebende Finanzierungsanteile 228.000 EUR
- Freibetrag 200.000 EUR
= Restbetrag 28.000 EUR
× 25 %
= Hinzurechnung 7.000 EUR.

Weitere Hinzurechnungen können insbesondere Gewinnanteile persönlich haftender KGaA-Gesellschafter, Streubesitzdividenden, Verlustanteile aus Personengesellschaften, bestimmte Spendenkorrekturen, ausschüttungsbedingte Teilwertabschreibungen und bestimmte ausländische Steuern betreffen.

4. Kürzungen nach § 9 GewStG

Typische Kürzungen sind:
- Grundbesitzkürzung für zum Betriebsvermögen gehörenden Grundbesitz,
- Gewinnanteile aus in- oder ausländischen Personengesellschaften,
- Schachteldividenden bei ausreichender Beteiligungsquote,
- Gewinne aus ausländischen Betriebsstätten,
- abzugsfähige Spenden.

Seit 2025 ist bei der einfachen Grundbesitzkürzung grundsätzlich auf 0,11 % des maßgebenden Grundsteuerwerts abzustellen. Für ältere Bewertungsgrundlagen können weiterhin die gesetzlichen Einheitswertregelungen und Faktoren relevant sein. [3]

5. Gewerbeverlust

Ein negativer Gewerbeertrag wird gesondert festgestellt und grundsätzlich nur vorgetragen. Einen Verlustrücktrag kennt die Gewerbesteuer nicht.

Der Verlustabzug erfolgt
- bis 1 Mio. EUR vollständig,
- darüber hinaus grundsätzlich nur in Höhe von 60 % des übersteigenden Gewerbeertrags.

Voraussetzung sind grundsätzlich Unternehmensidentität und Unternehmeridentität. Scheidet ein Gesellschafter aus einer Personengesellschaft aus, kann der auf ihn entfallende Verlustvortrag untergehen. Der Verlust wird vor dem rechtsformabhängigen Freibetrag abgezogen. [4]

6. Freibeträge und Messbetrag

Nach Abrundung des Gewerbeertrags auf volle 100 EUR gelten insbesondere folgende Freibeträge:
- natürliche Personen: 24.500 EUR,
- Personengesellschaften: 24.500 EUR,
- Kapitalgesellschaften: kein Freibetrag,
- bestimmte juristische Personen und wirtschaftliche Geschäftsbetriebe gemeinnütziger Körperschaften: 5.000 EUR.

Der Freibetrag darf keinen Gewerbeverlust erzeugen. Der verbleibende Betrag wird mit der Steuermesszahl von 3,5 % multipliziert. Der Messbetrag wird anschließend mit dem Hebesatz der Gemeinde vervielfacht. [5]

Beispiel:
Gewerbeertrag nach Verlustabzug und Abrundung 100.000 EUR
- Freibetrag Einzelunternehmen 24.500 EUR
= 75.500 EUR
× 3,5 %
= Messbetrag 2.642,50 EUR
× Hebesatz 400 %
= Gewerbesteuer 10.570 EUR.

7. Gewerbesteuerrückstellung

Bilanzierende Unternehmen müssen die am Abschlussstichtag voraussichtlich geschuldete Gewerbesteuer periodengerecht berücksichtigen.

Berechnung:
voraussichtliche Gewerbesteuer des Erhebungszeitraums
- geleistete Gewerbesteuervorauszahlungen
= voraussichtliche Nachzahlung beziehungsweise Rückstellung.

Übersteigen die Vorauszahlungen die erwartete Gewerbesteuer, ist keine Rückstellung, sondern grundsätzlich eine Forderung auszuweisen. [6]

Typischer Buchungssatz bei erwarteter Nachzahlung:
Gewerbesteueraufwand an Gewerbesteuerrückstellung.

Bei Zahlung im Folgejahr:
Gewerbesteuerrückstellung an Bank.

Soweit der endgültige Bescheid von der Rückstellung abweicht, ist die Differenz erfolgswirksam als zusätzlicher Aufwand oder Ertrag zu erfassen.

8. Kompaktes Arbeitsschema

1. Handelsrechtliches Ergebnis steuerlich überleiten.
2. Gewerbesteueraufwand und weitere nicht abzugsfähige Aufwendungen korrigieren.
3. Ausgangsbetrag nach § 7 GewStG bestimmen.
4. Hinzurechnungen nach § 8 GewStG erfassen.
5. Kürzungen nach § 9 GewStG abziehen.
6. Gewerbeverlust nach § 10a GewStG verrechnen.
7. Auf volle 100 EUR abrunden.
8. Rechtsformabhängigen Freibetrag abziehen.
9. Steuermesszahl von 3,5 % anwenden.
10. Mit dem kommunalen Hebesatz multiplizieren.
11. Vorauszahlungen abziehen.
12. Rückstellung oder Forderung erfassen.

Merksatz:
Die Gewerbesteuerrückstellung entspricht nicht dem gesamten Gewerbesteueraufwand, sondern nur der am Bilanzstichtag noch erwarteten Nachzahlung nach Abzug der bereits geleisteten Vorauszahlungen.

Quellenhinweise:
[1] §§ 7, 10, 11, 14 und 16 GewStG.
[2] § 8 GewStG sowie § 4 Abs. 5b EStG.
[3] § 9 GewStG sowie §§ 121a und 133 BewG.
[4] § 10a GewStG und R 10a GewStR.
[5] § 11 GewStG.
[6] Bilanzielle Rückstellungsgrundsätze; ergänzend § 20 GewStDV und § 35 EStG.

Rechtsstand: 2026.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === gewerbesteuerBerechnungRueckstellung.id)) {
  KNOWLEDGE_BASE.push(gewerbesteuerBerechnungRueckstellung);
}
