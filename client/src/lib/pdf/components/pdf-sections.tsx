import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatPercentage } from '../pdf-utils';

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    color: '#334155',
    flex: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 5,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  primaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  successValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#14532d',
    flex: 1,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  gridItem: {
    width: '50%',
    paddingRight: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 8,
    color: '#4b5563',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    marginVertical: 10,
  },
  note: {
    fontSize: 8,
    color: '#4b5563',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface ValueRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  primary?: boolean;
  success?: boolean;
  currency?: boolean;
  percentage?: boolean;
  description?: string;
}

export const ValueRow: React.FC<ValueRowProps> = ({ 
  label, 
  value, 
  highlight = false, 
  primary = false, 
  success = false,
  currency = false,
  percentage = false 
}) => {
  const formattedValue = currency && typeof value === 'number' 
    ? formatCurrency(value)
    : percentage && typeof value === 'number'
    ? formatPercentage(value)
    : value.toString();

  const viewStyles = [styles.row];
  if (highlight) {
    viewStyles.push(styles.highlightRow);
  }
  
  const textStyles = [styles.value];
  if (primary) {
    textStyles.push(styles.primaryValue);
  }
  if (success) {
    textStyles.push(styles.successValue);
  }

  return (
    <View style={viewStyles}>
      <Text style={styles.label}>{label}</Text>
      <Text style={textStyles}>{formattedValue}</Text>
    </View>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  currency?: boolean;
  percentage?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description,
  currency = false,
  percentage = false 
}) => {
  const formattedValue = currency && typeof value === 'number' 
    ? formatCurrency(value)
    : percentage && typeof value === 'number'
    ? formatPercentage(value)
    : value.toString();

  return (
    <View style={styles.gridItem}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{formattedValue}</Text>
      {description && <Text style={styles.cardDescription}>{description}</Text>}
    </View>
  );
};

export const MetricGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.grid}>{children}</View>
);

export const Divider: React.FC = () => <View style={styles.divider} />;

export const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.note}>{children}</Text>
);
