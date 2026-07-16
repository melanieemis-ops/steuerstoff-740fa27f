---
id: automatisierungsservice-rechnungen
title: Automatisierungsservice Rechnungen — Voraussetzungen und AS1
category: DATEV
source: Internes Team-Handout — Automatisierungsservice Rechnungen (Kanzlei-Rechnungswesen).
---

⇨ Automatisierungsservice Rechnungen — Voraussetzungen und AS1

_Voraussetzungen, Aktivierung, Symbolik (grün/gelb/rot), echte Automatisierung über die Spalte AS1 messen._

Zielbild
- Der Automatisierungsservice unterstützt die Verarbeitung von Eingangs- und Ausgangsrechnungen im DATEV-Rechnungswesen.
- Er lebt von Datenhistorie, wiederkehrenden Mustern und einer sauberen digitalen Prozesskette.

Voraussetzungen
- Regelmäßige Sendung ins Rechenzentrum (aktuelle Datenbasis).
- Ausreichende Dokumentenhistorie (offiziell mind. zwei Jahre, praktisch zählt Wiederkehr und Menge).
- OPOS aktiviert und tatsächlich genutzt.
- Behandlungsform „Standard“ (ggf. vor Aktivierung von „Erweitert“ umstellen).
- SKR03 oder SKR04, keine Branchenpakete, kein selbstbuchender Mandant.
- Digitale Belege werden bereits gebucht.

Stammdaten und E-Rechnungen
- System schlägt bei neuen Geschäftspartnern vorbefüllte Stammdaten vor.
- Bei E-Rechnungen können neue Geschäftspartner im Hintergrund automatisch angelegt werden (Einstellung in „Eigenschaften → Digitale Belege“).
- Sonderfälle wie Tankstellen-Filialen sind Prozessentscheidungen — nicht jeder Lieferant muss perfekt zusammengeführt werden.

Aktivierung
- In Kanzlei-Rechnungswesen über „Bestand → Automatisierungsservices“; System prüft Voraussetzungen.
- Robotersymbol in der Statuszeile zeigt nur an, dass mindestens ein Service aktiv ist.
- Pragmatisch testen und beobachten statt theoretisch zerdenken; bei fehlendem Mehrwert wieder deaktivieren.

Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung erforderlich.
- Rot: kein Vorschlag bzw. Fehler → Sachverhalt klären.

AS1-Spalte und echter Automatisierungsgrad
- Spalte AS1 ist standardmäßig nicht sichtbar; je Bestand über Rechtsklick → „Einstellungen Liste“ aktivieren.
- Zeigt, welche Buchungen wirklich vollautomatisch verarbeitet wurden (kein menschlicher Eingriff).
- Sobald ein Buchungssatz erneut geöffnet, bestätigt oder verändert wird, verschwindet die Kennzeichnung für Vollautomatik.
- AS1 ist sichtbar in Primanota/passender Ansicht, nicht im Grundblatt.

Team-Empfehlung
- Systemvorschläge nicht aus Gewohnheit bekämpfen — Prozesse so aufsetzen, dass das System möglichst oft recht hat.
- Manuelle Eingriffe reduzieren, AS1 regelmäßig auswerten, Mehrwert pro Bestand kritisch bewerten.

<!-- keywords: automatisierungsservice|as1[- ]?spalte|robotersymbol|e[- ]?rechnung.*automatik|automatisierungsgrad -->
