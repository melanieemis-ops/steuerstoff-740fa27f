import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

function AppRootComponent() {
  const { queryClient } = AppRootRoute.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export const AppRootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: AppRootComponent,
});
