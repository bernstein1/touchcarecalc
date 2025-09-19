import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavigationHeader from "@/components/navigation-header";
import CalculatorHub from "@/pages/calculator-hub";
import HSACalculator from "@/pages/hsa-calculator";
import CommuterCalculator from "@/pages/commuter-calculator";
import LifeInsuranceCalculator from "@/pages/life-insurance-calculator";
import RetirementCalculator from "@/pages/retirement-calculator";
import ComparisonTool from "@/pages/comparison-tool";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalculatorHub} />
      <Route path="/hsa" component={HSACalculator} />
      <Route path="/commuter" component={CommuterCalculator} />
      <Route path="/life-insurance" component={LifeInsuranceCalculator} />
      <Route path="/retirement" component={RetirementCalculator} />
      <Route path="/comparison" component={ComparisonTool} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={150} skipDelayDuration={0}>
        <div className="min-h-screen bg-background text-foreground">
          <NavigationHeader />
          <main className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
