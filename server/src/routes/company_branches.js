const express = require('express');
const CompanyBranchesController = require('../controllers/company_branches');
const router = express.Router();
const validation = require('../middlewares/companyBranchesValidator');

router
.route('/company_branches')
.get(CompanyBranchesController.getAllCompanyBranchesWithCompany)
.post(validation.createCompanyBranchData, CompanyBranchesController.createCompanyBranches);

router
.route('/company_branches/:branch_id')
.get(CompanyBranchesController.getCompanyBranchesByBranchesIdWithCompany)
.put(validation.updateCompanyBranchData, CompanyBranchesController.updateCompanyBranchesByCompanyBranchId)
.delete(CompanyBranchesController.deleteCompanyBranchesByCompanyBranchId);

module.exports = router;