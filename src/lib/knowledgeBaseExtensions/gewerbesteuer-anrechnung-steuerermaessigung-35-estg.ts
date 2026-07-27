import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const gewerbesteuerAnrechnungSteuerermaessigung35EStg: KBEntry = {
  id: "gewerbesteuer-anrechnung-steuerermaessigung-35-estg",
  title: "Gewerbesteueranrechnung: Steuerermäßigung bei gewerblichen Einkünften",
  short:
    "Kompakter Überblick zur Anrechnung der Gewerbesteuer auf die Einkommensteuer nach § 35 EStG – mit Anwendungsbereich, drei Begrenzungen, Einzelunternehmen, Personengesellschaften und Verfahrensfragen.",
  category: "Gewerbesteuer",
  type: "praxis",
  taxType: "gewerbesteuer",
  subCase: "anrechnung-35-estg",
  source:
    "Zusammengefasste Darstellung auf Grundlage des § 35 EStG, R 35 EStR und des BMF-Schreibens vom 3.11.2016, zuletzt geändert am 17.4.2019; Rechtsstand 2026.",
  keywords:
    "gewerbesteueranrechnung|steuerermäßigung § 35 estg|gewerbliche einkünfte|4-facher gewerbesteuermessbetrag|ermäßigungshöchstbetrag|tatsächlich zu zahlende gewerbesteuer|einzelunternehmen|personengesellschaft|mitunternehmer|gewinnverteilungsschlüssel|mehrstöckige personengesellschaft|anrechnungsüberhang|hebesatz 400 prozent|gewerbesteuermessbetrag",
  references: [
    "§ 35 EStG",
    "R 35 EStR 2012",
    "BMF-Schreiben vom 3.11.2016 – IV C 6 – S 2296-a/08/10002:003, BStBl 2016 I S. 1187",
    "BMF-Schreiben vom 17.4.2019 – IV C 6 – S 2296-a/17/10004, BStBl 2019 I S. 459",
    "§ 11 GewStG",
    "§ 175 Abs. 1 Satz 1 Nr. 1 AO",
  ],
  importance: 5,
  body: `§ 35 EStG mindert bei natürlichen Personen die tarifliche Einkommensteuer, soweit diese auf gewerbliche Einkünfte entfällt. Die Regelung soll die zusätzliche Belastung durch Gewerbesteuer abfedern und eine möglichst rechtsformneutrale Besteuerung von Einzelunternehmen und Personengesellschaften erreichen. Seit dem Veranlagungszeitraum 2020 beträgt der Anrechnungsfaktor grundsätzlich das Vierfache des Gewerbesteuer-Messbetrags.

1. Begünstigte Personen

Begünstigt sind insbesondere:
- Einzelunternehmer,
- Mitunternehmer von OHG, KG und anderen Personengesellschaften,
- persönlich haftende Gesellschafter einer KGaA,
- atypisch stille Gesellschafter,
- unmittelbar oder mittelbar beteiligte natürliche Personen.

Kapitalgesellschaften können § 35 EStG nicht nutzen. Das gilt auch, wenn sie an einer Personengesellschaft beteiligt sind. Der auf sie entfallende Anteil am Messbetrag läuft deshalb steuerlich ins Leere.

2. Drei Begrenzungen

Die Steuerermäßigung ist auf den niedrigsten der folgenden drei Beträge begrenzt:

1. das Vierfache des Gewerbesteuer-Messbetrags,
2. die auf die gewerblichen Einkünfte entfallende Einkommensteuer,
3. die tatsächlich zu zahlende Gewerbesteuer.

Merksatz:
Anrechenbar ist immer nur der kleinste Betrag aus Messbetragsgrenze, Ermäßigungshöchstbetrag und tatsächlicher Gewerbesteuer.

Die Ermäßigung mindert unmittelbar die tarifliche Einkommensteuer. Sie ist kein Betriebsausgabenabzug und kein Abzug von der Bemessungsgrundlage.

3. Bedeutung des Hebesatzes

Die Gewerbesteuer ergibt sich aus:

Gewerbesteuer-Messbetrag × kommunaler Hebesatz.

Bei einem Hebesatz von 400 % entspricht die Gewerbesteuer grundsätzlich dem Vierfachen des Messbetrags. Unterhalb von 400 % würde der Vierfachbetrag die Gewerbesteuer übersteigen; deshalb greift die Begrenzung auf die tatsächlich zu zahlende Gewerbesteuer. Oberhalb von 400 % verbleibt regelmäßig eine nicht anrechenbare Mehrbelastung.

Beispiel:
Messbetrag 2.730 EUR
× 4
= 10.920 EUR maximale Messbetragsanrechnung.

Beträgt die festgesetzte Gewerbesteuer 12.285 EUR, bleiben 1.365 EUR außerhalb der Anrechnung, sofern nicht bereits der Ermäßigungshöchstbetrag niedriger ist.

4. Einzelunternehmen und mehrere Betriebe

Der Gewerbesteuer-Messbetrag ist für jeden selbstständigen Gewerbebetrieb gesondert zu betrachten. Die Begrenzung auf den Vierfachbetrag und die tatsächlich zu zahlende Gewerbesteuer erfolgt betriebsbezogen.

Ein nicht ausgeschöpftes Anrechnungsvolumen eines niedrig besteuerten Betriebs darf nicht mit einer verbleibenden Belastung eines anderen Betriebs verrechnet werden. Bei einem einzigen Betrieb mit mehreren Betriebsstätten ist dagegen auf den einheitlichen Gewerbebetrieb abzustellen.

Erzielt ein Betrieb einkommensteuerlich einen Verlust, aber wegen gewerbesteuerlicher Hinzurechnungen einen positiven Gewerbeertrag, wird der dazugehörige Messbetrag bei der Anrechnung grundsätzlich nicht berücksichtigt.

5. Ermäßigungshöchstbetrag

Die Anrechnung darf nur die Einkommensteuer mindern, die anteilig auf positive gewerbliche Einkünfte entfällt. Vereinfacht wird hierzu die geminderte tarifliche Einkommensteuer nach dem Verhältnis

positive gewerbliche Einkünfte / Summe aller positiven Einkünfte

aufgeteilt.

Andere Einkünfte und Verluste können den Höchstbetrag daher mittelbar beeinflussen. Der Abgeltungsteuer unterliegende Kapitaleinkünfte gehören grundsätzlich nicht zur Summe der Einkünfte. Bei beantragter Günstigerprüfung und Einbeziehung in die tarifliche Besteuerung können sie die Verhältnisrechnung beeinflussen.

Nicht oder nur eingeschränkt begünstigt sind insbesondere:
- Gewinne nach der Tonnagebesteuerung,
- bestimmte Umwandlungsgewinne,
- grundsätzlich Veräußerungsgewinne nach §§ 16 und 17 EStG,
- gewerbesteuerfreie Einkünfte.

Gewerbesteuerpflichtige Veräußerungsgewinne können dagegen in den Anwendungsbereich fallen.

6. Kein Vortrag von Anrechnungsüberhängen

Kann der mögliche Ermäßigungsbetrag wegen fehlender Einkommensteuer, negativer gewerblicher Einkünfte oder eines niedrigen Ermäßigungshöchstbetrags nicht genutzt werden, verfällt er. Ein Vor- oder Rücktrag und eine Auszahlung sind nicht möglich.

7. Personengesellschaften

Bei Personengesellschaften werden der Gewerbesteuer-Messbetrag und die tatsächlich zu zahlende Gewerbesteuer gesondert und einheitlich festgestellt und anschließend auf die Gesellschafter verteilt.

Maßgeblich ist grundsätzlich der allgemeine Gewinnverteilungsschlüssel. Nicht berücksichtigt werden regelmäßig:
- Vorabgewinne,
- Sondervergütungen,
- Sonderbetriebsergebnisse,
- Ergebnisse aus Ergänzungsbilanzen.

Dadurch kann die steuerliche Gewerbesteuerbelastung eines Gesellschafters von seinem Anteil am Ermäßigungsbetrag abweichen. Gesellschaftsvertragliche Ausgleichsklauseln können wirtschaftliche Verzerrungen zwischen den Gesellschaftern abfedern, ändern aber nicht die steuerliche Aufteilung.

Bei einem Gesellschafterwechsel während des Jahres wird der Messbetrag grundsätzlich nur auf die am Ende des Erhebungszeitraums beteiligten Gesellschafter verteilt. Ein unterjährig ausgeschiedener Gesellschafter erhält regelmäßig keinen Anteil.

8. Mehrstöckige Personengesellschaften

Ist eine Oberpersonengesellschaft an einer Unterpersonengesellschaft beteiligt, wird der anteilige Messbetrag der Untergesellschaft grundsätzlich über die Obergesellschaft bis zu den natürlichen Personen weitergereicht.

Eine Durchleitung scheidet dagegen regelmäßig aus, wenn zwischen Ober- und Untergesellschaft eine Kapitalgesellschaft oder eine Familienstiftung zwischengeschaltet ist.

9. Tatsächlich zu zahlende Gewerbesteuer

Entscheidend ist nicht der Zahlungstag, sondern die für den jeweiligen Betrieb festgesetzte oder voraussichtlich festzusetzende Gewerbesteuer. Erfolgt die Einkommensteuerfestsetzung vor dem Gewerbesteuerbescheid, kann zunächst mit Messbetrag und Hebesatz gerechnet werden.

Ändert sich die festgesetzte Gewerbesteuer später, ist der Einkommensteuerbescheid als Folgebescheid grundsätzlich nach § 175 Abs. 1 Satz 1 Nr. 1 AO anzupassen. Gleiches gilt bei einem späteren Erlass der Gewerbesteuer.

10. Verfahrensrecht bei Personengesellschaften

Zu unterscheiden sind mehrere anfechtbare Bescheide:
- Gewerbesteuer-Messbescheid: Höhe des Gewerbeertrags und Messbetrags,
- Gewerbesteuerbescheid der Gemeinde: Höhe der Gewerbesteuer,
- Feststellungsbescheid nach § 35 Abs. 2 bis 4 EStG: Verteilung auf die Gesellschafter,
- Einkommensteuerbescheid: konkrete Steuerermäßigung beim Gesellschafter.

Praxisprüfung:
1. Liegen begünstigte gewerbliche Einkünfte einer natürlichen Person vor?
2. Wie hoch ist der vierfache Messbetrag je Betrieb oder Beteiligung?
3. Wie hoch ist die tatsächlich zu zahlende Gewerbesteuer?
4. Wie hoch ist der Ermäßigungshöchstbetrag?
5. Welcher der drei Beträge ist der niedrigste?
6. Bei Personengesellschaften: Welcher Anteil wurde gesondert festgestellt?

Merksatz:
§ 35 EStG beseitigt die Gewerbesteuer nicht vollständig. Er mindert die Einkommensteuer nur innerhalb der drei gesetzlichen Grenzen und nur bei natürlichen Personen.`
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === gewerbesteuerAnrechnungSteuerermaessigung35EStg.id)) {
  KNOWLEDGE_BASE.push(gewerbesteuerAnrechnungSteuerermaessigung35EStg);
}
