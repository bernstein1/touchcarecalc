import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDate } from '../pdf-utils';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 36,
    paddingLeft: 48,
    paddingRight: 48,
    paddingBottom: 56,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#94a3b8',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerDate: {
    fontSize: 8,
    color: '#64748b',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 25,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 14,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#94a3b8',
  },
});

interface BaseDocumentProps {
  title: string;
  subtitle: string;
  generatedAt: Date;
  children: React.ReactNode;
}

export const BaseDocument: React.FC<BaseDocumentProps> = ({
  title,
  subtitle,
  generatedAt,
  children,
}) => (
  <Document
    title={title}
    author="TouchCare"
    subject="Benefits calculator report"
    creator="TouchCare Benefits Calculator"
  >
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>TouchCare Benefits</Text>
        <View>
          <Text style={styles.headerDate}>Generated: {formatDate(generatedAt)}</Text>
        </View>
      </View>

      {/* Title Section */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Content */}
      {children}

      {/* Footer */}
      <Text style={styles.footer}>
        This report is for informational purposes only and should not be considered financial advice. 
        Please consult with a qualified financial advisor for personalized recommendations.
      </Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);
