export function calculateSlabs(taxableIncome, slabsDef) {
  let tax = 0;
  let breakdown = [];
  let previousLimit = 0;
  for (let slab of slabsDef) {
    if (taxableIncome > previousLimit) {
      let amountInSlab = Math.min(taxableIncome - previousLimit, slab.limit - previousLimit);
      let taxForSlab = amountInSlab * slab.rate;
      tax += taxForSlab;
      breakdown.push({ range: slab.label, rate: slab.rate, amount: amountInSlab, tax: taxForSlab });
      previousLimit = slab.limit;
    } else {
      breakdown.push({ range: slab.label, rate: slab.rate, amount: 0, tax: 0 });
    }
  }
  return { tax, breakdown };
}

export function calculateIndianTax(input) {
  const { salaryIncome, businessIncome, otherIncome, deductions80C, deductions80D = 0, educationLoan = 0, epf = 0, elss = 0, hra, homeLoan, nps } = input;

  const grossIncome = salaryIncome + businessIncome + otherIncome;

  // 1. Old Regime Deductions
  // Standard deduction under Old regime: 50,000 for salaried users
  const standardDeductionOld = salaryIncome > 50000 ? 50000 : salaryIncome;

  // Section 80C is capped at 1,50,000 (includes deductions80C, epf, elss)
  const total80C = deductions80C + epf + elss;
  const capped80C = Math.min(total80C, 150000);

  // Section 80D is capped at 25,000
  const capped80D = Math.min(deductions80D, 25000);

  // Section 80CCD(1B) - NPS is capped at 50,000
  const cappedNps = Math.min(nps, 50000);

  // Section 24(b) - Home loan interest deduction is capped at 2,00,000
  const cappedHomeLoan = Math.min(homeLoan, 200000);

  const deductionsOld = standardDeductionOld + capped80C + capped80D + educationLoan + cappedNps + cappedHomeLoan + hra;
  const taxableIncomeOld = Math.max(0, grossIncome - deductionsOld);

  // 2. New Regime Deductions
  // Standard deduction of 75,000 is available under New Regime as well for salary income
  const standardDeductionNew = salaryIncome > 75000 ? 75000 : salaryIncome;
  // No other deductions (80C, HRA, home loan, NPS etc.) are allowed under the New Regime
  const deductionsNew = standardDeductionNew;
  const taxableIncomeNew = Math.max(0, grossIncome - deductionsNew);

  // 3. Old Regime Tax Calculation (FY 2025-26 slabs - Unchanged)
  const oldSlabsDef = [
    { label: '0 - 2.5L', limit: 250000, rate: 0 },
    { label: '2.5L - 5L', limit: 500000, rate: 0.05 },
    { label: '5L - 10L', limit: 1000000, rate: 0.20 },
    { label: 'Above 10L', limit: Infinity, rate: 0.30 }
  ];

  let { tax: taxOld, breakdown: breakdownOld } = calculateSlabs(taxableIncomeOld, oldSlabsDef);

  // Rebate under Section 87A for Old Regime: if taxable income is <= 5,00,000, tax is free
  if (taxableIncomeOld <= 500000) {
    taxOld = 0;
    breakdownOld.forEach(b => b.tax = 0); // rebate zeroes out tax
  }

  // 4. New Regime Tax Calculation (FY 25-26 Budget slabs)
  const newSlabsDef = [
    { label: '0 - 4L', limit: 400000, rate: 0 },
    { label: '4L - 8L', limit: 800000, rate: 0.05 },
    { label: '8L - 12L', limit: 1200000, rate: 0.10 },
    { label: '12L - 16L', limit: 1600000, rate: 0.15 },
    { label: '16L - 20L', limit: 2000000, rate: 0.20 },
    { label: '20L - 24L', limit: 2400000, rate: 0.25 },
    { label: 'Above 24L', limit: Infinity, rate: 0.30 }
  ];

  let { tax: taxNew, breakdown: breakdownNew } = calculateSlabs(taxableIncomeNew, newSlabsDef);

  // Rebate under Section 87A for New Regime: if taxable income is <= 12,00,000, tax is free
  if (taxableIncomeNew <= 1200000) {
    taxNew = 0;
    breakdownNew.forEach(b => b.tax = 0); // rebate zeroes out tax
  }

  // 5. Add cess (4% Health and Education Cess)
  const cessOld = taxOld * 0.04;
  const totalTaxOld = taxOld + cessOld;

  const cessNew = taxNew * 0.04;
  const totalTaxNew = taxNew + cessNew;

  // Recommendation
  const recommendedRegime = totalTaxOld <= totalTaxNew ? 'Old Regime' : 'New Regime';

  return {
    grossIncome,
    taxableIncomeOld,
    taxableIncomeNew,
    deductionsOld,
    deductionsNew,
    taxOld,
    taxNew,
    cessOld,
    cessNew,
    totalTaxOld,
    totalTaxNew,
    breakdownOld,
    breakdownNew,
    recommendedRegime
  };
}