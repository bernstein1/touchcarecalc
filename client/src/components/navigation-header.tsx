import { Calculator, Printer, ArrowLeft, Home, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NavigationHeader() {
  const [location, navigate] = useLocation();
  const isHub = location === "/";

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Calculator className="text-primary-foreground text-lg" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">FinanceCalc Pro</h1>
              <p className="text-sm text-muted-foreground">2025 Tax Rules & Benefits</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {!isHub && (
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => navigate("/")}
                data-testid="button-home"
              >
                <Home className="mr-2" size={16} />
                Dashboard
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => navigate("/comparison")}
              data-testid="button-comparison"
            >
              <GitCompare className="mr-2" size={16} />
              Compare
            </Button>
            <Button
              className="glass-button hover:bg-primary/90 text-primary-foreground transition-all"
              onClick={handlePrint}
              data-testid="button-print"
            >
              <Printer className="mr-2" size={16} />
              Print Results
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
