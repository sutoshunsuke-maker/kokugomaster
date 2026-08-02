import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';
import Units from '@/pages/units';
import UnitDetail from '@/pages/unit-detail';
import Lessons from '@/pages/lessons';
import { AppShell } from '@/components/layout/app-shell';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AppShell>
          <Dashboard />
        </AppShell>
      </Route>
      <Route path="/units">
        <AppShell>
          <Units />
        </AppShell>
      </Route>
      <Route path="/units/:id">
        <AppShell>
          <UnitDetail />
        </AppShell>
      </Route>
      <Route path="/lessons">
        <AppShell>
          <Lessons />
        </AppShell>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
