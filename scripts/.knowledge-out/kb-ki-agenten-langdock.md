---
id: ki-agenten-langdock
title: KI-Agenten in Langdock — Aufbau und Einsatz im Kanzleialltag
category: DATEV
source: Internes Team-Handout — KI-Agenten in Langdock.
---

# KI-Agenten in Langdock — Aufbau und Einsatz im Kanzleialltag

_Spezialisierte Chatbots mit Anweisungen, Skills und Wissensquellen — stark bei Konvertierung, Importvorbereitung und Vorprüfung._

Ein KI-Agent in Langdock ist ein vorkonfigurierter Chatbot mit hinterlegten Anweisungen, Skills und Wissensordnern. Vorteil gegenüber freiem Prompten: einheitliche Ergebnisse, geringere Einstiegshürde, formularbasierte Eingaben.

Arbeitslogik
- Pflichtfelder (Berater-/Mandantennummer, Vorgangsart, Zielformat) füllen.
- Anhänge entscheiden über die Qualität: PDFs, CSV, Excel, Exportdaten, idealerweise GDPdU-Daten.
- Optionale Hinweise im Freitext für Fallbesonderheiten ergänzen.
- Ergebnis lesen, fachlich prüfen, Folgeschritte ableiten.

Typische Agenten
- QM-Chatbot: interne QM- und Wissenssuche in natürlicher Sprache.
- Dokumentenübersetzer: Verträge, Belege, PDFs übersetzen.
- Kontoauszug-Converter: PDF/CSV → MT940 oder CAMT.053 (PayPal/Stripe oft mit Pseudo-IBAN; bei Stripe Datumsformat beachten).
- Buchungsvorlauf-Converter: Fremddaten → DATEV-Buchungsvorlauf; Matching mit Debitorenliste.
- Anlagevermögens-Converter: Anlagenverzeichnis aus Fremdsystemen für DATEV-Import vorbereiten.
- Fachagenten: Anhang, WP-Anfragen, Jahresabschluss, Fremdwährung, Einkommensteuer, Gesellschafterdarlehen, Tax-Compliance/NPO.
- Organigramm-Agent laut Hinweis derzeit nicht zuverlässig — nicht nutzen.

Ergebnislogik
- Risikoeinstufung, Folgeprompts, Hinweise auf fehlende Unterlagen, Arbeitspapier-Struktur für die Akte.
- Subagenten delegieren Spezialprüfungen im Hintergrund.

Qualitätsregeln
- Fachliche Endkontrolle bleibt immer beim Menschen.
- Saubere Eingaben → kritische Prüfung → Rückmeldung von Fehlern an die Agenten-Pflege.

<!-- keywords: langdock|ki[- ]?agent|qm[- ]?chatbot|kontoauszug[- ]?converter|buchungsvorlauf[- ]?converter|mt940|camt\.?053 -->
