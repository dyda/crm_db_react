import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import Rudaw from '../../../assets/fonts/rudawregular2.ttf';
import PdfReportHeader from '../common/PdfReportHeader';

// Font registration
Font.register({
  family: 'Rudaw',
  fonts: [{ src: Rudaw, fontWeight: 'normal' }],
});

// Styles (same as ItemTransactionPDF)
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Rudaw',
    direction: 'rtl',
    position: 'relative',
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  filters: {
    fontSize: 10,
    marginBottom: 8,
    textAlign: 'center',
    color: '#444',
  },
  exportDate: {
    fontSize: 10,
    marginBottom: 8,
    textAlign: 'center',
    color: '#444',
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
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  signatureBox: {
    borderTop: '1px solid #888',
    width: 120,
    textAlign: 'center',
    fontSize: 10,
    paddingTop: 4,
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
  pageNumber: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#888',
  },
  // Column widths
  col1: { flex: 0.5 },
  col2: { flex: 1.2 },
  col3: { flex: 1.2 },
  col4: { flex: 1.2 },
  col5: { flex: 1.2 },
  col6: { flex: 1.2 },
  col7: { flex: 1.2 },
  col8: { flex: 2 },
});

// Utility
function formatNumberWithCommas(value) {
  if (value === null || value === undefined) return '';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Main component
const ItemDamagePDF = ({
  damages = [],
  warehouses = [],
  items = [],
  units = [],
  users = [],
  company = {},
  filters = {},
}) => {
  // Prepare filter display
  const filterTexts = [];
  if (filters.warehouse) {
    const warehouse = warehouses.find(w => w.id === filters.warehouse);
    filterTexts.push(`کۆگا: ${warehouse ? warehouse.name : filters.warehouse}`);
  }
  if (filters.item) {
    const item = items.find(i => i.id === filters.item);
    filterTexts.push(`کاڵا: ${item ? item.name : filters.item}`);
  }
  if (filters.type) {
    filterTexts.push(`جۆر: ${filters.type}`);
  }
  if (filters.user) {
    const user = users.find(u => u.id === filters.user);
    filterTexts.push(`کارمەند: ${user ? user.name : filters.user}`);
  }
  if (filters.dateRange?.start || filters.dateRange?.end) {
    filterTexts.push(
      `لە: ${filters.dateRange.start || '-'} بۆ: ${filters.dateRange.end || '-'}`
    );
  }
  if (filters.search) {
    filterTexts.push(`گەڕان: ${filters.search}`);
  }

  // Export/print date
  const exportDate = new Date().toLocaleString('ckb-IQ');

  // Total by unit
  const totalByUnit = damages.reduce((acc, row) => {
    const unitName = units.find(u => u.id === row.unit_id)?.name || row.unit_id || 'ناناسراو';
    acc[unitName] = (acc[unitName] || 0) + Number(row.quantity || 0);
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* PDF Header */}
        <PdfReportHeader
          company={company}
          title="ڕاپۆرتی کاڵای زیانبەردوو"
          filters={filterTexts}
          exportDate={exportDate}
          styles={styles}
        />

        {/* Table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, styles.col1]}>#</Text>
            <Text style={[styles.cell, styles.col3]}>کۆگا</Text>
            <Text style={[styles.cell, styles.col4]}>کاڵا</Text>
            <Text style={[styles.cell, styles.col5]}>یەکە</Text>
            <Text style={[styles.cell, styles.col6]}>بڕ</Text>
             <Text style={[styles.cell, styles.col2]}>جۆر</Text>
            <Text style={[styles.cell, styles.col8]}>هۆکار</Text>
            <Text style={[styles.cell, styles.col7]}>کارمەند</Text>
          </View>

          {/* Data rows */}
          {damages.map((row, idx) => (
            <View style={styles.row} key={row.id}>
              <Text style={[styles.cell, styles.col1]}>{idx + 1}</Text>
              <Text style={[styles.cell, styles.col3]}>{warehouses.find(w => w.id === row.warehouse_id)?.name || ''}</Text>
              <Text style={[styles.cell, styles.col4]}>{items.find(i => i.id === row.item_id)?.name || ''}</Text>
              <Text style={[styles.cell, styles.col5]}>{units.find(u => u.id === row.unit_id)?.name || ''}</Text>
              <Text style={[styles.cell, styles.col6]}>{formatNumberWithCommas(row.quantity)}</Text>
              <Text style={[styles.cell, styles.col2]}>{row.type}</Text>
               <Text style={[styles.cell, styles.col8]}>{row.reason || ''}</Text>
              <Text style={[styles.cell, styles.col7]}>{users.find(u => u.id === row.user_id)?.name || ''}</Text>
             
            </View>
          ))}

          {/* Sum row */}
          <View style={styles.sumRow}>
            <Text style={styles.sumTitle}>کۆی گشتی :</Text>
            <Text style={styles.sumText}>
              {Object.entries(totalByUnit).length === 0
                ? '-'
                : Object.entries(totalByUnit).map(([unit, sum], idx, arr) => (
                    <Text key={unit} style={{ color: '#d32f2f', marginLeft: 8 }}>
                      {unit}: {formatNumberWithCommas(sum)}
                      {idx < arr.length - 1 && <Text style={{ color: '#888' }}> | </Text>}
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

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default ItemDamagePDF;