/* eslint-disable */
// @ts-nocheck

// Native client route tree: UI routes only. Server API handlers must stay in the
// Cloudflare bundle and must never be bundled into the Capacitor application.
import { Route as rootRouteImport } from "./routes/__root";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as ChatRouteImport } from "./routes/chat";
import { Route as CsvKonverterRouteImport } from "./routes/csv-konverter";
import { Route as EinstellungenRouteImport } from "./routes/einstellungen";
import { Route as ErfolgeRouteImport } from "./routes/erfolge";
import { Route as FallCaseIdRouteImport } from "./routes/fall.$caseId";
import { Route as FallverlaufRouteImport } from "./routes/fallverlauf";
import { Route as FristenkalenderRouteImport } from "./routes/fristenkalender";
import { Route as GesetzImportierenRouteImport } from "./routes/gesetz-importieren";
import { Route as ImpressumRouteImport } from "./routes/impressum";
import { Route as KfzWertabgabeRouteImport } from "./routes/kfz-wertabgabe";
import { Route as LernenRouteImport } from "./routes/lernen";
import { Route as LernenAkademieRouteImport } from "./routes/lernen_.akademie";
import { Route as LernenAkademieFavoritenRouteImport } from "./routes/lernen_.akademie_.favoriten";
import { Route as LernenAkademieFehlertrainerRouteImport } from "./routes/lernen_.akademie_.fehlertrainer";
import { Route as LernenAkademieFehlertrainerTrainingRouteImport } from "./routes/lernen_.akademie_.fehlertrainer_.training";
import { Route as LernenAkademieFortschrittRouteImport } from "./routes/lernen_.akademie_.fortschritt";
import { Route as LernenAkademieKlausurenRouteImport } from "./routes/lernen_.akademie_.klausuren";
import { Route as LernenAkademieKlausurenSlugRouteImport } from "./routes/lernen_.akademie_.klausuren_.$slug";
import { Route as LernenPruefungssimulationRouteImport } from "./routes/lernen_.pruefungssimulation";
import { Route as LerngebieteRouteImport } from "./routes/lerngebiete";
import { Route as MagazinRouteImport } from "./routes/magazin";
import { Route as MittelverwendungsrechnerRouteImport } from "./routes/mittelverwendungsrechner";
import { Route as NeueAnfrageRouteImport } from "./routes/neue-anfrage";
import { Route as NpoPruefassistentRouteImport } from "./routes/npo-pruefassistent";
import { Route as SkrKonverterRouteImport } from "./routes/skr-konverter";
import { Route as WissensdatenbankRouteImport } from "./routes/wissensdatenbank";

function attach(route: { update: (options: unknown) => unknown }, id: string, path = id) {
  return route.update({
    id,
    path,
    getParentRoute: () => rootRouteImport,
  });
}

const IndexRoute = attach(IndexRouteImport, "/");
const ChatRoute = attach(ChatRouteImport, "/chat");
const CsvKonverterRoute = attach(CsvKonverterRouteImport, "/csv-konverter");
const EinstellungenRoute = attach(EinstellungenRouteImport, "/einstellungen");
const ErfolgeRoute = attach(ErfolgeRouteImport, "/erfolge");
const FallCaseIdRoute = attach(FallCaseIdRouteImport, "/fall/$caseId");
const FallverlaufRoute = attach(FallverlaufRouteImport, "/fallverlauf");
const FristenkalenderRoute = attach(FristenkalenderRouteImport, "/fristenkalender");
const GesetzImportierenRoute = attach(GesetzImportierenRouteImport, "/gesetz-importieren");
const ImpressumRoute = attach(ImpressumRouteImport, "/impressum");
const KfzWertabgabeRoute = attach(KfzWertabgabeRouteImport, "/kfz-wertabgabe");
const LernenRoute = attach(LernenRouteImport, "/lernen");
const LernenAkademieRoute = attach(LernenAkademieRouteImport, "/lernen/akademie");
const LernenAkademieFavoritenRoute = attach(
  LernenAkademieFavoritenRouteImport,
  "/lernen/akademie/favoriten",
);
const LernenAkademieFehlertrainerRoute = attach(
  LernenAkademieFehlertrainerRouteImport,
  "/lernen/akademie/fehlertrainer",
);
const LernenAkademieFehlertrainerTrainingRoute = attach(
  LernenAkademieFehlertrainerTrainingRouteImport,
  "/lernen/akademie/fehlertrainer/training",
);
const LernenAkademieFortschrittRoute = attach(
  LernenAkademieFortschrittRouteImport,
  "/lernen/akademie/fortschritt",
);
const LernenAkademieKlausurenRoute = attach(
  LernenAkademieKlausurenRouteImport,
  "/lernen/akademie/klausuren",
);
const LernenAkademieKlausurenSlugRoute = attach(
  LernenAkademieKlausurenSlugRouteImport,
  "/lernen/akademie/klausuren/$slug",
);
const LernenPruefungssimulationRoute = attach(
  LernenPruefungssimulationRouteImport,
  "/lernen/pruefungssimulation",
);
const LerngebieteRoute = attach(LerngebieteRouteImport, "/lerngebiete");
const MagazinRoute = attach(MagazinRouteImport, "/magazin");
const MittelverwendungsrechnerRoute = attach(
  MittelverwendungsrechnerRouteImport,
  "/mittelverwendungsrechner",
);
const NeueAnfrageRoute = attach(NeueAnfrageRouteImport, "/neue-anfrage");
const NpoPruefassistentRoute = attach(NpoPruefassistentRouteImport, "/npo-pruefassistent");
const SkrKonverterRoute = attach(SkrKonverterRouteImport, "/skr-konverter");
const WissensdatenbankRoute = attach(WissensdatenbankRouteImport, "/wissensdatenbank");

export const routeTreeIos = rootRouteImport._addFileChildren({
  IndexRoute,
  ChatRoute,
  CsvKonverterRoute,
  EinstellungenRoute,
  ErfolgeRoute,
  FallCaseIdRoute,
  FallverlaufRoute,
  FristenkalenderRoute,
  GesetzImportierenRoute,
  ImpressumRoute,
  KfzWertabgabeRoute,
  LernenRoute,
  LernenAkademieRoute,
  LernenAkademieFavoritenRoute,
  LernenAkademieFehlertrainerRoute,
  LernenAkademieFehlertrainerTrainingRoute,
  LernenAkademieFortschrittRoute,
  LernenAkademieKlausurenRoute,
  LernenAkademieKlausurenSlugRoute,
  LernenPruefungssimulationRoute,
  LerngebieteRoute,
  MagazinRoute,
  MittelverwendungsrechnerRoute,
  NeueAnfrageRoute,
  NpoPruefassistentRoute,
  SkrKonverterRoute,
  WissensdatenbankRoute,
});
