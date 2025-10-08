import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
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

export type ReportType = 'hsa' | 'fsa' | 'commuter' | 'life-insurance';

export interface PDFReportData {
  type: ReportType;
  title: string;
  generatedAt: Date;
  inputs: any;
  results: any;
  additionalData?: any;
}

export const generateAndDownloadPDF = async (
  component: React.ReactElement,
  filename: string
): Promise<void> => {
  try {
    const blob = await pdf(component).toBlob();
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getFilenameSuffix = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
};
