const EmployeeModel = require("../models/employee");
const CompanyModel = require("../models/company");
const BranchModel = require("../models/company_branches");
const qs = require("querystring");
const fs = require("fs");
const vCardsJS = require("vcards-js");
const xlsx = require("xlsx");
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
        modified_by: createdBy,
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

  importEmployees: async (req, res) => {
    try {
      if (!req.file) {
        return Response.responseStatus(res, 400, "File is required");
      }
      const created_by = req.userData.user_id;
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
      const worksheet = workbook.Sheets[sheetName];

      const employeesData = xlsx.utils.sheet_to_json(worksheet);
      // console.log(employeesData);
      const successData = [];
      const failureData = [];
      for (let i = 0; i < employeesData.length; i++) {
        try {
          const employee_id = employeesData[i]["Employee Id"];
          const employee_name = employeesData[i]["Employee Name"];
          const designation = employeesData[i]["Designation"];
          const mobile_number = employeesData[i]["Mobile Number"];
          const landline = employeesData[i]["Landline"] || null;
          const email = employeesData[i]["Email"];
          const photo = null;
          const is_active = employeesData[i]["Active"].toLowerCase() === "yes";
          const company_name = employeesData[i]["Company Name"];
          const branch_name = employeesData[i]["Branch Name"];

          const empIdResult = await EmployeeModel.getEmployeeByCondition({
            employee_id,
          });
          const companyResult = await CompanyModel.getCompanyByCondition({
            company_name,
          });
          const branchResult = await BranchModel.getCompanyBranchesByCondition({
            branch_name,
          });

          // console.log(empIdResult);
          // console.log(companyResult);
          // console.log(branchResult);


          if (
            !empIdResult.length > 0 &&
            companyResult.length > 0 &&
            branchResult.length > 0
          ) {
            const result = await EmployeeModel.createEmployee({
              employee_id,
              employee_name,
              designation,
              mobile_number,
              landline,
              email,
              photo,
              is_active,
              company_id: companyResult[0].company_id,
              branch_id: branchResult[0].branch_id,
              created_by,
              modified_by: created_by,
            });
            if (result.affectedRows > 0) {
              successData.push(employeesData[i]);
            } else {
              failureData.push(employeesData[i]);
            }
          } else {
            failureData.push(employeesData[i]);
          }
        } catch (error) {
          console.log(error);
          failureData.push(employeesData[i]);
        }
      }
      if (successData.length > 0) {
        return Response.responseStatus(res, 200, "Data imported successfully", {
          successData,
          failureData,
        });
      } else {
        return Response.responseStatus(res, 400, "Data import unsuccessful", {
          successData,
          failureData,
        });
      }
    } catch (error) {
      console.log("Error :", error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  exportEmployee: async(req,res)=>{
    try {

      const employeeData = await EmployeeModel.getAllEmployeeWithMapedData();

      let employees=[];

      for(let i=0;i<employeeData.length;i++){
        const {
          employee_id,
          employee_name,
          designation,
          mobile_number,
          landline,
          email,
          is_active,
          company_name,
          branch_name,
        }=employeeData[i];

        employees =[
          ...employees,
          {
            'Employee Id':employee_id,
            'Employee Name':employee_name,
            Designation:designation,
            'Mobile Number':mobile_number,
            Landline:landline,
            Email:email,
            Active:is_active?"Yes":"No",
            'Company Name':company_name,
            'Branch Name':branch_name
          }
        ]
      }

      const filename = 'EmployeeData.xlsx';
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(employees);
      xlsx.utils.book_append_sheet(wb, ws, 'Employees');
      const wbBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
  
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(wbBuffer);
    } catch (error) {
      console.error('Error exporting employee data:', error);
      return Response.responseStatus(res, 500, "Internal server error");
    }
  },

  listEmployees: async (req, res) => {
    try {
      const cond = { ...req.query };
      // console.log(cond);
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
              id: ep_id,
              employee_id,
              employee_name,
              designation,
              mobile_number,
              landline,
              email,
              photo: photo ? Buffer.from(photo, "binary").toString() : null,
              is_active,
              company: {
                company_id: company_id,
                company_name,
                company_website,
                company_logo: company_logo
                  ? Buffer.from(company_logo, "binary").toString()
                  : null,
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

  getAllInActiveEmployeesWithMappedData: async (req, res) => {
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
              id: ep_id,
              employee_id,
              employee_name,
              designation,
              mobile_number,
              landline,
              email,
              photo: photo ? Buffer.from(photo, "binary").toString() : null,
              is_active,
              company: {
                company_id: company_id,
                company_name,
                company_website,
                company_logo: company_logo
                  ? Buffer.from(company_logo, "binary").toString()
                  : null,
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
            photo: photo ? Buffer.from(photo, "binary").toString() : null,
            is_active,
            company: {
              company_id: company_id,
              company_name,
              company_website,
              company_logo: company_logo
                ? Buffer.from(company_logo, "binary").toString()
                : null,
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
        mobile_number: mobileNumber,
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
      return Response.responseStatus(
        res,
        400,
        `Failed to update Employee Data`
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  updateActiveEmployeeByEmployeeId: async (req, res) => {
    try {
      const employee_id = req.params.employee_id;
      const active = req.query.active;

      const update = {
        is_active: +active,
      };

      const result = await EmployeeModel.updateEmployeeByCondition(
        { employee_id },
        update
      );

      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          `Employee ${
            Boolean(update.is_active) ? "activated" : "deactived"
          } successfully`
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
      return Response.responseStatus(
        res,
        404,
        `Failed to delete Employee Data`
      );
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
      return Response.responseStatus(
        res,
        404,
        `Failed to delete Employee Data`
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  getVCardByEmployeeId: async (req, res) => {
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

        // const employeeData = [
        //   {
        //     id,
        //     employee_id,
        //     employee_name,
        //     designation,
        //     mobile_number,
        //     landline,
        //     email,
        //     photo:photo?Buffer.from(photo, 'binary').toString():null,
        //     is_active,
        //     company: {
        //       company_id: company_id,
        //       company_name,
        //       company_website,
        //       company_logo:company_logo?Buffer.from(company_logo, 'binary').toString():null,
        //     },
        //     branch: {
        //       branch_id: branch_id,
        //       branch_name,
        //       branch_address,
        //       google_map_link,
        //     },
        //   },
        // ];
        // Create a new vCard
        const vCard = vCardsJS();
        vCard.firstName = employee_name;
        vCard.email = email;
        vCard.cellPhone = mobile_number;

        // vCard.saveToFile(`${employee_name}_${Date.now()}.vcf`);

        // Convert vCard to a string
        const vCardString = vCard.getFormattedString();

        // Create a unique filename for the downloaded vCard
        const fileName = `${employee_name}.vcf`;

        // Write the vCard string to a file
        fs.writeFileSync(fileName, vCardString);

        // Set response headers for downloading the file
        res.setHeader("Content-Type", "text/vcard");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}`
        );

        // Stream the file to the response
        const fileStream = fs.createReadStream(fileName);
        fileStream.pipe(res);

        // Remove the file after streaming
        fileStream.on("end", () => {
          fs.unlinkSync(fileName);
        });
      } else {
        return Response.responseStatus(
          res,
          400,
          `No data found for ${employee_id}`
        );
      }
    } catch (error) {
      console.log(error.message);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = EmployeeController;
