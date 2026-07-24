import { useEffect } from "react";

import { MagazineFlipbook as OriginalMagazineFlipbook } from "./MagazineFlipbook";

const OLD_COVER = "/magazin-cover-ausgabe-03-final.png";
const NEW_COVER = "/magazin-cover-ausgabe-03-familienstiftung.svg";
const NEW_ALT =
  "Cover des steuerstoff Magazins – Ausgabe 03/2026: Steuerfalle Familienstiftung";

/**
 * Laufzeit-Wrapper für die neue Ausgabe 03.
 *
 * Die bestehende Flipbook-Komponente bleibt unverändert. Der Wrapper tauscht
 * ausschließlich das bisherige Cover der Ausgabe 03 aus – auch in der per
 * Portal gerenderten Vollbildansicht.
 */
export function MagazineFlipbook() {
  useEffect(() => {
    const replaceIssue03Cover = () => {
      document
        .querySelectorAll<HTMLImageElement>(`img[src="${OLD_COVER}"]`)
        .forEach((image) => {
          image.src = NEW_COVER;
          image.alt = NEW_ALT;
        });
    };

    replaceIssue03Cover();

    const observer = new MutationObserver(replaceIssue03Cover);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    return () => observer.disconnect();
  }, []);

  return <OriginalMagazineFlipbook />;
}
