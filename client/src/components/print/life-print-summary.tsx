import { formatCurrency } from "@/lib/pdf/pdf-utils";
import type { LifeInsuranceInputs, LifeInsuranceResults } from "@shared/schema";

interface LifePrintSummaryProps {
  inputs: LifeInsuranceInputs;
  results: LifeInsuranceResults;
}

export default function LifePrintSummary({ inputs, results }: LifePrintSummaryProps) {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const coverageGap = results.additionalNeeded;
  const gapLabel = coverageGap > 0 ? "Additional coverage needed" : "Coverage surplus";
  const gapValue = Math.abs(coverageGap);

  return (
    <div className="print-summary hidden print:block">
      <header>
        <h1>Life Insurance Needs Summary</h1>
        <p>Generated: {generatedAt}</p>
      </header>

      <section>
        <h2>Household Snapshot</h2>
        <dl>
          <div>
            <dt>Total outstanding debt</dt>
            <dd>{formatCurrency(inputs.totalDebt)}</dd>
          </div>
          <div>
            <dt>Annual income</dt>
            <dd>{formatCurrency(inputs.income)}</dd>
          </div>
          <div>
            <dt>Income support period</dt>
            <dd>{inputs.incomeYears} years</dd>
          </div>
          <div>
            <dt>Mortgage balance</dt>
            <dd>{formatCurrency(inputs.mortgageBalance)}</dd>
          </div>
          <div>
            <dt>Education goals</dt>
            <dd>{formatCurrency(inputs.educationCosts)}</dd>
          </div>
          <div>
            <dt>Current life insurance</dt>
            <dd>{formatCurrency(inputs.currentInsurance)}</dd>
          </div>
          <div>
            <dt>Liquid assets considered</dt>
            <dd>{formatCurrency(inputs.currentAssets ?? 0)}</dd>
          </div>
        </dl>
      </section>

      <div className="print-summary__divider" />

      <section>
        <h2>DIME Calculation</h2>
        <dl>
          <div>
            <dt>Recommended coverage (DIME)</dt>
            <dd>{formatCurrency(results.dimeTotal)}</dd>
          </div>
          <div>
            <dt>Income replacement</dt>
            <dd>{formatCurrency(results.incomeReplacement)}</dd>
          </div>
          {results.childEducationMultiplier ? (
            <div>
              <dt>Child education supplement</dt>
              <dd>{formatCurrency(results.childEducationMultiplier)}</dd>
            </div>
          ) : null}
        </dl>
        <p>
          The DIME method combines Debt, Income replacement, Mortgage payoff, and Education funding to estimate how much
          life insurance would keep your household financially secure.
        </p>
      </section>

      <div className="print-summary__divider" />

      <section>
        <h2>Coverage Gap Analysis</h2>
        <dl>
          <div>
            <dt>{gapLabel}</dt>
            <dd>{formatCurrency(gapValue)}</dd>
          </div>
        </dl>
        <p>
          {coverageGap > 0
            ? "Consider adding this amount of coverage so your family can retire debts, replace income, and stay on track with housing and education goals."
            : coverageGap < 0
              ? "Your existing coverage already exceeds the DIME recommendation. Review the policy to confirm the higher coverage still matches your goals."
              : "Your current coverage matches the DIME estimate. Revisit this calculation after major life events or annually during benefits review."}
        </p>
      </section>

      <div className="print-summary__divider" />

      <section>
        <h2>Next Steps</h2>
        <ul className="print-summary__list">
          <li>Compare term life quotes that cover at least the recommended DIME amount.</li>
          <li>Review beneficiary designations so funds reach loved ones quickly.</li>
          <li>Revisit coverage annually or after major milestones such as buying a home, welcoming a child, or changing jobs.</li>
        </ul>
      </section>
    </div>
  );
}
