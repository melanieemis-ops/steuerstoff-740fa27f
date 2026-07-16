---
id: datev-lerndateien
title: DATEV Lerndateien & Buchungsvorschläge
category: DATEV
source: Internes Handout — Lerndateien, Buchungsvorschläge & Automatisierung.
---

⇨ DATEV Lerndateien & Buchungsvorschläge

_Kriterien richtig wählen, Sternchen-Platzhalter, automatisiertes Buchen, AS1-Spalte und Aufräumen bestehender Bestände._

Grundsatz: So wenig Kriterien wie möglich, so viel wie nötig. Eine Lerndatei soll den wiederkehrenden Sachverhalt präzise treffen.

Anlegen
- Wege: Funktion oben im Programm, Shortcut Alt + -, oder STRG + L.
- Oben: Was soll gebucht werden (Konto, Personenkonto, Aufteilung).
- Unten: Wann soll die Lerndatei greifen (Kriterien je Rechnungskreis).

Geeignete Kriterien
- Wiederkehrende Begriffe im Verwendungszweck.
- Stabile Auftraggeber/Geschäftspartner kombiniert mit weiteren Kriterien.
- Transaktionstypen bei PayPal/Amazon.
- Ware/Leistung bei Eingangs- und Ausgangsrechnungen.

Riskante Kriterien
- Datum, Monat, Zeitraum (z. B. 06/23).
- Rechnungsnummern, laufende Referenzen.
- Wechselnde Beträge, zufällige Zeichenketten.
- Zu kurze Stichwörter (z. B. nur „AAG“).
- Nur der Auftraggeber, wenn unterschiedliche Sachverhalte möglich sind.

Sternchen-Platzhalter
- *Einzahlung* — beliebiger Text vor/nach „Einzahlung“.
- *Erstattung*AAG* — beide Stichwörter müssen vorkommen.
- *Beitr*ge* — deckt „Beiträge“ und „Beitraege“ ab.
- Zu viele Sternchen oder zu kurze Textteile machen die Lerndatei gefährlich breit.

Lerndateien testen: Transaktionen reimportieren und Vorschläge prüfen.

Buchungsvorschläge — Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung.
- Rot: kein Vorschlag/Fehler → Sachverhalt klären.

Automatisiertes Buchen
- Erst aktivieren, wenn Vorschläge stabil greifen und erste Zeiträume plausibel geprüft sind.
- AS1-Spalte zeigt den tatsächlichen Vollautomatisierungsgrad; standardmäßig ausgeblendet, über Listen-Einstellungen aktivieren.
- Sobald ein Buchungssatz erneut geöffnet oder verändert wird, entfällt die AS1-Kennzeichnung.

Pflege bestehender Bestände
- Übernommene Bestände kritisch prüfen: leere, redundante oder zu allgemeine Lerndateien aufräumen.
- Lerndateien, die nur einmal greifen, verschwenden Pflegeaufwand.

Neue Prüfungslogik
- Weg von der Einzelfallkontrolle jedes Belegs, hin zu risikoorientierter Stichprobe und gezielter Kontrolle der gelben/roten Fälle.

<!-- keywords: lerndatei|buchungsvorschlag|automatisches buchen|sternchen.*platzhalter|alt\s*\+\s*-|strg\s*\+\s*l -->
