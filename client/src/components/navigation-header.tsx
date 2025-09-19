import { Printer, Home, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import TouchCareLogo from "@/components/touchcare-logo";

export default function NavigationHeader() {
  const [location, navigate] = useLocation();
  const isHub = location === "/";
  const isComparison = location === "/comparison";

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-background/95 backdrop-blur border-b border-border/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <TouchCareLogo className="w-40" />
          <p className="text-sm text-muted-foreground font-normal leading-snug">
            A healthier understanding of healthcare.
          </p>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          {!isHub && (
            <Button
              variant="ghost"
              className="px-3 text-primary"
              onClick={() => navigate("/")}
              data-testid="button-home"
            >
              <Home className="mr-2" size={16} />
              Dashboard
            </Button>
          )}
          <Button
            variant="ghost"
            className={`px-3 ${isComparison ? "bg-[var(--surface-subtle)] text-primary" : "text-primary"}`}
            onClick={() => navigate("/comparison")}
            data-testid="button-comparison"
            aria-current={isComparison ? "page" : undefined}
          >
            <GitCompare className="mr-2" size={16} />
            Compare
          </Button>
          <Button
            variant="outline"
            className="px-3"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <Printer className="mr-2" size={16} />
            Print Results
          </Button>
        </nav>
      </div>
    </header>
  );
}
