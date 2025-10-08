import { formatCurrency } from "@/lib/pdf/pdf-utils";
import type { Recommendation } from "@/components/recommendations/recommendation-card";
import type { FSAInputs, FSAResults } from "@shared/schema";

interface FSAPrintSummaryProps {
  inputs: FSAInputs;
  results: FSAResults;
  recommendations: Recommendation[];
}

export default function FSAPrintSummary({ inputs, results, recommendations }: FSAPrintSummaryProps) {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const dependentCareEnabled = inputs.includeDependentCare;

  return (
    <div className="print-summary hidden print:block">
      <header>
        <h1>Health FSA Election Summary</h1>
        <p>Generated: {generatedAt}</p>
      </header>

      <section>
        <h2>Election Overview</h2>
        <dl>
          <div>
            <dt>Health FSA election</dt>
            <dd>{formatCurrency(inputs.healthElection)}</dd>
          </div>
          <div>
            <dt>Expected qualified expenses</dt>
            <dd>{formatCurrency(results.expectedUtilization)}</dd>
          </div>
          <div>
            <dt>Carryover allowance</dt>
            <dd>{formatCurrency(inputs.planCarryover)}</dd>
          </div>
          <div>
            <dt>Grace period</dt>
            <dd>{`${inputs.gracePeriodMonths.toFixed(1)} months`}</dd>
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
        <h2>Financial Impact</h2>
        <dl>
          <div>
            <dt>Health FSA tax savings</dt>
            <dd>{formatCurrency(results.taxSavings)}</dd>
          </div>
          <div>
            <dt>Protected by carryover/grace</dt>
            <dd>{formatCurrency(results.carryoverProtected)}</dd>
          </div>
          <div>
            <dt>Potential forfeiture risk</dt>
            <dd>{formatCurrency(results.forfeitureRisk)}</dd>
          </div>
          <div>
            <dt>Net benefit after forfeiture</dt>
            <dd>{formatCurrency(results.netBenefit)}</dd>
          </div>
        </dl>
      </section>

      {dependentCareEnabled ? (
        <>
          <div className="print-summary__divider" />
          <section>
            <h2>Dependent-care FSA Snapshot</h2>
            <dl>
              <div>
                <dt>Household election</dt>
                <dd>{formatCurrency(inputs.dependentCareElection)}</dd>
              </div>
              <div>
                <dt>Expected dependent-care expenses</dt>
                <dd>{formatCurrency(inputs.expectedDependentCareExpenses)}</dd>
              </div>
              <div>
                <dt>Dependent-care tax savings</dt>
                <dd>{formatCurrency(results.dependentCareTaxSavings)}</dd>
              </div>
              <div>
                <dt>Dependent-care forfeiture risk</dt>
                <dd>{formatCurrency(results.dependentCareForfeitureRisk)}</dd>
              </div>
            </dl>
          </section>
        </>
      ) : null}

      <div className="print-summary__divider" />

      <section>
        <h2>LPFSA & HSA Coordination</h2>
        <p>
          If you have a health savings account (HSA), you can add a Limited Purpose FSA (LPFSA) to cover dental and vision
          expenses without impacting HSA eligibility. HSA funds still pay for qualified dental and vision care, and the
          LPFSA gives you extra pre-tax dollars when HSA funds run short—for example, braces, contacts, or other predictable
          family expenses.
        </p>
      </section>

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
