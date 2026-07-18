import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";

import { magazineArticles, type MagazineArticle } from "@/data/magazineArticles";
import { ArticleAudioPlayer } from "@/components/magazine/ArticleAudioPlayer";
import { isAudioAllowed } from "@/lib/articleSpeechText";

type MagazinePage =
  | { kind: "cover"; issueId: string; issueLabel: string; src: string; alt: string }
  | { kind: "article"; issueId: string; issueLabel: string; article: MagazineArticle };

type MagazineIssue = {
  id: string;
  label: string;
  cover: { src: string; alt: string };
  articleIds: string[];
};

const magazineIssues: MagazineIssue[] = [
  {
    id: "01",
    label: "Ausgabe 01",
    cover: { src: "/cover.png", alt: "Cover des steuerstoff Magazins – Ausgabe 01/2026" },
    articleIds: [
      "jstg-2026-einkommensteuer",
      "haeusliches-arbeitszimmer-aufzeichnung-bfh-2026",
      "est-reform-2027",
      "ust-gelangensbestaetigung-bfh",
    ],
  },
  {
    id: "02",
    label: "Ausgabe 02",
    cover: { src: "/magazin-seite-02.png", alt: "Cover des steuerstoff Magazins – Ausgabe 02/2026" },
    articleIds: ["mitunternehmeranteil-fehlbuchung-bfh-2026"],
  },
];

const magazinePages: MagazinePage[] = magazineIssues.flatMap((issue) => {
  const pages: MagazinePage[] = [
    {
      kind: "cover",
      issueId: issue.id,
      issueLabel: issue.label,
      src: issue.cover.src,
      alt: issue.cover.alt,
    },
  ];
  for (const id of issue.articleIds) {
    const article = magazineArticles.find((a) => a.id === id);
    if (article) {
      pages.push({ kind: "article", issueId: issue.id, issueLabel: issue.label, article });
    }
  }
  return pages;
});

const issueCoverIndex = (issueId: string) =>
  magazinePages.findIndex((p) => p.kind === "cover" && p.issueId === issueId);


type FlipDirection = "next" | "previous";

function ArticleTeaser({ article }: { article: MagazineArticle }) {
  const leadFirst = article.lead.split(/\n\n+/)[0] ?? article.lead;
  const isSpecial = article.format === "special";
  return (
    <div
      className={`flex h-full w-full flex-col justify-between gap-3 px-5 py-6 ${
        isSpecial
          ? "bg-gradient-to-b from-[#0b1220] via-[#0b1220] to-[#111a2e] text-[#f5efe1]"
          : "text-[#2b2117]"
      }`}
    >
      <div className="min-w-0">
        {isSpecial ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-sm bg-gradient-to-r from-[#22d3ee] to-[#ec4899] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#0b1220]">
              {article.specialtyLabel ?? "steuerstoff SPEZIAL"}
            </span>
            {article.statusLabel ? (
              <span className="rounded-sm border border-[#22d3ee]/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">
                {article.statusLabel}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6b3a]">
            {article.issueLabel}
          </p>
        )}
        <h3
          className={`mt-2 text-[17px] font-semibold leading-snug tracking-tight ${
            isSpecial ? "text-[#f5efe1]" : ""
          }`}
        >
          {article.title}
        </h3>
        {isSpecial && article.subtitle ? (
          <p className="mt-1 text-[11.5px] leading-snug text-[#c8d3ea]">
            {article.subtitle}
          </p>
        ) : null}
        <p
          className={`mt-3 line-clamp-5 text-[12.5px] leading-relaxed ${
            isSpecial ? "text-[#c8d3ea]" : "text-[#4a3d2c]"
          }`}
        >
          {leadFirst}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {article.highlights.map((h) => (
          <div
            key={h.label}
            className={`min-w-0 rounded-lg px-2.5 py-2 ${
              isSpecial
                ? "border border-[#22d3ee]/25 bg-white/5"
                : "border border-[#d9c9ac] bg-white/60"
            }`}
          >
            <div
              className={`truncate text-[9px] font-semibold uppercase tracking-wider ${
                isSpecial ? "text-[#22d3ee]" : "text-[#8a6b3a]"
              }`}
            >
              {h.label}
            </div>
            <div
              className={`mt-0.5 truncate text-[13px] font-semibold ${
                isSpecial ? "text-[#f5efe1]" : "text-[#2b2117]"
              }`}
            >
              {h.value}
            </div>
          </div>
        ))}
      </div>

      <p
        className={`text-center text-[10.5px] font-medium uppercase tracking-[0.18em] ${
          isSpecial ? "text-[#22d3ee]" : "text-[#8a6b3a]"
        }`}
      >
        Im Vollbild vollständig lesen
      </p>
    </div>
  );
}

const NOTICE_LABEL: Record<"wichtig" | "merke" | "praxistipp", string> = {
  wichtig: "Wichtig",
  merke: "Merke",
  praxistipp: "Praxistipp",
};

function renderPageContent(page: MagazinePage): ReactNode {
  if (page.kind === "cover") {
    return (
      <img
        src={page.src}
        alt={page.alt}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
    );
  }
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <ArticleTeaser article={page.article} />
    </div>
  );
}

