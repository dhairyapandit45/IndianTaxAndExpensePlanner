import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import TaxProfile from '../models/TaxProfile.js';
import { calculateIndianTax } from '../utils/taxCalculator.js';

// @desc    Get aggregate report statistics (Incomes, Expenses, Taxes)
// @route   GET /api/reports
export const getReportSummary = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const expenses = await Expense.find({ userId });
    const incomes = await Income.find({ userId });
    const taxProfile = await TaxProfile.findOne({ userId });

    // Group expenses by calendar month
    const expenseByMonth = {};
    const categoryBreakdown = {};
    const categoryBreakdownByMonth = {};
    
    expenses.forEach((exp) => {
      // Date is formatted YYYY-MM-DD
      const month = exp.date.substring(0, 7); // "YYYY-MM"
      expenseByMonth[month] = (expenseByMonth[month] || 0) + exp.amount;
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
      
      if (!categoryBreakdownByMonth[month]) {
         categoryBreakdownByMonth[month] = {};
      }
      categoryBreakdownByMonth[month][exp.category] = (categoryBreakdownByMonth[month][exp.category] || 0) + exp.amount;
    });

    // Group incomes by calendar month
    const incomeByMonth = {};
    incomes.forEach((inc) => {
      const month = inc.date.substring(0, 7); // "YYYY-MM"
      incomeByMonth[month] = (incomeByMonth[month] || 0) + inc.amount;
    });

    // All distinct months in active logs, sorted chronologically descending
    const allMonths = Array.from(
      new Set([...Object.keys(expenseByMonth), ...Object.keys(incomeByMonth)])
    ).sort((a, b) => b.localeCompare(a));

    const monthlySummary = allMonths.map((m) => {
      const totalIncome = incomeByMonth[m] || 0;
      const totalExpense = expenseByMonth[m] || 0;
      return {
        month: m,
        income: totalIncome,
        expenses: totalExpense,
        savings: totalIncome - totalExpense
      };
    });

    // Tax summary calculations
    let taxSummary = null;
    if (taxProfile) {
      const calculations = calculateIndianTax({
        salaryIncome: taxProfile.salaryIncome,
        businessIncome: taxProfile.businessIncome,
        otherIncome: taxProfile.otherIncome,
        deductions80C: taxProfile.deductions80C,
        deductions80D: taxProfile.deductions80D,
        educationLoan: taxProfile.educationLoan,
        epf: taxProfile.epf,
        elss: taxProfile.elss,
        hra: taxProfile.hra,
        homeLoan: taxProfile.homeLoan,
        nps: taxProfile.nps
      });

      taxSummary = {
        grossIncome: calculations.grossIncome,
        taxableIncomeOld: calculations.taxableIncomeOld,
        taxableIncomeNew: calculations.taxableIncomeNew,
        totalTaxOld: calculations.totalTaxOld,
        totalTaxNew: calculations.totalTaxNew,
        recommendedRegime: calculations.recommendedRegime
      };
    }

    res.json({
      monthlySummary,
      categoryBreakdown,
      categoryBreakdownByMonth,
      taxSummary
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error loading report data.' });
  }
};