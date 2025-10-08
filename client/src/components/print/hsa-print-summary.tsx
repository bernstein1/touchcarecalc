import { formatCurrency } from "@/lib/pdf/pdf-utils";
import type { Recommendation } from "@/components/recommendations/recommendation-card";
import type { HSAInputs, HSAResults } from "@shared/schema";

interface HSAPrintSummaryProps {
  inputs: HSAInputs;
  results: HSAResults;
  recommendations: Recommendation[];
}

export default function HSAPrintSummary({ inputs, results, recommendations }: HSAPrintSummaryProps) {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const coverageLabel = inputs.coverage === "family" ? "Family HDHP / CDHP" : "Individual HDHP / CDHP";
  const marginalRateDisplay = `${results.marginalRate}%`;
  const warnings = results.warnings ?? [];

  return (
    <div className="print-summary hidden print:block" aria-hidden={false}>
      <header>
        <h1>HSA Strategy Summary</h1>
        <p>Generated: {generatedAt}</p>
      </header>

      <section>
        <h2>Coverage Snapshot</h2>
        <dl>
          <div>
            <dt>Coverage level</dt>
            <dd>{coverageLabel}</dd>
          </div>
          <div>
            <dt>Account holder age</dt>
            <dd>{inputs.age}</dd>
          </div>
          <div>
            <dt>Household annual income</dt>
            <dd>{formatCurrency(inputs.annualIncome)}</dd>
          </div>
          <div>
            <dt>Marginal federal tax rate</dt>
            <dd>{marginalRateDisplay}</dd>
          </div>
        </dl>
      </section>

      <div className="print-summary__divider" />

      <section>
        <h2>Key Numbers</h2>
        <dl>
          <div>
            <dt>Annual contribution limit</dt>
            <dd>{formatCurrency(results.annualContributionLimit)}</dd>
          </div>
          <div>
            <dt>Your HSA contribution</dt>
            <dd>{formatCurrency(results.employeeContribution)}</dd>
          </div>
          <div>
            <dt>Employer contribution</dt>
            <dd>{formatCurrency(results.employerContribution)}</dd>
          </div>
          <div>
            <dt>Projected HSA balance</dt>
            <dd>{formatCurrency(results.projectedReserve)}</dd>
          </div>
          <div>
            <dt>Target savings goal</dt>
            <dd>{formatCurrency(inputs.targetReserve)}</dd>
          </div>
          <div>
            <dt>Net annual savings advantage</dt>
            <dd>{formatCurrency(results.netCashflowAdvantage)}</dd>
          </div>
        </dl>
      </section>

      <div className="print-summary__divider" />

      <section>
        <h2>Premium & Tax Highlights</h2>
        <dl>
          <div>
            <dt>Annual premium savings redirected</dt>
            <dd>{formatCurrency(results.annualPremiumSavings)}</dd>
          </div>
          <div>
            <dt>Tax savings on contributions</dt>
            <dd>{formatCurrency(results.taxSavings)}</dd>
          </div>
          <div>
            <dt>Catch-up contribution applied</dt>
            <dd>{formatCurrency(results.catchUpContribution)}</dd>
          </div>
        </dl>
      </section>

      {warnings.length > 0 ? (
        <>
          <div className="print-summary__divider" />
          <section>
            <h2>Important Notices</h2>
            <ul className="print-summary__list">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {recommendations.length > 0 ? (
        <>
          <div className="print-summary__divider" />
          <section>
            <h2>Recommendations</h2>
            <ul className="print-summary__list">
              {recommendations.map((recommendation, index) => (
                <li key={index}>
                  <strong>{recommendation.title}.</strong> {recommendation.message}
                  {recommendation.actions && recommendation.actions.length > 0 ? (
                    <ul className="print-summary__list">
                      {recommendation.actions.map((action, actionIndex) => (
                        <li key={actionIndex}>{action}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