function pageAltText(page: MagazinePage): string {
  return page.kind === "cover" ? page.alt : page.article.title;
}

function normalizeForSpeech(text: string): string {
  return text
    .replace(/§§/g, "Paragrafen")
    .replace(/§/g, "Paragraf")
    .replace(/(\d+)([a-z])\b/g, "$1 $2")
    .replace(/\bAbs\./g, "Absatz")
    .replace(/\bNr\./g, "Nummer")
    .replace(/\bBuchst\./g, "Buchstabe")
    .replace(/\bEStG\b/g, "Einkommensteuergesetz")
    .replace(/\bUStG\b/g, "Umsatzsteuergesetz")
    .replace(/\bAO\b/g, "Abgabenordnung")
    .replace(/\bKStG\b/g, "Körperschaftsteuergesetz")
    .replace(/\bGewStG\b/g, "Gewerbesteuergesetz")
    .replace(/\bBGB\b/g, "Bürgerliches Gesetzbuch")
    .replace(/\bBFH\b/g, "Bundesfinanzhof")
    .replace(/\bBMF\b/g, "Bundesministerium der Finanzen")
    .replace(/\bEuGH\b/g, "Europäischer Gerichtshof")
    .replace(/\bEWR\b/g, "Europäischer Wirtschaftsraum")
    .replace(/\bEU\b/g, "Europäische Union");
}

