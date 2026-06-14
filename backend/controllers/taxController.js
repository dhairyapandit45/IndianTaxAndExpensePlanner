import TaxProfile from '../models/TaxProfile.js';
import { calculateIndianTax } from '../utils/taxCalculator.js';

// @desc    Get current user's tax profile & tax calculations
// @route   GET /api/tax
export const getTaxProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    let profile = await TaxProfile.findOne({ userId });

    const defaultProfile = {
      salaryIncome: 0,
      businessIncome: 0,
      otherIncome: 0,
      deductions80C: 0,
      deductions80D: 0,
      educationLoan: 0,
      epf: 0,
      elss: 0,
      hra: 0,
      homeLoan: 0,
      nps: 0
    };

    const activeProfile = profile || { userId, ...defaultProfile };

    // Calculate tax numbers
    const calculations = calculateIndianTax({
      salaryIncome: activeProfile.salaryIncome,
      businessIncome: activeProfile.businessIncome,
      otherIncome: activeProfile.otherIncome,
      deductions80C: activeProfile.deductions80C,
      deductions80D: activeProfile.deductions80D || 0,
      educationLoan: activeProfile.educationLoan || 0,
      epf: activeProfile.epf || 0,
      elss: activeProfile.elss || 0,
      hra: activeProfile.hra,
      homeLoan: activeProfile.homeLoan,
      nps: activeProfile.nps
    });

    res.json({
      profile: activeProfile,
      calculations
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error fetching tax profile.' });
  }
};

// @desc    Update or create user's tax profile
// @route   POST /api/tax
export const updateTaxProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  const {
    salaryIncome,
    businessIncome,
    otherIncome,
    deductions80C,
    deductions80D,
    educationLoan,
    epf,
    elss,
    hra,
    homeLoan,
    nps
  } = req.body;

  try {
    let profile = await TaxProfile.findOne({ userId });

    const newValues = {
      salaryIncome: salaryIncome !== undefined ? Number(salaryIncome) : 0,
      businessIncome: businessIncome !== undefined ? Number(businessIncome) : 0,
      otherIncome: otherIncome !== undefined ? Number(otherIncome) : 0,
      deductions80C: deductions80C !== undefined ? Number(deductions80C) : 0,
      deductions80D: deductions80D !== undefined ? Number(deductions80D) : 0,
      educationLoan: educationLoan !== undefined ? Number(educationLoan) : 0,
      epf: epf !== undefined ? Number(epf) : 0,
      elss: elss !== undefined ? Number(elss) : 0,
      hra: hra !== undefined ? Number(hra) : 0,
      homeLoan: homeLoan !== undefined ? Number(homeLoan) : 0,
      nps: nps !== undefined ? Number(nps) : 0
    };

    let updatedProfile;
    if (profile && profile._id) {
      updatedProfile = await TaxProfile.findByIdAndUpdate(profile._id, newValues, { new: true });
    } else {
      updatedProfile = await TaxProfile.create({
        userId,
        ...newValues
      });
    }

    const calculations = calculateIndianTax({
      salaryIncome: updatedProfile.salaryIncome,
      businessIncome: updatedProfile.businessIncome,
      otherIncome: updatedProfile.otherIncome,
      deductions80C: updatedProfile.deductions80C,
      deductions80D: updatedProfile.deductions80D,
      educationLoan: updatedProfile.educationLoan,
      epf: updatedProfile.epf,
      elss: updatedProfile.elss,
      hra: updatedProfile.hra,
      homeLoan: updatedProfile.homeLoan,
      nps: updatedProfile.nps
    });

    res.json({
      profile: updatedProfile,
      calculations
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error updating tax profile.' });
  }
};