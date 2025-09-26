import { useState } from 'react';
import { generateAndDownloadPDF, getFilenameSuffix, PDFReportData, ComparisonReportData, formatCurrency } from './pdf-utils';
import { HSAReport } from './templates/hsa-report';
import { FSAReport } from './templates/fsa-report';
import { CommuterReport } from './templates/commuter-report';
import { LifeInsuranceReport } from './templates/life-insurance-report';
import { ComparisonReport } from './templates/comparison-report';
import {
  HSAInputs,
  HSAResults,
  FSAInputs,
  FSAResults,
  CommuterInputs,
  CommuterResults,
  LifeInsuranceInputs,
  LifeInsuranceResults
} from '@shared/schema';

type CalculatorInputs = HSAInputs | FSAInputs | CommuterInputs | LifeInsuranceInputs;
type CalculatorResults = HSAResults | FSAResults | CommuterResults | LifeInsuranceResults;

export const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportHSAReport = async (inputs: HSAInputs, results: HSAResults) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const coverageText = inputs.coverage === 'family' ? 'family' : 'individual';
      const data: PDFReportData = {
        type: 'hsa',
        title: 'HSA Strategy Analysis',
        generatedAt: new Date(),
        inputs,
        results,
        additionalData: {
          narrative: {
            compatibility: `Qualified ${coverageText} high-deductible health plan (HDHP) coverage opens ${formatCurrency(results.annualContributionLimit)} of health savings account (HSA) room, including ${formatCurrency(results.catchUpContribution ?? 0)} in catch-up space once you turn 55.`,
            employerSupport: `Employer contributions of ${formatCurrency(results.employerContribution)} combine with your paycheck deposits to build the ${formatCurrency(inputs.targetReserve)} safety cushion.`,
            premiumOffsets: `Switching plans frees ${formatCurrency(results.annualPremiumSavings)} in yearly premiums that can move straight into the HSA.`,
            cashflow: `After premium savings, employer help, and tax savings, you keep ${formatCurrency(results.netCashflowAdvantage)} more than the payroll contributions going out.`,
          }
        }
      };
      
      const filename = `HSA_Report_${getFilenameSuffix()}.pdf`;
      const reportElement = HSAReport({ data }) as React.ReactElement;
      await generateAndDownloadPDF(reportElement, filename);
    } catch (err) {
      setError('Failed to generate HSA report. Please try again.');
      console.error('HSA PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportFSAReport = async (inputs: FSAInputs, results: FSAResults) => {
    setIsGenerating(true);
    setError(null);

    try {
      const data: PDFReportData = {
        type: 'fsa',
        title: 'FSA Election Analysis',
        generatedAt: new Date(),
        inputs,
        results,
        additionalData: {
          narrative: {
            electionSizing: `Health FSA election of ${formatCurrency(inputs.healthElection)} captures ${formatCurrency(results.expectedUtilization)} in expected expenses across routine care, planned procedures, and prescriptions.`,
            gracePeriod: `Carryover allowances protect ${formatCurrency(results.carryoverProtected)} with a ${inputs.gracePeriodMonths.toFixed(1)}-month grace period to finish spending prior-year dollars.`,
            forfeiture: `Monitor ${formatCurrency(results.forfeitureRisk)} of potential forfeitures and adjust before year-end to preserve the ${formatCurrency(results.netBenefit)} net benefit after taxes.`
          }
        }
      };

      const filename = `FSA_Report_${getFilenameSuffix()}.pdf`;
      const reportElement = FSAReport({ data }) as React.ReactElement;
      await generateAndDownloadPDF(reportElement, filename);
    } catch (err) {
      setError('Failed to generate FSA report. Please try again.');
      console.error('FSA PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCommuterReport = async (inputs: CommuterInputs, results: CommuterResults) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const data: PDFReportData = {
        type: 'commuter',
        title: 'Commuter Benefits Analysis',
        generatedAt: new Date(),
        inputs,
        results
      };
      
      const filename = `Commuter_Report_${getFilenameSuffix()}.pdf`;
      const reportElement = CommuterReport({ data }) as React.ReactElement;
      await generateAndDownloadPDF(reportElement, filename);
    } catch (err) {
      setError('Failed to generate Commuter report. Please try again.');
      console.error('Commuter PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportLifeInsuranceReport = async (inputs: LifeInsuranceInputs, results: LifeInsuranceResults) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const data: PDFReportData = {
        type: 'life-insurance',
        title: 'Life Insurance Needs Analysis',
        generatedAt: new Date(),
        inputs,
        results
      };
      
      const filename = `Life_Insurance_Report_${getFilenameSuffix()}.pdf`;
      const reportElement = LifeInsuranceReport({ data }) as React.ReactElement;
      await generateAndDownloadPDF(reportElement, filename);
    } catch (err) {
      setError('Failed to generate Life Insurance report. Please try again.');
      console.error('Life Insurance PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportComparisonReport = async (data: Omit<ComparisonReportData, 'generatedAt'>) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const reportData: ComparisonReportData = {
        ...data,
        generatedAt: new Date()
      };
      
      const filename = `Comparison_Report_${data.calculatorType}_${getFilenameSuffix()}.pdf`;
      const reportElement = ComparisonReport({ data: reportData }) as React.ReactElement;
      await generateAndDownloadPDF(reportElement, filename);
    } catch (err) {
      setError('Failed to generate Comparison report. Please try again.');
      console.error('Comparison PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (
    type: 'hsa' | 'fsa' | 'commuter' | 'life-insurance',
    inputs: CalculatorInputs,
    results: CalculatorResults
  ) => {
    switch (type) {
      case 'hsa':
        await exportHSAReport(inputs as HSAInputs, results as HSAResults);
        break;
      case 'fsa':
        await exportFSAReport(inputs as FSAInputs, results as FSAResults);
        break;
      case 'commuter':
        await exportCommuterReport(inputs as CommuterInputs, results as CommuterResults);
        break;
      case 'life-insurance':
        await exportLifeInsuranceReport(inputs as LifeInsuranceInputs, results as LifeInsuranceResults);
        break;
      default:
        setError('Unknown report type');
    }
  };

  return {
    isGenerating,
    error,
    exportHSAReport,
    exportFSAReport,
    exportCommuterReport,
    exportLifeInsuranceReport,
    exportComparisonReport,
    exportReport
  };
};