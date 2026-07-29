import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const erbschaftsteuerBewertungBetriebsvermoegen: KBEntry = {
  id: "erbschaftsteuer-bewertung-betriebsvermoegen-vereinfachtes-ertragswertverfahren",
  title: "Erbschaftsteuer: Bewertung des Betriebsvermögens",
  short:
    "Kompakte Übersicht zur Bewertung von Einzelunternehmen, Mitunternehmeranteilen und Kapitalgesellschaftsanteilen mit dem gemeinen Wert, dem vereinfachten Ertragswertverfahren und dem Substanzwert als Mindestwert.",
  category: "Erbschaftsteuer",
  type: "praxis",
  taxType: "erbschaftsteuer",
  subCase: "bewertung-betriebsvermoegen",
  source:
    "Praxisübersicht nach § 12 Abs. 5 ErbStG, §§ 9, 11, 95–97, 109, 151 sowie §§ 199–203 BewG und den Erbschaftsteuer-Richtlinien.",
  keywords:
    "betriebsvermögen bewertung|unternehmensbewertung erbschaftsteuer|gemeiner wert|verkehrswert|vereinfachtes ertragswertverfahren|kapitalisierungsfaktor 13,75|jahresertrag|substanzwert|mindestwert|§ 11 bewg|§ 109 bewg|§ 199 bewg|§ 200 bewg|§ 201 bewg|§ 202 bewg|§ 203 bewg|gesonderte feststellung|unternehmerlohn|nicht betriebsnotwendiges vermögen|junges vermögen",
  references: [
    "§ 12 Abs. 5 ErbStG",
    "§ 9 BewG",
    "§ 11 Abs. 2 BewG",
    "§§ 95–97 BewG",
    "§ 109 BewG",
    "§ 151 Abs. 1 Satz 1 Nr. 2 und 3 BewG",
    "§§ 199–203 BewG",
    "§§ 13a, 13b ErbStG",
  ],
  importance: 5,
  body: `Wird ein Einzelunternehmen, ein Mitunternehmeranteil oder ein Anteil an einer Kapitalgesellschaft vererbt oder verschenkt, ist grundsätzlich der gemeine Wert zum Bewertungsstichtag anzusetzen. Erst nach der Bewertung wird geprüft, ob Verschonungen nach §§ 13a, 13b ErbStG greifen.

1. Reihenfolge der Bewertung

Der Wert wird grundsätzlich in folgender Reihenfolge ermittelt:
- Börsenkurs bei börsennotierten Anteilen,
- Ableitung aus Verkäufen unter fremden Dritten innerhalb eines Jahres vor dem Bewertungsstichtag,
- anerkanntes, im gewöhnlichen Geschäftsverkehr übliches Bewertungsverfahren, etwa IDW S 1,
- vereinfachtes Ertragswertverfahren nach §§ 199–203 BewG.

Das vereinfachte Ertragswertverfahren darf nicht angewendet werden, wenn es zu einem offensichtlich unzutreffenden Ergebnis führt. Ein niedrigerer gemeiner Wert kann durch ein methodisch anerkanntes Gutachten nachgewiesen werden.

2. Vereinfachtes Ertragswertverfahren

Ausgangspunkt ist der durchschnittliche nachhaltig erzielbare Jahresertrag der letzten drei abgelaufenen Wirtschaftsjahre. Die Ergebnisse werden nicht gewichtet.

Formel:
Unternehmenswert = durchschnittlicher Jahresertrag × 13,75

Der ertragsteuerliche Gewinn wird nach § 202 BewG bereinigt. Typische Korrekturen sind:
- Hinzurechnung außergewöhnlicher Aufwendungen, Sonderabschreibungen, Teilwertabschreibungen und Ertragsteueraufwand,
- Kürzung außergewöhnlicher Erträge und Veräußerungsgewinne,
- Abzug eines angemessenen Unternehmerlohns,
- anschließend pauschaler Ertragsteuerabzug von 30 % auf ein positives Betriebsergebnis.

Die Gewinnermittlungsart ist unerheblich. Das Verfahren gilt sowohl bei Bilanzierung als auch bei Einnahmenüberschussrechnung.

3. Separat zu bewertendes Vermögen

Nicht betriebsnotwendiges Vermögen, Beteiligungen an anderen Gesellschaften und innerhalb der letzten zwei Jahre eingelegtes junges Betriebsvermögen werden nicht durch den Ertragswert abgegolten. Sie sind grundsätzlich mit ihrem gemeinen Wert gesondert hinzuzurechnen; zugehörige Schulden werden abgezogen. Die damit verbundenen Erträge und Aufwendungen sind bei der Ermittlung des Jahresertrags zu korrigieren.

4. Substanzwert als Mindestwert

Der nach einem Ertragswert- oder anderen anerkannten Verfahren ermittelte Wert darf grundsätzlich nicht unter dem Substanzwert liegen. Dieser entspricht der Summe der gemeinen Werte aller Wirtschaftsgüter und sonstigen aktiven Ansätze abzüglich der Schulden und sonstigen Abzüge. Stille Reserven sind dabei aufzudecken.

Der Mindestwert ist nicht zu prüfen, wenn der gemeine Wert aus einem Börsenkurs oder aus zeitnahen Verkäufen abgeleitet wurde.

5. Gesonderte Feststellung

Der Wert des Betriebsvermögens und nicht börsennotierter Kapitalgesellschaftsanteile wird regelmäßig gesondert festgestellt. Der Feststellungsbescheid ist Grundlagenbescheid für die Erbschaft- oder Schenkungsteuer.

Wichtig:
Einwendungen gegen die Höhe des Unternehmenswerts müssen mit Rechtsbehelf gegen den Feststellungsbescheid erhoben werden. Ist dieser bestandskräftig, kann die Bewertung grundsätzlich nicht mehr im späteren Erbschaft- oder Schenkungsteuerbescheid angegriffen werden.

Ein innerhalb eines Jahres bereits festgestellter Wert kann erneut verwendet werden, wenn sich die Verhältnisse nicht wesentlich geändert haben. Der Erklärungspflichtige kann jedoch eine neue stichtagsbezogene Bewertung beantragen.

6. Personengesellschaften

Bei Personengesellschaften umfasst das bewertungsrechtliche Betriebsvermögen das Gesamthandsvermögen sowie Ergänzungs- und Sonderbetriebsvermögen. Der gemeine Wert wird nach § 97 Abs. 1a BewG aufgeteilt: Kapitalkonten werden vorweg zugerechnet, der Restwert nach dem allgemeinen Gewinnverteilungsschlüssel verteilt und Sonderbetriebsvermögen unmittelbar dem jeweiligen Gesellschafter zugeordnet.

Merksatz:
Zuerst wird der gemeine Wert des Betriebsvermögens festgestellt. Danach wird geprüft, welcher Teil nach §§ 13a, 13b ErbStG begünstigt ist. Im vereinfachten Ertragswertverfahren gilt: bereinigter Dreijahresdurchschnitt × 13,75, mindestens jedoch der Substanzwert.`
};

KNOWLEDGE_BASE.push(erbschaftsteuerBewertungBetriebsvermoegen);