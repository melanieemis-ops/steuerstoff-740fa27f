import { createFileRoute } from "@tanstack/react-router";
import ExtfPdfConverter from "../components/ExtfPdfConverter";

export const Route = createFileRoute("/csv-konverter")({
  component: CsvKonverterPage,
});

function CsvKonverterPage() {
  return <ExtfPdfConverter />;
}
