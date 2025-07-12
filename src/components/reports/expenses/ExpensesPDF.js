import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import Rudaw from '../../../assets/fonts/rudawregular2.ttf';

// 1. Font registration
Font.register({
  family: 'Rudaw',
  fonts: [{ src: Rudaw, fontWeight: 'normal' }],
});

// 2. Styles
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Rudaw',
    direction: 'rtl',
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 5,
    direction: 'rtl',
  },
  row: {
    flexDirection: 'row-reverse',
  },
  cell: {
    padding: 4,
    border: '1px solid #eee',
    fontSize: 10,
    textAlign: 'right',
  },
  header: {
    fontWeight: 'bold',
    backgroundColor: '#eee',
    fontSize: 11,
  },
  sumRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
    boxSizing: 'border-box',
    width: '100%',
    border: '1px solid #d1d5db',
  },
  sumTitle: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#222',
    flex: 1,
    textAlign: 'right',
  },
  sumText: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#222',
    flex: 2,
    textAlign: 'left',
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 18,
    borderTop: '1px solid #eee',
    paddingTop: 8,
    fontSize: 10,
    color: '#888',
    width: 'auto',
    height: 18,
  },
  footerRight: {
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    width: '48%',
  },
  footerLeft: {
    position: 'absolute',
    left: 0,
    textAlign: 'left',
    width: '48%',
  },
  // Column widths
  col1: { flex: 0.5 },
  col2: { flex: 1.5 },
  col3: { flex: 2 },
  col4: { flex: 1.5 },
  col5: { flex: 2 },
  col6: { flex: 1.5 },
  col7: { flex: 2 },
  col8: { flex: 1.5 },
});

// 3. Utility function
function getSumByCurrency(expenses, currencies) {
  const sums = {};
  expenses.forEach(exp => {
    const currency = currencies.find(cur => cur.id === exp.currency_id);
    const symbol = currency?.symbol || '';
    const key = symbol || exp.currency_id || '';
    const amount = Number(exp.amount || 0);
    if (!sums[key]) sums[key] = 0;
    sums[key] += amount;
  });
  return sums;
}
function formatNumberWithCommas(value) {
  if (value === null || value === undefined) return '';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 4. Main component
const ExpensesPDF = ({ expenses, categories, branches, employees, currencies, company }) => {
  const sumByCurrency = getSumByCurrency(expenses, currencies);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{company?.name || ''}</Text>
            <Text style={{ fontSize: 10 }}>{company?.tagline || ''}</Text>
            <Text style={{ fontSize: 10 }}>{company?.phone_1 || ''}</Text>
            <Text style={{ fontSize: 10 }}>{company?.phone_2 || ''}</Text>
          </View>
          {company?.logo_1 && (
            <Image
              src={company.logo_1}
              style={{ width: 100, height: 100, marginLeft: 15, borderRadius: 1 }}
            />
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>ڕاپۆرتی مەسرووفات</Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, styles.col1]}>#</Text>
            <Text style={[styles.cell, styles.col2]}>گرووپ</Text>
            <Text style={[styles.cell, styles.col3]}>ناو</Text>
            <Text style={[styles.cell, styles.col4]}>بڕ</Text>
            <Text style={[styles.cell, styles.col5]}>کارمەند</Text>
            <Text style={[styles.cell, styles.col6]}>لق</Text>
            <Text style={[styles.cell, styles.col7]}>تێبینی</Text>
            <Text style={[styles.cell, styles.col8]}>بەروار</Text>
          </View>

          {/* Data rows */}
          {expenses.map(exp => (
            <View style={styles.row} key={exp.id}>
              <Text style={[styles.cell, styles.col1]}>{exp.id}</Text>
              <Text style={[styles.cell, styles.col2]}>{categories.find(c => c.id === exp.category_id)?.name || ''}</Text>
              <Text style={[styles.cell, styles.col3]}>{exp.name}</Text>
              <Text style={[styles.cell, styles.col4]}>
                {(currencies.find(cur => cur.id === exp.currency_id)?.symbol || '') + formatNumberWithCommas(exp.amount)}
              </Text>
              <Text style={[styles.cell, styles.col5]}>{employees.find(e => e.id === exp.employee_id)?.name || ''}</Text>
              <Text style={[styles.cell, styles.col6]}>{branches.find(b => b.id === exp.branch_id)?.name || ''}</Text>
              <Text style={[styles.cell, styles.col7]}>{exp.note}</Text>
              <Text style={[styles.cell, styles.col8]}>
                {new Date(exp.expense_date).toLocaleDateString('ckb-IQ')}
              </Text>
            </View>
          ))}

          {/* Sum row */}
          <View style={styles.sumRow}>
            <Text style={styles.sumTitle}>کۆی گشتی</Text>
            <Text style={styles.sumText}>
              {Object.entries(sumByCurrency).map(([symbol, total]) => (
                <Text key={symbol} style={{ marginHorizontal: 1 }}>
                  {symbol}{total.toLocaleString()} {' | '}
                </Text>
              ))}
            </Text>
          </View>
        </View>

        {/* Footer */}
        {(company?.address || company?.supplier_name) && (
          <View style={styles.footer}>
            {company?.address && (
              <Text style={styles.footerRight}>ناونیشان: {company.address}</Text>
            )}
            {company?.supplier_name && (
              <Text style={styles.footerLeft}>{company.supplier_name}</Text>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ExpensesPDF;
