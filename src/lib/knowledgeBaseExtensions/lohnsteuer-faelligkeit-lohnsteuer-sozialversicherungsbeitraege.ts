import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const lohnsteuerFaelligkeitLohnsteuerSozialversicherung: KBEntry = {
  id: "lohnsteuer-faelligkeit-lohnsteuer-sozialversicherungsbeitraege",
  title: "Fälligkeit von Lohnsteuer und Sozialversicherungsbeiträgen",
  short:
    "Fälligkeit, Zahlungsschonfrist, Säumniszuschläge und Stundung bei Lohnsteuer und Gesamtsozialversicherungsbeiträgen im direkten Vergleich.",
  category: "Lohnsteuer",
  type: "praxis",
  source:
    "Zusammenfassung nach § 41a EStG, §§ 240, 222 AO sowie §§ 23 bis 25 SGB IV; Rechtsstand Juli 2026.",
  keywords:
    "fälligkeit lohnsteuer|lohnsteuer 10. folgemonat|säumniszuschlag lohnsteuer|zahlungsschonfrist drei tage|§ 240 ao|fälligkeit sozialversicherungsbeiträge|drittletzter bankarbeitstag|gesamtsozialversicherungsbeitrag|säumniszuschlag sozialversicherung|§ 23 sgb iv|§ 24 sgb iv|beitragsnachweis|freiwillig krankenversichert firmenzahler|stundung sozialversicherungsbeiträge|tilgungsreihenfolge",
  references: [
    "§ 41a Abs. 1 EStG",
    "§ 222 AO",
    "§ 240 AO",
    "§ 23 SGB IV",
    "§ 24 SGB IV",
    "§ 25 SGB IV",
  ],
  importance: 5,
  body: `Lohnsteuer und Sozialversicherungsbeiträge haben unterschiedliche Fälligkeitstermine und unterschiedliche Regeln bei verspäteter Zahlung. Besonders wichtig: Für Sozialversicherungsbeiträge gibt es keine dreitägige Zahlungsschonfrist.

1. Lohnsteuer: Anmeldung und Zahlung
Der Arbeitgeber muss die im Lohnsteuer-Anmeldungszeitraum einbehaltene individuelle und die von ihm übernommene pauschale Lohnsteuer grundsätzlich spätestens am 10. Tag nach Ablauf des Anmeldungszeitraums anmelden und an das Betriebsstättenfinanzamt abführen.

Fällt der 10. auf einen Samstag, Sonntag oder gesetzlichen Feiertag, endet die Frist erst mit Ablauf des nächsten Werktags.

2. Säumniszuschlag bei Lohnsteuer
Wird die fällige Lohnsteuer nicht rechtzeitig entrichtet, entsteht kraft Gesetzes ein Säumniszuschlag. Ein Verschulden des Arbeitgebers ist nicht erforderlich.

Berechnung:
- 1 % für jeden angefangenen Monat der Säumnis,
- Bemessungsgrundlage ist der rückständige Steuerbetrag,
- dieser wird auf den nächsten durch 50 EUR teilbaren Betrag abgerundet,
- bei einem Rückstand unter 50 EUR entsteht rechnerisch kein Säumniszuschlag.

Die Säumnis beginnt nicht, bevor die Steuer festgesetzt oder angemeldet wurde. Bei einer verspätet eingereichten Lohnsteuer-Anmeldung können daneben Verspätungszuschläge wegen der verspäteten Abgabe entstehen.

3. Dreitägige Zahlungsschonfrist bei Steuern
Bei einer Säumnis von bis zu drei Tagen wird der Säumniszuschlag grundsätzlich nicht erhoben. Die Fälligkeit selbst verschiebt sich dadurch nicht; die Finanzverwaltung verzichtet lediglich auf die Erhebung des bereits entstandenen Zuschlags.

Die Schonfrist gilt insbesondere bei Überweisungen. Sie gilt nicht für bestimmte Zahlungsarten, insbesondere nicht für Bar- oder Scheckzahlungen. Maßgeblich ist regelmäßig der Eingang beziehungsweise die Gutschrift bei der Finanzkasse.

4. Erlass und Stundung bei Lohnsteuer
Säumniszuschläge können im Einzelfall aus Billigkeitsgründen ganz oder teilweise erlassen werden, etwa bei einem offenbaren Versehen, einer plötzlichen Erkrankung oder wirtschaftlicher Existenzgefährdung. Ein Erlass erfolgt nicht automatisch und muss beantragt sowie begründet werden.

Eine Stundung der Steuer kommt nur unter den Voraussetzungen des § 222 AO in Betracht. Sie muss grundsätzlich vor Fälligkeit beantragt werden. Ein bloßer Liquiditätsengpass führt nicht automatisch zu einem Zahlungsaufschub.

5. Sozialversicherung: gesetzliche Fälligkeit
Gesamtsozialversicherungsbeiträge, die nach Arbeitsentgelt bemessen werden, sind in voraussichtlicher Höhe spätestens am drittletzten Bankarbeitstag des laufenden Beschäftigungsmonats fällig.

Ist die endgültige Beitragshöhe zu diesem Zeitpunkt noch nicht bekannt, kann der Arbeitgeber grundsätzlich:
- die voraussichtliche Beitragsschuld berechnen oder
- im Rahmen der gesetzlichen Vereinfachungsregelung Beiträge in Höhe des Vormonats zahlen.

Ein verbleibender Restbetrag wird zum drittletzten Bankarbeitstag des Folgemonats fällig. Einmalzahlungen des Vormonats dürfen bei der vereinfachten Vormonatslösung nicht erneut berücksichtigt werden.

6. Beitragsnachweis
Der Beitragsnachweis muss der Einzugsstelle bereits vor der Beitragsfälligkeit vorliegen. Die konkreten Abgabetermine richten sich nach den gemeinsamen Verfahrensgrundsätzen und liegen regelmäßig vor dem drittletzten Bankarbeitstag. Deshalb müssen Entgeltabrechnung, Beitragsnachweis und Zahlung rechtzeitig vorbereitet werden.

7. Freiwillig krankenversicherte Arbeitnehmer
Für freiwillig gesetzlich Krankenversicherte können sich die Fälligkeitstermine nach der Satzung der jeweiligen Krankenkasse richten. Beim Firmenzahlerverfahren führt der Arbeitgeber die Kranken- und Pflegeversicherungsbeiträge für den Arbeitnehmer ab.

Praxisempfehlung: Die Fälligkeit sollte mit der jeweiligen Einzugsstelle geklärt werden. Andernfalls können für denselben Arbeitnehmer unterschiedliche Termine gelten:
- Kranken- und Pflegeversicherung nach der Kassensatzung,
- Renten- und Arbeitslosenversicherung nach § 23 SGB IV.

8. Säumniszuschläge in der Sozialversicherung
Werden Beiträge oder Beitragsvorschüsse nicht bis zum Ablauf des Fälligkeitstags gezahlt, entsteht für jeden angefangenen Monat ein Säumniszuschlag von 1 % des rückständigen, auf 50 EUR nach unten abgerundeten Betrags.

Wichtig:
- Es gibt keine dreitägige Zahlungsschonfrist.
- Bereits ein Tag Verspätung kann einen Säumniszuschlag auslösen.
- Eine besondere Zahlungsaufforderung ist nicht erforderlich.
- Bei einem gesondert anzufordernden Rückstand unter 150 EUR kann die Erhebung nach § 24 SGB IV unterbleiben.
- Scheitert ein Lastschrifteinzug aus vom Arbeitgeber zu vertretenden Gründen, können zusätzlich Rücklastschriftkosten entstehen.

9. Tilgungsbestimmung bei Beitragsrückständen
Der Arbeitgeber kann bei einer Zahlung bestimmen, welche Schuld getilgt werden soll. In Krisenfällen kann es besonders wichtig sein, ausdrücklich die Tilgung der Arbeitnehmeranteile zu bestimmen.

Fehlt eine Tilgungsbestimmung, verrechnet die Einzugsstelle regelmäßig in der gesetzlichen Reihenfolge, insbesondere zunächst Auslagen, anschließend Gesamtsozialversicherungsbeiträge, danach Säumniszuschläge, Zinsen und weitere Nebenforderungen. Innerhalb derselben Forderungsart werden ältere Fälligkeiten zuerst getilgt.

10. Stundung von Sozialversicherungsbeiträgen
Eine Stundung ist nur auf Antrag und nur durch Vereinbarung mit der Einzugsstelle möglich. Sie kann den Gesamtsozialversicherungsbeitrag vollständig oder teilweise erfassen, nicht jedoch isoliert nur einzelne Versicherungszweige.

Typische Inhalte einer Stundungsvereinbarung:
- Zahlungs- oder Ratenplan,
- Fälligkeit der gestundeten Beträge,
- Verzinsung,
- gegebenenfalls Sicherheitsleistung.

Der Antrag sollte frühzeitig vor Fälligkeit gestellt werden. Solange keine Stundung bewilligt ist, bleiben die Beiträge regulär fällig und Säumniszuschläge können entstehen.

11. Verjährung
Ansprüche auf Sozialversicherungsbeiträge verjähren grundsätzlich vier Jahre nach Ablauf des Kalenderjahres, in dem sie fällig geworden sind. Bei vorsätzlich vorenthaltenen Beiträgen gilt regelmäßig eine deutlich längere Verjährungsfrist.

Direkter Vergleich
- Lohnsteuer: regelmäßig fällig am 10. des Folgemonats.
- Sozialversicherung: regelmäßig fällig am drittletzten Bankarbeitstag des laufenden Monats.
- Lohnsteuer: dreitägige Säumnisschonfrist bei geeigneter Zahlungsart.
- Sozialversicherung: keine Schonfrist.
- Säumniszuschlag: in beiden Bereichen grundsätzlich 1 % je angefangenem Monat auf einen abgerundeten Rückstand.
- Stundung: stets nur auf Antrag und nach ausdrücklicher Bewilligung.

Praxischeck
- Lohnsteuer-Anmeldungszeitraum und Fälligkeit richtig bestimmt?
- Wochenenden und Feiertage beim 10. berücksichtigt?
- Überweisung so veranlasst, dass sie rechtzeitig gutgeschrieben wird?
- Beitragsnachweise vor dem jeweiligen Abgabetermin übermittelt?
- Drittletzten Bankarbeitstag je Monat geprüft?
- Vormonatsregelung bei schwankenden Entgelten einheitlich angewendet?
- Fälligkeit freiwilliger Beiträge mit der Krankenkasse abgestimmt?
- Lastschriftmandate und Kontodeckung kontrolliert?
- Bei Liquiditätsproblemen rechtzeitig Stundungsantrag gestellt?
- Bei Teilzahlungen eine klare Tilgungsbestimmung angegeben?

Typische Fehler
- Die dreitägige steuerliche Schonfrist wird auf Sozialversicherungsbeiträge übertragen.
- Der Beitragsnachweis wird erst am Zahlungstag übermittelt.
- Der drittletzte Kalendertag wird mit dem drittletzten Bankarbeitstag verwechselt.
- Bei schwankendem Entgelt werden Einmalzahlungen in der Vormonatsberechnung doppelt berücksichtigt.
- Eine beantragte, aber noch nicht bewilligte Stundung wird bereits wie ein Zahlungsaufschub behandelt.
- Bei freiwillig Versicherten wird die abweichende Kassensatzung nicht geprüft.
- Teilzahlungen erfolgen ohne Tilgungsbestimmung.`
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerFaelligkeitLohnsteuerSozialversicherung.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerFaelligkeitLohnsteuerSozialversicherung);
}