function blockToPlainText(block: ArticleBlockLike): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "subheading":
      return block.text;
    case "notice":
      return block.text;
    case "legalStatus":
      return `${block.label}. ${block.text}`;
    case "list":
      return block.items.join(". ");
    case "summary":
      return `${block.title}. ${block.items.join(". ")}`;
    case "keyNumbers":
      return `${block.title}. ${block.items.map((n) => `${n.big}: ${n.label}`).join(". ")}`;
    case "change":
      return [
        `Änderung ${block.number}: ${block.title}. ${block.lawRef}.`,
        ...block.paragraphs,
        ...(block.list ?? []),
        block.practice ? `Praxis: ${block.practice}` : "",
        block.effective ? `Geplant: ${block.effective}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "editorial":
      return `${block.title}. ${block.paragraphs.join(" ")}`;
    case "checklist":
      return `${block.title}. ${block.items.join(". ")}`;
    case "sourceLink":
      return `${block.title}. ${block.text}`;
    default:
      return "";
  }
}

// Local alias to make blockToPlainText typing simple
type ArticleBlockLike = MagazineArticle["blocks"][number];

function ArticleToolbar({ article, hideSpeak = false }: { article: MagazineArticle; hideSpeak?: boolean }) {
  const bookmarkKey = `steuerstoff-magazin-bookmark-${article.id}`;
  const [bookmarked, setBookmarked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    try {
      setBookmarked(localStorage.getItem(bookmarkKey) === "1");
    } catch {
      /* ignore */
    }
  }, [bookmarkKey]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleBookmark = () => {
    try {
      const next = !bookmarked;
      setBookmarked(next);
      if (next) localStorage.setItem(bookmarkKey, "1");
      else localStorage.removeItem(bookmarkKey);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    const shareData = {
      title: article.title,
      text: article.subtitle ?? article.lead.slice(0, 140),
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(shareData);
        return;
      }
    } catch {
      /* fallback */
    }
    try {
      await navigator.clipboard.writeText(`${shareData.title} – ${shareData.url}`);
    } catch {
      /* ignore */
    }
  };

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    const parts: string[] = [
      article.title,
      article.subtitle ?? "",
      article.lead,
      ...article.blocks.map(blockToPlainText),
    ];
    const full = normalizeForSpeech(parts.filter(Boolean).join(". "));
    // Chunk to avoid engine limits
    const chunks = full.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [full];
    synth.cancel();
    chunks.forEach((c, idx) => {
      const u = new SpeechSynthesisUtterance(c.trim());
      u.lang = "de-DE";
      u.rate = 1;
      if (idx === chunks.length - 1) {
        u.onend = () => setIsSpeaking(false);
      }
      synth.speak(u);
    });
    setIsSpeaking(true);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleBookmark}
        aria-pressed={bookmarked}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#22d3ee]/30 bg-[#0b1220]/5 px-3 py-1.5 text-[12px] font-medium text-[#0b1220] transition hover:bg-[#0b1220]/10"
      >
        {bookmarked ? "★ Gemerkt" : "☆ Merken"}
      </button>
      {hideSpeak ? null : (
        <button
          type="button"
          onClick={speak}
          aria-pressed={isSpeaking}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#22d3ee]/30 bg-[#0b1220]/5 px-3 py-1.5 text-[12px] font-medium text-[#0b1220] transition hover:bg-[#0b1220]/10"
        >
          {isSpeaking ? "⏹ Stoppen" : "▶ Vorlesen"}
        </button>
      )}
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#22d3ee]/30 bg-[#0b1220]/5 px-3 py-1.5 text-[12px] font-medium text-[#0b1220] transition hover:bg-[#0b1220]/10"
      >
        Teilen
      </button>
    </div>
  );
}

function ChecklistBlock({
  storageKey,
  items,
  title,
}: {
  storageKey: string;
  items: string[];
  title: string;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === items.length) {
          setChecked(parsed.map(Boolean));
        }
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, items.length]);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = prev.map((v, idx) => (idx === i ? !v : v));
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const done = checked.filter(Boolean).length;

  return (
    <aside
      className="rounded-xl border border-[#0b1220]/15 bg-[#0b1220] px-4 py-5 text-[#f5efe1] sm:px-6"
      aria-label={title}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-[#f5efe1] sm:text-[17px]">
          {title}
        </h3>
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#22d3ee]">
          {done}/{items.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => {
          const id = `${storageKey}-${i}`;
          return (
            <li key={i}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked[i] ?? false}
                  onChange={() => toggle(i)}
                  className="mt-0.5 h-5 w-5 flex-none accent-[#22d3ee]"
                />
                <span
                  className={`text-[14px] leading-snug ${
                    checked[i] ? "text-[#c8d3ea] line-through" : "text-[#f5efe1]"
                  }`}
                >
                  {it}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function FullArticle({ article }: { article: MagazineArticle }) {
  const isSpecial = article.format === "special";
  const containerClass = isSpecial
    ? "mx-auto w-full max-w-[780px] overflow-hidden rounded-2xl bg-[#faf5ea] text-[#1c160e] shadow-[0_20px_60px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
    : "mx-auto w-full max-w-[760px] rounded-xl bg-[#f6f0e7] px-5 py-8 text-[#241c12] shadow-[0_20px_60px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10 sm:px-10 sm:py-12";

  return (
    <article
      className={containerClass}
      style={{
        paddingLeft: isSpecial ? undefined : "max(1.125rem, env(safe-area-inset-left))",
        paddingRight: isSpecial ? undefined : "max(1.125rem, env(safe-area-inset-right))",
      }}
    >
      {isSpecial ? (
        <div
          className="relative bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111a2e] px-5 py-8 text-[#f5efe1] sm:px-10 sm:py-12"
          style={{
            paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
            paddingRight: "max(1.25rem, env(safe-area-inset-right))",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ec4899] to-transparent"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-gradient-to-r from-[#22d3ee] to-[#ec4899] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#0b1220]">
              {article.specialtyLabel ?? "steuerstoff SPEZIAL"}
            </span>
            {article.statusLabel ? (
              <span className="rounded-sm border border-[#22d3ee]/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">
                {article.statusLabel}
              </span>
            ) : null}
            {article.category ? (
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c8d3ea]">
                · {article.category}
              </span>
            ) : null}
          </div>
          <h1
            className="mt-4 font-semibold leading-[1.1] tracking-tight text-[#f5efe1]"
            style={{ fontSize: "clamp(1.75rem, 1.15rem + 2.4vw, 2.75rem)" }}
          >
            {article.title}
          </h1>
          {article.subtitle ? (
            <p
              className="mt-3 max-w-[62ch] leading-snug text-[#c8d3ea]"
              style={{ fontSize: "clamp(1rem, 0.95rem + 0.4vw, 1.2rem)" }}
            >
              {article.subtitle}
            </p>
          ) : null}
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-[#c8d3ea] sm:grid-cols-4">
            {article.author ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#22d3ee]">Autorin</dt>
                <dd className="mt-0.5 font-medium text-[#f5efe1]">{article.author}</dd>
              </div>
            ) : null}
            {article.readingTime ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#22d3ee]">Lesezeit</dt>
                <dd className="mt-0.5 font-medium text-[#f5efe1]">ca. {article.readingTime} Min.</dd>
              </div>
            ) : null}
            {article.legalStatusDate ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#22d3ee]">Rechtsstand</dt>
                <dd className="mt-0.5 font-medium text-[#f5efe1]">
                  {formatGermanDate(article.legalStatusDate)}
                </dd>
              </div>
            ) : null}
            {article.publishedAt ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#22d3ee]">Veröffentlicht</dt>
                <dd className="mt-0.5 font-medium text-[#f5efe1]">
                  {formatGermanDate(article.publishedAt)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : (
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6b3a]">
            steuerstoff Magazin · {article.issueLabel.replace(/^Ausgabe\s+/, "Ausgabe ")}
          </p>
          <h1
            className="mt-3 font-semibold leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 1.15rem + 1.8vw, 2.25rem)" }}
          >
            {article.title}
          </h1>
          {article.lead.split(/\n\n+/).map((para, i) => (
            <p
              key={i}
              className="mt-5 font-medium leading-[1.65] text-[#3a2f20]"
              style={{ fontSize: "clamp(1.075rem, 1rem + 0.45vw, 1.235rem)" }}
            >
              {para}
            </p>
          ))}
        </header>
      )}

      <div
        className={`space-y-5 leading-[1.7] text-[#241c12] ${
          isSpecial ? "px-5 pb-10 pt-6 sm:px-10" : "mt-8"
        }`}
        style={{
          fontSize: "clamp(1.0625rem, 0.98rem + 0.35vw, 1.2rem)",
          ...(isSpecial
            ? {
                paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
                paddingRight: "max(1.25rem, env(safe-area-inset-right))",
              }
            : {}),
        }}
      >
        {isAudioAllowed(article.id) ? (
          <ArticleAudioPlayer
            articleId={article.id}
            browserSpeakContext={
              article.curatedSpeechText && article.curatedSpeechText.trim()
                ? {
                    title: article.title,
                    subtitle: article.subtitle,
                    lead: "",
                    bodyText: "",
                    speechOverride: finalizeCuratedSpeechText(article.curatedSpeechText),
                  }
                : {
                    title: article.title,
                    subtitle: article.subtitle,
                    lead: article.lead,
                    bodyText: article.blocks.map(blockToPlainText).filter(Boolean).join(". "),
                  }
            }
          />
        ) : null}
        {isSpecial || isAudioAllowed(article.id) ? (
          <ArticleToolbar article={article} hideSpeak={isAudioAllowed(article.id)} />
        ) : null}
        {isSpecial ? (
          <p
            className="font-medium leading-[1.65] text-[#3a2f20]"
            style={{ fontSize: "clamp(1.075rem, 1rem + 0.45vw, 1.235rem)" }}
          >
            {article.lead}
          </p>
        ) : null}
        {article.blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h2
                key={i}
                className="pt-3 font-semibold tracking-tight text-[#1c160e]"
                style={{ fontSize: "clamp(1.2rem, 1.05rem + 0.7vw, 1.5rem)" }}
              >
                {block.text}
              </h2>
            );
          }
          if (block.type === "subheading") {
            return (
              <h3
                key={i}
                className="pt-1 font-semibold tracking-tight text-[#1c160e]"
                style={{ fontSize: "clamp(1.075rem, 1rem + 0.45vw, 1.25rem)" }}
              >
                {block.text}
              </h3>
            );
          }
          if (block.type === "list") {
            return (
              <ul
                key={i}
                className="list-disc space-y-1.5 pl-6 marker:text-[#8a6b3a]"
              >
                {block.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          }
          if (block.type === "summary") {
            return (
              <aside
                key={i}
                className="rounded-xl border border-[#d9c9ac] bg-[#efe4cf]/70 px-5 py-4"
                aria-label={block.title}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a6b3a]">
                  {block.title}
                </div>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-[#8a6b3a]">
                  {block.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              </aside>
            );
          }
          if (block.type === "notice") {
            const label = block.variant
              ? NOTICE_LABEL[block.variant]
              : "Beachten Sie";
            return (
              <aside
                key={i}
                role="note"
                className="rounded-lg border-l-4 border-[#b98a3a] bg-[#efe4cf] px-4 py-3 text-[#2b2117]"
              >
                <span className="mr-2 font-semibold uppercase tracking-wider text-[#8a6b3a]">
                  {label}
                </span>
                <span>{block.text}</span>
              </aside>
            );
          }
          if (block.type === "legalStatus") {
            return (
              <aside
                key={i}
                role="note"
                className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-[#2b2117]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  {block.label}
                </div>
                <p className="mt-1 text-[14.5px] leading-relaxed">{block.text}</p>
              </aside>
            );
          }
          if (block.type === "keyNumbers") {
            return (
              <section
                key={i}
                aria-label={block.title}
                className="rounded-xl border border-[#0b1220]/10 bg-white/70 p-4 sm:p-5"
              >
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0b1220]/70">
                  {block.title}
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {block.items.map((n, j) => (
                    <div
                      key={j}
                      className="min-w-0 rounded-lg border border-[#0b1220]/10 bg-gradient-to-br from-[#0b1220] to-[#111a2e] p-4 text-[#f5efe1]"
                    >
                      <div
                        className="break-words font-semibold leading-tight tracking-tight text-[#22d3ee]"
                        style={{ fontSize: "clamp(1.05rem, 0.95rem + 0.9vw, 1.6rem)" }}
                      >
                        {n.big}
                      </div>
                      <div className="mt-1 text-[12.5px] leading-snug text-[#c8d3ea]">
                        {n.label}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }
          if (block.type === "change") {
            return (
              <section
                key={i}
                aria-label={`${block.number}. ${block.title}`}
                className="rounded-xl border border-[#0b1220]/10 bg-white/60 p-4 sm:p-5"
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className="flex-none rounded-md bg-[#0b1220] px-2 py-0.5 text-[12px] font-bold text-[#22d3ee]"
                    aria-hidden="true"
                  >
                    {String(block.number).padStart(2, "0")}
                  </span>
                  <h3
                    className="font-semibold tracking-tight text-[#1c160e]"
                    style={{ fontSize: "clamp(1.1rem, 1rem + 0.55vw, 1.3rem)" }}
                  >
                    {block.title}
                  </h3>
                </div>
                <div className="mt-2">
                  <span className="inline-block max-w-full break-words rounded-full border border-[#0b1220]/15 bg-[#0b1220]/5 px-2.5 py-0.5 text-[11.5px] font-medium text-[#0b1220]">
                    {block.lawRef}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {block.paragraphs.map((p, k) => (
                    <p key={k}>{p}</p>
                  ))}
                  {block.list ? (
                    <ul className="list-disc space-y-1.5 pl-6 marker:text-[#8a6b3a]">
                      {block.list.map((it, k) => (
                        <li key={k}>{it}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {block.practice ? (
                  <aside
                    role="note"
                    className="mt-4 rounded-lg border-l-4 border-[#22d3ee] bg-[#eaf7fb] px-4 py-3 text-[#0b1220]"
                  >
                    <span className="mr-2 font-semibold uppercase tracking-wider text-[#0e7490]">
                      Praxis
                    </span>
                    <span className="text-[15px]">{block.practice}</span>
                  </aside>
                ) : null}
                {block.effective ? (
                  <div className="mt-3 text-[12.5px] font-medium uppercase tracking-wider text-[#0b1220]/70">
                    Geplanter Anwendungszeitpunkt:{" "}
                    <span className="text-[#0b1220]">{block.effective}</span>
                  </div>
                ) : null}
              </section>
            );
          }
          if (block.type === "editorial") {
            return (
              <section
                key={i}
                aria-label={block.title}
                className="rounded-xl border border-[#ec4899]/25 bg-gradient-to-br from-[#0b1220] to-[#1e0b1a] px-5 py-6 text-[#f5efe1] sm:px-7 sm:py-7"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ec4899]">
                  Redaktion
                </div>
                <h3
                  className="mt-1 font-semibold tracking-tight text-[#f5efe1]"
                  style={{ fontSize: "clamp(1.2rem, 1.05rem + 0.7vw, 1.5rem)" }}
                >
                  {block.title}
                </h3>
                <div className="mt-3 space-y-3 text-[15px] leading-[1.65] text-[#e6ecf7]">
                  {block.paragraphs.map((p, k) => (
                    <p key={k}>{p}</p>
                  ))}
                </div>
              </section>
            );
          }
          if (block.type === "checklist") {
            return (
              <ChecklistBlock
                key={i}
                storageKey={block.storageKey}
                items={block.items}
                title={block.title}
              />
            );
          }
          if (block.type === "sourceLink") {
            return (
              <section
                key={i}
                aria-label={block.title}
                className="rounded-xl border border-[#0b1220]/15 bg-white/70 p-5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0b1220]/70">
                  {block.title}
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#1c160e]">
                  {block.text}
                </p>
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex max-w-full items-center gap-2 break-words rounded-full bg-[#0b1220] px-4 py-2 text-[13px] font-semibold text-[#22d3ee] transition hover:bg-[#111a2e]"
                >
                  {block.buttonLabel} ↗
                </a>
                {block.note ? (
                  <p className="mt-3 text-[12px] leading-snug text-[#0b1220]/70">
                    {block.note}
                  </p>
                ) : null}
              </section>
            );
          }
          return <p key={i}>{(block as { text?: string }).text ?? ""}</p>;
        })}
      </div>
    </article>
  );
}

function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}


export function MagazineFlipbook() {
  const [pageIndex, setPageIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<FlipDirection>("next");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, [isFullscreen]);

  useLayoutEffect(() => {
    if (!isFullscreen) return;
    const container = scrollContainerRef.current;
    if (container) {
      const activeIssueId = magazinePages[pageIndex]?.issueId;
      const target = activeIssueId
        ? (container.querySelector(`#issue-${activeIssueId}`) as HTMLElement | null)
        : null;
      if (target) {
        // relative Position innerhalb des Scroll-Containers
        const top = target.offsetTop - 12;
        container.scrollTo({ top: Math.max(0, top) });
      } else {
        container.scrollTo({ top: 0 });
      }
    }
    closeButtonRef.current?.focus();
  }, [isFullscreen, pageIndex]);

  const turnToPage = (nextIndex: number) => {
    if (
      isFlipping ||
      nextIndex < 0 ||
      nextIndex >= magazinePages.length ||
      nextIndex === pageIndex
    ) {
      return;
    }
    setDirection(nextIndex > pageIndex ? "next" : "previous");
    setTargetIndex(nextIndex);
    setIsFlipping(true);
  };

  const showPreviousPage = () => turnToPage(pageIndex - 1);
  const showNextPage = () => turnToPage(pageIndex + 1);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;
    const distance = touchEndX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 50) return;
    if (distance < 0) showNextPage();
    else showPreviousPage();
  };

  const handleFlipEnd = () => {
    if (!isFlipping) return;
    setPageIndex(targetIndex);
    setIsFlipping(false);
  };

  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < magazinePages.length - 1;

  const pageTransform = isFlipping
    ? direction === "next"
      ? "rotateY(-180deg)"
      : "rotateY(180deg)"
    : "rotateY(0deg)";

  const currentIssueId = magazinePages[pageIndex]?.issueId ?? magazineIssues[0].id;
  const currentIssueLabel =
    magazineIssues.find((i) => i.id === currentIssueId)?.label ?? magazineIssues[0].label;

  return (
    <div className="mx-auto w-full max-w-[420px]">
      {magazineIssues.length > 1 ? (
        <div
          role="tablist"
          aria-label="Magazin-Ausgaben"
          className="mb-3 flex items-center justify-center gap-1.5 rounded-full border border-border/70 bg-card/60 p-1 shadow-sm"
        >
          {magazineIssues.map((issue) => {
            const active = issue.id === currentIssueId;
            return (
              <button
                key={issue.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => turnToPage(issueCoverIndex(issue.id))}
                disabled={isFlipping}
                className={`flex-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {issue.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div
        className="relative touch-pan-y select-none"
        style={{ perspective: "1800px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-[977/1610] overflow-hidden rounded-[1.4rem] border border-border/70 bg-[#f6f0e7] shadow-[0_24px_70px_-28px_rgba(15,23,42,0.48)]">
          {/* Nächste Seite darunter */}
          {renderPageContent(magazinePages[targetIndex])}

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute inset-0 z-10 cursor-zoom-in"
            aria-label={`Seite ${pageIndex + 1} im Vollbild öffnen`}
          >
            <div
              className="absolute inset-0 transition-transform duration-700 ease-in-out"
              style={{
                transform: pageTransform,
                transformOrigin:
                  direction === "next" ? "left center" : "right center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                willChange: "transform",
              }}
              onTransitionEnd={handleFlipEnd}
              aria-label={pageAltText(magazinePages[pageIndex])}
            >
              <div className="absolute inset-0 bg-[#f6f0e7]">
                {renderPageContent(magazinePages[pageIndex])}
              </div>
            </div>

            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
              Vollbild
            </span>
          </button>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3 bg-gradient-to-r from-black/10 to-transparent" />

          {canGoBack && (
            <button
              type="button"
              onClick={showPreviousPage}
              disabled={isFlipping}
              aria-label="Vorherige Magazinseite"
              className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-background/85 text-foreground shadow-lg backdrop-blur transition hover:scale-105 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          {canGoForward && (
            <button
              type="button"
              onClick={showNextPage}
              disabled={isFlipping}
              aria-label="Nächste Magazinseite"
              className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-background/85 text-foreground shadow-lg backdrop-blur transition hover:scale-105 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {magazinePages.map((page, index) => (
          <button
            key={index}
            type="button"
            onClick={() => turnToPage(index)}
            disabled={isFlipping}
            aria-label={`Magazinseite ${index + 1} öffnen`}
            className={`h-2 rounded-full transition-all ${
              index === pageIndex
                ? "w-7 bg-foreground"
                : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      <p
        className="mt-2 text-center text-xs text-muted-foreground"
        aria-live="polite"
      >
        Seite {pageIndex + 1} von {magazinePages.length}
        <span className="ml-2">· Zum Umblättern wischen</span>
      </p>

      {isFullscreen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] bg-neutral-900/95"
              role="dialog"
              aria-modal="true"
              aria-label="steuerstoff Magazin – Vollbild-Leseansicht"
              data-scroll-lock-owner="magazine-fullscreen"
            >
              <div
                ref={scrollContainerRef}
                className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain"
                style={{
                  WebkitOverflowScrolling: "touch",
                  overscrollBehaviorY: "contain",
                }}
              >
                <div
                  className="sticky top-0 z-10 border-b border-white/10 bg-neutral-900/80 backdrop-blur"
                  style={{ paddingTop: "env(safe-area-inset-top)" }}
                >
                  <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="flex items-baseline gap-2 text-white">
                      <span className="text-sm font-semibold tracking-tight">
                        steuerstoff Magazin
                      </span>
                      <span className="text-xs text-white/60">
                        {currentIssueLabel}
                      </span>
                    </div>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={() => setIsFullscreen(false)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20"
                      aria-label="Vollbild schließen"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div
                  className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10"
                  style={{
                    paddingBottom:
                      "calc(env(safe-area-inset-bottom) + 2.5rem)",
                  }}
                >
                  {/* Cover-Figuren werden pro Ausgabe unten gerendert. */}


                  {magazineIssues.map((issue, issueIdx) => {
                    const issueArticles = issue.articleIds
                      .map((id) => magazineArticles.find((a) => a.id === id))
                      .filter((a): a is MagazineArticle => Boolean(a));
                    return (
                      <section
                        key={issue.id}
                        id={`issue-${issue.id}`}
                        aria-label={issue.label}
                        className="flex flex-col gap-6"
                      >
                        {issueIdx > 0 ? (
                          <div className="mx-auto my-2 flex w-full max-w-[520px] items-center gap-3">
                            <div className="h-px flex-1 bg-white/15" aria-hidden="true" />
                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                              {issue.label}
                            </span>
                            <div className="h-px flex-1 bg-white/15" aria-hidden="true" />
                          </div>
                        ) : null}
                        <figure className="overflow-hidden rounded-xl bg-[#f6f0e7] shadow-[0_20px_60px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                          <img
                            src={issue.cover.src}
                            alt={issue.cover.alt}
                            loading={issueIdx === 0 ? "eager" : "lazy"}
                            className="block h-auto w-full select-none"
                            draggable={false}
                          />
                        </figure>
                        {issueArticles.map((a, idx) => (
                          <div key={a.id}>
                            {idx > 0 ? (
                              <div
                                className="mx-auto my-4 h-px w-24 bg-white/20"
                                aria-hidden="true"
                              />
                            ) : null}
                            <FullArticle article={a} />
                          </div>
                        ))}
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
