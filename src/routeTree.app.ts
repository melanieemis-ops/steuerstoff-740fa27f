import { Route as rootRouteImport } from "./routes/__root";
import { Route as WissensdatenbankRouteImport } from "./routes/wissensdatenbank";
import { Route as SkrKonverterRouteImport } from "./routes/skr-konverter";
import { Route as NpoPruefassistentRouteImport } from "./routes/npo-pruefassistent";
import { Route as NeueAnfrageRouteImport } from "./routes/neue-anfrage";
import { Route as MittelverwendungsrechnerRouteImport } from "./routes/mittelverwendungsrechner";
import { Route as MagazinRouteImport } from "./routes/magazin";
import { Route as LerngebieteRouteImport } from "./routes/lerngebiete";
import { Route as LernenRouteImport } from "./routes/lernen";
import { Route as KfzWertabgabeRouteImport } from "./routes/kfz-wertabgabe";
import { Route as GesetzImportierenRouteImport } from "./routes/gesetz-importieren";
import { Route as FristenkalenderRouteImport } from "./routes/fristenkalender";
import { Route as FallverlaufRouteImport } from "./routes/fallverlauf";
import { Route as ErfolgeRouteImport } from "./routes/erfolge";
import { Route as EinstellungenRouteImport } from "./routes/einstellungen";
import { Route as CsvKonverterRouteImport } from "./routes/csv-konverter";
import { Route as ChatRouteImport } from "./routes/chat";
import { Route as AkademieRouteImport } from "./routes/akademie";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as FallCaseIdRouteImport } from "./routes/fall.$caseId";

const WissensdatenbankRoute = WissensdatenbankRouteImport.update({
  id: "/wissensdatenbank",
  path: "/wissensdatenbank",
  getParentRoute: () => rootRouteImport,
} as const);
const SkrKonverterRoute = SkrKonverterRouteImport.update({
  id: "/skr-konverter",
  path: "/skr-konverter",
  getParentRoute: () => rootRouteImport,
} as const);
const NpoPruefassistentRoute = NpoPruefassistentRouteImport.update({
  id: "/npo-pruefassistent",
  path: "/npo-pruefassistent",
  getParentRoute: () => rootRouteImport,
} as const);
const NeueAnfrageRoute = NeueAnfrageRouteImport.update({
  id: "/neue-anfrage",
  path: "/neue-anfrage",
  getParentRoute: () => rootRouteImport,
} as const);
const MittelverwendungsrechnerRoute = MittelverwendungsrechnerRouteImport.update({
  id: "/mittelverwendungsrechner",
  path: "/mittelverwendungsrechner",
  getParentRoute: () => rootRouteImport,
} as const);
const MagazinRoute = MagazinRouteImport.update({
  id: "/magazin",
  path: "/magazin",
  getParentRoute: () => rootRouteImport,
} as const);
const LerngebieteRoute = LerngebieteRouteImport.update({
  id: "/lerngebiete",
  path: "/lerngebiete",
  getParentRoute: () => rootRouteImport,
} as const);
const LernenRoute = LernenRouteImport.update({
  id: "/lernen",
  path: "/lernen",
  getParentRoute: () => rootRouteImport,
} as const);
const KfzWertabgabeRoute = KfzWertabgabeRouteImport.update({
  id: "/kfz-wertabgabe",
  path: "/kfz-wertabgabe",
  getParentRoute: () => rootRouteImport,
} as const);
const GesetzImportierenRoute = GesetzImportierenRouteImport.update({
  id: "/gesetz-importieren",
  path: "/gesetz-importieren",
  getParentRoute: () => rootRouteImport,
} as const);
const FristenkalenderRoute = FristenkalenderRouteImport.update({
  id: "/fristenkalender",
  path: "/fristenkalender",
  getParentRoute: () => rootRouteImport,
} as const);
const FallverlaufRoute = FallverlaufRouteImport.update({
  id: "/fallverlauf",
  path: "/fallverlauf",
  getParentRoute: () => rootRouteImport,
} as const);
const ErfolgeRoute = ErfolgeRouteImport.update({
  id: "/erfolge",
  path: "/erfolge",
  getParentRoute: () => rootRouteImport,
} as const);
const EinstellungenRoute = EinstellungenRouteImport.update({
  id: "/einstellungen",
  path: "/einstellungen",
  getParentRoute: () => rootRouteImport,
} as const);
const CsvKonverterRoute = CsvKonverterRouteImport.update({
  id: "/csv-konverter",
  path: "/csv-konverter",
  getParentRoute: () => rootRouteImport,
} as const);
const ChatRoute = ChatRouteImport.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => rootRouteImport,
} as const);
const AkademieRoute = AkademieRouteImport.update({
  id: "/akademie",
  path: "/akademie",
  getParentRoute: () => rootRouteImport,
} as const);
const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRouteImport,
} as const);
const FallCaseIdRoute = FallCaseIdRouteImport.update({
  id: "/fall/$caseId",
  path: "/fall/$caseId",
  getParentRoute: () => rootRouteImport,
} as const);

const rootRouteChildren = {
  IndexRoute,
  AkademieRoute,
  ChatRoute,
  CsvKonverterRoute,
  EinstellungenRoute,
  ErfolgeRoute,
  FallverlaufRoute,
  FristenkalenderRoute,
  GesetzImportierenRoute,
  KfzWertabgabeRoute,
  LernenRoute,
  LerngebieteRoute,
  MagazinRoute,
  MittelverwendungsrechnerRoute,
  NeueAnfrageRoute,
  NpoPruefassistentRoute,
  SkrKonverterRoute,
  WissensdatenbankRoute,
  FallCaseIdRoute,
};

export const routeTreeApp = rootRouteImport._addFileChildren(rootRouteChildren as never);
