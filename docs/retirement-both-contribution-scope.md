# 401(k) Contribution Split Slider Scope

## Objective
When a user selects the **Both** contribution type on the 401(k) Retirement Calculator, let them control how their employee contribution is divided between traditional and Roth accounts with a slider. The UI, data model, calculations, reporting, and analytics need to adapt to the chosen split while keeping existing functionality unchanged for the other contribution types.

## User Experience Updates
- **Slider placement**: Reveal a labeled slider directly beneath the "Contribution Type" cards whenever `contributionType === 'both'`.
  - Range: 0–100.
  - Step: 5% (match existing slider granularity elsewhere) with live value readout (e.g., "Traditional 60% / Roth 40%").
  - Default: 50/50 to preserve current behaviour.
- **Validation & limits**:
  - Lock the slider and display helper text if the user’s total employee contribution is zero.
  - Ensure the combined allocation never exceeds the IRS deferral limit already enforced by the calculator; the slider only redistributes that existing amount.
- **Accessibility**:
  - Provide descriptive `aria` labels and keyboard support matching the other sliders.
  - Persist choice in URL/shareable state if deep-linking is supported elsewhere.

## State & Data Model Changes
- Extend `RetirementInputs` with a new optional field, e.g. `bothSplitTraditional: number` (0–100). Default to `50`.
- Update React component state (`useState` initializer, `updateInput`) to include the new property.
- Persist the split when exporting/importing sessions via `@shared/schema` and any API payloads.
- Ensure local storage or URL sync hooks (if present) include the new field.

## Calculation Logic Adjustments
- Modify `calculateRetirement` so:
  - Employee contributions remain capped by age-appropriate limits.
  - Traditional portion = `employeeContribAnnual * (bothSplitTraditional / 100)` up to the base deferral limit (`23,000`); any amount beyond the base limit (catch-up) is still treated as traditional for tax savings unless business rules say otherwise.
  - Roth portion = remaining employee contribution.
  - Tax savings use the computed traditional amount instead of a hardcoded 50% split.
- Record both portions in `yearlyProjections` if reporting should differentiate them in the future (consider adding fields now or ensure shape can expand later).

## UI & Reporting Touchpoints
- Update quick stats cards, projection tables, and tooltips to describe how the split works.
- Confirm PDF export (`use-pdf-export` and templates) renders language consistent with the chosen allocation, e.g., “Traditional (60%) / Roth (40%).”
- If charts or graphs should illustrate the mix, decide whether to show separate series; otherwise mention in legend or summary.

## QA & Testing
- Unit tests for `calculateRetirement` covering:
  - 0/100, 50/50, and 100/0 splits.
  - Catch-up contribution cases (age ≥ 50) to confirm excess stays traditional.
  - Regression for pure `traditional` and `roth` selections.
- Cypress/Vitest component tests (if available) verifying slider visibility toggles, value changes update summaries, and calculations react accordingly.
- Manual sanity checks on PDF export and any persisted session retrieval.

## Analytics & Telemetry (if applicable)
- If analytics track calculator usage, add events for slider interactions and captured split percentages to support future UX decisions.

## Rollout Considerations
- Feature flag if staged rollout is required.
- Update documentation (help text, FAQ) explaining how to choose an allocation strategy.
- Communicate in release notes that mixed contribution strategies are now adjustable.
