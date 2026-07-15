import { useMemo } from "react";

export type DisplaySource = {
  id?: string;
  title: string;
  reference?: string | null;
  excerpt?: string;
};

function cleanText(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/^["“”]+|["“”]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function relevanceDescription(source: DisplaySource): string {
  const excerpt = cleanText(source.excerpt);
  if (!excerpt) return "Als fachliche Grundlage für die Antwort verwendet.";
  const sentence = excerpt.split(/(?<=[.!?])\s+/)[0] || excerpt;
  return sentence.length > 160 ? sentence.slice(0, 157).trimEnd() + "…" : sentence;
}

export function CompactSources({ sources }: { sources: DisplaySource[] }) {
  const visible = useMemo(() => {
    const seen = new Set<string>();
    return sources
      .filter((source) => {
        const key = `${cleanText(source.title).toLowerCase()}|${cleanText(source.reference).toLowerCase()}`;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);
  }, [sources]);

  if (!visible.length) return null;

  return (
    <section className="steuerstoff-sources" aria-label="Verwendete Wissensquellen">
      <h3>Verwendete Quellen</h3>
      <ol>
        {visible.map((source, index) => (
          <li key={source.id ?? `${source.title}-${index}`}>
            <div className="steuerstoff-source-head">
              <span className="steuerstoff-source-number">[{index + 1}]</span>
              <div>
                <p className="steuerstoff-source-title">{cleanText(source.title)}</p>
                {source.reference ? (
                  <p className="steuerstoff-source-reference">
                    {cleanText(source.reference)}
                  </p>
                ) : null}
              </div>
            </div>

            <p className="steuerstoff-source-relevance">
              {relevanceDescription(source)}
            </p>

            {source.excerpt ? (
              <details>
                <summary>Fundstelle anzeigen</summary>
                <p>{cleanText(source.excerpt)}</p>
              </details>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
