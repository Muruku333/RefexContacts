const EmployeeModel = require("../models/employee");
const qs=require("querystring");
const Response = require("../helpers/response");
const { validationResult } = require("express-validator");
const { APP_URL, LIMIT_DATA } = process.env;

const EmployeeController = {
  createEmployee: async (req, res) => {
    try {
      // console.log(req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const {
        employeeId,
        employeeName,
        designation,
        mobileNumber,
        landline,
        email,
        photo,
        companyId,
        branchId,
        createdBy,
      } = req.body;

      const employee_data = {
        employee_id: employeeId,
        employee_name: employeeName,
        designation,
        mobile_number: mobileNumber,
        landline,
        email,
        photo,
        company_id: companyId,
        branch_id: branchId,
        created_by: createdBy,
        modified_by: createdBy
      };
      const result = await EmployeeModel.createEmployee(employee_data);
      if (result.insertId > 0) {
        return Response.responseStatus(
          res,
          201,
          `Employee created successfully`
        );
      }
      return Response.responseStatus(res, 400, `Failed to create employee`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  listEmployees: async (req, res) => {
    try {
      const cond = { ...req.query };
      cond.field = cond.field || "ep.id";
      cond.search = cond.search || "";
      cond.page = Number(cond.page) || 1;
      cond.limit = Number(cond.limit) || Number(LIMIT_DATA);
      cond.dataLimit = cond.limit;
      cond.offset = (cond.page - 1) * cond.limit;
      cond.sort = cond.sort || "ep.id";
      cond.order = cond.order || "ASC";
    
      const pageInfo = {
        nextLink: null,
        prevLink: null,
        totalData: 0,
        totalPage: 0,
        currentPage: 0,
      };

      const countData = await EmployeeModel.getEmployeesCountByCondition(cond);

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
          ? APP_URL.concat(`/api/employees?${nextQuery}`)
          : null;
      pageInfo.prevLink =
        cond.page > 1 ? APP_URL.concat(`/api/employees?${prevQuery}`) : null;

      const rows = await EmployeeModel.getEmployeesByCondition(cond);

      if (rows.length > 0) {
        let employeeData = [];
        rows.map((row) => {
          const {
            ep_id,
            employee_id,
            employee_name,
            designation,
            mobile_number,
            landline,
            email,
            photo,
            is_active,
            company_id,
            branch_id,
            company_name,
            company_website,
            company_logo,
            branch_name,
            branch_address,
            google_map_link,
          } = row;

          employeeData = [
            ...employeeData,
            {
              id:ep_id,
              employee_id,
              employee_name,
              designation,
              mobile_number,
              landline,
              email,
              photo:photo?Buffer.from(photo, 'binary').toString():null,
              is_active,
              company: {
                company_id: company_id,
                company_name,
                company_website,
                company_logo,
              },
              branch: {
                branch_id: branch_id,
                branch_name,
                branch_address,
                google_map_link,
              },
            },
          ];
        });
        return Response.responseStatus(
          res,
          200,
          "List of all Employees ",
          employeeData,
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

  getAllInActiveEmployeesWithMappedData: async(req,res)=>{
    try {
        const rows = await EmployeeModel.getAllInActiveEmployeesWithMappedData();
        if (rows.length > 0) {
          let employeeData = [];
          rows.map((row) => {
            const {
              ep_id,
              employee_id,
              employee_name,
              designation,
              mobile_number,
              landline,
              email,
              photo,
              is_active,
              company_id,
              branch_id,
              company_name,
              company_website,
              company_logo,
              branch_name,
              branch_address,
              google_map_link,
            } = row;
  
            employeeData = [
              ...employeeData,
              {
                id:ep_id,
                employee_id,
                employee_name,
                designation,
                mobile_number,
                landline,
                email,
                photo:photo?Buffer.from(photo, 'binary').toString():null,
                is_active,
                company: {
                  company_id: company_id,
                  company_name,
                  company_website,
                  company_logo,
                },
                branch: {
                  branch_id: branch_id,
                  branch_name,
                  branch_address,
                  google_map_link,
                },
              },
            ];
          });
          return Response.responseStatus(
            res,
            200,
            "List of all Inactive Employees ",
            employeeData
          );
        }
        return Response.responseStatus(res, 400, "No data found");
      } catch (error) {
        return Response.responseStatus(res, 500, "Internal server error", {
          error: error.message,
        });
      }
  },

  getEmployeeByEmployeeIdWithMappedData: async (req, res) => {
    try {
      const employee_id = req.params.employee_id;

      const rows = await EmployeeModel.getEmployeeByEmployeeIdWithMappedData(
        employee_id
      );

      if (rows.length > 0) {
        const {
          id,
          employee_id,
          employee_name,
          designation,
          mobile_number,
          landline,
          email,
          photo,
          is_active,
          company_id,
          branch_id,
          company_name,
          company_website,
          company_logo,
          branch_name,
          branch_address,
          google_map_link,
        } = rows[0]; // Note the change here, using rows[0] to get the first row

        const employeeData = [
          {
            id,
            employee_id,
            employee_name,
            designation,
            mobile_number,
            landline,
            email,
            photo:photo?Buffer.from(photo, 'binary').toString():null,
            is_active,
            company: {
              company_id: company_id,
              company_name,
              company_website,
              company_logo,
            },
            branch: {
              branch_id: branch_id,
              branch_name,
              branch_address,
              google_map_link,
            },
          },
        ];

        return Response.responseStatus(
          res,
          200,
          `Details of Employee (${employee_id})`,
          employeeData
        );
      }

      return Response.responseStatus(
        res,
        400,
        `No data found for ${employee_id}`
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  // updateEmployeeById: async (req, res) => {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return Response.responseStatus(res, 400, "Validation Failed", errors);
  //     }
  //     const id = req.params.id;
  //     const {
  //       employeeId,
  //       employeeName,
  //       employeeDesignation,
  //       employeeMobileNumber,
  //       employeeLandline,
  //       employeeEmail,
  //       employeePhoto,
  //       employeeCompanyId,
  //       employeeBranchId,
  //       is_active,
  //       modifiedBy,
  //     } = req.body;
  //     const employeeData = {
  //       employee_id: employeeId,
  //       employee_name: employeeName,
  //       designation: employeeDesignation,
  //       mobile_number: employeeMobileNumber,
  //       landline: employeeLandline,
  //       email: employeeEmail,
  //       photo: employeePhoto,
  //       is_active: is_active,
  //       company_id: employeeCompanyId,
  //       branch_id: employeeBranchId,
  //       modified_by: modifiedBy,
  //     };
  //     const result = await EmployeeModel.updateEmployeeByCondition(
  //       { id },
  //       employeeData
  //     );
  //     if (result.affectedRows > 0) {
  //       return Response.responseStatus(
  //         res,
  //         200,
  //         "Employee Data updated successfully"
  //       );
  //     }
  //     return Response.responseStatus(res, 400, `Failed to update Employee Data`);
  //   } catch (error) {
  //     return Response.responseStatus(res, 500, "Internal server error", {
  //       error: error.message,
  //     });
  //   }
  // },

  updateEmployeeByEmployeeId: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const employee_id = req.params.employee_id;
      const {
        employeeId,
        employeeName,
        designation,
        mobileNumber,
        landline,
        email,
        photo,
        companyId,
        branchId,
        modifiedBy,
      } = req.body;
      const employeeData = {
        employee_id: employeeId,
        employee_name: employeeName,
        designation,
        mobile_number:mobileNumber,
        landline,
        email,
        photo,
        company_id: companyId,
        branch_id: branchId,
        modified_by: modifiedBy,
      };
      const result = await EmployeeModel.updateEmployeeByCondition(
        { employee_id },
        employeeData
      );
      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          "Employee Data updated successfully"
        );
      }
      return Response.responseStatus(res, 400, `Failed to update Employee Data`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  updateActiveEmployeeByEmployeeId: async(req,res)=>{
    try {
        const employee_id = req.params.employee_id;
        const active = req.query.active;
        
        const update ={
            is_active:+active,
        }

        const result = await EmployeeModel.updateEmployeeByCondition({employee_id },update);
        
        if (result.affectedRows > 0) {
          return Response.responseStatus(
            res,
            200,
            `Employee ${Boolean(update.is_active)?'activated':'deactived'} successfully`
          );
        }
        return Response.responseStatus(res, 404, `Failed to update employee`);
      } catch (error) {
        return Response.responseStatus(res, 500, "Internal server error", {
          error: error.message,
        });
      }
  },

  deleteEmployeeById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await EmployeeModel.deleteEmployeeByCondition({ id });
      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          `Employee Data deleted successfully`
        );
      }
      return Response.responseStatus(res, 404, `Failed to delete Employee Data`);
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  deleteEmployeeByEmployeeId: async (req, res) => {
    try {
      const employee_id = req.params.employee_id;
      const result = await EmployeeModel.deleteEmployeeByCondition({
        employee_id,
      });
      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          `Employee Data deleted successfully`
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

module.exports = EmployeeController;
