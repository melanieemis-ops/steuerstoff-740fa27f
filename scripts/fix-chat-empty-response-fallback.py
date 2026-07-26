from pathlib import Path

path = Path('src/routes/chat.tsx')
text = path.read_text(encoding='utf-8')

old = '''      if (trimmed && attachmentsToSend.length === 0) {
        try {
          const fallback = withFallbackMarker(generateAnswer(trimmed));
          const aiMsg: Msg = { id: uid(), role: "assistant", answer: fallback, t: Date.now() };
          setMessages((prev) => [...prev, aiMsg]);
        } catch {
          const errMsg: Msg = {
            id: uid(),
            role: "error",
            text:
              (error as Error).message ||
              "Antwort konnte nicht erstellt werden. Bitte erneut versuchen.",
            t: Date.now(),
            retryOf: userMsg.id,
          };
          setMessages((prev) => [...prev, errMsg]);
        }
      } else {'''

new = '''      if (trimmed && attachmentsToSend.length === 0) {
        let fallback: ChatAnswer;
        try {
          fallback = withFallbackMarker(generateAnswer(trimmed));
        } catch (fallbackError) {
          console.error(
            "[steuerstoff-chat] local fallback failed:",
            fallbackError instanceof Error ? fallbackError.message : "unknown",
          );
          const normalized = trimmed
            .normalize("NFD")
            .replace(/[\\u0300-\\u036f]/g, "")
            .replace(/ß/g, "ss")
            .toLowerCase();
          const isDepreciationQuestion =
            /abschreib|\\bafa\\b|wertminder|niederstwert|restbuchwert|sonderabschreib/.test(
              normalized,
            );

          fallback = withFallbackMarker(
            isDepreciationQuestion
              ? {
                  kind: "info",
                  summary:
                    "Die wichtigsten Abschreibungsarten sind die lineare, degressive, progressive und leistungsabhängige Abschreibung. Daneben gibt es außerplanmäßige Abschreibungen bei Wertminderungen sowie steuerliche Sonderabschreibungen, insbesondere nach §§ 7g und 7b EStG.",
                  sections: [
                    {
                      title: "Planmäßige Abschreibungen",
                      body:
                        "Lineare Abschreibung: gleichbleibende Jahresbeträge. Degressive Abschreibung: fallende Jahresbeträge. Progressive Abschreibung: steigende Jahresbeträge und handelsrechtlich nur ausnahmsweise passend. Leistungsabhängige Abschreibung: Verteilung nach der tatsächlichen Nutzung oder Leistung.",
                    },
                    {
                      title: "Außerplanmäßige Abschreibung",
                      body:
                        "Sie berücksichtigt zusätzliche Wertminderungen. Beim Anlagevermögen ist handelsrechtlich grundsätzlich eine voraussichtlich dauernde Wertminderung erforderlich; beim Umlaufvermögen gilt das strenge Niederstwertprinzip.",
                    },
                    {
                      title: "Steuerliche Sonderabschreibungen",
                      body:
                        "Sonderabschreibungen treten neben die normale AfA, zum Beispiel für kleine und mittlere Betriebe nach § 7g EStG oder für begünstigten Mietwohnungsneubau nach § 7b EStG.",
                    },
                  ],
                  nextStep:
                    "Für einen konkreten Fall bitte Wirtschaftsgut, Anschaffungsdatum, Kosten und Nutzungsdauer ergänzen.",
                  links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
                  knowledge: "Abschreibung",
                  confidence: "high",
                }
              : {
                  kind: "info",
                  summary:
                    "Das KI-Modell hat keine verwertbare Antwort geliefert. Die lokale Wissenslogik konnte ebenfalls nicht vollständig geladen werden. Bitte versuche die Frage erneut oder öffne die Wissensdatenbank.",
                  nextStep: "Frage erneut senden oder in der Wissensdatenbank nach dem Thema suchen.",
                  links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
                  confidence: "low",
                  needsHumanReview: true,
                },
          );
        }

        const aiMsg: Msg = { id: uid(), role: "assistant", answer: fallback, t: Date.now() };
        setMessages((prev) => [...prev, aiMsg]);
      } else {'''

if old not in text:
    raise SystemExit('Expected fallback block not found in src/routes/chat.tsx')

text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')

Path('scripts/fix-chat-empty-response-fallback.py').unlink(missing_ok=True)
Path('.github/workflows/fix-chat-empty-response-fallback-once.yml').unlink(missing_ok=True)
