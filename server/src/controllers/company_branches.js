const CompanyBranchesModel = require("../models/company_branches");
const Response = require("../helpers/response");
const { validationResult } = require("express-validator");

const CompanyBranchesController = {
  createCompanyBranches: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const {
        companyBranchName,
        companyBranchAddress,
        googleMapLink,
        companyId,
        createdBy,
      } = req.body;

      const companyBranchData = {
        branch_name: companyBranchName,
        branch_address: companyBranchAddress,
        google_map_link: googleMapLink,
        company_id: companyId,
        created_by: createdBy,
        modified_by: createdBy
      };
      const result = await CompanyBranchesModel.createCompanyBranches(
        companyBranchData
      );
      if (result.insertId > 0) {
        return Response.responseStatus(
          res,
          201,
          `Company Branch data created successfully`
        );
      }
      return Response.responseStatus(
        res,
        400,
        `Failed to create company branch data`
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  getAllCompanyBranches: async (req, res) => {
    try {
      const companyBranchData =
        await CompanyBranchesModel.getAllCompanyBranches();
      if (companyBranchData.length > 0) {
        return Response.responseStatus(
          res,
          200,
          "List of all Companies Branches",
          companyBranchData
        );
      }
      return Response.responseStatus(res, 400, "No data found");
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  getCompanyBranchesByCompanyBranchId: async (req, res) => {
    const branch_id = req.params.branch_id;
    try {
      const companyBranchData =
        await CompanyBranchesModel.getCompanyBranchesByCondition({ branch_id });
      if (companyBranchData.length > 0) {
        return Response.responseStatus(
          res,
          200,
          `Details of Company(${branch_id})`,
          companyBranchData
        );
      }
      return Response.responseStatus(res, 400, `No data found for ${branch_id}`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  getAllCompanyBranchesWithCompany: async (req, res) => {
    try {
      const rows =
        await CompanyBranchesModel.getAllCompanyBranchesWithCompany();
      if (rows.length > 0) {
        let companyBranchData = [];
        rows.map((row) => {
          const {
            id,
            branch_id,
            branch_name,
            branch_address,
            google_map_link,
            company_id,
            company_name,
            company_website,
            company_logo,
          } = row;

          companyBranchData = [
            ...companyBranchData,
            {
              id,
              branch_id,
              branch_name,
              branch_address,
              google_map_link,

              companyData: {
                id,
                company_id: company_id,
                company_name,
                company_website,
                company_logo,
              },
            },
          ];
        });
        return Response.responseStatus(
          res,
          200,
          "List of all Company Branches",
          companyBranchData
        );
      }
      return Response.responseStatus(res, 400, "No data found");
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  getCompanyBranchesByBranchesIdWithCompany: async (req, res) => {
    try {
      const branch_id = req.params.branch_id;

      const rows =
        await CompanyBranchesModel.getCompanyBranchesByBranchesIdWithCompany(
          branch_id
        );
      if (rows.length > 0) {
        const {
          cpb_id,
          branch_name,
          branch_address,
          google_map_link,
          cp_id,
          company_id,
          company_name,
          company_website,
          company_logo,
        } = rows[0];

        const companyBranchData = [
          {
            id: cpb_id,

            branch_name,
            branch_address,
            google_map_link,

            companyData: {
              id: cp_id,
              company_id,
              company_name,
              company_website,
              company_logo,
            },
          },
        ];

        return Response.responseStatus(
          res,
          200,
          `Details of Company Branches (${branch_id})`,
          companyBranchData
        );
      }
      return Response.responseStatus(res, 400, `No data found for ${branch_id}`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  updateCompanyBranchesByCompanyBranchId: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const branch_id = req.params.branch_id;
      const {
        companyBranchName,
        companyBranchAddress,
        googleMapLink,
        companyId,
        modifiedBy,
      } = req.body;
      const companyData = {
        branch_name: companyBranchName,
        branch_address: companyBranchAddress,
        google_map_link: googleMapLink,
        company_id: companyId,
        modified_by: modifiedBy,
      };
      const result =
        await CompanyBranchesModel.updateCompanyBranchesByCondition(
          { branch_id },
          companyData
        );
      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          "Company Branch Data updated successfully"
        );
      }
      return Response.responseStatus(res, 400, `Failed to update Employee Data`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  deleteCompanyBranchesByCompanyBranchId: async (req, res) => {
    try {
      const branch_id = req.params.branch_id;
      const result =
        await CompanyBranchesModel.deleteCompanyBranchesByCondition({
          branch_id,
        });
      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          `Company Branch Data deleted successfully`
        );
      }
      return Response.responseStatus(res, 404, `Failed to delete Employee Data`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = CompanyBranchesController;
