import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const sozialversicherungBetriebspruefung: KBEntry = {
  id: "sozialversicherung-betriebspruefung",
  title: "Betriebsprüfung in der Sozialversicherung",
  short:
    "Prüfung der Arbeitgeber durch die Deutsche Rentenversicherung: Prüfungsrhythmus, euBP, Unterlagen, Schwerpunkte und typische Risiken.",
  category: "Sozialversicherung",
  type: "praxis",
  source:
    "Zusammenfassung nach § 28p SGB IV, § 166 Abs. 2 SGB VII, Beitragsverfahrensverordnung und den Grundsätzen zur elektronisch unterstützten Betriebsprüfung; Rechtsstand Juli 2026.",
  keywords:
    "betriebsprüfung sozialversicherung|sozialversicherungsprüfung|drv prüfung|deutsche rentenversicherung arbeitgeberprüfung|§ 28p sgb iv|eubp|elektronisch unterstützte betriebsprüfung|entgeltabrechnung prüfung|finanzbuchhaltungsdaten eubp|künstlersozialabgabe prüfung|unfallversicherung prüfung|deüv meldungen|insolvenzgeldumlage|aag umlagen|wertguthaben insolvenzschutz|scheinselbstständigkeit prüfung|minijob prüfung|mindestlohn sozialversicherung|entgeltunterlagen|prüfzeitraum vier jahre",
  references: [
    "§ 28p SGB IV",
    "§ 28f SGB IV",
    "§ 95b SGB IV",
    "§ 126 SGB IV",
    "§ 166 Abs. 2 SGB VII",
    "§ 35 KSVG",
    "Beitragsverfahrensverordnung",
    "Grundsätze für die Übermittlung der Daten für die euBP, gültig ab 01.01.2025",
  ],
  importance: 5,
  body: `Die Betriebsprüfung in der Sozialversicherung wird grundsätzlich von den Trägern der Deutschen Rentenversicherung durchgeführt. Sie soll sicherstellen, dass Arbeitgeber ihre Melde-, Aufzeichnungs- und Beitragspflichten ordnungsgemäß erfüllen.

1. Prüfungsrhythmus und Zweck
- Arbeitgeber werden grundsätzlich mindestens alle vier Jahre geprüft.
- Geprüft werden insbesondere die Richtigkeit der Beitragszahlungen und der Meldungen zur Sozialversicherung.
- Der Prüfzeitraum umfasst regelmäßig den noch nicht verjährten Zeitraum; Beitragsansprüche verjähren grundsätzlich vier Jahre nach Ablauf des Kalenderjahres der Fälligkeit.
- Bei vorsätzlich vorenthaltenen Beiträgen können deutlich längere Verjährungsfristen gelten.

2. Welche Bereiche werden geprüft?
Typische Prüffelder sind:
- Versicherungspflicht oder Versicherungsfreiheit der Beschäftigten,
- richtige Beurteilung von Beschäftigung und Selbstständigkeit,
- Beitragsberechnung in Kranken-, Pflege-, Renten- und Arbeitslosenversicherung,
- Arbeitnehmeranteile und rechtzeitige Zahlung an die Einzugsstellen,
- Umlagen U1, U2 und Insolvenzgeldumlage,
- DEÜV-Meldungen und Beitragsnachweise,
- Minijobs und kurzfristige Beschäftigungen,
- geschuldetes, aber nicht gezahltes Arbeitsentgelt, insbesondere Mindestlohn oder Tariflohn,
- Künstlersozialabgabe und Meldepflichten nach dem KSVG,
- Angaben zur Unfallversicherung und Zuordnung zu Gefahrtarifstellen,
- Insolvenzschutz bei Wertguthabenvereinbarungen.

Die Prüfung kann auf die Entgeltunterlagen beschränkt werden, darf aber auch auf die Finanzbuchhaltung, Voraufzeichnungen, Verträge, Belege und weitere Teile des Rechnungswesens ausgedehnt werden. Gerade geldwerte Vorteile, Fremdleistungen oder mögliche Scheinselbstständigkeit sind häufig nur dort erkennbar.

3. Elektronisch unterstützte Betriebsprüfung (euBP)
- Seit 1.1.2023 ist die elektronische Übermittlung der Entgeltabrechnungsdaten grundsätzlich verpflichtend.
- Seit 1.1.2025 sind zusätzlich die erforderlichen Daten der Finanzbuchhaltung elektronisch zu übermitteln.
- Die Übermittlung erfolgt aus einem systemgeprüften Entgeltabrechnungsprogramm oder über eine systemgeprüfte Schnittstelle bzw. ein geprüftes Modul der Finanzbuchhaltung.
- Für Abrechnungszeiträume bis zum 31.12.2026 kann der Arbeitgeber im begründeten Einzelfall beim zuständigen Rentenversicherungsträger einen Verzicht auf die elektronische Übermittlung beantragen.

4. Vorbereitung und Ankündigung
- Die Prüfung wird regelmäßig vorher angekündigt.
- Sie soll möglichst einen Monat und grundsätzlich spätestens 14 Tage vorher angekündigt werden.
- Bei besonderen Gründen, zum Beispiel Insolvenz, Betriebsaufgabe, Verdacht auf Beitragshinterziehung oder Schwarzarbeit, kann eine Prüfung unangekündigt erfolgen.
- Die Prüfung kann beim Arbeitgeber, bei der Abrechnungsstelle oder bei der prüfenden Stelle stattfinden.

5. Vorzulegende Unterlagen
Wichtige Unterlagen sind insbesondere:
- Lohnkonten und Entgeltabrechnungen,
- Beitragsnachweise und DEÜV-Meldungen,
- Arbeitsverträge und Statusunterlagen,
- Unterlagen zu Minijobs und kurzfristigen Beschäftigungen,
- Nachweise über Versicherungsfreiheit oder Befreiungen,
- Stundenaufzeichnungen und Mindestlohndokumentation,
- Befreiungserklärungen von Minijobbern,
- Nachweise zur Elterneigenschaft in der Pflegeversicherung,
- Finanzbuchhaltungsdaten und relevante Belege,
- Bescheide und Prüfberichte der Finanzverwaltung,
- Unterlagen zur Künstlersozialabgabe,
- Wertguthabenvereinbarungen und Insolvenzschutz.

Seit 1.1.2022 sind bestimmte begleitende Entgeltunterlagen grundsätzlich elektronisch zu führen. Die Daten müssen während der Prüfung vollständig, nachvollziehbar und ohne vermeidbare Verzögerung verfügbar sein.

6. Verhältnis zur Lohnsteuer-Außenprüfung
Die DRV-Betriebsprüfung prüft Sozialversicherungsbeiträge, nicht die korrekte Lohnsteuer. Diese wird im Rahmen der Lohnsteuer-Außenprüfung durch die Finanzverwaltung geprüft. Lohnsteuer-Haftungsbescheide und Prüfberichte werden von der Rentenversicherung jedoch sozialversicherungsrechtlich ausgewertet.

Praxischeckliste
- Letzte DRV-Prüfung und aktuellen Prüfzeitraum festgestellt?
- euBP-Daten aus Lohn- und Finanzbuchhaltung technisch übermittelbar?
- Entgeltunterlagen vollständig und elektronisch verfügbar?
- Minijobs, kurzfristige Beschäftigungen und Fremdkräfte geprüft?
- Statusfragen bei Geschäftsführern und Selbstständigen dokumentiert?
- Sachbezüge, Reisekosten, Firmenwagen und sonstige Vorteile abgeglichen?
- DEÜV-Meldungen und Beitragsnachweise plausibilisiert?
- Künstlersozialabgabe geprüft?
- Lohnsteuer-Prüfberichte sozialversicherungsrechtlich ausgewertet?
- Mindestlohn- und Arbeitszeitaufzeichnungen vollständig?

Typische Fehler
- Freie Mitarbeiter werden trotz tatsächlicher Beschäftigung als selbstständig behandelt.
- Entgeltbestandteile sind nur in der Finanzbuchhaltung, nicht aber in der Lohnabrechnung erfasst.
- Minijobs oder kurzfristige Beschäftigungen werden falsch beurteilt.
- Arbeitnehmeranteile oder Umlagen werden verspätet oder unvollständig abgeführt.
- Lohnsteuer-Haftungsbescheide werden nicht auf Sozialversicherungspflicht geprüft.
- euBP-Daten können nicht vollständig oder nicht fristgerecht bereitgestellt werden.
- Künstlersozialabgabe oder Insolvenzgeldumlage werden übersehen.
- Geschuldeter Mindest- oder Tariflohn wird nicht in die Beitragsberechnung einbezogen.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === sozialversicherungBetriebspruefung.id)) {
  KNOWLEDGE_BASE.push(sozialversicherungBetriebspruefung);
}
