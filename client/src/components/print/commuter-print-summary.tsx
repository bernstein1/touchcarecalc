import { formatCurrency } from "@/lib/pdf/pdf-utils";
import type { CommuterInputs, CommuterResults } from "@shared/schema";

interface CommuterPrintSummaryProps {
  inputs: CommuterInputs;
  results: CommuterResults;
}

export default function CommuterPrintSummary({ inputs, results }: CommuterPrintSummaryProps) {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="print-summary hidden print:block">
      <header>
        <h1>Commuter Benefits Summary</h1>
        <p>Generated: {generatedAt}</p>
      </header>

      <section>
        <h2>Monthly Commute Costs</h2>
        <dl>
          <div>
            <dt>Transit cost</dt>
            <dd>{formatCurrency(inputs.transitCost)}</dd>
          </div>
          <div>
            <dt>Parking cost</dt>
            <dd>{formatCurrency(inputs.parkingCost)}</dd>
          </div>
          <div>
            <dt>Total monthly commute</dt>
            <dd>{formatCurrency(inputs.transitCost + inputs.parkingCost)}</dd>
          </div>
          <div>
            <dt>Household annual income</dt>
            <dd>{formatCurrency(inputs.annualIncome)}</dd>
          </div>
          <div>
            <dt>Estimated marginal tax rate</dt>
            <dd>{`${results.marginalRate}%`}</dd>
          </div>
        </dl>
      </section>

      <div className="print-summary__divider" />

      <section>
        <h2>Pre-tax Benefit Impact</h2>
        <dl>
          <div>
            <dt>Transit benefit (annualized)</dt>
            <dd>{formatCurrency(results.annualTransit)}</dd>
          </div>
          <div>
            <dt>Parking benefit (annualized)</dt>
            <dd>{formatCurrency(results.annualParking)}</dd>
          </div>
          <div>
            <dt>Total annual benefit</dt>
            <dd>{formatCurrency(results.annualTotal)}</dd>
          </div>
          <div>
            <dt>Total annual tax savings</dt>
            <dd>{formatCurrency(results.totalSavings)}</dd>
          </div>
          <div>
            <dt>Average monthly tax savings</dt>
            <dd>{formatCurrency(results.totalSavings / 12)}</dd>
          </div>
        </dl>
      </section>

      <div className="print-summary__divider" />

      <section>
        <h2>How to Use the Benefit</h2>
        <ul className="print-summary__list">
          <li>Set aside up to $340 per month pre-tax for transit fares and another $340 for qualified parking in 2026.</li>
          <li>Enroll or adjust elections through your commuter benefits administrator when costs change.</li>
          <li>Use the provided card or submit receipts quickly so reimbursements keep pace with your commuting expenses.</li>
          <li>Review your commute a few times a year to ensure deductions still match real-world costs.</li>
        </ul>
      </section>
    </div>
  );
}
