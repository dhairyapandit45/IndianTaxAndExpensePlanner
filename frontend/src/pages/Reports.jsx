import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { Download, AlertCircle, FileSpreadsheet, Layers, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('All Time');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports');
        setData(res.data);
      } catch (err) {
        setErrorMsg('Failed to aggregate report structures.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    // Header
    csvContent += "=== Monthly Financial Summary ===\r\n";
    csvContent += "Month,Total Income,Total Expenses,Net Savings\r\n";

    data.monthlySummary.forEach((item) => {
      csvContent += `${item.month},${item.income},${item.expenses},${item.savings}\r\n`;
    });

    csvContent += "\r\n=== Category Wise Consumption ===\r\n";
    csvContent += "Category,Aggregate Spent (INR)\r\n";
    Object.entries(data.categoryBreakdown).forEach(([cat, val]) => {
      csvContent += `${cat},${val}\r\n`;
    });

    if (data.taxSummary) {
      csvContent += "\r\n=== Saved Tax Assessment ===\r\n";
      csvContent += `Gross Income,${data.taxSummary.grossIncome}\r\n`;
      csvContent += `Taxable Net Old,${data.taxSummary.taxableIncomeOld}\r\n`;
      csvContent += `Taxable Net New,${data.taxSummary.taxableIncomeNew}\r\n`;
      csvContent += `Est Old Slab Tax,${data.taxSummary.totalTaxOld}\r\n`;
      csvContent += `Est New Slab Tax,${data.taxSummary.totalTaxNew}\r\n`;
      csvContent += `Advised Regime,${data.taxSummary.recommendedRegime}\r\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finance_report_tax_expense_manager.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    try {
      if (!data) return;
      const expensesRes = await api.get('/expenses');
      const expenses = expensesRes.data || [];
      
      const doc = new jsPDF();
      doc.text("Monthly Expense Summary", 14, 15);
      
      const summaryTableData = data.monthlySummary.map(item => [
        item.month,
        formatRupees(item.expenses)
      ]);

      autoTable(doc, {
        startY: 20,
        head: [['Month', 'Total Expenses']],
        body: summaryTableData,
      });

      const finalY = doc.lastAutoTable.finalY || 20;

      doc.text("Detailed Transactions", 14, finalY + 15);

      const tableData = expenses.map(exp => [
        new Date(exp.date).toLocaleDateString(),
        exp.title,
        exp.category,
        formatRupees(exp.amount)
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Date', 'Title', 'Category', 'Amount']],
        body: tableData,
      });

      doc.save("expense_report.pdf");
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const [expensesRes, incomeRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/income')
      ]);
      const expenses = expensesRes.data || [];
      const incomes = incomeRes.data || [];

      const wb = XLSX.utils.book_new();

      const expenseData = expenses.map(exp => ({
        Date: new Date(exp.date).toLocaleDateString(),
        Title: exp.title,
        Category: exp.category,
        Amount: exp.amount
      }));
      const wsExpenses = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");

      const incomeData = incomes.map(inc => ({
        Date: new Date(inc.date).toLocaleDateString(),
        Source: inc.source,
        Amount: inc.amount
      }));
      const wsIncome = XLSX.utils.json_to_sheet(incomeData);
      XLSX.utils.book_append_sheet(wb, wsIncome, "Income");

      XLSX.writeFile(wb, "financial_report.xlsx");
    } catch (err) {
      console.error(err);
      alert('Failed to download Excel');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-400 font-medium">Compiling tax audits and transactional logs...</p>
        </div>
      </div>);

  }

  const totalMonthlyIncome = data?.monthlySummary?.reduce((acc, curr) => acc + curr.income, 0) || 0;
  const totalMonthlyExpenses = data?.monthlySummary?.reduce((acc, curr) => acc + curr.expenses, 0) || 0;
  const totalMonthlySavings = data?.monthlySummary?.reduce((acc, curr) => acc + curr.savings, 0) || 0;

  const activeCategoryBreakdown = selectedMonth === 'All Time' 
    ? data?.categoryBreakdown || {} 
    : data?.categoryBreakdownByMonth?.[selectedMonth] || {};

  const totalCategoryExpenses = Object.values(activeCategoryBreakdown).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8" id="reports-view">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Downloadable Reports</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Static listings auditing income streams, ledger categories, and regimes.</p>
          </div>
          {data &&
            <div className="flex flex-wrap gap-2 self-start sm:self-center">
              <button
                onClick={handleDownloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2.5 rounded-md transition shadow-sm inline-flex items-center gap-1.5"
                id="download-csv-btn">
                <Download className="w-4 h-4" />
                CSV Statement
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-md transition shadow-sm inline-flex items-center gap-1.5"
                id="download-pdf-btn">
                <FileText className="w-4 h-4" />
                PDF Report
              </button>
              <button
                onClick={handleDownloadExcel}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-md transition shadow-sm inline-flex items-center gap-1.5"
                id="download-excel-btn">
                <Table className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          }
        </div>

        {errorMsg &&
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm" id="report-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        }

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Table 1: Monthly Saving Summary */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="font-bold text-md text-gray-800 dark:text-slate-100 border-b border-gray-100 dark:border-slate-700/50 pb-2.5 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Monthly Income & Expense Summary
            </h3>

            {!data || data.monthlySummary.length === 0 ?
            <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                No active monthly summary. Log some items first.
              </div> :

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3">Total Income</th>
                      <th className="py-2 px-3">Total Expenses</th>
                      <th className="py-2 px-3 text-right">Net Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlySummary.map((item) =>
                  <tr key={item.month} className="border-b border-gray-100 dark:border-slate-700/50 font-medium hover:bg-gray-50 transition">
                        <td className="py-2.5 px-3 font-mono text-gray-900 dark:text-white">{item.month}</td>
                        <td className="py-2.5 px-3 text-green-600">{formatRupees(item.income)}</td>
                        <td className="py-2.5 px-3 text-red-550">{formatRupees(item.expenses)}</td>
                        <td className={`py-2.5 px-3 text-right ${item.savings >= 0 ? 'text-blue-600' : 'text-orange-550'}`}>
                          {formatRupees(item.savings)}
                        </td>
                      </tr>
                  )}
                  </tbody>
                  <tfoot className="bg-gray-100 dark:bg-slate-800 font-bold text-gray-900 dark:text-white border-t-2 border-gray-200 dark:border-slate-700">
                    <tr>
                      <td className="py-3 px-3 text-sm">Totals</td>
                      <td className="py-3 px-3 text-green-700 text-sm">{formatRupees(totalMonthlyIncome)}</td>
                      <td className="py-3 px-3 text-red-600 text-sm">{formatRupees(totalMonthlyExpenses)}</td>
                      <td className={`py-3 px-3 text-right text-sm ${totalMonthlySavings >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
                        {formatRupees(totalMonthlySavings)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            }
          </div>

          {/* Table 2: Category Breakdown */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2.5">
              <h3 className="font-bold text-md text-gray-800 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Expense Category Breakdown
              </h3>
              {data && Object.keys(data.categoryBreakdownByMonth || {}).length > 0 && (
                <select 
                  className="text-xs border border-gray-200 dark:border-slate-700 rounded px-2 py-1 outline-none text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-900 font-medium cursor-pointer"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="All Time">All Time</option>
                  {Object.keys(data.categoryBreakdownByMonth).sort((a,b) => b.localeCompare(a)).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            {!data || Object.keys(activeCategoryBreakdown).length === 0 ?
            <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                No expense category distributions detected for {selectedMonth}.
              </div> :

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                      <th className="py-2 px-3">Category Name</th>
                      <th className="py-2 px-3 text-right">Aggregate Spent (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(activeCategoryBreakdown).map(([cat, val]) =>
                  <tr key={cat} className="border-b border-gray-100 dark:border-slate-700/50 font-medium hover:bg-gray-50 transition">
                        <td className="py-3 px-3 text-gray-700 dark:text-slate-200 capitalize">{cat}</td>
                        <td className="py-3 px-3 text-right text-gray-900 dark:text-white font-bold">{formatRupees(val)}</td>
                      </tr>
                  )}
                  </tbody>
                  <tfoot className="bg-gray-100 dark:bg-slate-800 font-bold text-gray-900 dark:text-white border-t-2 border-gray-200 dark:border-slate-700">
                    <tr>
                      <td className="py-3 px-3 text-sm">Total Expenditure</td>
                      <td className="py-3 px-3 text-right text-red-600 text-sm">{formatRupees(totalCategoryExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            }
          </div>

          {/* Table 3: Tax Summary */}
          {data &&
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm lg:col-span-2 space-y-4">
              <h3 className="font-bold text-md text-gray-800 dark:text-slate-100 border-b border-gray-100 dark:border-slate-700/50 pb-2.5">
                Saved Tax Assessment Profile Summary
              </h3>

              {!data.taxSummary ?
            <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                  Tax estimates not configured yet. Set up details on the{' '}
                  <span className="text-blue-600 underline font-semibold cursor-pointer">Tax Calculator</span> page.
                </div> :

            <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-150 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold bg-gray-50 dark:bg-slate-900">
                        <th className="py-2.5 px-3">Parameter Name</th>
                        <th className="py-2.5 px-3 text-right">Old Regime Estimates</th>
                        <th className="py-2.5 px-3 text-right text-indigo-950">New Regime Estimates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium font-mono text-xs">
                      <tr>
                        <td className="py-3 px-3 text-gray-600 dark:text-slate-300 font-sans text-sm">Declared Annual Gross Earnings</td>
                        <td className="py-3 px-3 text-right text-gray-900 dark:text-white font-bold">{formatRupees(data.taxSummary.grossIncome)}</td>
                        <td className="py-3 px-3 text-right text-indigo-950 font-bold">{formatRupees(data.taxSummary.grossIncome)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-gray-600 dark:text-slate-300 font-sans text-sm">Computed Net Taxable Income</td>
                        <td className="py-3 px-3 text-right text-gray-900 dark:text-white">{formatRupees(data.taxSummary.taxableIncomeOld)}</td>
                        <td className="py-3 px-3 text-right text-indigo-950 font-bold">{formatRupees(data.taxSummary.taxableIncomeNew)}</td>
                      </tr>
                      <tr className="bg-indigo-50/20">
                        <td className="py-3.5 px-3 text-gray-700 dark:text-slate-200 font-sans font-extrabold text-sm">Estimated Total Tax (including Cess)</td>
                        <td className={`py-3.5 px-3 text-right font-extrabold text-sm ${data.taxSummary.totalTaxOld < data.taxSummary.totalTaxNew ? 'text-green-600' : data.taxSummary.totalTaxOld > data.taxSummary.totalTaxNew ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{formatRupees(data.taxSummary.totalTaxOld)}</td>
                        <td className={`py-3.5 px-3 text-right font-extrabold text-sm ${data.taxSummary.totalTaxNew < data.taxSummary.totalTaxOld ? 'text-green-600' : data.taxSummary.totalTaxNew > data.taxSummary.totalTaxOld ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{formatRupees(data.taxSummary.totalTaxNew)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-gray-650 dark:text-slate-300 font-sans font-bold text-sm">Best Selection Verdict</td>
                        <td colSpan={2} className="py-3 px-3 text-center text-blue-700 font-sans font-black text-sm">
                          Use: {data.taxSummary.recommendedRegime} (Saves {formatRupees(Math.abs(data.taxSummary.totalTaxOld - data.taxSummary.totalTaxNew))})
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            }
            </div>
          }

        </div>

      </div>
    </div>);

};

export default Reports;
