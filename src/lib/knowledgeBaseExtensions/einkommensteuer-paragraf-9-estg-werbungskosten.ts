import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf9EstgWerbungskosten: KBEntry = {
  id: "einkommensteuer-paragraf-9-estg-werbungskosten",
  title: "§ 9 EStG – Werbungskosten",
  short:
    "Werbungskosten sind beruflich oder einkunftsbezogen veranlasste Aufwendungen zur Erwerbung, Sicherung und Erhaltung von Einnahmen. § 9 EStG regelt insbesondere Fahrtkosten, Reisekosten, doppelte Haushaltsführung, Arbeitsmittel, Verpflegung und Ausbildungskosten.",
  category: "Einkommensteuer",
  type: "gesetz",
  source: "Kompakte Zusammenfassung des § 9 EStG; Rechtsstand Juli 2026.",
  keywords:
    "§ 9 estg|werbungskosten|arbeitnehmer|berufskosten|einkunftsbezogene aufwendungen|entfernungspauschale|erste tätigkeitsstätte|reisekosten|auswärtstätigkeit|doppelte haushaltsführung|familienheimfahrt|verpflegungspauschale|arbeitsmittel|berufskleidung|fortbildungskosten|studium|erstausbildung|übernachtungskosten|schuldzinsen|berufsverband",
  references: [
    "§ 9 EStG",
    "§ 9 Abs. 1 EStG",
    "§ 9 Abs. 2 EStG",
    "§ 9 Abs. 4 EStG",
    "§ 9 Abs. 4a EStG",
    "§ 9 Abs. 6 EStG",
  ],
  importance: 5,
  body: `Werbungskosten sind Aufwendungen zur Erwerbung, Sicherung und Erhaltung von Einnahmen. Sie werden bei der Einkunftsart abgezogen, durch die sie veranlasst sind.

Typische Werbungskosten
- Schuldzinsen, Renten und dauernde Lasten mit wirtschaftlichem Zusammenhang zu einer Einkunftsart.
- Grundstücksbezogene Steuern, öffentliche Abgaben und Versicherungen bei der Einnahmeerzielung.
- Beiträge zu Berufsständen und Berufsverbänden.
- Arbeitsmittel, zum Beispiel Werkzeuge, Computer oder typische Berufskleidung.
- Absetzungen für Abnutzung (AfA), Sonderabschreibungen und erhöhte Absetzungen.

Fahrten zur ersten Tätigkeitsstätte
Für Fahrten zwischen Wohnung und erster Tätigkeitsstätte gilt die Entfernungspauschale von 0,38 € je vollem Kilometer der einfachen Entfernung. Der Abzug ist grundsätzlich auf 4.500 € jährlich begrenzt; bei Nutzung eines eigenen oder überlassenen Kraftwagens kann ein höherer Betrag berücksichtigt werden. Maßgeblich ist regelmäßig die kürzeste Straßenverbindung, ausnahmsweise eine offensichtlich verkehrsgünstigere und regelmäßig genutzte Strecke.

Berufliche Auswärtstätigkeit
Fahrten, die keine Wege zur ersten Tätigkeitsstätte und keine Familienheimfahrten sind, können mit den tatsächlichen Kosten oder den pauschalen Kilometersätzen nach dem Bundesreisekostengesetz angesetzt werden. Für notwendige Übernachtungen sind grundsätzlich die tatsächlichen Kosten abziehbar.

Doppelte Haushaltsführung
Voraussetzungen sind ein eigener Hausstand außerhalb des Beschäftigungsorts, eine finanzielle Beteiligung an dessen Lebensführung und eine Unterkunft am Ort der ersten Tätigkeitsstätte. Unterkunftskosten sind im Inland bis 1.000 € monatlich und im Ausland grundsätzlich bis 2.000 € monatlich abziehbar. Zusätzlich kann grundsätzlich eine Familienheimfahrt pro Woche mit 0,38 € je Entfernungskilometer berücksichtigt werden.

Verpflegungsmehraufwendungen
Bei beruflicher Auswärtstätigkeit gelten Pauschalen von:
- 28 € bei 24-stündiger Abwesenheit,
- 14 € für An- und Abreisetage mit Übernachtung,
- 14 € bei mehr als acht Stunden Abwesenheit ohne Übernachtung.

Die Pauschalen sind grundsätzlich auf die ersten drei Monate an derselben Tätigkeitsstätte begrenzt. Eine Unterbrechung von mindestens vier Wochen lässt die Frist neu beginnen. Vom Arbeitgeber gestellte Mahlzeiten kürzen die Pauschale um 20 % für Frühstück und jeweils 40 % für Mittag- oder Abendessen, bezogen auf die volle Tagespauschale.

Erste Tätigkeitsstätte
Erste Tätigkeitsstätte ist eine ortsfeste betriebliche Einrichtung, der der Arbeitnehmer dauerhaft zugeordnet ist. Fehlt eine eindeutige Zuordnung, greifen quantitative Kriterien: typischerweise arbeitstäglich, zwei volle Arbeitstage pro Woche oder mindestens ein Drittel der regelmäßigen Arbeitszeit. Je Dienstverhältnis gibt es höchstens eine erste Tätigkeitsstätte.

Ausbildung und Studium
Aufwendungen für Berufsausbildung oder Studium sind nur Werbungskosten, wenn bereits eine Erstausbildung abgeschlossen wurde oder die Ausbildung beziehungsweise das Studium im Rahmen eines Dienstverhältnisses stattfindet. Eine Erstausbildung erfordert grundsätzlich eine geordnete Ausbildung von mindestens zwölf Monaten bei Vollzeit und eine Abschlussprüfung.

Merke
Entscheidend ist immer der objektive wirtschaftliche Zusammenhang mit steuerpflichtigen Einnahmen. Private Lebensführungskosten bleiben grundsätzlich nicht abziehbar. Bei gemischter Veranlassung ist zu prüfen, ob eine sachgerechte Aufteilung möglich ist.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf9EstgWerbungskosten.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf9EstgWerbungskosten);
}
