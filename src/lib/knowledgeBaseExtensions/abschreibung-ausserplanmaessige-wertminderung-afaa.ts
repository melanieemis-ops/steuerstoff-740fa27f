import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";
import "@/lib/knowledgeBaseExtensions/abschreibung-gebaeude-aussergewoehnliche-abnutzung-afaa";

export const abschreibungAusserplanmaessigeWertminderungAfaa: KBEntry = {
  id: "abschreibung-ausserplanmaessige-wertminderung-afaa",
  title: "Außerplanmäßige Abschreibungen bei Wertminderungen",
  short:
    "Kompakter Praxisüberblick zu niedrigerem beizulegendem Wert, Teilwertabschreibung, dauernder Wertminderung und Abgrenzung zur AfaA.",
  category: "Abschreibung",
  type: "praxis",
  taxType: "bilanzsteuerrecht",
  subCase: "ausserplanmaessige-wertminderung-afaa",
  source:
    "Eigenständig zusammengefasste Darstellung auf Grundlage von BBK 2026 und NWB TAAAK-19312; Rechtsstand 2026.",
  keywords:
    "außerplanmäßige abschreibung|ausserplanmaessige abschreibung|wertminderung|niedrigerer beizulegender wert|teilwertabschreibung|afaa|außergewöhnliche technische abnutzung|außergewöhnliche wirtschaftliche abnutzung|dauernde wertminderung|niederstwertprinzip|anlagevermögen|umlaufvermögen|§ 253 hgb|§ 6 estg|§ 7 estg",
  references: [
    "§§ 252, 253 und 255 HGB",
    "§ 6 Abs. 1 Nr. 1 und Nr. 2 EStG",
    "§ 7 Abs. 1 Satz 7 EStG",
    "[1] BBK 2026",
    "[2] NWB TAAAK-19312",
  ],
  importance: 5,
  body: `Liegt der tatsächliche Wert eines Vermögensgegenstands am Bilanzstichtag unter seinem Buchwert, ist zu prüfen, ob handelsrechtlich eine außerplanmäßige Abschreibung und steuerrechtlich eine Teilwertabschreibung oder eine AfaA zulässig beziehungsweise erforderlich ist. Entscheidend sind die Vermögensart, die Dauer der Wertminderung und ihre Ursache. [1][2]

Unterkategorie: Wertminderungen und AfaA

1. Ausgangspunkt: Buchwert und Vergleichswert

Vermögensgegenstände dürfen höchstens mit den Anschaffungs- oder Herstellungskosten abzüglich planmäßiger Abschreibungen angesetzt werden. Für die Prüfung einer Wertminderung wird der fortgeführte Buchwert mit dem niedrigeren beizulegenden Wert verglichen. [1]

Als Vergleichswerte kommen insbesondere in Betracht:
- Börsen- oder Marktpreis,
- Wiederbeschaffungszeitwert,
- Reproduktionswert oder
- voraussichtlicher Veräußerungserlös.

2. Anlagevermögen

Bei Vermögensgegenständen des Anlagevermögens ist handelsrechtlich zwingend außerplanmäßig abzuschreiben, wenn eine voraussichtlich dauernde Wertminderung vorliegt.

Bei Finanzanlagen besteht zusätzlich ein Wahlrecht zur außerplanmäßigen Abschreibung, wenn die Wertminderung voraussichtlich nur vorübergehend ist.

Praxisregel:
Eine dauernde Wertminderung liegt regelmäßig vor, wenn der Wert während eines erheblichen Teils der verbleibenden Nutzungsdauer unter dem fortgeführten Buchwert bleiben wird. Bei abnutzbarem Anlagevermögen wird häufig auf mindestens die Hälfte der Restnutzungsdauer, begrenzt auf etwa drei bis fünf Jahre, abgestellt. [1][2]

3. Umlaufvermögen

Im Umlaufvermögen gilt das strenge Niederstwertprinzip. Wertminderungen sind unabhängig davon zu berücksichtigen, ob sie dauerhaft oder nur vorübergehend sind.

Beispiel:
Waren mit Anschaffungskosten von 20.000 € können am Bilanzstichtag nur noch für voraussichtlich 15.000 € verwertet werden. In der Handelsbilanz ist auf 15.000 € abzuschreiben.

Buchungssatz:
Abschreibungen auf Vorräte 5.000 € an Warenbestand 5.000 €

4. Steuerrechtliche Teilwertabschreibung

Steuerrechtlich besteht bei einer voraussichtlich dauernden Wertminderung grundsätzlich ein Wahlrecht zur Abschreibung auf den niedrigeren Teilwert.

Typische Teilwertvermutungen:
- Beim Erwerb entspricht der Teilwert regelmäßig den Anschaffungs- oder Herstellungskosten.
- Bei nicht abnutzbarem Anlagevermögen entspricht er später grundsätzlich weiterhin diesen Kosten.
- Bei abnutzbarem Anlagevermögen entspricht er regelmäßig den um lineare AfA verminderten Anschaffungs- oder Herstellungskosten.
- Beim Umlaufvermögen orientiert er sich häufig an Wiederbeschaffungskosten oder am voraussichtlichen Veräußerungserlös.

Die objektive Feststellungslast für einen niedrigeren Teilwert trägt der Steuerpflichtige. [1][2]

5. Börsennotierte Wertpapiere

Übliche Kursschwankungen allein führen handelsrechtlich noch nicht automatisch zu einer dauernden Wertminderung.

Als Indizien werden unter anderem herangezogen:
- Der Buchwert wurde in den letzten sechs Monaten vor dem Bilanzstichtag dauerhaft um mehr als 20 % unterschritten oder
- der Durchschnitt der täglichen Börsen- oder Marktpreise der letzten zwölf Monate liegt mehr als 10 % unter dem Buchwert.

Erholt sich der Kurs bis zum Aufstellungszeitpunkt wieder bis mindestens zum Buchwert, spricht dies gegen eine dauernde Wertminderung.

Steuerrechtlich wird bei börsennotierten und börsengehandelten Wertpapieren häufig bereits dann von einer dauernden Wertminderung ausgegangen, wenn der Kurs am Bilanzstichtag unter dem Erwerbskurs liegt und der Rückgang die Bagatellgrenze von 5 % überschreitet. [1][2]

6. Abgrenzung zur AfaA

Die Absetzung für außergewöhnliche technische oder wirtschaftliche Abnutzung betrifft abnutzbare Wirtschaftsgüter, deren Nutzbarkeit oder Substanz durch ein außergewöhnliches Ereignis beeinträchtigt wird.

Typische Fälle:
- Maschinenschaden durch Bedienungsfehler,
- außergewöhnlich hoher Verschleiß,
- Brand- oder Unfallschaden,
- teilweise Zerstörung eines Gebäudes,
- Gebäudeabbruch oder
- Totalschaden eines Pkw.

Für eine AfaA genügt nicht allein ein niedrigerer Marktwert. Erforderlich ist eine Beeinträchtigung der Substanz, der technischen Nutzbarkeit oder der wirtschaftlichen Einsatzmöglichkeit.

7. Teilwertabschreibung oder AfaA?

Die AfaA hat systematisch Vorrang, wenn die Wertminderung auf einer außergewöhnlichen technischen oder wirtschaftlichen Abnutzung beruht.

AfaA spricht für:
- verkürzte Nutzungsdauer,
- eingeschränkte Einsatzfähigkeit,
- Substanzverlust oder
- außergewöhnliches Schadensereignis.

Teilwertabschreibung spricht für:
- gesunkene Wiederbeschaffungskosten,
- veränderte Marktbedingungen,
- Kursverluste oder
- sonstige reine Wertänderungen ohne Beeinträchtigung der Nutzbarkeit.

8. Buchungsbeispiele

Beispiel 1: Dauernde Wertminderung einer Maschine

Buchwert zum 31.12.: 60.000 €
Niedrigerer beizulegender Wert: 42.000 €
Dauernde Wertminderung: 18.000 €

Buchungssatz:
Außerplanmäßige Abschreibungen auf Sachanlagen 18.000 € an Maschinen 18.000 €

Beispiel 2: AfaA nach Maschinenschaden

Buchwert vor Schaden: 40.000 €
Wert nach außergewöhnlichem Schaden: 24.000 €
AfaA: 16.000 €

Buchungssatz:
Absetzungen für außergewöhnliche Abnutzung 16.000 € an Maschinen 16.000 €

Beispiel 3: Vorübergehender Kursrückgang einer Finanzanlage

Buchwert: 50.000 €
Kurswert am Bilanzstichtag: 44.000 €
Die Wertminderung ist voraussichtlich nicht dauerhaft.

Handelsrechtlich besteht bei Finanzanlagen ein Abschreibungswahlrecht. Steuerrechtlich ist eine Teilwertabschreibung grundsätzlich nur bei voraussichtlich dauernder Wertminderung möglich.

9. Wertaufholung

Entfallen die Gründe für eine frühere außerplanmäßige Abschreibung, ist handelsrechtlich bis höchstens zu den fortgeführten Anschaffungs- oder Herstellungskosten zuzuschreiben.

Buchungssatz:
Vermögensgegenstand an Erträge aus Zuschreibungen

10. Praxis-Checkliste

1. Handelt es sich um Anlage- oder Umlaufvermögen?
2. Wie hoch sind Buchwert und Vergleichswert am Bilanzstichtag?
3. Ist die Wertminderung voraussichtlich dauerhaft?
4. Liegt bei einer Finanzanlage nur eine vorübergehende Wertminderung vor?
5. Beruht der Verlust auf einer bloßen Wertänderung oder auf außergewöhnlicher Abnutzung?
6. Ist handelsrechtlich eine Pflicht oder ein Wahlrecht gegeben?
7. Besteht steuerrechtlich ein Wahlrecht zur Teilwertabschreibung oder AfaA?
8. Ist die Wertminderung ausreichend dokumentiert?
9. Muss in späteren Jahren eine Wertaufholung erfolgen?

Merksatz:
Anlagevermögen wird grundsätzlich nur bei dauernder Wertminderung außerplanmäßig abgeschrieben; Umlaufvermögen dagegen bei jeder Wertminderung am Bilanzstichtag. Die AfaA setzt zusätzlich ein außergewöhnliches Ereignis voraus, das Substanz oder Nutzbarkeit beeinträchtigt. [1][2]

Quellenzuordnung:
[1] BBK 2026.
[2] NWB TAAAK-19312.

Rechtsstand: 2026.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === abschreibungAusserplanmaessigeWertminderungAfaa.id)) {
  KNOWLEDGE_BASE.push(abschreibungAusserplanmaessigeWertminderungAfaa);
}
