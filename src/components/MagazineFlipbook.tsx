import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react";

const magazinePages = [
  {
    src: "/cover.png",
    alt: "Cover des steuerstoff Magazins – Ausgabe 01/2026",
  },
  {
    src: "/magazin-seite-02.png",
    alt: "Einkommensteuerreform 2027 – Die Pläne der Bundesregierung",
  },
];

type FlipDirection = "next" | "previous";

export function MagazineFlipbook() {
  const [pageIndex, setPageIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] =
    useState<FlipDirection>("next");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  const turnToPage = (nextIndex: number) => {
    if (
      isFlipping ||
      nextIndex < 0 ||
      nextIndex >= magazinePages.length ||
      nextIndex === pageIndex
    ) {
      return;
    }

    setDirection(
      nextIndex > pageIndex ? "next" : "previous",
    );
    setTargetIndex(nextIndex);
    setIsFlipping(true);
  };

  const showPreviousPage = () => {
    turnToPage(pageIndex - 1);
  };

  const showNextPage = () => {
    turnToPage(pageIndex + 1);
  };

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    touchStartX.current =
      event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    if (touchStartX.current === null) return;

    const touchEndX =
      event.changedTouches[0]?.clientX;

    if (touchEndX === undefined) return;

    const distance = touchEndX - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(distance) < 50) return;

    if (distance < 0) {
      showNextPage();
    } else {
      showPreviousPage();
    }
  };

  const handleFlipEnd = () => {
    if (!isFlipping) return;

    setPageIndex(targetIndex);
    setIsFlipping(false);
  };

  const canGoBack = pageIndex > 0;
  const canGoForward =
    pageIndex < magazinePages.length - 1;

  const pageTransform = isFlipping
    ? direction === "next"
      ? "rotateY(-180deg)"
      : "rotateY(180deg)"
    : "rotateY(0deg)";

  const currentPage = magazinePages[pageIndex];

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div
        className="relative touch-pan-y select-none"
        style={{ perspective: "1800px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-[977/1610] overflow-hidden rounded-[1.4rem] border border-border/70 bg-[#f6f0e7] shadow-[0_24px_70px_-28px_rgba(15,23,42,0.48)]">
          {/* Die nächste Seite liegt bereits unter der aktuellen Seite */}
          <img
            src={magazinePages[targetIndex].src}
            alt={magazinePages[targetIndex].alt}
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute inset-0 z-10 cursor-zoom-in"
            aria-label={`Seite ${pageIndex + 1} im Vollbild öffnen`}
          >
            {/* Aktuelle Seite, die beim Umblättern gedreht wird */}
            <img
              src={magazinePages[pageIndex].src}
              alt={magazinePages[pageIndex].alt}
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-in-out"
              style={{
                transform: pageTransform,
                transformOrigin:
                  direction === "next"
                    ? "left center"
                    : "right center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                willChange: "transform",
              }}
              onTransitionEnd={handleFlipEnd}
              draggable={false}
            />

            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
              Vollbild
            </span>
          </button>

          {/* Dezente Papierkante */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3 bg-gradient-to-r from-black/10 to-transparent" />

          {canGoBack && (
            <button
              type="button"
              onClick={showPreviousPage}
              disabled={isFlipping}
              aria-label="Vorherige Magazinseite"
              className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-background/85 text-foreground shadow-lg backdrop-blur transition hover:scale-105 disabled:opacity-40"
            >
              <ChevronLeft
                className="h-5 w-5"
                aria-hidden="true"
              />
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
              <ChevronRight
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {magazinePages.map((page, index) => (
          <button
            key={page.src}
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
        Seite {pageIndex + 1} von{" "}
        {magazinePages.length}
        <span className="ml-2">
          · Zum Umblättern wischen
        </span>
      </p>

      {isFullscreen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Magazinseite im Vollbild"
        >
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute right-2 top-2 z-10 rounded-full border border-border/70 bg-background/90 p-2 text-foreground shadow-lg backdrop-blur"
              aria-label="Vollbild schließen"
            >
              <X className="h-5 w-5" />
            </button>

            <img
              src={currentPage.src}
              alt={currentPage.alt}
              className="max-h-[90vh] w-full rounded-[1.25rem] object-contain shadow-2xl"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
