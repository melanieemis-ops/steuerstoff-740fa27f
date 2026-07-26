import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const abschreibungAfaWertminderungen: KBEntry = {
  id: "abschreibung-afa-wertminderungen-hgb-estg-ifrs",
  title: "Abschreibungen, AfA und Wertminderungen",
  short:
    "Praxisüberblick zur planmäßigen und außerplanmäßigen Abschreibung nach HGB, zur AfA nach EStG sowie zu Wertminderungen nach IFRS – mit Methoden, Nutzungsdauer, GWG, Zuschreibung und Rechenbeispielen.",
  category: "Abschreibung",
  type: "praxis",
  taxType: "Abschreibung",
  subCase: "abschreibungen-afa-wertminderungen",
  source:
    "Praxisübersicht zu § 253 HGB, §§ 6 und 7 EStG sowie IAS 36 und IFRS 3.",
  keywords:
    "abschreibung|afa|wertminderung|planmäßige abschreibung|außerplanmäßige abschreibung|nutzungsdauer|abschreibungsplan|lineare abschreibung|degressive abschreibung|leistungsabschreibung|progressive abschreibung|geringwertige wirtschaftsgüter|gwg|sammelposten|erinnerungswert|restwert|schrottwert|zuschreibung|wertaufholung|gemildertes niederstwertprinzip|strenges niederstwertprinzip|geschäfts- oder firmenwert|goodwill|ias 36|ifrs 3|§ 253 hgb|§ 6 estg|§ 7 estg",
  references: [
    "§ 253 HGB",
    "§ 246 Abs. 1 Satz 4 HGB",
    "§ 252 Abs. 1 Nr. 4 und Nr. 6 HGB",
    "§ 255 Abs. 2a HGB",
    "§ 284 Abs. 2 Nr. 1 und 2 HGB",
    "§ 285 Nr. 13 und 18 HGB",
    "§ 6 EStG",
    "§ 7 EStG",
    "IAS 36",
    "IFRS 3",
  ],
  importance: 5,
  body: `Abschreibungen gehören zu den zentralen Instrumenten der Folgebewertung. Handelsrecht, Steuerrecht und IFRS verfolgen zwar ähnliche Grundgedanken, unterscheiden sich aber bei Ansatz, Nutzungsdauer, Methode, Wertminderung und Wertaufholung teilweise deutlich.

1. Grundgedanke der Abschreibung

Vermögensgegenstände werden handelsrechtlich grundsätzlich höchstens mit den Anschaffungs- oder Herstellungskosten abzüglich Abschreibungen angesetzt (§ 253 Abs. 1 HGB). Abschreibungen verteilen Investitionsaufwendungen periodengerecht auf die Zeit der wirtschaftlichen Nutzung und bilden Wertminderungen ab.

Abgeschrieben werden können:
- Vermögensgegenstände des Anlagevermögens,
- Vermögensgegenstände des Umlaufvermögens,
- entgeltlich erworbene Geschäfts- oder Firmenwerte.

Der entgeltlich erworbene Geschäfts- oder Firmenwert gilt nach § 246 Abs. 1 Satz 4 HGB als zeitlich begrenzt nutzbarer Vermögensgegenstand. Er ist zu aktivieren, planmäßig abzuschreiben und bei voraussichtlich dauernder Wertminderung zusätzlich außerplanmäßig abzuschreiben.

2. Zugangsbewertung und Wertobergrenze

Bemessungsgrundlage der Abschreibung sind grundsätzlich die Anschaffungs- oder Herstellungskosten. Diese bilden zugleich die handelsrechtliche Wertobergrenze. Selbst wenn Wiederbeschaffungs- oder Marktwerte später höher liegen, ist ein Ansatz oberhalb der historischen Anschaffungs- oder Herstellungskosten grundsätzlich ausgeschlossen.

Sind frühere außerplanmäßige Abschreibungen nicht mehr begründet, besteht nach § 253 Abs. 5 Satz 1 HGB grundsätzlich ein Zuschreibungsgebot. Die Zuschreibung ist allerdings auf die fortgeführten Anschaffungs- oder Herstellungskosten begrenzt. Für den entgeltlich erworbenen Geschäfts- oder Firmenwert gilt ein Zuschreibungsverbot.

3. Planmäßige Abschreibung des Anlagevermögens

Abnutzbare Vermögensgegenstände des Anlagevermögens sind planmäßig abzuschreiben (§ 253 Abs. 3 Sätze 1 und 2 HGB). Abnutzbar ist ein Vermögensgegenstand, wenn seine Nutzung zeitlich begrenzt ist, etwa durch:
- technischen Verschleiß,
- wirtschaftliche Überholung,
- Substanzverzehr,
- rechtlich begrenzte Schutz- oder Nutzungsdauer.

Typische abnutzbare Anlagegegenstände sind Gebäude, Maschinen, Fahrzeuge, Büroausstattung, Patente und entgeltlich erworbene Geschäfts- oder Firmenwerte.

Nicht abnutzbar sind regelmäßig Grund und Boden, Finanzanlagen, geleistete Anzahlungen und Anlagen im Bau.

4. Abschreibungsplan

Für jeden einzelnen Vermögensgegenstand ist ein Abschreibungsplan festzulegen. Er umfasst insbesondere:
- die voraussichtliche Nutzungsdauer,
- die Abschreibungsmethode,
- gegebenenfalls einen Rest- oder Schrottwert.

Der Plan muss nicht zwingend in einem gesonderten Dokument stehen. In der Praxis genügt die nachvollziehbare Dokumentation in der Anlagenbuchhaltung.

Zweck der planmäßigen Abschreibung ist vor allem die periodengerechte Verteilung des Aufwands. Sie soll nicht zwingend den Marktwert zum Bilanzstichtag abbilden.

5. Bestimmung der Nutzungsdauer

Die handelsrechtliche Nutzungsdauer richtet sich nach der betriebsindividuellen wirtschaftlichen Nutzung. Maßgeblich sind technische, wirtschaftliche und rechtliche Faktoren.

Die technische Lebensdauer bildet nur die äußerste Grenze. Ist die wirtschaftliche oder rechtliche Nutzung kürzer, geht diese vor. Branchenwerte und steuerliche AfA-Tabellen können Hinweise geben, ersetzen aber nicht die handelsrechtliche Schätzung.

Kann die Nutzungsdauer eines selbst geschaffenen immateriellen Vermögensgegenstands oder eines derivativen Geschäfts- oder Firmenwerts ausnahmsweise nicht verlässlich geschätzt werden, ist nach § 253 Abs. 3 Sätze 3 und 4 HGB regelmäßig eine Nutzungsdauer von zehn Jahren anzusetzen.

6. Erinnerungswert, Restwert und Schrottwert

Voll abgeschriebene, aber noch vorhandene Vermögensgegenstände werden in der Praxis häufig mit einem Erinnerungswert von 1 EUR weitergeführt.

Ein erheblicher voraussichtlicher Restwert ist bei der Abschreibung zu berücksichtigen, wenn eine vollständige Abschreibung auf null oder einen bloßen Erinnerungswert die wirtschaftlichen Verhältnisse verzerren würde.

Beispiel:
Ein Pkw wird für 120.000 EUR angeschafft, aber nach drei Jahren voraussichtlich noch für 80.000 EUR verwertet. Wird der erhebliche Restwert sachgerecht berücksichtigt, wird nur der erwartete Wertverzehr bis zum Veräußerungszeitpunkt abgeschrieben.

Auch ein Schrottwert ist zu berücksichtigen, wenn er mit ausreichender Sicherheit anfällt und im Verhältnis zu den Anschaffungs- oder Herstellungskosten wesentlich ist.

7. Änderung des Abschreibungsplans

Nach erstmaliger Anwendung ist der Abschreibungsplan grundsätzlich stetig fortzuführen (§ 252 Abs. 1 Nr. 6 HGB).

Eine Änderung kommt nur bei sachlich begründeten neuen Erkenntnissen oder wesentlich veränderten Verhältnissen in Betracht, zum Beispiel:
- geänderte Restnutzungsdauer,
- technische Neuerungen,
- geänderte Nutzung,
- Wertaufholung,
- nachträgliche Anschaffungs- oder Herstellungskosten,
- Erkenntnisse aus einer steuerlichen Außenprüfung.

Wird die Restnutzungsdauer verkürzt, wird der aktuelle Buchwert grundsätzlich prospektiv auf die neue Restnutzungsdauer verteilt. Frühere Abschreibungen werden nicht rückwirkend neu berechnet.

Beispiel:
Anschaffungskosten 60.000 EUR, ursprüngliche Nutzungsdauer zehn Jahre. Nach drei Jahren beträgt der Buchwert 42.000 EUR. Wird nun eine Restnutzungsdauer von drei Jahren festgestellt, werden grundsätzlich 14.000 EUR pro Jahr abgeschrieben; im letzten Jahr verbleibt gegebenenfalls ein Erinnerungswert.

Ein Methodenwechsel ist wegen des Stetigkeitsgebots nur in begründeten Ausnahmefällen zulässig. Wird ein Wechsel von degressiver zu linearer Abschreibung von Beginn an im Abschreibungsplan vorgesehen, liegt hingegen keine nachträgliche Methodenänderung vor.

8. Geringwertige Wirtschaftsgüter und Sammelposten

Steuerlich bestehen nach § 6 Abs. 2 und 2a EStG insbesondere folgende Möglichkeiten:
- bis 250 EUR: sofortiger Betriebsausgabenabzug ohne besondere Aufzeichnungspflicht,
- über 250 EUR bis 800 EUR: Sofortabschreibung mit Aufzeichnungspflicht,
- über 250 EUR bis 1.000 EUR: Einstellung in einen jahresbezogenen Sammelposten mit Abschreibung zu je 20 % im Jahr der Bildung und in den folgenden vier Jahren.

Das Wahlrecht ist für die betroffenen Wirtschaftsgüter eines Wirtschaftsjahres einheitlich auszuüben. Scheidet ein Wirtschaftsgut aus dem Sammelposten aus, wird der Sammelposten grundsätzlich nicht vermindert.

Handelsrechtlich kann die steuerliche Vereinfachung übernommen werden, wenn die zusammengefassten Vermögensgegenstände insgesamt von untergeordneter Bedeutung sind.

9. Abschreibungsmethoden

9.1 Lineare Abschreibung

Bei der linearen Abschreibung werden die abschreibungsfähigen Anschaffungs- oder Herstellungskosten gleichmäßig auf die Nutzungsdauer verteilt.

Formel:
Jährliche Abschreibung = abschreibungsfähige Anschaffungs- oder Herstellungskosten / Nutzungsdauer

Beispiel:
40.000 EUR Anschaffungskosten bei acht Jahren Nutzungsdauer ergeben eine jährliche Abschreibung von 5.000 EUR beziehungsweise 12,5 %.

9.2 Geometrisch-degressive Abschreibung

Bei der geometrisch-degressiven Abschreibung wird ein gleichbleibender Prozentsatz auf den jeweiligen Restbuchwert angewendet. Die jährlichen Abschreibungsbeträge sinken.

Beispiel:
50.000 EUR Anschaffungskosten und 30 % Abschreibung ergeben im ersten Jahr 15.000 EUR, im zweiten Jahr 10.500 EUR und im dritten Jahr 7.350 EUR Abschreibung.

Da die Methode rechnerisch nie vollständig auf null führt, ist häufig ein Wechsel zur linearen Abschreibung sinnvoll. Der Wechsel erfolgt typischerweise, sobald die lineare Abschreibung auf den Restbuchwert höher ist als die degressive Abschreibung.

9.3 Arithmetisch-degressive Abschreibung

Bei der arithmetisch-degressiven Abschreibung sinkt der Abschreibungsbetrag jährlich um einen konstanten Differenzbetrag.

Beispiel:
40.000 EUR Anschaffungskosten bei vier Jahren Nutzungsdauer ergeben bei digitaler Abschreibung die Staffel 16.000 EUR, 12.000 EUR, 8.000 EUR und 4.000 EUR.

9.4 Progressive Abschreibung

Bei der progressiven Abschreibung steigen die Abschreibungsbeträge im Zeitablauf. Sie ist handelsrechtlich nur ausnahmsweise zulässig, wenn sie den tatsächlichen Nutzungs- oder Wertverzehr sachgerecht abbildet.

9.5 Leistungsabhängige Abschreibung

Die leistungsabhängige Abschreibung verteilt die Anschaffungs- oder Herstellungskosten nach der tatsächlichen Nutzung, etwa nach Maschinenstunden, Stückzahl oder gefahrenen Kilometern. Voraussetzung ist eine verlässliche Dokumentation der Gesamtleistung und der periodischen Leistung.

10. Immaterielle Vermögensgegenstände und Goodwill

Bei selbst geschaffenen immateriellen Vermögensgegenständen können Entwicklungskosten unter den Voraussetzungen des § 255 Abs. 2a HGB aktiviert werden. Forschungskosten sind dagegen stets Aufwand. Können Forschungs- und Entwicklungskosten nicht verlässlich getrennt werden, ist eine Aktivierung ausgeschlossen.

Ein entgeltlich erworbener Geschäfts- oder Firmenwert ist zu aktivieren und über seine voraussichtliche Nutzungsdauer abzuschreiben. Kann diese nicht verlässlich geschätzt werden, sind zehn Jahre anzusetzen. Kapitalgesellschaften müssen den Abschreibungszeitraum im Anhang erläutern.

11. Außerplanmäßige Abschreibung im Anlagevermögen

Für das Anlagevermögen gilt das gemilderte Niederstwertprinzip:
- bei voraussichtlich dauernder Wertminderung besteht ein Abschreibungsgebot,
- bei nur vorübergehender Wertminderung besteht grundsätzlich ein Abschreibungsverbot,
- bei Finanzanlagen besteht bei vorübergehender Wertminderung ein Abschreibungswahlrecht.

Eine Wertminderung eines abnutzbaren Anlagegegenstands gilt regelmäßig als dauerhaft, wenn der niedrigere Wert für einen erheblichen Teil der Restnutzungsdauer bestehen bleibt. Als Orientierung wird häufig mindestens die halbe Restnutzungsdauer oder ein Zeitraum von fünf Jahren herangezogen.

Bei nicht abnutzbaren Anlagegegenständen ist eine Wertminderung grundsätzlich eher dauerhaft, weil keine planmäßige Abschreibung den Buchwert später automatisch an den niedrigeren Wert angleicht.

12. Niedrigerer beizulegender Wert

Eine außerplanmäßige Abschreibung setzt voraus, dass der beizulegende Wert am Abschlussstichtag unter dem Buchwert liegt.

Als Hilfswerte kommen insbesondere in Betracht:
- Wiederbeschaffungswert,
- Einzelveräußerungswert,
- Ertragswert.

Für betrieblich weiter genutzte Sachanlagen ist regelmäßig der Wiederbeschaffungswert relevant. Der Einzelveräußerungswert ist insbesondere bei geplanter Veräußerung, Stilllegung oder fehlender weiterer Nutzung maßgeblich. Bei Patenten, Beteiligungen, Lizenzen und vermieteten Objekten kann der Ertragswert entscheidend sein.

13. Umlaufvermögen

Für das Umlaufvermögen gilt handelsrechtlich das strenge Niederstwertprinzip. Wertminderungen sind grundsätzlich unabhängig davon zu berücksichtigen, ob sie dauerhaft oder nur vorübergehend sind.

14. Wertaufholung

Entfällt der Grund einer früheren außerplanmäßigen Abschreibung, ist nach § 253 Abs. 5 HGB grundsätzlich zuzuschreiben. Die Obergrenze bilden die fortgeführten Anschaffungs- oder Herstellungskosten.

Nach der Zuschreibung ist die neue Bemessungsgrundlage auf die verbleibende Restnutzungsdauer zu verteilen. Für den entgeltlich erworbenen Geschäfts- oder Firmenwert besteht weiterhin ein Zuschreibungsverbot.

15. Steuerrechtliche AfA

Steuerlich richtet sich die AfA insbesondere nach § 7 EStG. Anders als im Handelsrecht sind Methoden, Sätze und Nutzungsdauern stärker gesetzlich oder verwaltungsseitig typisiert.

Wichtige Unterschiede:
- AfA-Tabellen dienen als steuerliche Orientierung,
- Sonderabschreibungen und Investitionsbegünstigungen können zusätzlich eingreifen,
- temporäre gesetzliche Regelungen zur degressiven AfA sind genau nach Anschaffungszeitraum und persönlichem Anwendungsbereich zu prüfen,
- handelsrechtliche und steuerliche Nutzungsdauer können auseinanderfallen.

16. IFRS und IAS 36

Nach IFRS werden Vermögenswerte planmäßig über ihre wirtschaftliche Nutzungsdauer abgeschrieben. Zusätzlich ist nach IAS 36 zu prüfen, ob Anzeichen für eine Wertminderung bestehen.

Liegt der erzielbare Betrag unter dem Buchwert, ist ein Wertminderungsaufwand zu erfassen. Der erzielbare Betrag ist der höhere Betrag aus:
- beizulegendem Zeitwert abzüglich Veräußerungskosten und
- Nutzungswert.

Geschäfts- oder Firmenwerte werden nach IFRS 3 nicht planmäßig abgeschrieben, sondern mindestens jährlich einem Impairment-Test unterzogen. Eine Wertaufholung auf einen zuvor wertgeminderten Goodwill ist nach IFRS ausgeschlossen.

17. Prüfungsschema

1. Gehört der Vermögensgegenstand zum Anlage- oder Umlaufvermögen?
2. Ist er abnutzbar oder nicht abnutzbar?
3. Wie hoch sind Anschaffungs- oder Herstellungskosten?
4. Welche Nutzungsdauer ist sachgerecht?
5. Welche Abschreibungsmethode bildet den Verbrauch zutreffend ab?
6. Ist ein Rest- oder Schrottwert zu berücksichtigen?
7. Liegen neue Erkenntnisse vor, die eine Anpassung des Abschreibungsplans erfordern?
8. Bestehen Anzeichen für eine außerplanmäßige Wertminderung?
9. Ist die Wertminderung dauerhaft oder nur vorübergehend?
10. Besteht später ein Zuschreibungsgebot?
11. Welche Unterschiede ergeben sich zwischen Handelsbilanz, Steuerbilanz und IFRS?

Kurzfassung:
Planmäßige Abschreibungen verteilen Anschaffungs- oder Herstellungskosten auf die Nutzungsdauer. Außerplanmäßige Abschreibungen reagieren auf zusätzliche Wertverluste. Im Anlagevermögen gilt handelsrechtlich grundsätzlich das gemilderte, im Umlaufvermögen das strenge Niederstwertprinzip. Steuerlich bestimmen insbesondere §§ 6 und 7 EStG die AfA; nach IFRS ist IAS 36 für Wertminderungen und IFRS 3 für den Goodwill zentral.`,
};

KNOWLEDGE_BASE.push(abschreibungAfaWertminderungen);
