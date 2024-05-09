const Response = require("../helpers/response");
const PDFDocument = require("pdfkit");
const qs = require("querystring");
const fs=require("fs");
const QRCode = require("qrcode");
const PrintRequestModel = require("../models/print_request");
const PrintEmployeeModel = require("../models/print_employee");
const EmployeeModel = require("../models/employee");
const { validationResult } = require("express-validator");
const sendMail = require("../helpers/sendMail");
const UserModel = require("../models/users");
const Role = require("../utils/userTypes");
const { APP_URL, FRONT_END_URL, LIMIT_DATA } = process.env;

const PrintRequestController = {
  createPrintRequest: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const { status = "pending", printEmployees = [] } = req.body;

      const printRequestData = {
        status,
        created_by: req.userData.user_id,
        modified_by: req.userData.user_id,
      };

      const result = await PrintRequestModel.createRequest(printRequestData);

      if (result.insertId > 0) {
        const requestResult = await PrintRequestModel.getRequestsByCondition({
          id: result.insertId,
        });

        printEmployees.map(async (id, index) => {
          const printEmployeeData = {
            employee_id: printEmployees[index],
            request_id: requestResult[0].request_id,
          };
          await PrintEmployeeModel.createPrintEmployee(printEmployeeData);
        });

        const resultCU = await UserModel.getUsersByCondition({user_id:req.userData.user_id});
        const resultCHRO = await UserModel.getUsersByCondition({user_type:Role.Admin});

        let err=0;
        for(let i=0;i<resultCHRO.length;i++){
          const link = FRONT_END_URL; //  or call us at +91 95519 33890
          const mailSubject = "New Printing Card Request - Action Required";
          const mailContent = `<p>Hi ${resultCHRO[i].first_name} ${resultCHRO[i].last_name},</p>
      <p>We hope this message finds you well. We wanted to inform you that a new request has been created in Refex Contacts, and your attention is required.</p>
      <p><strong>Request Details:</strong></p>
      <ul>
          <li><strong>Request ID:</strong> ${requestResult[0].request_id}</li>
          <li><strong>Requested By:</strong> ${resultCU[0].first_name} ${resultCU[0].last_name} (${resultCU.email})</li>
      </ul>
      <p>Please log in to the Refex Contacts app to review and take necessary action. You can access the app by clicking <a href="${link}">here</a>.</p>
      <p>Once logged in, navigate to the 'Print Request' section and locate the request using the provided details. Verify the information and take the appropriate action, such as approving or rejecting the request.</p>
      <p>If you have any questions or need clarification regarding the request, feel free to contact our support team at helpdesk@refex.co.in </p>
      <div style="text-align: center;">
          <a href="${link}">
              <img src="${link}/assets/Refex-Logo.png" alt="Refex Contacts" style="max-width: 100px;"> 
          </a>
      </div>
      <p>Thank you for your prompt attention to this matter.</p>
      <p>Best regards,</p>
      <p>Refex Contacts Team</p>`;
  
      await sendMail(resultCHRO[i].email, mailSubject, mailContent, async (error, info)=>{
        if (error) {
          // await PrintRequestModel.deleteRequestById(result.insertId);
          err++;
        }
      });
        }

        if(err){
          return Response.responseStatus(res, 201,`Print request created. Facing error in mail sending with ${err} CHRO.`);
        }

        return Response.responseStatus(res, 201,`Print request send successfully`);
      }
      return Response.responseStatus(res, 400, `Failed to send print request`);
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  listPrintRequests: async (req, res) => {
    try {
      const cond = { ...req.query };

      cond.field = cond.field || "pr.id";
      cond.search = cond.search || "";
      cond.page = Number(cond.page) || 1;
      cond.limit = Number(cond.limit) || Number(LIMIT_DATA);
      cond.dataLimit = cond.limit;
      cond.offset = (cond.page - 1) * cond.limit;
      cond.sort = cond.sort || "pr.id";
      cond.order = cond.order || "ASC";

      const pageInfo = {
        nextLink: null,
        prevLink: null,
        all:0,
        pending:0,
        approved:0,
        rejected:0,
        totalData: 0,
        totalPage: 0,
        currentPage: 0,
      };

      const countData = await PrintRequestModel.getRequestsCountByCondition(
        cond
      );
      const allCount = await PrintRequestModel.getRequestsCountByCondition({
        field:'pr.id',
        search:'',
        sort:'pr.id',
        order:'asc'
      });
      const pendingCount = await PrintRequestModel.getRequestsCountByCondition({
        field:'pr.status',
        search:'pending',
        sort:'pr.id',
        order:'asc'
      });
      const rejectedCount = await PrintRequestModel.getRequestsCountByCondition({
        field:'pr.status',
        search:'rejected',
        sort:'pr.id',
        order:'asc'
      });
      const approvedCount = await PrintRequestModel.getRequestsCountByCondition({
        field:'pr.status',
        search:'approved',
        sort:'pr.id',
        order:'asc'
      });

      pageInfo.all = allCount[0].totalData;
      pageInfo.pending=pendingCount[0].totalData;
      pageInfo.rejected=rejectedCount[0].totalData;
      pageInfo.approved=approvedCount[0].totalData;
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
          ? APP_URL.concat(`/api/print_request?${nextQuery}`)
          : null;
      pageInfo.prevLink =
        cond.page > 1
          ? APP_URL.concat(`/api/print_request?${prevQuery}`)
          : null;

      const requestRows = await PrintRequestModel.listRequests(cond);

      if (requestRows.length > 0) {
        let printRequestData = [];
        let printEmployeeData = [];

        for(let i=0;i<requestRows.length;i++){
          const {
            id,
            request_id,
            status,
            created_by,
            cu_email,
            created_at,
            modified_by,
            mu_email,
            modified_at,
          } = requestRows[i];

          const employeesRows =
            await PrintEmployeeModel.getPrintEmployeeByCondition({
              request_id,
            });

          printEmployeeData = [];
        for(let j=0;j<employeesRows.length;j++){
          const {
            id,
            employee_id,
            employee_name,
            designation,
            mobile_number,
            email,
            landline,
            photo,
            is_active,
            company_id,
            company_name,
            branch_id,
            branch_name,
          } = employeesRows[j];

          printEmployeeData = [
            ...printEmployeeData,
            {
              id,
              employee_id,
              employee_name,
              designation,
              mobile_number,
              email,
              landline,
              photo: photo ? Buffer.from(photo, "binary").toString() : null,
              is_active,
              company: {
                company_id,
                company_name,
              },
              branch: {
                branch_id,
                branch_name,
              },
            },
          ];
        }

          printRequestData = [
            ...printRequestData,
            {
              id,
              request_id,
              status,
              print_employees: printEmployeeData,
              created: {
                created_by,
                email: cu_email,
                created_at,
              },
              modified: {
                modified_by,
                email: mu_email,
                modified_at,
              },
            },
          ];
        }

        return await Response.responseStatus(
          res,
          200,
          "List of all Print Requests ",
          printRequestData,
          pageInfo
        );
      }

      return Response.responseStatus(res, 400, "No data found",null,pageInfo);
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  updateStatusPrintRequests: async(req, res)=>{
    try {
      const request_id = req.params.request_id;
      const {status="pending"} = req.query;

      const update= {
        status,
      };
      
      const result = await PrintRequestModel.updateRequestByCondition({request_id},update);

      if(result.affectedRows>0){
        const resultPR = await PrintRequestModel.getRequestsByCondition({request_id});
        const resultMU = await UserModel.getUsersByCondition({user_id:req.userData.user_id});
        const resultCU = await UserModel.getUsersByCondition({user_id:resultPR[0].created_by});

        const mailSubject = "Request Status Update - Refex Contacts";
        const link = `${FRONT_END_URL}`;

const mailContent = `<p>Hi ${resultCU[0].first_name} ${resultCU[0].last_name},</p>
    <p>We are writing to inform you about an important update regarding a request in Refex Contacts.</p>
    <p><strong>Request Details:</strong></p>
    <ul>
        <li><strong>Request ID:</strong> ${request_id}</li>
        <li><strong>Status Updated To:</strong> ${status.charAt(0).toUpperCase()+status.slice(1)}</li>
        <li><strong>Updated By:</strong> ${resultMU[0].first_name} ${resultMU[0].last_name}(${resultMU[0].user_type})</li>
    </ul>
    <p>You can view the updated status by logging in to the Refex Contacts app. Click <a href="${link}">here</a> to access your account.</p>
    <p>Navigate to the 'Requests' section to find the specific request and review the latest status and comments provided by the CHRO. If you have any questions or concerns, please feel free to reach out to our support team at helpdesk@refex.co.in</p>
    <div style="text-align: center;">
        <a href="${link}">
            <img src="${link}/assets/Refex-Logo.png" alt="Refex Contacts" style="max-width: 100px;">
        </a>
    </div>
    <p>Thank you for your attention to this update.</p>
    <p>Best regards,</p>
    <p>Refex Contacts Team</p>`;

    await sendMail(resultCU[0].email, mailSubject, mailContent, async (error, info)=>{
      if (error) {
        return Response.responseStatus(
          res,
          200,
          `Status updated to ${status} for Print Request (${request_id}). Facing error in sending mail to ${resultCU[0].email}`
        );
      }
    });
        return Response.responseStatus(
          res,
          200,
          `Status updated to ${status} for Print Request (${request_id})`
        );
      }
      return Response.responseStatus(res, 404, `Failed to update status for Print Request - ${request_id}`);
    
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  generateVCardPDF: async (req, res) => {
    try {
      const employee_id = req.params.employee_id;

      const rows = await EmployeeModel.getEmployeeByCondition({
        "ep.employee_id": employee_id,
        "ep.is_active": 1,
      });
      if (rows.length > 0) {
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
        } = rows[0];
        const path = APP_URL || "http://loacalhost:3001";
        const qrCodeUrl = path.concat(`/vcard/${employee_id}`);
        const logo = (await company_logo)
          ? Buffer.from(company_logo, "binary").toString()
          : null;

        let adjust = 469;

        if (employee_name.length > 21) {
          adjust = adjust - 8;
        }
        if (designation.length > 35) {
          adjust = adjust - 4;
        }

        const doc = new PDFDocument({
          size: "A4", // Set A4 paper size
          margin: 0, // No margins
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${employee_name}_${employee_id}.pdf"`
        );
        doc.pipe(res);
        // Start of Front Side of the card -----------------------------------------------
        doc.rect(171.5, 260.5, 3.5 * 72.5, 2 * 73).stroke(); // Border dimensions in points
        doc.image(logo, 244.375, 297.5, {
          fit: [1.5 * 72, 1 * 72], // Constrain image size (adjust as needed)
          align: "center", // Center horizontally
          valign: "center", // Center vertically
        }); // .rect(244.375, 297.5, 1.5 * 72, 1* 72)
        // End of Front Side of the card -------------------------------------------

        // Start of Back Side of the card -----------------------------------------
        doc.rect(171.5, 426.5, 3.5 * 72.5, 2 * 73).stroke(); // Border dimensions in points
        // Define the gradient colors
        const gradientColors = ["#345C9B", "#70BB23", "#F1460C"];
        // Create a linear gradient fill
        const gradientFill = doc.linearGradient(
          191.5,
          adjust,
          191.5 + employee_name.length * 7,
          adjust
        );
        gradientFill.stop(0, gradientColors[0]);
        gradientFill.stop(0.4, gradientColors[1]);
        gradientFill.stop(1, gradientColors[2]);

        // Set the gradient fill for the text
        doc.fill(gradientFill);

        // Add your gradient-filled text
        doc
          .font("Times-Bold")
          .fontSize(12.5)
          .text(employee_name, 191.5, adjust, {
            width: 140,
          })
          .font("Times-Roman", 9)
          //   .moveDown()
          .fillColor("black")
          .text(designation, {
            width: 140,
          })
          .moveDown()
          .text(" ", {
            lineGap: -2,
          })
          .text(`+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`, {
            width: 140,
            lineGap: 3,
          })
          .text(email, {
            width: 140,
          });

        //   doc.font('Times-Roman');
        //   doc
        //     .fillColor("black")
        //     .fontSize(9)
        //     .text(designation, 191.5, 481);

        //   doc.fillColor("black").fontSize(9).text(`+91 ${mobile_number.slice(0,5)} ${mobile_number.slice(5)}`, 191.5, 511);

        //   doc.fillColor("black").fontSize(9).text(email, 191.5, 525);

        //   console.log( await generateQR('https://localhost:3000'));

        doc.image(
          await QRCode.toDataURL(qrCodeUrl, {
            errorCorrectionLevel: "H",
            margin: 0,
          }),
          341,
          469.5,
          {
            fit: [61, 61], // Constrain image size (adjust as needed)
            align: "center", // Center horizontally
            valign: "center", // Center vertically
          }
        );
        // End of Back Side of the card --------------------------------------------

        doc.end();
        //   return Response.responseStatus(res, 200, "Employee Data", rows[0]);
      } else {
        return Response.responseStatus(res, 400, "No data found");
      }
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = PrintRequestController;
