import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import ExtfPdfConverter from "../components/ExtfPdfConverter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/csv-konverter")({
  component: CsvKonverterPage,
  head: () => ({
    meta: [
      { title: "PDF zu EXTF-CSV · steuerstoff" },
      {
        name: "description",
        content:
          "PDF-Rechnungen in DATEV-EXTF-CSV konvertieren – direkt im Browser, ohne Upload an Dritte.",
      },
    ],
  }),
});

function CsvKonverterPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <ExtfPdfConverter />
      </main>
      <SiteFooter />
    </>
  );
}
