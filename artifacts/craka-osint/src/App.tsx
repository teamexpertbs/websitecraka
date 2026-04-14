import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Logs from "@/pages/logs";
import Stats from "@/pages/stats";
import Tools from "@/pages/tools";
import Admin from "@/pages/admin";
import Premium from "@/pages/premium";
import Refer from "@/pages/refer";
import "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/logs" component={Logs} />
      <Route path="/stats" component={Stats} />
      <Route path="/tools" component={Tools} />
      <Route path="/admin" component={Admin} />
      <Route path="/premium" component={Premium} />
      <Route path="/refer" component={Refer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
