import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const koerperschaftsteuerGmbhGrundlagen: KBEntry = {
  id: "koerperschaftsteuer-gmbh-grundlagen-steuerliche-besonderheiten",
  title: "GmbH: Was ist steuerrechtlich zu beachten?",
  short:
    "Kompakter Überblick über Körperschaftsteuer, Gewerbesteuer, Umsatzsteuer, Geschäftsführervergütung, verdeckte Gewinnausschüttungen, Ausschüttungen, Verlustnutzung und steuerliche Pflichten einer GmbH.",
  category: "Körperschaftsteuer",
  type: "praxis",
  taxType: "koerperschaftsteuer",
  subCase: "gmbh-grundlagen",
  source:
    "Eigenständig zusammengefasste Darstellung auf Grundlage von KStG, GewStG, EStG, UStG, AO und HGB; Rechtsstand 2026.",
  keywords:
    "gmbh steuerrechtlich beachten|gmbh steuerliche grundlagen|gmbh steuern|kapitalgesellschaft steuer|körperschaftsteuer gmbh|gewerbesteuer gmbh|verdeckte gewinnausschüttung|vga|geschäftsführer gehalt|gesellschafter geschäftsführer|ausschüttung gmbh|kapitalertragsteuer ausschüttung|verlustvortrag gmbh|organschaft|gmbh jahresabschluss",
  references: [
    "§§ 1, 7, 8, 8b, 23, 27 und 31 KStG",
    "§§ 2, 7 bis 11 und 16 GewStG",
    "§§ 20, 32d und 43 EStG",
    "UStG",
    "AO",
    "§§ 264 ff. HGB",
  ],
  importance: 5,
  body: `Eine GmbH ist eine eigenständige juristische Person und damit steuerlich grundsätzlich von ihren Gesellschaftern zu trennen. Sie unterliegt insbesondere der Körperschaftsteuer, der Gewerbesteuer und regelmäßig der Umsatzsteuer. Zusätzlich sind Rechtsbeziehungen zwischen GmbH und Gesellschaftern streng auf Fremdüblichkeit zu prüfen. [1]

Unterkategorie: GmbH-Grundlagen

1. Körperschaftsteuer

Das zu versteuernde Einkommen der GmbH wird grundsätzlich mit 15 % Körperschaftsteuer belastet. Hinzu kommt der Solidaritätszuschlag auf die Körperschaftsteuer. Ausgangspunkt ist der handelsrechtliche Jahresüberschuss, der um steuerliche Korrekturen ergänzt wird. [1]

Nicht jede handelsrechtliche Betriebsausgabe ist steuerlich abzugsfähig. Zu prüfen sind insbesondere:
- nicht abzugsfähige Steuern und Nebenleistungen,
- Bewirtungsaufwendungen,
- Geschenke,
- Spenden,
- verdeckte Gewinnausschüttungen,
- steuerfreie Beteiligungserträge nach § 8b KStG.

2. Gewerbesteuer

Die GmbH gilt kraft Rechtsform stets als Gewerbebetrieb. Deshalb unterliegt grundsätzlich ihr gesamter Gewinn der Gewerbesteuer, unabhängig von der konkreten Tätigkeit. Einen Freibetrag von 24.500 EUR erhält sie nicht. [2]

Berechnung:
steuerlicher Gewinn
+ Hinzurechnungen nach § 8 GewStG
- Kürzungen nach § 9 GewStG
= Gewerbeertrag
× 3,5 %
= Gewerbesteuermessbetrag
× Hebesatz der Gemeinde
= Gewerbesteuer.

Die Gewerbesteuer ist bei der GmbH keine abzugsfähige Betriebsausgabe.

3. Umsatzsteuer

Erbringt die GmbH nachhaltig Leistungen gegen Entgelt, ist sie regelmäßig Unternehmerin im Sinne des UStG. Zu prüfen sind:
- Steuerbarkeit und Steuerpflicht der Umsätze,
- richtiger Steuersatz,
- Vorsteuerabzug,
- ordnungsgemäße Rechnungen,
- Reverse Charge und Auslandssachverhalte,
- Umsatzsteuer-Voranmeldungen und Jahreserklärung.

Die Kleinunternehmerregelung kann bei einer GmbH grundsätzlich anwendbar sein, ist in der Praxis bei operativ tätigen Gesellschaften aber häufig nicht sinnvoll.

4. Gesellschafter-Geschäftsführer

Vergütungen an Gesellschafter-Geschäftsführer sind nur dann als Betriebsausgaben abzugsfähig, wenn sie betrieblich veranlasst, im Voraus klar vereinbart und fremdüblich sind.

Besonders zu prüfen sind:
- Geschäftsführergehalt,
- Tantiemen,
- Pensionszusagen,
- Firmenwagen,
- Darlehen,
- Mieten und Pachten,
- private Kostenübernahmen.

Fehlt die Fremdüblichkeit, kann eine verdeckte Gewinnausschüttung vorliegen. [1]

5. Verdeckte Gewinnausschüttung

Eine verdeckte Gewinnausschüttung liegt vereinfacht vor, wenn die GmbH ihrem Gesellschafter einen Vorteil zuwendet, den sie einem fremden Dritten nicht gewährt hätte, und dadurch ihr Einkommen gemindert oder eine Vermögensmehrung verhindert wird.

Folgen:
- außerbilanzielle Hinzurechnung bei der GmbH,
- grundsätzlich Einkünfte aus Kapitalvermögen beim Gesellschafter,
- gegebenenfalls Kapitalertragsteuerhaftung,
- Zins- und Haftungsrisiken.

Typische Fälle sind überhöhte Vergütungen, private Kosten, verbilligte Überlassungen, zinslose Darlehen oder nicht ordnungsgemäß vereinbarte Tantiemen.

6. Offene Gewinnausschüttung

Ausschüttungen aufgrund eines wirksamen Gewinnverwendungsbeschlusses mindern das Einkommen der GmbH nicht. Die GmbH muss regelmäßig Kapitalertragsteuer und Solidaritätszuschlag einbehalten und abführen. [3]

Beim Anteilseigner hängt die Besteuerung davon ab, ob die Beteiligung im Privat- oder Betriebsvermögen gehalten wird und ob Abgeltungsteuer, Teileinkünfteverfahren oder § 8b KStG einschlägig sind.

7. Verluste

Steuerliche Verluste können grundsätzlich vor- und zurückgetragen werden. Einschränkungen können sich insbesondere bei schädlichen Anteilseignerwechseln, Umwandlungen, Organschaften und der Mindestbesteuerung ergeben.

Bei Anteilserwerben ist daher stets zu prüfen, ob Verlustvorträge gefährdet sind.

8. Jahresabschluss und Erklärungen

Die GmbH ist grundsätzlich buchführungs- und bilanzierungspflichtig. Typische Pflichten sind:
- handelsrechtlicher Jahresabschluss,
- Offenlegung beziehungsweise Hinterlegung,
- Körperschaftsteuererklärung,
- Gewerbesteuererklärung,
- Umsatzsteuererklärung,
- elektronische Übermittlung der E-Bilanz,
- Kapitalertragsteuer-Anmeldungen bei Ausschüttungen,
- Lohnsteuer-Anmeldungen bei Beschäftigten und Geschäftsführern.

9. Trennung von Gesellschaft und Gesellschafter

Private und betriebliche Vorgänge müssen konsequent getrennt werden. Zahlungen zwischen GmbH und Gesellschafter sollten stets durch klare Verträge, ordnungsgemäße Rechnungen, Gesellschafterbeschlüsse und tatsächliche Durchführung dokumentiert sein.

Praxisprüfung:
1. Welche Leistungen erbringt die GmbH?
2. Welche Steuerarten sind betroffen?
3. Gibt es Verträge mit Gesellschaftern oder Geschäftsführern?
4. Sind Vergütungen und Konditionen fremdüblich?
5. Liegen offene oder verdeckte Ausschüttungen vor?
6. Sind Verlustvorträge oder Beteiligungserträge betroffen?
7. Wurden alle Erklärungs-, Zahlungs- und Offenlegungspflichten erfüllt?

Merksatz:
Bei der GmbH müssen Gesellschaft und Gesellschafter steuerlich strikt getrennt werden. Besonders fehleranfällig sind Vergütungen, private Kosten, Darlehen und Ausschüttungen.

Quellenhinweise:
[1] §§ 1, 7, 8, 8b, 23, 27 und 31 KStG.
[2] §§ 2, 7 bis 11 und 16 GewStG.
[3] §§ 20, 32d und 43 EStG.

Rechtsstand: 2026.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === koerperschaftsteuerGmbhGrundlagen.id)) {
  KNOWLEDGE_BASE.push(koerperschaftsteuerGmbhGrundlagen);
}
