const CompanyModel = require("../models/company");
const CompanyBranchesModel = require("../models/company_branches");
const qs = require("querystring");
const Response = require("../helpers/response");
const { validationResult } = require("express-validator");
const { APP_URL, LIMIT_DATA } = process.env;

const CompanyController = {
  createCompany: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const {
        companyName,
        companyWebSite,
        companyLogo,
        companyBranches = [],
        createdBy,
      } = req.body;

      const companyData = {
        company_name: companyName,
        company_website: companyWebSite,
        company_logo: companyLogo,
        created_by: createdBy,
        modified_by: createdBy,
      };
      const result = await CompanyModel.createCompany(companyData);
      if (result.insertId > 0) {
        const companyResult = await CompanyModel.getCompanyById(
          result.insertId
        );

        companyBranches.map(async (branches) => {
          const branchData = {
            branch_name: branches.companyBranchName,
            branch_address: branches.companyBranchAddress,
            google_map_link: branches.googleMapLink,
            company_id: companyResult[0].company_id,
            created_by: createdBy,
            modified_by: createdBy,
          };

          await CompanyBranchesModel.createCompanyBranches(branchData);
        });

        return Response.responseStatus(
          res,
          201,
          `Company created successfully`
        );
      }
      return Response.responseStatus(res, 400, `Failed to create company`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  listCompanies: async (req, res) => {
    try {
      const cond = { ...req.query };
      cond.field = cond.field || "id";
      cond.search = cond.search || "";
      cond.page = Number(cond.page) || 1;
      cond.limit = Number(cond.limit) || Number(LIMIT_DATA);
      cond.dataLimit = cond.limit;
      cond.offset = (cond.page - 1) * cond.limit;
      cond.sort = cond.sort || "id";
      cond.order = cond.order || "ASC";

      const pageInfo = {
        nextLink: null,
        prevLink: null,
        totalData: 0,
        totalPage: 0,
        currentPage: 0,
      };

      const countData = await CompanyModel.getCompaniesCountByCondition(cond);

      pageInfo.totalData = countData[0].totalData;
      pageInfo.totalPage = Math.ceil(pageInfo.totalData / cond.limit);
      pageInfo.currentPage = cond.page;
      const nextQuery = qs.stringify({
        ...req.query,
        page: cond.page + 1,
      });
      const prevQuery = qs.stringify({
        ...req.query,
        page: cond.page - 1,
      });
      pageInfo.nextLink =
        cond.page < pageInfo.totalPage
          ? APP_URL.concat(`/api/companies?${nextQuery}`)
          : null;
      pageInfo.prevLink =
        cond.page > 1 ? APP_URL.concat(`/api/companies?${prevQuery}`) : null;

      const results = await CompanyModel.listCompanies(cond);

      if (results.length > 0) {
        return Response.responseStatus(
          res,
          200,
          "List of all Companies",
          results,
          pageInfo
        );
      }
      return Response.responseStatus(res, 400, "No data found");
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  getAllCompanies: async (req, res) => {
    try {
      const rows = await CompanyModel.getAllCompanies();
      if(rows.length>0){
        let companies =[];

        // rows.map((row)=>{

        //   // const branches = await CompanyBranchesModel.getCompanyBranchesByCondition({company_id:row.company_id});

        //   companies = [
        //     ...companies,
        //     {
        //       ...row,
        //       // branches,
        //     }
        //   ];
        // });

        for(let i=0;i<rows.length;i++){
          const branches = await CompanyBranchesModel.getCompanyBranchesByCondition({company_id: rows[i].company_id});

          companies = [
            ...companies,
            {
              ...rows[i],
              branches,
            }
          ]
        }

        return Response.responseStatus(res, 200, "List of companies with branches",companies);
      }
      return Response.responseStatus(res, 400, "No data found");
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  // getCompanyById: async (req, res) => {
  //   const id = req.params.id;
  //   try {
  //     const companyData = await CompanyModel.getCompanyByCondition({ id });
  //     if (companyData.length > 0) {
  //       return Response.responseStatus(
  //         res,
  //         200,
  //         `Details of Company(${id})`,
  //         companyData
  //       );
  //     }
  //     return Response.responseStatus(res, 400, `No data found for ${id}`);
  //   } catch (error) {
  //     return Response.responseStatus(res, 500, "Internal server error", {
  //       error: error.message,
  //     });
  //   }
  // },

  getCompanyByCompanyId: async (req, res) => {
    const company_id = req.params.company_id;
    try {
      const result = await CompanyModel.getCompanyByCondition({
        company_id,
      });
      if (result.length > 0) {
        const branches =
          await CompanyBranchesModel.getCompanyBranchesByCondition({
            company_id,
          });
          
        const companyData = [
          {
            ...result[0],
            company_logo:result[0].company_logo?Buffer.from(result[0].company_logo, 'binary').toString():null,
            company_branches: branches,
          },
        ];
        return Response.responseStatus(
          res,
          200,
          `Details of Company(${company_id})`,
          companyData
        );
      }
      return Response.responseStatus(
        res,
        400,
        `No data found for ${company_id}`
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  // updateCompanyById: async (req, res) => {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return Response.responseStatus(res, 400, "Validation Failed", errors);
  //     }
  //     const id = req.params.id;
  //     const { companyName, companyWebSite, companyLogo, modifiedBy } = req.body;
  //     const companyData = {
  //       company_name: companyName,
  //       company_website: companyWebSite,
  //       company_logo: companyLogo,
  //       modified_by: modifiedBy,
  //     };
  //     const result = await CompanyModel.updateCompanyByCondition(
  //       { id },
  //       companyData
  //     );
  //     if (result.affectedRows > 0) {
  //       return Response.responseStatus(
  //         res,
  //         200,
  //         "Company Data updated successfully"
  //       );
  //     }
  //     return Response.responseStatus(
  //       res,
  //       400,
  //       `Failed to update Employee Data`
  //     );
  //   } catch (error) {
  //     return Response.responseStatus(res, 500, "Internal server error", {
  //       error: error.message,
  //     });
  //   }
  // },

  updateCompanyByCompanyId: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const company_id = req.params.company_id;
      const {
        companyName,
        companyWebSite,
        companyLogo,
        companyBranches = [],
        modifiedBy,
      } = req.body;

      const companyData = {
        company_name: companyName,
        company_website: companyWebSite,
        company_logo: companyLogo,
        modified_by: modifiedBy,
      };

      const result = await CompanyModel.updateCompanyByCondition(
        { company_id },
        companyData
      );

      if (result.affectedRows > 0) {
        const prevBranches =
          await CompanyBranchesModel.getCompanyBranchesByCondition({
            company_id,
          });

        if (companyBranches.length > prevBranches.length) {
          companyBranches.map(async (branch) => {
            if (branch.branchId) {
              const branchData = {
                company_id,
                branch_name: branch.companyBranchName,
                branch_address: branch.companyBranchAddress,
                google_map_link: branch.googleMapLink,
                modified_by: modifiedBy,
              };
              await CompanyBranchesModel.updateCompanyBranchesByCondition(
                { branch_id: branch.branchId },
                branchData
              );
            } else {
              const branchData = {
                company_id,
                branch_name: branch.companyBranchName,
                branch_address: branch.companyBranchAddress,
                google_map_link: branch.googleMapLink,
                created_by: modifiedBy,
                modified_by: modifiedBy,
              };
              await CompanyBranchesModel.createCompanyBranches(branchData);
            }
          });
        } else if (companyBranches.length < prevBranches.length) {
          prevBranches.map(async (branch) => {
            if (
              companyBranches.find((_cb) => _cb.branchId === branch.branch_id)
            ) {
              const branchData = {
                company_id,
                branch_name: branch.branch_name,
                branch_address: branch.branch_address,
                google_map_link: branch.google_map_link,
                modified_by: modifiedBy,
              };
              await CompanyBranchesModel.updateCompanyBranchesByCondition(
                { branch_id: branch.branch_id },
                branchData
              );
            } else {
              await CompanyBranchesModel.deleteCompanyBranchesByCondition({
                branch_id: branch.branch_id,
              });
            }
          });
        } else {
          companyBranches.map(async (branch) => {
            const branchData = {
              company_id,
              branch_name: branch.companyBranchName,
              branch_address: branch.companyBranchAddress,
              google_map_link: branch.googleMapLink,
              modified_by: modifiedBy,
            };
            await CompanyBranchesModel.updateCompanyBranchesByCondition(
              { branch_id: branch.branchId },
              branchData
            );
          });
        }
        return Response.responseStatus(
          res,
          200,
          "Company updated successfully"
        );
      }
      return Response.responseStatus(res, 400, `Failed to update Company`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  // deleteCompanyById: async (req, res) => {
  //   try {
  //     const id = req.params.id;
  //     const result = await CompanyModel.deleteCompanyByCondition({ id });
  //     if (result.affectedRows > 0) {
  //       return Response.responseStatus(
  //         res,
  //         200,
  //         `Company Data deleted successfully`
  //       );
  //     }
  //     return Response.responseStatus(
  //       res,
  //       404,
  //       `Failed to delete Employee Data`
  //     );
  //   } catch (error) {
  //     return Response.responseStatus(res, 500, "Internal server error", {
  //       error: error.message,
  //     });
  //   }
  // },

  deleteCompanyByCompanyId: async (req, res) => {
    try {
      const company_id = req.params.company_id;
      const result =
        await CompanyBranchesModel.deleteCompanyBranchesByCondition({
          company_id,
        });
      if (result.affectedRows > 0) {
        const result_2 = await CompanyModel.deleteCompanyByCondition({
          company_id,
        });

        if (result_2.affectedRows > 0) {
          return Response.responseStatus(
            res,
            200,
            `Company deleted successfully`
          );
        }
      }
      return Response.responseStatus(res, 404, `Failed to delete Company`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = CompanyController;

// updateCompanyByCompanyId: async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return Response.responseStatus(res, 400, "Validation Failed", errors);
//     }
//     const company_id = req.params.company_id;
//     const { companyName, companyWebSite, companyLogo, companyBranches=[], modifiedBy } = req.body;

//     const companyData = {
//       company_name: companyName,
//       company_website: companyWebSite,
//       company_logo: companyLogo,
//       modified_by: modifiedBy,
//     };

//     const result = await CompanyModel.updateCompanyByCondition(
//       { company_id },
//       companyData
//     );

//     if (result.affectedRows > 0) {

//         const deleteResult = await CompanyBranchesModel.deleteCompanyBranchesByCondition({company_id});
//         if(deleteResult.affectedRows>0){

//           companyBranches.map(async (branches)=>{
//             const branchData={
//              branch_name: branches.companyBranchName,
//              branch_address: branches.companyBranchAddress,
//              google_map_link: branches.googleMapLink,
//              company_id: company_id,
//              created_by: modifiedBy,
//              modified_by: modifiedBy
//             };

//             await CompanyBranchesModel.createCompanyBranches(branchData);

//            });
//         }

//       return Response.responseStatus(
//         res,
//         200,
//         "Company updated successfully"
//       );
//     }
//     return Response.responseStatus(res, 400, `Failed to update Company`);
//   } catch (error) {
//     return Response.responseStatus(res, 500, "Internal server error", {
//       error: error.message,
//     });
//   }
// },
