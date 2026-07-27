import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const bilanzierungGrundlagenSteuerlicherBilanzenzusammenhang: KBEntry = {
  id: "bilanzierung-grundlagen-steuerlicher-bilanzenzusammenhang",
  title: "Grundlagen des steuerlichen Bilanzenzusammenhangs",
  short:
    "Wie Bilanzierungsfehler zwischen Wirtschaftsjahren fortwirken, wann im Fehlerjahr zu berichtigen ist und wann der formelle Bilanzenzusammenhang die Korrektur in das erste offene Jahr verlagert.",
  category: "Bilanzierung",
  type: "praxis",
  source:
    "Zusammenfassung nach StuB 13/2026, S. 507, NWB VAAAK-18588, unter Berücksichtigung der dort ausgewerteten Rechtsprechung und Literatur; Rechtsstand Juli 2026.",
  keywords:
    "bilanzenzusammenhang|steuerlicher bilanzenzusammenhang|formeller bilanzenzusammenhang|materieller bilanzenzusammenhang|bilanzberichtigung|§ 4 abs. 2 estg|zweischneidigkeit der bilanz|bilanzkontinuität|fehlerjahr|erstes offenes jahr|fehlertransport|totalgewinn|§ 6b rücklage|teilwertabschreibung|unterlassene einlage|treu und glauben|§ 6 abs. 3 estg|veranlagungsbilanz",
  references: [
    "[1] BFH, Urteil vom 2.7.2025 – XI R 27/22, BStBl 2025 II S. 970; Kanzler, StuB 2026 S. 383",
    "[2] Kanzler, Handbuch Bilanzsteuerrecht, 5. Aufl. 2026, Rz. 1110",
    "[3] Meyer, BeckOK EStG, 23. Edition 2025, § 4 Rz. 994–995.2",
    "[4] Bode, Kirchhof/Seer, EStG, 25. Aufl. 2026, § 4 Rz. 112",
    "[5] Kanzler, NWB 2012 S. 2376; Handbuch Bilanzsteuerrecht, Rz. 1113",
    "[6] Drüen, Brandis/Heuermann, § 4; Meyer, BeckOK EStG, § 4 Rz. 998.1",
    "[7] Bode, Kirchhof/Seer, EStG, § 4 Rz. 113",
    "[8] BFH, Urteil vom 27.3.1962 – I 136/60 S; BFH, Beschluss vom 29.11.1965 – GrS 1/65 S; BFH, Beschluss vom 31.1.2013 – GrS 1/10",
    "[9] BVerfG, Beschluss vom 5.7.2005 – 2 BvR 492/04",
    "[10] Kanzler, NWB 2012 S. 2376",
    "[11] BFH, Urteil vom 17.6.2019 – IV R 19/16",
    "[12] BFH, Urteil vom 20.10.2015 – VIII R 33/13",
    "[13] BFH, Urteil vom 28.4.1998 – VIII R 46/96",
    "[14] Drüen, Brandis/Heuermann, § 4 Rz. 948",
    "[15] BFH, Urteil vom 28.4.1998 – VIII R 46/96",
    "[16] Jahressteuergesetz 2007 vom 13.12.2006, BGBl 2006 I S. 2878",
    "[17] BFH, Urteil vom 27.3.1962 – I 136/60 S",
    "[18] Meyer, BeckOK EStG, § 4 Rz. 1078; Kanzler, Handbuch Bilanzsteuerrecht, Rz. 1114",
    "[19] Loschelder, Schmidt, EStG, 45. Aufl. 2026, § 4 Rz. 301; Drüen, Brandis/Heuermann, § 4 Rz. 949",
    "[20] Stapperfend, FR 1998 S. 825–828",
    "[21] Loschelder, Schmidt, EStG, § 4 Rz. 303; Drüen, Brandis/Heuermann, § 4 Rz. 950; Seiler, EStG Kommentar, § 4 Rz. C 52",
    "[22] Loschelder, Schmidt, EStG, § 4 Rz. 280",
    "[23] BFH, Urteil vom 27.5.2020 – XI R 12/18",
    "[24] BFH, Beschluss vom 23.3.2011 – IV B 68/10; BFH, Urteil vom 27.7.2023 – IV R 15/20",
    "[25] BFH, Beschluss vom 31.1.2013 – GrS 1/10",
    "[26] Bode, Kirchhof/Seer, EStG, § 4 Rz. 118–119",
    "[27] BFH, Urteil vom 30.6.2005 – IV R 11/04",
    "[28] BFH, Urteil vom 2.7.2025 – XI R 27/22",
    "[29] Meyer, BeckOK EStG, § 4 Rz. 1084",
    "[30] BFH, Urteil vom 9.4.2019 – X R 23/16",
    "[31] BFH, Urteil vom 9.4.2019 – X R 23/16; BFH, Urteil vom 29.7.2015 – X R 37/13",
    "[32] BFH, Urteil vom 28.4.1998 – VIII R 46/96; BFH, Beschluss vom 22.4.1998 – IV B 107/97",
    "[33] BFH, Urteil vom 19.1.1982 – VIII R 21/77",
    "[34] BFH, Urteil vom 28.10.1998 – X R 96/96; BFH, Urteil vom 20.10.2015 – VIII R 33/13",
    "[35] BFH, Urteil vom 2.5.1984 – VIII R 239/82; BFH, Urteil vom 28.10.1998 – X R 96/96",
    "[36] BFH, Urteil vom 7.10.1971 – IV R 181/66",
    "[37] BFH, Urteil vom 4.11.1999 – IV R 70/98",
    "[38] BFH, Urteil vom 17.6.2019 – IV R 19/16; Farwick, StuB 2019 S. 848",
    "[39] BFH, Urteil vom 17.6.2019 – IV R 19/16",
    "[40] BFH, Urteil vom 27.7.2023 – IV R 15/20; Kolbe, StuB 2023 S. 936",
    "[41] BFH, Beschluss vom 23.3.2011 – IV B 68/10",
    "[42] BFH, Urteil vom 2.7.2025 – XI R 27/22; Kanzler, StuB 2026 S. 383",
    "[43] BFH, Urteil vom 2.7.2025 – XI R 27/22",
    "[44] BFH, Urteil vom 27.3.1962 – I 136/60 S",
    "[45] Meyer, BeckOK EStG, § 4 Rz. 1228–1264",
    "[46] BFH, Urteil vom 24.10.2001 – X R 153/97",
    "[47] BFH, Urteil vom 9.5.2012 – X R 38/10",
    "[48] BFH, Urteil vom 22.6.2010 – VIII R 3/08",
    "[49] BFH, Urteil vom 4.5.1993 – VIII R 14/90",
    "[50] BFH, Urteil vom 3.7.1980 – IV R 31/77",
    "[51] BFH, Beschluss vom 8.2.2017 – X B 138/16",
    "[52] BFH, Urteil vom 22.1.1985 – VIII R 29/82",
    "[53] BFH, Urteil vom 2.5.1984 – VIII R 239/82",
    "[54] BFH, Urteil vom 29.1.2025 – X R 35/19, BStBl 2025 II S. 768",
    "[55] BFH, Urteil vom 29.1.2025 – X R 35/19, Rz. 81",
    "StuB 13/2026, S. 507",
    "NWB VAAAK-18588",
  ],
  importance: 5,
  body: `Der steuerliche Bilanzenzusammenhang verbindet die Schlussbilanz eines Wirtschaftsjahres mit der Anfangsbilanz des Folgejahres. Nach § 4 Abs. 1 Satz 1 EStG müssen beide grundsätzlich übereinstimmen. Diese sogenannte Zweischneidigkeit der Bilanz verhindert wertmäßige Sprünge zwischen den Jahren und sichert trotz möglicher Periodenfehler grundsätzlich die richtige Erfassung des Totalgewinns. Handelsrechtlich folgt die Bilanzkontinuität aus § 252 Abs. 1 Nr. 1 HGB und wirkt über die Maßgeblichkeit des § 5 Abs. 1 Satz 1 EStG in die Steuerbilanz hinein. [2] [3] [4]

1. Materieller und formeller Bilanzenzusammenhang
Der materielle Bilanzenzusammenhang würde jeden Fehler rückwirkend im ursprünglichen Fehlerjahr berichtigen. Das wäre materiell besonders genau, würde aber Bestandskraft und Änderungsschranken der Abgabenordnung missachten. Rechtsprechung und herrschende Meinung folgen deshalb dem formellen Bilanzenzusammenhang. [7] [8] [9] [10] [11]

Der formelle Bilanzenzusammenhang übernimmt den fehlerhaften Schlussbilanzwert eines bestandskräftigen Jahres zunächst als Anfangswert des Folgejahres. Der Fehler wird erst in der Schlussbilanz des ersten Jahres korrigiert, dessen Steuerfestsetzung verfahrensrechtlich noch geändert werden kann. War der ursprüngliche Fehler erfolgswirksam, ist auch seine Korrektur grundsätzlich erfolgswirksam. Dadurch wird zwar nicht immer der richtige Periodengewinn, wohl aber grundsätzlich der richtige Totalgewinn besteuert. [12] [13] [14] [15]

Merksatz:
Fehlerjahr noch änderbar = Berichtigung im Fehlerjahr.
Fehlerjahr nicht mehr änderbar = Korrektur im ersten offenen Jahr über den formellen Bilanzenzusammenhang.

2. Vorrang der Bilanzberichtigung nach § 4 Abs. 2 EStG
Ein objektiv unrichtiger Bilanzansatz ist vorrangig nach § 4 Abs. 2 Satz 1 EStG an der Fehlerquelle zu berichtigen. Das gilt auch für eine steuerliche Überleitungsrechnung nach § 60 Abs. 2 EStDV, nicht jedoch für rein außerbilanzielle Hinzurechnungen oder Kürzungen. [22] [23] [24] [25]

Ist der Bescheid des Fehlerjahres noch änderbar, etwa wegen eines Vorbehalts der Nachprüfung nach § 164 AO oder einer Korrekturvorschrift der §§ 172 ff. AO, muss die Berichtigung im Fehlerjahr erfolgen. Die Auswirkungen auf Folgejahre können als rückwirkendes Ereignis nach § 175 Abs. 1 Satz 1 Nr. 2 AO nachgezogen werden. [26] [27]

Erst wenn eine Änderung des Fehlerjahres verfahrensrechtlich ausgeschlossen ist, greift der formelle Bilanzenzusammenhang als subsidiäres Korrektursystem. § 4 Abs. 2 Satz 1 Halbsatz 2 EStG wird insoweit als gesetzliche Verankerung dieses Zusammenspiels verstanden. [16] [18] [28]

3. Ausnahmen und Nichtanwendung
Eine erfolgswirksame Fehlerkorrektur im ersten offenen Jahr unterbleibt insbesondere in folgenden Fällen:
- Der Fehler hatte insgesamt keine Auswirkung auf Gewinn oder Steuer. Maßgeblich ist eine Gesamtbetrachtung der betroffenen Bilanzposten. [29] [30] [31]
- Treu und Glauben verlangen eine abweichende Behandlung, etwa wenn die Finanzverwaltung dem Steuerpflichtigen einen Fehler praktisch aufgedrängt hat. Der Grundsatz kann auch zulasten des Steuerpflichtigen wirken, wenn dieser bewusst rechtswidrige Vorteile angestrebt hat. [32] [33] [34] [35] [36]
- Das Finanzamt wich lediglich in seiner Veranlagung von der zutreffenden Bilanz des Steuerpflichtigen ab. Dann fehlt ein fehlerhafter Bilanzansatz in der Steuerbilanz selbst; eine eigenständige Veranlagungsbilanz entsteht nicht. [37]

4. Aktuelle wichtige BFH-Fälle
Unterlassene Einlage ohne Bilanzposten:
Der formelle Bilanzenzusammenhang setzt einen am Bilanzstichtag vorhandenen Bilanzposten voraus. War eine Schuld bereits vor dem Stichtag privat bezahlt und deshalb kein Posten mehr vorhanden, kann eine unterlassene Einlage nicht über den Bilanzenzusammenhang nachgeholt werden. Maßgeblich ist vielmehr der richtige Betriebsvermögensvergleich nach § 4 Abs. 1 EStG. [38] [39]

Teilwertabschreibung und aktuelles Recht:
Für die Frage, ob die ursprüngliche Bilanz fehlerhaft war, gilt das Recht des Fehlerjahres. Für außerbilanzielle Folgen der Korrektur im ersten offenen Jahr gilt dagegen das Recht des Berichtigungsjahres. Außerbilanzielle Hinzurechnungen und Kürzungen sind selbst kein Gegenstand der Bilanzberichtigung. [40] [41]

Zu Unrecht gebildete § 6b-Rücklage:
Eine § 6b-Rücklage ist ein eigenständiger Passivposten. Ist das Bildungsjahr bestandskräftig, muss eine materiell unzulässige Rücklage im ersten offenen Jahr nach den Grundsätzen des formellen Bilanzenzusammenhangs gewinnerhöhend aufgelöst werden. § 6b EStG verdrängt diesen Korrekturmechanismus nicht. [1] [42] [43]

Unentgeltliche Betriebsübertragung nach § 6 Abs. 3 EStG:
Der Bilanzenzusammenhang kann auch zwischen verschiedenen Rechtsträgern wirken. Der Rechtsnachfolger übernimmt neben Buchwerten und stillen Reserven grundsätzlich auch die Bilanzierungshistorie und damit fortwirkende Bilanzierungsfehler des Rechtsvorgängers. [54] [55]

5. Typische Korrekturfolgen
- Nicht oder zu niedrig aktivierte Wirtschaftsgüter werden mit dem Wert angesetzt, der sich bei von Anfang an zutreffender Bilanzierung ergeben hätte. [46]
- Fälschlich sofort abgezogene Anschaffungs- oder Herstellungskosten werden im ersten offenen Jahr grundsätzlich erfolgswirksam aktiviert; häufig ist eine Schattenrechnung erforderlich. [47] [48]
- Überhöhte AfA wird regelmäßig dadurch korrigiert, dass der verbleibende Restbuchwert auf die Restnutzungsdauer verteilt wird. [49]
- Bewusst zur Steuerverlagerung zusammengeballte AfA oder zu Unrecht bilanziertes Privatvermögen können erfolgsneutral zu korrigieren sein. [50] [51]
- Irrtümlich passivierte Posten sind grundsätzlich erfolgswirksam auszubuchen; unterlassene Schulden sind grundsätzlich erfolgswirksam nachzuholen. [52] [53]

Praxisprüfung
1. Liegt überhaupt ein objektiv fehlerhafter Bilanzansatz vor?
2. Hat sich der Fehler auf Gewinn oder Steuer ausgewirkt?
3. Ist das Fehlerjahr nach der AO noch änderbar?
4. Falls ja: Berichtigung an der Fehlerquelle nach § 4 Abs. 2 EStG.
5. Falls nein: Transport des Fehlers bis zur ersten offenen Schlussbilanz.
6. Ist die Korrektur erfolgswirksam oder ausnahmsweise erfolgsneutral?
7. Greifen Treu und Glauben, fehlender Bilanzposten oder eine bloße Abweichung des Finanzamts?
8. Welches Recht gilt im Berichtigungsjahr für außerbilanzielle Folgen?
9. Wurde ein Betrieb nach § 6 Abs. 3 EStG übertragen und damit auch die Bilanzierungshistorie übernommen?

Kernaussage:
Der formelle Bilanzenzusammenhang ist kein Ersatz für die Bilanzberichtigung, sondern ihr nachgeordnetes Auffangsystem. Er greift nur, wenn der Fehler materiell berichtigt werden müsste, das Fehlerjahr aber verfahrensrechtlich nicht mehr geändert werden darf.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === bilanzierungGrundlagenSteuerlicherBilanzenzusammenhang.id)) {
  KNOWLEDGE_BASE.push(bilanzierungGrundlagenSteuerlicherBilanzenzusammenhang);
}
