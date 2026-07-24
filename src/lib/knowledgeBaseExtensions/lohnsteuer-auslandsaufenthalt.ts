import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const lohnsteuerAuslandsaufenthalt: KBEntry = {
  id: "lohnsteuer-auslandsaufenthalt",
  title: "Auslandsaufenthalt: lohnsteuerrechtliche Folgen",
  short:
    "Besteuerung von Arbeitslohn bei Auslandseinsätzen: Steuerpflicht, DBA, 183-Tage-Regel, Nachweise, Grenzgänger und Lohnsteuerabzug.",
  category: "Lohnsteuer",
  type: "praxis",
  importance: 5,
  source:
    "Zusammenfassung nach §§ 1, 34c und 49 EStG sowie dem BMF-Schreiben vom 12.12.2023 zur steuerlichen Behandlung des Arbeitslohns nach DBA; Rechtsstand Juli 2026.",
  keywords:
    "auslandsaufenthalt lohnsteuer|auslandseinsatz arbeitnehmer|arbeiten im ausland steuer|dba arbeitslohn|183 tage regel|183 tage|tätigkeitsstaat|wohnstaat|ansässigkeitsstaat|auslandstätigkeitserlass|progressionsvorbehalt|grenzgänger|grenzpendler|freistellungsbescheinigung|beschränkte steuerpflicht arbeitnehmer|unbeschränkte steuerpflicht arbeitnehmer|§ 1 estg|§ 49 estg|§ 34c estg|lohnsteuer ausland|entsendung|homeoffice ausland",
  references: [
    "§ 1 Abs. 1 bis 4 EStG",
    "§ 34c EStG",
    "§ 49 Abs. 1 Nr. 4 EStG",
    "BMF-Schreiben vom 12.12.2023, IV B 2 – S 1300/21/10024 :005",
    "BMF-Schreiben vom 10.06.2022 zum Auslandstätigkeitserlass",
    "BMF-Schreiben vom 08.10.2024 zur Aufteilung des Arbeitslohns",
  ],
  body: `Bei einem Auslandsaufenthalt ist zuerst zu klären, ob der Arbeitnehmer in Deutschland unbeschränkt oder beschränkt steuerpflichtig ist. Anschließend ist zu prüfen, welchem Staat nach einem Doppelbesteuerungsabkommen das Besteuerungsrecht für den Arbeitslohn zusteht.

1. Unbeschränkte Steuerpflicht
Behält der Arbeitnehmer in Deutschland einen Wohnsitz oder gewöhnlichen Aufenthalt, bleibt er grundsätzlich unbeschränkt steuerpflichtig. Deutschland erfasst dann zunächst das Welteinkommen. Ob der im Ausland erarbeitete Arbeitslohn in Deutschland tatsächlich besteuert wird, richtet sich vor allem nach dem einschlägigen DBA.

2. Grundregel nach DBA
Arbeitslohn wird grundsätzlich dort besteuert, wo die Tätigkeit tatsächlich ausgeübt wird. Entscheidend ist der physische Arbeitsort, nicht der Sitz des Arbeitgebers oder das auszahlende Konto.

Der Wohnsitzstaat vermeidet die Doppelbesteuerung meist durch:
- Freistellung des ausländischen Arbeitslohns, häufig unter Progressionsvorbehalt, oder
- Anrechnung der ausländischen Steuer.

Welche Methode gilt, ergibt sich aus dem jeweiligen DBA.

3. Die 183-Tage-Regel
Bei einer nur vorübergehenden Tätigkeit bleibt das Besteuerungsrecht ausnahmsweise beim Wohnsitzstaat, wenn alle drei Voraussetzungen erfüllt sind:
- Der Arbeitnehmer hält sich im Tätigkeitsstaat nicht länger als 183 Tage innerhalb des im DBA genannten Zeitraums auf.
- Die Vergütung wird nicht von oder für einen im Tätigkeitsstaat ansässigen Arbeitgeber getragen.
- Die Vergütung wird nicht von einer Betriebsstätte oder festen Einrichtung des Arbeitgebers im Tätigkeitsstaat wirtschaftlich getragen.

Fehlt nur eine Voraussetzung, kann der Tätigkeitsstaat den Arbeitslohn grundsätzlich besteuern. Die 183 Tage sind nach dem jeweiligen DBA als Kalenderjahr, Steuerjahr oder Zwölfmonatszeitraum zu prüfen. Maßgeblich sind regelmäßig Anwesenheitstage, nicht nur Arbeitstage.

4. Nachweis der ausländischen Besteuerung
Wird der Arbeitslohn in Deutschland nach einem DBA freigestellt, kann das Finanzamt Nachweise verlangen, dass:
- der ausländische Staat die Einkünfte tatsächlich besteuert hat oder
- der ausländische Staat wirksam auf sein Besteuerungsrecht verzichtet hat.

Geeignete Unterlagen sind insbesondere ausländische Steuerbescheide, Zahlungsnachweise, Arbeitgeberbescheinigungen oder amtliche Freistellungsnachweise.

5. Kein DBA vorhanden
Besteht kein DBA, bleibt Deutschland bei unbeschränkter Steuerpflicht grundsätzlich zur Besteuerung berechtigt. Eine Doppelbesteuerung kann dann insbesondere vermieden werden durch:
- Anrechnung der ausländischen Steuer nach § 34c EStG,
- Abzug der ausländischen Steuer bei der Einkünfteermittlung oder
- Steuerfreistellung nach dem Auslandstätigkeitserlass, wenn dessen Voraussetzungen erfüllt sind.

6. Beschränkte Steuerpflicht
Hat der Arbeitnehmer weder Wohnsitz noch gewöhnlichen Aufenthalt in Deutschland, kann dennoch eine beschränkte Steuerpflicht entstehen, etwa bei:
- Tätigkeit im Inland,
- bestimmten Tätigkeiten für inländische öffentliche Kassen,
- Vergütungen von Geschäftsführern, Prokuristen oder Vorstandsmitgliedern inländisch geleiteter Gesellschaften,
- bestimmten Entlassungsentschädigungen,
- einer steuerlich relevanten Verwertung einer im Ausland ausgeübten Tätigkeit im Inland.

Der inländische Arbeitgeber muss dann prüfen, ob deutscher Lohnsteuerabzug erforderlich ist.

7. Grenzgänger und Grenzpendler
Grenzgängerregelungen beruhen auf dem jeweiligen DBA und können das Besteuerungsrecht abweichend dem Wohnsitzstaat zuweisen. Voraussetzungen wie Grenzzone, regelmäßige Rückkehr und zulässige Nichtrückkehrtage sind staatenbezogen zu prüfen.

Wichtige Beispiele:
- Frankreich und Österreich: besondere Grenzzonen und regelmäßig eine 45-Tage-Regel.
- Schweiz: grundsätzlich Besteuerung im Wohnsitzstaat mit einer Quellensteuer von 4,5 % im Tätigkeitsstaat; außerdem besondere 60-Tage-Regel für beruflich veranlasste Nichtrückkehrtage.

Ein Grenzpendler erfüllt die besondere DBA-Grenzgängerregel nicht. Dann gelten die allgemeinen DBA-Regeln für Arbeitslohn.

8. Lohnsteuerabzug und Aufteilung
Bei teilweise steuerpflichtigem und teilweise steuerfreiem Arbeitslohn ist der Gesamtarbeitslohn sachgerecht aufzuteilen. Maßgeblich sind regelmäßig die tatsächlichen Arbeitstage in den jeweiligen Staaten. Der Arbeitgeber sollte insbesondere dokumentieren:
- Einsatz- und Reisetage,
- Arbeitsorte,
- Homeoffice-Tage,
- Urlaub und Krankheit,
- wirtschaftliche Kostentragung,
- ausländische Steuerabzüge und Bescheinigungen.

Praxischeck
- Deutscher Wohnsitz oder gewöhnlicher Aufenthalt vorhanden?
- Welches DBA gilt?
- Wo wurde die Arbeit tatsächlich ausgeübt?
- Ist die 183-Tage-Regel vollständig erfüllt?
- Wer trägt den Arbeitslohn wirtschaftlich?
- Gibt es eine ausländische Betriebsstätte?
- Welche Methode zur Vermeidung der Doppelbesteuerung gilt?
- Sind ausländische Steuerzahlung oder Besteuerungsverzicht nachgewiesen?
- Liegt eine Grenzgängerregelung vor?
- Muss der Arbeitgeber den Lohnsteuerabzug anpassen oder den Arbeitslohn aufteilen?

Typische Fehler
- Nur auf die Zahlstelle oder den Sitz des Arbeitgebers abstellen.
- Die 183 Tage als reine Arbeitstage zählen.
- Wirtschaftliche Kostentragung durch eine ausländische Betriebsstätte übersehen.
- DBA-Freistellung ohne Nachweis der ausländischen Besteuerung annehmen.
- Grenzgänger und Grenzpendler gleichbehandeln.
- Auslands-, Reise- und Homeoffice-Tage nicht fortlaufend dokumentieren.
- Den gesamten Jahresarbeitslohn pauschal einem Staat zuordnen.`
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerAuslandsaufenthalt.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerAuslandsaufenthalt);
}
