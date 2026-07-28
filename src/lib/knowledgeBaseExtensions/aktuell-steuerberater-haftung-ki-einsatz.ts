import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const aktuellSteuerberaterHaftungKiEinsatz: KBEntry = {
  id: "aktuell-steuerberater-haftung-ki-einsatz",
  title: "Steuerberater-Haftung beim Einsatz von KI",
  short:
    "Kompakter Überblick zu Haftung, Kontrollpflichten, Transparenz, Mitarbeiterschulung und Berufshaftpflicht beim beruflichen Einsatz künstlicher Intelligenz.",
  category: "Aktuell",
  type: "verwaltung",
  source:
    "Zusammenfassung eines Fachbeitrags zum verantwortungsvollen Einsatz künstlicher Intelligenz in der Steuerberatung.",
  keywords:
    "steuerberater haftung ki|künstliche intelligenz steuerberatung|ki halluzinationen|berufshaftpflicht ki|kanzlei ki richtlinie|kontrollpflicht ki|überwachungspflicht steuerberater|§ 611 bgb|§ 631 bgb|§§ 280 ff. bgb|§ 67 stberg",
  references: [
    "§§ 280 ff. BGB",
    "§ 611 BGB",
    "§ 631 BGB",
    "§ 67 StBerG",
  ],
  importance: 5,
  body: `Künstliche Intelligenz kann Steuerberater bei Recherchen, Berechnungen, Steuererklärungen, Gutachten und der Formulierung von Schreiben unterstützen. Die fachliche Verantwortung verbleibt jedoch vollständig beim Berufsangehörigen.

Haftungsgrundlagen
Die Mandatsbeziehung ist regelmäßig ein Geschäftsbesorgungsvertrag mit Dienstleistungscharakter. Bei einer klar abgegrenzten Einzelleistung, etwa einem Gutachten oder einer einzelnen Steuererklärung, kann ein Werkvertrag vorliegen. Für Pflichtverletzungen gelten die allgemeinen Haftungsregeln der §§ 280 ff. BGB. Spezielle Haftungsvorschriften für den Einsatz von KI bestehen nicht.

KI ist nur ein Hilfsmittel
Fehler eines KI-Systems werden rechtlich grundsätzlich wie Fehler anderer eingesetzter Hilfsmittel oder Mitarbeiter behandelt. Halluzinationen, erfundene Quellen oder fehlerhafte Berechnungen entlasten den Steuerberater nicht. KI-Ergebnisse dürfen deshalb niemals ungeprüft übernommen werden.

Kontroll- und Überwachungspflichten
Der Steuerberater oder ein fachkundiger Mitarbeiter muss jedes KI-Ergebnis auf Plausibilität, Vollständigkeit und fachliche Richtigkeit prüfen. Dabei gilt eine strikte Risikoorientierung: Je wichtiger und haftungsträchtiger das Ergebnis, desto intensiver muss die Kontrolle ausfallen. Auffälligkeiten und Fehlfunktionen sollten dokumentiert und unverzüglich behoben werden.

Kanzleiorganisation
Mitarbeiter, die KI beruflich einsetzen, benötigen geeignete Schulungen und Fortbildungen. Empfehlenswert ist eine kanzleiinterne KI-Richtlinie mit klaren Vorgaben zu zulässigen Anwendungen, Kontrollschritten, Datenschutz, Dokumentation und Verantwortlichkeiten.

Transparenz gegenüber Mandanten
Werden wesentliche Arbeitsschritte durch KI unterstützt, sollte dies gegenüber dem Mandanten transparent geregelt werden, möglichst im Beratungsvertrag. Das betrifft insbesondere Rechtsprechungsrecherchen, Gutachten, Schreiben an Finanzbehörden und Steuererklärungen.

Berufshaftpflicht
Zusätzlich ist zu prüfen, ob die Berufshaftpflichtversicherung nach § 67 StBerG den Einsatz von KI umfasst. Verlangt der Versicherer besondere Dokumentations- oder Überwachungspflichten, müssen diese verbindlich in den Kanzleiabläufen umgesetzt werden.

Praxishinweis
KI kann die Arbeit erheblich erleichtern, ersetzt aber weder Fachwissen noch persönliche Verantwortung. Entscheidend sind fachliche Endkontrolle, nachvollziehbare Dokumentation, geschulte Mitarbeiter und klare interne Regeln.

Merksatz
KI darf unterstützen – entscheiden, prüfen und haften muss weiterhin der Steuerberater.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === aktuellSteuerberaterHaftungKiEinsatz.id)) {
  KNOWLEDGE_BASE.push(aktuellSteuerberaterHaftungKiEinsatz);
}
