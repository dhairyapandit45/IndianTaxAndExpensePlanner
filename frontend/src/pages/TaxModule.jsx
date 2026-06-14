import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { Calculator, CheckCircle, Info, AlertCircle } from 'lucide-react';

const TaxModule = () => {
  const [inputs, setInputs] = useState({
    salaryIncome: '',
    businessIncome: '',
    otherIncome: '',
    deductions80C: '',
    deductions80D: '',
    educationLoan: '',
    epf: '',
    elss: '',
    hra: '',
    homeLoan: '',
    nps: ''
  });

  const [calcs, setCalcs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchTaxProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tax');
        if (res.data && res.data.profile) {
          const prof = res.data.profile;
          setInputs({
            salaryIncome: prof.salaryIncome ? String(prof.salaryIncome) : '',
            businessIncome: prof.businessIncome ? String(prof.businessIncome) : '',
            otherIncome: prof.otherIncome ? String(prof.otherIncome) : '',
            deductions80C: prof.deductions80C ? String(prof.deductions80C) : '',
            deductions80D: prof.deductions80D ? String(prof.deductions80D) : '',
            educationLoan: prof.educationLoan ? String(prof.educationLoan) : '',
            epf: prof.epf ? String(prof.epf) : '',
            elss: prof.elss ? String(prof.elss) : '',
            hra: prof.hra ? String(prof.hra) : '',
            homeLoan: prof.homeLoan ? String(prof.homeLoan) : '',
            nps: prof.nps ? String(prof.nps) : ''
          });
        }
        setCalcs(res.data?.calculations || null);
      } catch (err) {
        setErrorMsg('Error loading your Saved Tax Profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setCalculating(true);

    const body = {
      salaryIncome: Number(inputs.salaryIncome || 0),
      businessIncome: Number(inputs.businessIncome || 0),
      otherIncome: Number(inputs.otherIncome || 0),
      deductions80C: Number(inputs.deductions80C || 0),
      deductions80D: Number(inputs.deductions80D || 0),
      educationLoan: Number(inputs.educationLoan || 0),
      epf: Number(inputs.epf || 0),
      elss: Number(inputs.elss || 0),
      hra: Number(inputs.hra || 0),
      homeLoan: Number(inputs.homeLoan || 0),
      nps: Number(inputs.nps || 0)
    };

    try {
      const res = await api.post('/tax', body);
      setCalcs(res.data.calculations);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Calculation saving failed.');
    } finally {
      setCalculating(false);
    }
  };

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-400 font-medium">Loading Tax Slabs and Profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8" id="tax-module-view">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600 animate-spin-slow" />
            Comprehensive Tax Planner
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Determine liabilities and select the optimal scheme to minimize deductions.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2 mb-4 text-sm" id="tax-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {Number(inputs.businessIncome) > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md text-orange-900 mb-4 shadow-sm" id="business-warning">
            <h4 className="font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Business Income Rule Trap
            </h4>
            <p className="text-sm mt-1">
              Indian tax rules stipulate that taxpayers with business or professional income default to the New Tax Regime. You can only opt out and switch to the Old Regime <strong>once in a lifetime</strong> using Form 10-IEA. If you choose the Old Regime for business income, you will be locked into it. Consult a tax professional before deciding.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
          <div>
            <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Old Regime Slabs & Deductions
            </h5>
            <p className="leading-relaxed">
              Standard Slabs: Nil up to 2.5L; 5% up to 5L; 20% up to 10L; 30% above. Rebate: zero tax up to taxable income of 5,00,000. You can claim major deductions: Standard salary deduction (50k), HRA, 80C, 80D, NPS, Education Loan, EPF, ELSS, and Home Loans.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              New Regime Slabs (Latest FY 2025-26 Budget)
            </h5>
            <p className="leading-relaxed">
              Slabs: Nil up to 4L; 5% up to 8L; 10% up to 12L; 15% up to 16L; 20% up to 20L; 25% up to 24L; 30% above. Rebate under Section 87A: zero tax up to taxable income of 12,00,000. Standard salary deduction (75k) is allowed. All other exemptions are ignored.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form Side */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm h-fit">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3 mb-4">
              Enter Income & Exemptions
            </h3>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 rounded-md p-3.5 space-y-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block">Section A: Annual Earnings</span>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Salary Gross Income</label>
                  <input
                    type="text"
                    name="salaryIncome"
                    placeholder="e.g. 800000"
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                    value={inputs.salaryIncome}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Business Profits / Receipts</label>
                  <input
                    type="text"
                    name="businessIncome"
                    placeholder="e.g. 150000"
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                    value={inputs.businessIncome}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Other Source Revenues</label>
                  <input
                    type="text"
                    name="otherIncome"
                    placeholder="e.g. Interest, rent, dividend"
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                    value={inputs.otherIncome}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="bg-green-50/50 border border-green-100 rounded-md p-3.5 space-y-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-green-700 block">Section B: Old Slabs Exemptions</span>

                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">Sec 80C (Max 1.5L)</label>
                  <input
                    type="text"
                    name="deductions80C"
                    placeholder="e.g. 120000"
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                    value={inputs.deductions80C}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">EPF</label>
                    <input
                      type="text"
                      name="epf"
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      value={inputs.epf}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">ELSS</label>
                    <input
                      type="text"
                      name="elss"
                      placeholder="e.g. 40000"
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      value={inputs.elss}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">Sec 80D (Health Ins.)</label>
                    <input
                      type="text"
                      name="deductions80D"
                      placeholder="e.g. 25000"
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      value={inputs.deductions80D}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">Education Loan</label>
                    <input
                      type="text"
                      name="educationLoan"
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      value={inputs.educationLoan}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">HRA Exempted</label>
                    <input
                      type="text"
                      name="hra"
                      placeholder="e.g. 60000"
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      value={inputs.hra}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">Home Loan Int.</label>
                    <input
                      type="text"
                      name="homeLoan"
                      placeholder="Max 2L"
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      value={inputs.homeLoan}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-slate-300 uppercase mb-1">National Pension Scheme (NPS - 80CCD)</label>
                  <input
                    type="text"
                    name="nps"
                    placeholder="Max 50K"
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800"
                    value={inputs.nps}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-md transition text-xs shadow-sm"
                id="calculate-tax-btn"
              >
                {calculating ? 'Analyzing brackets...' : 'Save & Calculate Liability'}
              </button>
            </form>
          </div>

          {/* Results Side */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-lg shadow-sm lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 pb-3">
              Estimated Tax Liability Comparison
            </h3>

            {!calcs ? (
              <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-sm">
                Fill out the left form and run calculation to display Old vs. New tax results.
              </div>
            ) : (
              <div className="space-y-6" id="tax-result-cards">
                
                {/* Recommendation Banner */}
                <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded-md text-green-900">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                    Recommended Plan: <span className="underline font-extrabold">{calcs.recommendedRegime}</span>
                  </h4>
                  <p className="text-xs text-green-800 mt-1">
                    Choosing the <strong className="font-bold">{calcs.recommendedRegime}</strong> will save you approximately{' '}
                    <strong className="underline text-green-950 font-black">
                      {formatRupees(Math.abs(calcs.totalTaxOld - calcs.totalTaxNew))}
                    </strong>{' '}
                    in taxes for the FY 2025-26.
                  </p>
                </div>

                {/* Slabs Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Regime: Old */}
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-5 space-y-4 shadow-sm hover:border-gray-300 transition">
                    <div className="border-b border-gray-100 dark:border-slate-700/50 pb-2">
                      <h4 className="font-bold text-md text-gray-800 dark:text-slate-100 uppercase flex items-center justify-between">
                        <span>Old Regime</span>
                        <span className="text-xs font-normal text-gray-400 dark:text-slate-500 lowercase">lots of deductions</span>
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Gross Total Income:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatRupees(calcs.grossIncome)}</span>
                      </div>
                      <div className="flex justify-between text-green-650">
                        <span>Total Deductions Applied:</span>
                        <span>- {formatRupees(calcs.deductionsOld)}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-sm">
                        <span className="text-gray-700 dark:text-slate-200">Taxable Net Income:</span>
                        <span className="text-gray-900 dark:text-white">{formatRupees(calcs.taxableIncomeOld)}</span>
                      </div>

                      <div className="border-t border-gray-150 dark:border-slate-700 pt-2 pb-1 space-y-1">
                        <span className="text-gray-500 dark:text-slate-400 font-bold">Slab Breakdown:</span>
                        {calcs.breakdownOld && calcs.breakdownOld.map((slab, i) => (
                          <div key={i} className="flex justify-between pl-2 text-[11px] text-gray-500 dark:text-slate-400">
                            <span>{slab.range} ({(slab.rate * 100).toFixed(0)}%) on {formatRupees(slab.amount)}</span>
                            <span className="text-gray-700 dark:text-slate-200 font-medium">{formatRupees(slab.tax)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-150 dark:border-slate-700 pt-1 flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Base Slab Tax:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatRupees(calcs.taxOld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Cess Education (4%):</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatRupees(calcs.cessOld)}</span>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-2 flex justify-between font-black text-base text-gray-950 dark:text-white">
                        <span>Total Tax Owed:</span>
                        <span>{formatRupees(calcs.totalTaxOld)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Regime: New */}
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-5 space-y-4 shadow-sm hover:border-gray-300 transition">
                    <div className="border-b border-gray-100 dark:border-slate-700/50 pb-2">
                      <h4 className="font-bold text-md text-gray-800 dark:text-slate-100 uppercase flex items-center justify-between">
                        <span>New Regime</span>
                        <span className="text-xs font-normal text-green-600 bg-green-50 px-1 py-0.5 rounded uppercase font-mono">rebate: 12L</span>
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Gross Total Income:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatRupees(calcs.grossIncome)}</span>
                      </div>
                      <div className="flex justify-between text-green-650">
                        <span>Standard Salary Deduction:</span>
                        <span>- {formatRupees(calcs.deductionsNew)}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-sm">
                        <span className="text-gray-700 dark:text-slate-200">Taxable Net Income:</span>
                        <span className="text-gray-900 dark:text-white">{formatRupees(calcs.taxableIncomeNew)}</span>
                      </div>

                      <div className="border-t border-gray-150 dark:border-slate-700 pt-2 pb-1 space-y-1">
                        <span className="text-gray-500 dark:text-slate-400 font-bold">Slab Breakdown:</span>
                        {calcs.breakdownNew && calcs.breakdownNew.map((slab, i) => (
                          <div key={i} className="flex justify-between pl-2 text-[11px] text-gray-500 dark:text-slate-400">
                            <span>{slab.range} ({(slab.rate * 100).toFixed(0)}%) on {formatRupees(slab.amount)}</span>
                            <span className="text-gray-700 dark:text-slate-200 font-medium">{formatRupees(slab.tax)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-150 dark:border-slate-700 pt-1 flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Base Slab Tax:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatRupees(calcs.taxNew)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Cess Education (4%):</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatRupees(calcs.cessNew)}</span>
                      </div>

                      <div className="border-t border-gray-200 dark:border-slate-700 pt-2 flex justify-between font-black text-base text-gray-950 dark:text-white">
                        <span>Total Tax Owed:</span>
                        <span>{formatRupees(calcs.totalTaxNew)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                <span className="text-[10px] text-gray-400 dark:text-slate-500 block leading-normal italic text-center">
                  ⚠️ Disclaimer: Calculators evaluate standard estimates in compliance with average Section 87A rebate rules under FY 25-26. Review files and consult local tax experts for precise declarations.
                </span>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default TaxModule;
