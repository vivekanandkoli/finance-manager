import { format } from 'date-fns';

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = 'expenses.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`✅ Exported ${data.length} records to ${filename}`);
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data, filename = 'expenses.json') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`✅ Exported ${data.length} records to ${filename}`);
};

/**
 * Export data to Excel format (using XLSX library)
 */
export const exportToExcel = async (data, filename = 'expenses.xlsx') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Dynamic import of xlsx to reduce bundle size
    const XLSX = await import('xlsx');
    
    // Prepare data with formatted dates
    const exportData = data.map(expense => ({
      Date: format(new Date(expense.date), 'dd/MM/yyyy'),
      Category: expense.category || 'N/A',
      Description: expense.description || 'N/A',
      Amount: parseFloat(expense.amount || 0),
      Currency: expense.currency || 'INR',
      Status: expense.status || 'unsubmitted',
      'Payment Method': expense.paymentMethod || 'N/A',
      Merchant: expense.merchant || 'N/A',
      Notes: expense.notes || ''
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Category
      { wch: 30 }, // Description
      { wch: 12 }, // Amount
      { wch: 10 }, // Currency
      { wch: 15 }, // Status
      { wch: 18 }, // Payment Method
      { wch: 20 }, // Merchant
      { wch: 30 }  // Notes
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    console.log(`✅ Exported ${data.length} records to ${filename}`);
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    alert('Failed to export to Excel. Make sure xlsx library is installed.');
  }
};

/**
 * Export data to PDF format (using jsPDF)
 */
export const exportToPDF = async (expenses, reportTitle = 'Expense Report') => {
  if (!expenses || expenses.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Dynamic imports to reduce bundle size
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(reportTitle, 14, 22);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 32);
    doc.text(`Total Expenses: ${expenses.length}`, 14, 38);
    
    const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    doc.text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 14, 44);
    
    // Prepare table data
    const tableData = expenses.map(expense => [
      format(new Date(expense.date), 'dd/MM/yyyy'),
      expense.category || 'N/A',
      (expense.description || 'N/A').substring(0, 30), // Truncate long descriptions
      `₹${parseFloat(expense.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      expense.status || 'N/A'
    ]);
    
    // Add table
    doc.autoTable({
      startY: 50,
      head: [['Date', 'Category', 'Description', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        3: { halign: 'right' } // Align amount to right
      }
    });
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(fileName);
    
    console.log(`✅ Exported PDF: ${fileName}`);
  } catch (error) {
    console.error('❌ Error exporting to PDF:', error);
    alert('Failed to export to PDF. Make sure jspdf library is installed.');
  }
};

/**
 * Print expense report
 */
export const printReport = (expenses, reportTitle = 'Expense Report') => {
  if (!expenses || expenses.length === 0) {
    alert('No data to print');
    return;
  }

  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #1e293b;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
          }
          .metadata {
            margin: 20px 0;
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #3b82f6;
            color: white;
            font-weight: bold;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .total {
            margin-top: 20px;
            font-size: 18px;
            font-weight: bold;
            text-align: right;
            padding: 15px;
            background-color: #f0f9ff;
            border-radius: 5px;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="metadata">
          <p><strong>Generated on:</strong> ${format(new Date(), 'dd MMM yyyy HH:mm')}</p>
          <p><strong>Total Expenses:</strong> ${expenses.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `
              <tr>
                <td>${format(new Date(expense.date), 'dd/MM/yyyy')}</td>
                <td>${expense.category || 'N/A'}</td>
                <td>${expense.description || 'N/A'}</td>
                <td>₹${parseFloat(expense.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td>${expense.status || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          Total Amount: ₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
