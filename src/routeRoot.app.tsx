import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

function AppRootComponent() {
  const { queryClient } = AppRootRoute.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <style>{`
        div[style*="background-color"]:has(img[src*="magazin-cover-ausgabe-03-familienstiftung"]),
        figure:has(> img[src*="magazin-cover-ausgabe-03-familienstiftung"]) {
          background-color: #f6f0e7 !important;
        }
      `}</style>
      <Outlet />
    </QueryClientProvider>
  );
}

export const AppRootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: AppRootComponent,
});