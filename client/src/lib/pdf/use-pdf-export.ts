import { useState } from 'react';
import { generateAndDownloadPDF, getFilenameSuffix, PDFReportData, ComparisonReportData } from './pdf-utils';
import { HSAReport } from './templates/hsa-report';
import { CommuterReport } from './templates/commuter-report';
import { LifeInsuranceReport } from './templates/life-insurance-report';
import { RetirementReport } from './templates/retirement-report';
import { ComparisonReport } from './templates/comparison-report';
import { HSAInputs, HSAResults, CommuterInputs, CommuterResults, LifeInsuranceInputs, LifeInsuranceResults, RetirementInputs, RetirementResults } from '@shared/schema';

type CalculatorInputs = HSAInputs | CommuterInputs | LifeInsuranceInputs | RetirementInputs;
type CalculatorResults = HSAResults | CommuterResults | LifeInsuranceResults | RetirementResults;

export const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportHSAReport = async (inputs: HSAInputs, results: HSAResults) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const data: PDFReportData = {
        type: 'hsa',
        title: `${inputs.accountType.toUpperCase()} Benefits Analysis`,
        generatedAt: new Date(),
        inputs,
        results
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

  const exportRetirementReport = async (inputs: RetirementInputs, results: RetirementResults) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const data: PDFReportData = {
        type: 'retirement',
        title: '401(k) Retirement Planning Analysis',
        generatedAt: new Date(),
        inputs,
        results
      };
      
      const filename = `Retirement_Report_${getFilenameSuffix()}.pdf`;
      const reportElement = RetirementReport({ data }) as React.ReactElement;
      await generateAndDownloadPDF(reportElement, filename);
    } catch (err) {
      setError('Failed to generate Retirement report. Please try again.');
      console.error('Retirement PDF export error:', err);
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
    type: 'hsa' | 'commuter' | 'life-insurance' | 'retirement',
    inputs: CalculatorInputs,
    results: CalculatorResults
  ) => {
    switch (type) {
      case 'hsa':
        await exportHSAReport(inputs as HSAInputs, results as HSAResults);
        break;
      case 'commuter':
        await exportCommuterReport(inputs as CommuterInputs, results as CommuterResults);
        break;
      case 'life-insurance':
        await exportLifeInsuranceReport(inputs as LifeInsuranceInputs, results as LifeInsuranceResults);
        break;
      case 'retirement':
        await exportRetirementReport(inputs as RetirementInputs, results as RetirementResults);
        break;
      default:
        setError('Unknown report type');
    }
  };

  return {
    isGenerating,
    error,
    exportHSAReport,
    exportCommuterReport,
    exportLifeInsuranceReport,
    exportRetirementReport,
    exportComparisonReport,
    exportReport
  };
};