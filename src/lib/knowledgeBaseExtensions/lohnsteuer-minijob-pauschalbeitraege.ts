import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const lohnsteuerMinijobPauschalbeitraege: KBEntry = {
  id: "lohnsteuer-minijob-pauschalbeitraege",
  title: "Minijob: Pauschalbeiträge zur Kranken- und Rentenversicherung",
  short:
    "Pauschalbeiträge bei geringfügig entlohnten Beschäftigungen: Beitragssätze, Voraussetzungen, Sonderfälle, Mindestbeitrag und Abführung.",
  category: "Lohnsteuer",
  type: "praxis",
  source:
    "Zusammenfassung nach § 249b SGB V, §§ 168, 172 SGB VI und den Geringfügigkeits-Richtlinien; Rechtsstand 2026.",
  keywords:
    "minijob pauschalbeiträge|geringfügige beschäftigung|603 euro minijob|pauschalbeitrag krankenversicherung|13 prozent krankenversicherung|5 prozent privathaushalt|pauschalbeitrag rentenversicherung|15 prozent rentenversicherung|mindestbeitragsbemessungsgrundlage 175 euro|minijob zentrale|kurzfristige beschäftigung|praktikant minijob|beamter minijob|versorgungswerk minijob|rentenversicherungspflicht minijob",
  references: [
    "§ 249b SGB V",
    "§ 168 Abs. 1 Nr. 1b und 1c SGB VI",
    "§ 172 Abs. 3 und 3a SGB VI",
    "§ 163 Abs. 8 SGB VI",
    "Geringfügigkeits-Richtlinien",
  ],
  importance: 5,
  body: `Für geringfügig entlohnte Beschäftigungen zahlt der Arbeitgeber unter bestimmten Voraussetzungen Pauschalbeiträge zur Kranken- und Rentenversicherung. Die Beiträge trägt grundsätzlich allein der Arbeitgeber. Eine Abwälzung der Arbeitgeber-Pauschalbeiträge auf den Arbeitnehmer ist unzulässig und kann als Ordnungswidrigkeit geahndet werden.

1. Krankenversicherung
Der Pauschalbeitrag beträgt:
- 13 % des Arbeitsentgelts bei gewerblichen Arbeitgebern,
- 5 % bei Beschäftigungen im Privathaushalt.

Voraussetzung ist, dass der Minijobber gesetzlich krankenversichert ist. Ob Pflicht-, freiwillige oder Familienversicherung besteht, ist unerheblich. Durch den Pauschalbeitrag entsteht keine eigene Mitgliedschaft und insbesondere kein Krankengeldanspruch.

Für privat krankenversicherte Minijobber fällt kein Pauschalbeitrag zur Krankenversicherung an.

2. Rentenversicherung
Der Arbeitgeberanteil beträgt:
- 15 % des Arbeitsentgelts bei gewerblichen Arbeitgebern,
- 5 % bei Beschäftigungen im Privathaushalt.

Ist der Minijobber rentenversicherungspflichtig, wird der Beitrag auf den allgemeinen Beitragssatz von 18,6 % aufgestockt. Den Unterschiedsbetrag trägt der Arbeitnehmer:
- regelmäßig 3,6 % im gewerblichen Bereich,
- regelmäßig 13,6 % im Privathaushalt.

3. Mindestbeitragsbemessungsgrundlage
Bei bestehender Rentenversicherungspflicht gilt grundsätzlich eine Mindestbeitragsbemessungsgrundlage von 175 EUR monatlich. Daraus ergibt sich ein Mindestbeitrag von 32,55 EUR. Liegt das tatsächliche Entgelt darunter, muss der Arbeitnehmer die Differenz zwischen dem Mindestbeitrag und dem Arbeitgeberanteil tragen.

Die Mindestbeitragsbemessungsgrundlage gilt nicht für reine Arbeitgeber-Pauschalbeiträge bei Rentenversicherungsfreiheit oder Befreiung.

Bei Beginn, Ende oder relevanter Unterbrechung im laufenden Monat wird sie anteilig berechnet:
175 EUR × Kalendertage ÷ 30.

4. Typische Sonderfälle
- Studenten: Bei einem Minijob bis zur geltenden Geringfügigkeitsgrenze fallen Pauschalbeiträge an, sofern gesetzliche Krankenversicherung besteht.
- Vorgeschriebene Praktika: Aus dem Praktikumsentgelt fallen grundsätzlich keine Minijob-Pauschalbeiträge an; die Versicherungsfreiheit wegen Geringfügigkeit ist regelmäßig ausgeschlossen. Ein daneben ausgeübter Minijob ist gesondert zu beurteilen.
- Nicht vorgeschriebene Vor- oder Nachpraktika: Bei geringfügiger Entlohnung fallen grundsätzlich Pauschalbeiträge an.
- Beamte: Der RV-Pauschalbeitrag ist grundsätzlich zu zahlen. Ausnahme: Der Dienstherr erstreckt die Versorgungsanwartschaft ausdrücklich auf den Minijob.
- Altersvollrentner und andere rentenversicherungsfreie Personen: Der RV-Pauschalbeitrag bleibt grundsätzlich geschuldet.
- Mitglieder berufsständischer Versorgungswerke: Bei Befreiung allein als Minijobber ist der RV-Pauschalbeitrag zu zahlen. Bei förmlicher Befreiung zugunsten des Versorgungswerks sind stattdessen Beiträge an das Versorgungswerk abzuführen.

5. Mehrere Beschäftigungen
Mehrere geringfügig entlohnte Beschäftigungen sind zusammenzurechnen. Wird dadurch Versicherungspflicht ausgelöst, gelten die normalen beitragsrechtlichen Regeln statt der Pauschalbeiträge.

Für die Mindestbeitragsbemessungsgrundlage sind die Entgelte mehrerer rentenversicherungspflichtiger Minijobs zusammenzurechnen. Besteht daneben bereits eine rentenversicherungspflichtige Hauptbeschäftigung, werden die RV-Beiträge im Minijob grundsätzlich aus dem tatsächlichen Entgelt berechnet.

6. Kurzfristige Beschäftigung
Für eine versicherungsfreie kurzfristige Beschäftigung fallen keine Pauschalbeiträge zur Kranken- und Rentenversicherung an. Unberührt bleiben insbesondere Unfallversicherung, Umlagen U1 und U2 sowie Insolvenzgeldumlage.

7. Flexible Arbeitszeit und Wertguthaben
Pauschalbeiträge können auch während entgeltlicher Freistellungsphasen bei flexiblen Arbeitszeitmodellen oder Wertguthabenvereinbarungen anfallen. Wird ein Zeitguthaben ausgezahlt, erfolgt die Beitragsberechnung wie bei einer Einmalzahlung.

8. Abführung
Die Beiträge werden elektronisch im Beitragsnachweis gemeldet und an die Minijob-Zentrale abgeführt. Bei Minijobs im Privathaushalt berechnet die Minijob-Zentrale die Beiträge im Haushaltsscheckverfahren und zieht sie vom Konto des Arbeitgebers ein.

Praxischeck
- Liegt wirklich eine geringfügig entlohnte und keine kurzfristige Beschäftigung vor?
- Ist der Arbeitnehmer gesetzlich oder privat krankenversichert?
- Gewerblicher Arbeitgeber oder Privathaushalt?
- Besteht RV-Pflicht oder wurde eine wirksame Befreiung erklärt?
- Muss die Mindestbeitragsbemessungsgrundlage von 175 EUR berücksichtigt werden?
- Gibt es weitere Beschäftigungen, die zusammenzurechnen sind?
- Liegt ein vorgeschriebenes Praktikum, Beamtenstatus oder eine berufsständische Versorgung vor?
- Beitragsnachweis und Zahlung an die Minijob-Zentrale rechtzeitig veranlasst?`
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === lohnsteuerMinijobPauschalbeitraege.id)) {
  KNOWLEDGE_BASE.push(lohnsteuerMinijobPauschalbeitraege);
}
