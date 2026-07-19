import { AppRootRoute } from "./routeRoot.app";
import { Route as WissensdatenbankRouteImport } from "./routes/wissensdatenbank";
import { Route as SkrKonverterRouteImport } from "./routes/skr-konverter";
import { Route as NpoPruefassistentRouteImport } from "./routes/npo-pruefassistent";
import { Route as NeueAnfrageRouteImport } from "./routes/neue-anfrage";
import { Route as MittelverwendungsrechnerRouteImport } from "./routes/mittelverwendungsrechner";
import { Route as MagazinRouteImport } from "./routes/magazin";
import { Route as LerngebieteRouteImport } from "./routes/lerngebiete";
import { Route as LernenRouteImport } from "./routes/lernen";
import { Route as KfzWertabgabeRouteImport } from "./routes/kfz-wertabgabe";
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
  getParentRoute: () => AppRootRoute,
} as const);
const SkrKonverterRoute = SkrKonverterRouteImport.update({
  id: "/skr-konverter",
  path: "/skr-konverter",
  getParentRoute: () => AppRootRoute,
} as const);
const NpoPruefassistentRoute = NpoPruefassistentRouteImport.update({
  id: "/npo-pruefassistent",
  path: "/npo-pruefassistent",
  getParentRoute: () => AppRootRoute,
} as const);
const NeueAnfrageRoute = NeueAnfrageRouteImport.update({
  id: "/neue-anfrage",
  path: "/neue-anfrage",
  getParentRoute: () => AppRootRoute,
} as const);
const MittelverwendungsrechnerRoute = MittelverwendungsrechnerRouteImport.update({
  id: "/mittelverwendungsrechner",
  path: "/mittelverwendungsrechner",
  getParentRoute: () => AppRootRoute,
} as const);
const MagazinRoute = MagazinRouteImport.update({
  id: "/magazin",
  path: "/magazin",
  getParentRoute: () => AppRootRoute,
} as const);
const LerngebieteRoute = LerngebieteRouteImport.update({
  id: "/lerngebiete",
  path: "/lerngebiete",
  getParentRoute: () => AppRootRoute,
} as const);
const LernenRoute = LernenRouteImport.update({
  id: "/lernen",
  path: "/lernen",
  getParentRoute: () => AppRootRoute,
} as const);
const KfzWertabgabeRoute = KfzWertabgabeRouteImport.update({
  id: "/kfz-wertabgabe",
  path: "/kfz-wertabgabe",
  getParentRoute: () => AppRootRoute,
} as const);
const FristenkalenderRoute = FristenkalenderRouteImport.update({
  id: "/fristenkalender",
  path: "/fristenkalender",
  getParentRoute: () => AppRootRoute,
} as const);
const FallverlaufRoute = FallverlaufRouteImport.update({
  id: "/fallverlauf",
  path: "/fallverlauf",
  getParentRoute: () => AppRootRoute,
} as const);
const ErfolgeRoute = ErfolgeRouteImport.update({
  id: "/erfolge",
  path: "/erfolge",
  getParentRoute: () => AppRootRoute,
} as const);
const EinstellungenRoute = EinstellungenRouteImport.update({
  id: "/einstellungen",
  path: "/einstellungen",
  getParentRoute: () => AppRootRoute,
} as const);
const CsvKonverterRoute = CsvKonverterRouteImport.update({
  id: "/csv-konverter",
  path: "/csv-konverter",
  getParentRoute: () => AppRootRoute,
} as const);
const ChatRoute = ChatRouteImport.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => AppRootRoute,
} as const);
const AkademieRoute = AkademieRouteImport.update({
  id: "/akademie",
  path: "/akademie",
  getParentRoute: () => AppRootRoute,
} as const);
const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRootRoute,
} as const);
const FallCaseIdRoute = FallCaseIdRouteImport.update({
  id: "/fall/$caseId",
  path: "/fall/$caseId",
  getParentRoute: () => AppRootRoute,
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

export const routeTreeApp = AppRootRoute._addFileChildren(rootRouteChildren as never);
