const Response = require("../helpers/response");
const PDFDocument = require("pdfkit");
const qs = require("querystring");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const PrintRequestModel = require("../models/print_request");
const PrintEmployeeModel = require("../models/print_employee");
const EmployeeModel = require("../models/employee");
const { validationResult } = require("express-validator");
const sendMail = require("../helpers/sendMail");
const UserModel = require("../models/users");
const Role = require("../utils/userTypes");
const { mobileIconBase64, emailIconBase64 } = require("../utils/icons");
const { APP_URL, FRONT_END_URL, LIMIT_DATA, PRINT_ADMIN_MAIL } = process.env;

const PrintRequestController = {
  createPrintRequest: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const { status = "pending", printEmployees = [] } = req.body;
      // console.log(req.uploadedFile);
      const printRequestData = {
        status,
        support_document: req.uploadedFile.filename,
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
            status,
          };
          await PrintEmployeeModel.createPrintEmployee(printEmployeeData);
        });

        const resultCU = await UserModel.getUsersByCondition({
          user_id: req.userData.user_id,
        });
        const resultCHRO = await UserModel.getUsersByCondition({
          user_type: Role.Admin,
        });

        let err = 0;
        /* for (let i = 0; i < resultCHRO.length; i++) {
          const link = FRONT_END_URL; //  or call us at +91 95519 33890
          const mailSubject = "New Printing Card Request - Action Required";
          const mailContent = `<p>Hi ${resultCHRO[i].first_name} ${resultCHRO[i].last_name},</p>
      <p>We hope this message finds you well. We wanted to inform you that a new request has been created in Refex Contacts, and your attention is required.</p>
      <p><strong>Request Details:</strong></p>
      <ul>
          <li><strong>Request ID:</strong> ${requestResult[0].request_id}</li>
          <li><strong>Requested By:</strong> ${resultCU[0].first_name} ${resultCU[0].last_name} (${resultCU[0].user_type} - ${resultCU[0].email})</li>
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

          await sendMail(
            resultCHRO[i].email,
            mailSubject,
            mailContent,
            null,
            async (error, info) => {
              if (error) {
                // await PrintRequestModel.deleteRequestById(result.insertId);
                err++;
              }
            }
          );
        }*/

        if (err) {
          return Response.responseStatus(
            res,
            201,
            `Print request created. Facing error in mail sending with ${err} CHRO.`
          );
        }

        return Response.responseStatus(
          res,
          201,
          `Print request send successfully`
        );
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
        all: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalData: 0,
        totalPage: 0,
        currentPage: 0,
      };

      const countData = await PrintRequestModel.getRequestsCountByCondition(
        cond
      );
      const allCount = await PrintRequestModel.getRequestsCountByCondition({
        field: "pr.id",
        search: "",
        sort: "pr.id",
        order: "asc",
      });
      const pendingCount = await PrintRequestModel.getRequestsCountByCondition({
        field: "pr.status",
        search: "pending",
        sort: "pr.id",
        order: "asc",
      });
      const rejectedCount = await PrintRequestModel.getRequestsCountByCondition(
        {
          field: "pr.status",
          search: "rejected",
          sort: "pr.id",
          order: "asc",
        }
      );
      const approvedCount = await PrintRequestModel.getRequestsCountByCondition(
        {
          field: "pr.status",
          search: "approved",
          sort: "pr.id",
          order: "asc",
        }
      );

      pageInfo.all = allCount[0].totalData;
      pageInfo.pending = pendingCount[0].totalData;
      pageInfo.rejected = rejectedCount[0].totalData;
      pageInfo.approved = approvedCount[0].totalData;
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

        for (let i = 0; i < requestRows.length; i++) {
          const {
            id,
            request_id,
            status,
            support_document,
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
          for (let j = 0; j < employeesRows.length; j++) {
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
              status,
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
                status,
              },
            ];
          }

          printRequestData = [
            ...printRequestData,
            {
              id,
              request_id,
              status,
              support_document,
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

      return Response.responseStatus(res, 400, "No data found", null, pageInfo);
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  updateStatusPrintRequests: async (req, res) => {
    try {
      const { user_id } = req.userData;
      const request_id = req.params.request_id;
      const { status = "pending" } = req.query;
      const link = `${FRONT_END_URL}`;
      const attachments = [];

      const update = {
        status,
        modified_by: user_id,
      };

      const result = await PrintRequestModel.updateRequestByCondition(
        { request_id },
        update
      );

      if (result.affectedRows > 0) {
        await PrintEmployeeModel.updatePrintEmployeeByCondition(
          { request_id },
          { status }
        );

        const resultPR = await PrintRequestModel.getRequestsByCondition({
          request_id,
        });
        const resultMU = await UserModel.getUsersByCondition({
          user_id: req.userData.user_id,
        });
        const resultCU = await UserModel.getUsersByCondition({
          user_id: resultPR[0].created_by,
        });

        if (status === "approved") {
          const rows = await PrintEmployeeModel.getPrintEmployeeByCondition({
            "pe.request_id": request_id,
          });

          for (let i = 0; i < rows.length; i++) {
            const { employee_id } = rows[i];

            const ep_rows = await EmployeeModel.getEmployeeByCondition({
              "ep.employee_id": employee_id,
              // "ep.is_active": 1,
            });

            if (ep_rows.length > 0) {
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
              } = ep_rows[0];
              const URL = APP_URL || "http://loacalhost:3001";
              const qrCodeUrl = URL.concat(`/vcard/${employee_id}`);
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

              doc.registerFont(
                "Montserrat-SemiBold",
                path.join(
                  __dirname,
                  "../fonts/Montserrat/static/Montserrat-SemiBold.ttf"
                )
              );
              doc.registerFont(
                "Montserrat-Medium",
                path.join(
                  __dirname,
                  "../fonts/Montserrat/static/Montserrat-Medium.ttf"
                )
              );

              // Define the path to save the PDF
              const uploadsDir = path.join(
                __dirname,
                "../../uploads/approved_vcards"
              );
              const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
              const fileName = `${employee_name}_${uniqueSuffix}.pdf`;
              const filePath = path.join(uploadsDir, fileName);
              attachments.push({
                filename: fileName,
                path: filePath,
              });
              // Ensure the uploads directory exists
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir);
              }
              // Create a write stream to the file
              const writeStream = fs.createWriteStream(filePath);

              // Handle errors during PDF creation
              doc.on("error", (err) => {
                console.error("PDF generation error:", err);
                if (!res.headersSent) {
                  return Response.responseStatus(
                    res,
                    500,
                    "PDF generation failed",
                    {
                      error: err.message,
                    }
                  );
                }
              });

              // Pipe the PDF document to the write stream
              doc.pipe(writeStream);
              // Centered rectangle dimensions
              const rectWidth = 3.5 * 72.5; // 253.75 points
              const rectHeight = 2 * 73; // 146 points

              // A4 page dimensions in points
              const pageWidth = 595.28;
              const pageHeight = 841.89;

              // Calculating top-left corner to center the rectangle
              const rectX = (pageWidth - rectWidth) / 2; // 170.765 points
              const rectY = (pageHeight - rectHeight) / 2; // 347.945 points

              // Draw the rectangle centered on the page
              doc.rect(rectX, rectY, rectWidth, rectHeight).stroke();

              // Centered image dimensions
              const imageWidth = 1.5 * 72; // 108 points
              const imageHeight = 1 * 72; // 72 points

              // Calculating top-left corner to center the image inside the rectangle
              const imageX = rectX + (rectWidth - imageWidth) / 2; // 243.64 points
              const imageY = rectY + (rectHeight - imageHeight) / 2; // 384.945 points

              // Draw the image centered inside the rectangle
              doc.image(logo, imageX, imageY - 3, {
                fit: [imageWidth, imageHeight], // Constrain image size
                align: "center", // Center horizontally
                valign: "center", // Center vertically
              });
              // End of Front Side of the card -------------------------------------------

              doc.addPage();
              // Start of Back Side of the card -----------------------------------------
              // Draw the rectangle centered on the page
              doc.rect(rectX, rectY, rectWidth, rectHeight).stroke();

              // Define padding
              const padding = 15;

              // Measure the height of the text block for the first part (name and designation)
              doc.fontSize(12).font("Montserrat-SemiBold");
              const nameHeight = doc.heightOfString(employee_name, {
                width: rectWidth / 1.5 - padding,
              });
              doc.fontSize(8).font("Montserrat-Medium");
              const designationHeight = doc.heightOfString(designation, {
                width: rectWidth / 1.5 - padding,
              });
              const firstPartHeight =
                nameHeight + designationHeight + doc.currentLineHeight() / 2; // Including line gap

              // Measure the height of the text block for the second part (mobile number and email)
              doc.fontSize(8).font("Montserrat-Medium");
              const mobileHeight = doc.heightOfString(
                `+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`,
                { width: rectWidth / 1.5 - padding }
              );
              const emailHeight = doc.heightOfString(email, {
                width: rectWidth / 1.5 - padding,
              });
              const secondPartHeight =
                mobileHeight + emailHeight + doc.currentLineHeight() / 2; // Including line gap

              // Total height of the text blocks including gap
              const gap = 10; // Gap between the two parts
              const totalTextHeight = firstPartHeight + secondPartHeight + gap;

              // Position the text inside the rectangle with padding and center vertically
              const textWidth = rectWidth / 1.5 - padding; // Allocate half the rectangle width minus padding
              const textX = rectX + padding;
              const textY = rectY + (rectHeight - totalTextHeight) / 2 + 2; // Center vertically

              // Define the gradient colors
              const gradientColors = ["#345C9B", "#70BB23", "#F1460C"];
              // Create a linear gradient fill
              const gradientFill = doc.linearGradient(
                textX,
                textY,
                textX + employee_name.length * 7,
                textY
              );
              gradientFill.stop(0, gradientColors[0]);
              gradientFill.stop(0.4, gradientColors[1]);
              gradientFill.stop(1, gradientColors[2]);

              // Set the gradient fill for the text
              doc.fill(gradientFill);

              // Add your gradient-filled text
              doc
                .font("Montserrat-SemiBold")
                .fontSize(12)
                .text(employee_name, textX, textY - 4, {
                  width: textWidth,
                  align: "left",
                })
                .font("Montserrat-Medium", 8)
                .fillColor("black")
                .text(designation, {
                  width: textWidth,
                  align: "left",
                });

              // Add the gap between the two parts
              const secondPartY = textY + firstPartHeight + gap;

              // Size for icons (assuming line height of 9 points font size)
              const iconSize = 9; // Adjust this if needed
              const iconMargin = 5; // Margin between icon and text

              // Add the second part of the text (mobile number and email) with icons
              doc.image(mobileIconBase64, textX, secondPartY + 0.4, {
                width: iconSize,
                height: iconSize,
              });
              doc
                .font("Montserrat-Medium", 8)
                .text(
                  `+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`,
                  textX + iconSize + iconMargin,
                  secondPartY,
                  {
                    width: textWidth - iconSize - iconMargin,
                    // lineGap: 3,
                    align: "left",
                  }
                );

              const emailY =
                secondPartY + mobileHeight + doc.currentLineHeight() / 2;
              doc.image(emailIconBase64, textX, emailY + 0.5, {
                width: iconSize + 1,
                height: iconSize + 1,
              });
              doc
                .font("Montserrat-Medium", 8)
                .text(email, textX + iconSize + iconMargin, emailY, {
                  width: textWidth - iconSize - iconMargin,
                  align: "left",
                });

              // Draw the QR code on the right side of the rectangle
              const qrCodePath = await QRCode.toDataURL(qrCodeUrl, {
                errorCorrectionLevel: "L",
                margin: 0,
              }); // Path to your QR code image
              const qrCodeSize = 63; // Size of the QR code (1 inch)
              const qrX = rectX + rectWidth - qrCodeSize - padding; // 10 points padding from the right edge of the rectangle
              const qrY = rectY + (rectHeight - qrCodeSize) / 2; // Center vertically within the rectangle

              doc.image(qrCodePath, qrX, qrY, {
                fit: [qrCodeSize, qrCodeSize],
              });

              doc.end();
              //   return Response.responseStatus(res, 200, "Employee Data", rows[0]);
            }
          }

          const adminMailSubject = "Visiting Card Print Request"; //- ${resultMU[0].user_type}
          const adminMailContent = `
          <p>Dear Admin,</p>
          
          <p>We hope this message finds you well. We are pleased to inform you that the visiting card print request has been approved by <strong>${resultMU[0].first_name} ${resultMU[0].last_name}</strong>.</p>
          
          <p>Please find the attached PDF with the details required for printing the visiting cards.</p>
          
          <p>If you have any questions or concerns, please feel free to reach out to our support team at helpdesk@refex.co.in</p>
          
          <div style="text-align: center;">
              <a href="${link}">
                  <img src="${link}/assets/Refex-Logo.png" alt="Refex Contacts" style="max-width: 100px;">
              </a>
          </div>
          
          <p>Thank you for your attention to this request.</p>
          
          <p>Best regards,</p>
          <p>Refex Contacts Team</p>`;

          // <p>You can view the updated status by logging in to the Refex Contacts app. Click <a href="${link}">here</a> to access your account.</p>

          // Navigate to the 'Requests' section to find the specific request and review the latest status and comments provided by the ${resultMU[0].user_type}.

          await sendMail(
            PRINT_ADMIN_MAIL,
            // "kumarmurugesh14032001@gmail.com",
            adminMailSubject,
            adminMailContent,
            attachments,
            async (error, info) => {
              if (error) {
                console.log(error);
                // return Response.responseStatus(
                //   res,
                //   200,
                //   `Status updated to ${status} for Print Request (${request_id}). Facing error in sending mail to ${resultCU[0].email}`
                // );
              }
            }
          );

          const mailSubject = "Request Status Update - Refex Contacts"; //(${resultMU[0].user_type})
          const mailContent = `<p>Hi ${resultCU[0].first_name} ${
            resultCU[0].last_name
          },</p>
      <p>We are writing to inform you about an important update regarding a request in Refex Contacts.</p>
      <p><strong>Request Details:</strong></p>
      <ul>
          <li><strong>Request ID:</strong> ${request_id}</li>
          <li><strong>Status Updated To:</strong> ${
            status.charAt(0).toUpperCase() + status.slice(1)
          }</li>
          <li><strong>Updated By:</strong> ${resultMU[0].first_name} ${
            resultMU[0].last_name
          }</li>
      </ul>
      <p>You can view the updated status by logging in to the Refex Contacts app. Click <a href="${link}">here</a> to access your account.</p>

      <p>Please find the attached PDF for printing the visiting cards.</p>

      <p>Navigate to the 'Requests' section to find the specific request and review the latest status and comments provided by the CHRO. If you have any questions or concerns, please feel free to reach out to our support team at helpdesk@refex.co.in</p>

      <div style="text-align: center;">
          <a href="${link}">
              <img src="${link}/assets/Refex-Logo.png" alt="Refex Contacts" style="max-width: 100px;">
          </a>
      </div>

      <p>Thank you for your attention to this update.</p>
      <p>Best regards,</p>
      <p>Refex Contacts Team</p>`;

          await sendMail(
            resultCU[0].email,
            mailSubject,
            mailContent,
            attachments,
            async (error, info) => {
              if (error) {
                return Response.responseStatus(
                  res,
                  200,
                  `Status updated to ${status} for Print Request (${request_id}). Facing error in sending mail to ${resultCU[0].email}`
                );
              }
            }
          );
        } else {
          const mailSubject = "Request Status Update - Refex Contacts"; //(${resultMU[0].user_type})
          const mailContent = `<p>Hi ${resultCU[0].first_name} ${
            resultCU[0].last_name
          },</p>
    <p>We are writing to inform you about an important update regarding a request in Refex Contacts.</p>
    <p><strong>Request Details:</strong></p>
    <ul>
        <li><strong>Request ID:</strong> ${request_id}</li>
        <li><strong>Status Updated To:</strong> ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }</li>
        <li><strong>Updated By:</strong> ${resultMU[0].first_name} ${
            resultMU[0].last_name
          }</li>
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

          await sendMail(
            resultCU[0].email,
            mailSubject,
            mailContent,
            null,
            async (error, info) => {
              if (error) {
                return Response.responseStatus(
                  res,
                  200,
                  `Status updated to ${status} for Print Request (${request_id}). Facing error in sending mail to ${resultCU[0].email}`
                );
              }
            }
          );
        }

        return Response.responseStatus(
          res,
          200,
          `Status updated to ${status} for Print Request (${request_id})`
        );
      }
      return Response.responseStatus(
        res,
        404,
        `Failed to update status for Print Request - ${request_id}`
      );
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  updateStatusPrintEmployees: async (req, res) => {
    try {
      const { user_id } = req.userData;
      const { request_id, pe_ids = [], status } = req.body;
      const link = `${FRONT_END_URL}`;
      const attachments = [];
      const emp_rows = [];
      let approvedCount = 0;
      let pendingCount = 0;
      let rejectedCount = 0;

      for (let i = 0; i < pe_ids.length; i++) {
        const pe_id = pe_ids[i];
        await PrintEmployeeModel.updatePrintEmployeeById(pe_id, { status });
        const resultPE = await PrintEmployeeModel.getPrintEmployeeByCondition({
          "pe.id": pe_id,
        });
        emp_rows.push(resultPE[0].employee_id);
      }
      const resultEMPRows =
        await PrintEmployeeModel.getPrintEmployeeByCondition({ request_id });
      for (let i = 0; i < resultEMPRows.length; i++) {
        const { status } = resultEMPRows[i];
        if (status === "approved") {
          approvedCount++;
        } else if (status === "pending") {
          pendingCount++;
        } else if (status === "rejected") {
          rejectedCount++;
        }
      }
      let maxStatus =
        approvedCount > rejectedCount
          ? approvedCount > pendingCount
            ? "approved"
            : "pending"
          : rejectedCount > pendingCount
          ? "rejected"
          : "pending";
      maxStatus =
        approvedCount === rejectedCount && pendingCount > 1
          ? "pending"
          : maxStatus;
      maxStatus =
        approvedCount === rejectedCount && pendingCount === 0
          ? "approved"
          : maxStatus;

      await PrintRequestModel.updateRequestByCondition(
        { request_id },
        { status: maxStatus }
      );

      const resultPR = await PrintRequestModel.getRequestsByCondition({
        request_id,
      });
      const resultMU = await UserModel.getUsersByCondition({
        user_id,
      });
      const resultCU = await UserModel.getUsersByCondition({
        user_id: resultPR[0].created_by,
      });
      // console.log(status);
      // console.log(emp_rows);
      if (status === "approved") {
        for (let i = 0; i < emp_rows.length; i++) {
          const employee_id = emp_rows[i];

          const ep_rows = await EmployeeModel.getEmployeeByCondition({
            "ep.employee_id": employee_id,
            // "ep.is_active": 1,
          });

          if (ep_rows.length > 0) {
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
            } = ep_rows[0];
            const URL = APP_URL || "http://loacalhost:3001";
            const qrCodeUrl = URL.concat(`/vcard/${employee_id}`);
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

            doc.registerFont(
              "Montserrat-SemiBold",
              path.join(
                __dirname,
                "../fonts/Montserrat/static/Montserrat-SemiBold.ttf"
              )
            );
            doc.registerFont(
              "Montserrat-Medium",
              path.join(
                __dirname,
                "../fonts/Montserrat/static/Montserrat-Medium.ttf"
              )
            );

            // Define the path to save the PDF
            const uploadsDir = path.join(
              __dirname,
              "../../uploads/approved_vcards"
            );
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileName = `${employee_name}_${uniqueSuffix}.pdf`;
            const filePath = path.join(uploadsDir, fileName);
            attachments.push({
              filename: fileName,
              path: filePath,
            });
            // Ensure the uploads directory exists
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir);
            }
            // Create a write stream to the file
            const writeStream = fs.createWriteStream(filePath);

            // Handle errors during PDF creation
            doc.on("error", (err) => {
              console.error("PDF generation error:", err);
              if (!res.headersSent) {
                return Response.responseStatus(
                  res,
                  500,
                  "PDF generation failed",
                  {
                    error: err.message,
                  }
                );
              }
            });
            // Pipe the PDF document to the write stream
            doc.pipe(writeStream);

            // Centered rectangle dimensions
            const rectWidth = 3.5 * 72.5; // 253.75 points
            const rectHeight = 2 * 73; // 146 points

            // A4 page dimensions in points
            const pageWidth = 595.28;
            const pageHeight = 841.89;

            // Calculating top-left corner to center the rectangle
            const rectX = (pageWidth - rectWidth) / 2; // 170.765 points
            const rectY = (pageHeight - rectHeight) / 2; // 347.945 points

            // Draw the rectangle centered on the page
            doc.rect(rectX, rectY, rectWidth, rectHeight).stroke();

            // Centered image dimensions
            const imageWidth = 1.5 * 72; // 108 points
            const imageHeight = 1 * 72; // 72 points

            // Calculating top-left corner to center the image inside the rectangle
            const imageX = rectX + (rectWidth - imageWidth) / 2; // 243.64 points
            const imageY = rectY + (rectHeight - imageHeight) / 2; // 384.945 points

            // Draw the image centered inside the rectangle
            doc.image(logo, imageX, imageY - 3, {
              fit: [imageWidth, imageHeight], // Constrain image size
              align: "center", // Center horizontally
              valign: "center", // Center vertically
            });
            // End of Front Side of the card -------------------------------------------

            doc.addPage();
            // Start of Back Side of the card -----------------------------------------
            // Draw the rectangle centered on the page
            doc.rect(rectX, rectY, rectWidth, rectHeight).stroke();

            // Define padding
            const padding = 15;

            // Measure the height of the text block for the first part (name and designation)
            doc.fontSize(12).font("Montserrat-SemiBold");
            const nameHeight = doc.heightOfString(employee_name, {
              width: rectWidth / 1.5 - padding,
            });
            doc.fontSize(8).font("Montserrat-Medium");
            const designationHeight = doc.heightOfString(designation, {
              width: rectWidth / 1.5 - padding,
            });
            const firstPartHeight =
              nameHeight + designationHeight + doc.currentLineHeight() / 2; // Including line gap

            // Measure the height of the text block for the second part (mobile number and email)
            doc.fontSize(8).font("Montserrat-Medium");
            const mobileHeight = doc.heightOfString(
              `+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`,
              { width: rectWidth / 1.5 - padding }
            );
            const emailHeight = doc.heightOfString(email, {
              width: rectWidth / 1.5 - padding,
            });
            const secondPartHeight =
              mobileHeight + emailHeight + doc.currentLineHeight() / 2; // Including line gap

            // Total height of the text blocks including gap
            const gap = 10; // Gap between the two parts
            const totalTextHeight = firstPartHeight + secondPartHeight + gap;

            // Position the text inside the rectangle with padding and center vertically
            const textWidth = rectWidth / 1.5 - padding; // Allocate half the rectangle width minus padding
            const textX = rectX + padding;
            const textY = rectY + (rectHeight - totalTextHeight) / 2 + 2; // Center vertically

            // Define the gradient colors
            const gradientColors = ["#345C9B", "#70BB23", "#F1460C"];
            // Create a linear gradient fill
            const gradientFill = doc.linearGradient(
              textX,
              textY,
              textX + employee_name.length * 7,
              textY
            );
            gradientFill.stop(0, gradientColors[0]);
            gradientFill.stop(0.4, gradientColors[1]);
            gradientFill.stop(1, gradientColors[2]);

            // Set the gradient fill for the text
            doc.fill(gradientFill);

            // Add your gradient-filled text
            doc
              .font("Montserrat-SemiBold")
              .fontSize(12)
              .text(employee_name, textX, textY - 4, {
                width: textWidth,
                align: "left",
              })
              .font("Montserrat-Medium", 8)
              .fillColor("black")
              .text(designation, {
                width: textWidth,
                align: "left",
              });

            // Add the gap between the two parts
            const secondPartY = textY + firstPartHeight + gap;

            // Size for icons (assuming line height of 9 points font size)
            const iconSize = 9; // Adjust this if needed
            const iconMargin = 5; // Margin between icon and text

            // Add the second part of the text (mobile number and email) with icons
            doc.image(mobileIconBase64, textX, secondPartY + 0.4, {
              width: iconSize,
              height: iconSize,
            });
            doc
              .font("Montserrat-Medium", 8)
              .text(
                `+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`,
                textX + iconSize + iconMargin,
                secondPartY,
                {
                  width: textWidth - iconSize - iconMargin,
                  // lineGap: 3,
                  align: "left",
                }
              );

            const emailY =
              secondPartY + mobileHeight + doc.currentLineHeight() / 2;
            doc.image(emailIconBase64, textX, emailY + 0.5, {
              width: iconSize + 1,
              height: iconSize + 1,
            });
            doc
              .font("Montserrat-Medium", 8)
              .text(email, textX + iconSize + iconMargin, emailY, {
                width: textWidth - iconSize - iconMargin,
                align: "left",
              });

            // Draw the QR code on the right side of the rectangle
            const qrCodePath = await QRCode.toDataURL(qrCodeUrl, {
              errorCorrectionLevel: "L",
              margin: 0,
            }); // Path to your QR code image
            const qrCodeSize = 63; // Size of the QR code (1 inch)
            const qrX = rectX + rectWidth - qrCodeSize - padding; // 10 points padding from the right edge of the rectangle
            const qrY = rectY + (rectHeight - qrCodeSize) / 2; // Center vertically within the rectangle

            doc.image(qrCodePath, qrX, qrY, {
              fit: [qrCodeSize, qrCodeSize],
            });

            doc.end();
            //   return Response.responseStatus(res, 200, "Employee Data", rows[0]);
          }
        }

        const adminMailSubject = "Visiting Card Print Request"; //- ${resultMU[0].user_type}
        const adminMailContent = `
        <p>Dear Admin,</p>
        
        <p>We hope this message finds you well. We are pleased to inform you that the visiting card print request has been approved by <strong>${resultMU[0].first_name} ${resultMU[0].last_name}</strong>.</p>
        
        <p>Please find the attached PDF with the details required for printing the visiting cards.</p>
        
        <p>If you have any questions or concerns, please feel free to reach out to our support team at helpdesk@refex.co.in</p>
        
        <div style="text-align: center;">
            <a href="${link}">
                <img src="${link}/assets/Refex-Logo.png" alt="Refex Contacts" style="max-width: 100px;">
            </a>
        </div>
        
        <p>Thank you for your attention to this request.</p>
        
        <p>Best regards,</p>
        <p>Refex Contacts Team</p>`;

        // <p>You can view the updated status by logging in to the Refex Contacts app. Click <a href="${link}">here</a> to access your account.</p>

        // Navigate to the 'Requests' section to find the specific request and review the latest status and comments provided by the ${resultMU[0].user_type}.

        await sendMail(
          PRINT_ADMIN_MAIL,
          // "kumarmurugesh14032001@gmail.com",
          adminMailSubject,
          adminMailContent,
          attachments,
          async (error, info) => {
            if (error) {
              console.log(error);
              // return Response.responseStatus(
              //   res,
              //   200,
              //   `Status updated to ${status} for Print Request (${request_id}). Facing error in sending mail to ${resultCU[0].email}`
              // );
            }
          }
        );

        const mailSubject = "Request Status Update - Refex Contacts"; //(${resultMU[0].user_type})
        const mailContent = `<p>Hi ${resultCU[0].first_name} ${
          resultCU[0].last_name
        },</p>
    <p>We are writing to inform you about an important update regarding a request in Refex Contacts.</p>
    <p><strong>Request Details:</strong></p>
    <ul>
        <li><strong>Request ID:</strong> ${request_id}</li>
        <li><strong>Status Updated To:</strong> ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }</li>
        <li><strong>Selected Employee IDs:</strong> ${emp_rows}</li>
        <li><strong>Updated By:</strong> ${resultMU[0].first_name} ${
          resultMU[0].last_name
        }</li>
    </ul>
    <p>You can view the updated status by logging in to the Refex Contacts app. Click <a href="${link}">here</a> to access your account.</p>

    <p>Please find the attached PDF for printing the visiting cards.</p>

    <p>Navigate to the 'Requests' section to find the specific request and review the latest status and comments provided by the CHRO. If you have any questions or concerns, please feel free to reach out to our support team at helpdesk@refex.co.in</p>

    <div style="text-align: center;">
        <a href="${link}">
            <img src="${link}/assets/Refex-Logo.png" alt="Refex Contacts" style="max-width: 100px;">
        </a>
    </div>

    <p>Thank you for your attention to this update.</p>
    <p>Best regards,</p>
    <p>Refex Contacts Team</p>`;

        await sendMail(
          resultCU[0].email,
          mailSubject,
          mailContent,
          attachments,
          async (error, info) => {
            if (error) {
              return Response.responseStatus(
                res,
                200,
                `Status updated to ${status} for Print Request (${request_id}). Facing error in sending mail to ${resultCU[0].email}`
              );
            }
          }
        );
      } else {
        const mailSubject = "Request Status Update - Refex Contacts"; //(${resultMU[0].user_type})
        const mailContent = `<p>Hi ${resultCU[0].first_name} ${
          resultCU[0].last_name
        },</p>
  <p>We are writing to inform you about an important update regarding a request in Refex Contacts.</p>
  <p><strong>Request Details:</strong></p>
  <ul>
      <li><strong>Request ID:</strong> ${request_id}</li>
      <li><strong>Status Updated To:</strong> ${
        status.charAt(0).toUpperCase() + status.slice(1)
      }</li>
      <li><strong>Updated By:</strong> ${resultMU[0].first_name} ${
          resultMU[0].last_name
        }</li>
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

        await sendMail(
          resultCU[0].email,
          mailSubject,
          mailContent,
          null,
          async (error, info) => {
            if (error) {
              return Response.responseStatus(
                res,
                200,
                `Status updated to ${status} for Print Request (${request_id}). Facing error in sending mail to ${resultCU[0].email}`
              );
            }
          }
        );
      }

      return Response.responseStatus(
        res,
        200,
        `Status updated to ${status} for selected employees.`
      );
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
        // "ep.is_active": 1,
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
        const URL = APP_URL || "http://localhost:3001";
        const qrCodeUrl = URL.concat(`/vcard/${employee_id}`);
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

        doc.registerFont(
          "Montserrat-SemiBold",
          path.join(
            __dirname,
            "../fonts/Montserrat/static/Montserrat-SemiBold.ttf"
          )
        );
        doc.registerFont(
          "Montserrat-Medium",
          path.join(
            __dirname,
            "../fonts/Montserrat/static/Montserrat-Medium.ttf"
          )
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${employee_name}_${employee_id}.pdf"`
        );

        // Handle errors during PDF creation
        doc.on("error", (err) => {
          console.error("PDF generation error:", err);
          if (!res.headersSent) {
            return Response.responseStatus(res, 500, "PDF generation failed", {
              error: err.message,
            });
          }
        });

        doc.pipe(res);
        // Centered rectangle dimensions
        const rectWidth = 3.5 * 72.5; // 253.75 points
        const rectHeight = 2 * 73; // 146 points

        // A4 page dimensions in points
        const pageWidth = 595.28;
        const pageHeight = 841.89;

        // Calculating top-left corner to center the rectangle
        const rectX = (pageWidth - rectWidth) / 2; // 170.765 points
        const rectY = (pageHeight - rectHeight) / 2; // 347.945 points

        // Draw the rectangle centered on the page
        doc.rect(rectX, rectY, rectWidth, rectHeight).stroke();

        // Centered image dimensions
        const imageWidth = 1.5 * 72; // 108 points
        const imageHeight = 1 * 72; // 72 points

        // Calculating top-left corner to center the image inside the rectangle
        const imageX = rectX + (rectWidth - imageWidth) / 2; // 243.64 points
        const imageY = rectY + (rectHeight - imageHeight) / 2; // 384.945 points

        // Draw the image centered inside the rectangle
        doc.image(logo, imageX, imageY - 3, {
          fit: [imageWidth, imageHeight], // Constrain image size
          align: "center", // Center horizontally
          valign: "center", // Center vertically
        });
        // End of Front Side of the card -------------------------------------------

        doc.addPage();
        // Start of Back Side of the card -----------------------------------------
        // Draw the rectangle centered on the page
        doc.rect(rectX, rectY, rectWidth, rectHeight).stroke();

        const padding = 15;

        // Measure the height of the text block for the first part (name and designation)
        doc.fontSize(12).font("Montserrat-SemiBold");
        const nameHeight = doc.heightOfString(employee_name, {
          width: rectWidth / 1.5 - padding,
        });
        doc.fontSize(8).font("Montserrat-Medium");
        const designationHeight = doc.heightOfString(designation, {
          width: rectWidth / 1.5 - padding,
        });
        const firstPartHeight =
          nameHeight + designationHeight + doc.currentLineHeight() / 2; // Including line gap
        // console.log(doc.currentLineHeight());
        // Measure the height of the text block for the second part (mobile number and email)
        doc.fontSize(8).font("Montserrat-Medium");
        const mobileHeight = doc.heightOfString(
          `+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`,
          { width: rectWidth / 1.5 - padding }
        );
        const emailHeight = doc.heightOfString(email, {
          width: rectWidth / 1.5 - padding,
        });
        const secondPartHeight =
          mobileHeight + emailHeight + doc.currentLineHeight() / 2; // Including line gap

        // Total height of the text blocks including gap
        const gap = 10; // Gap between the two parts
        const totalTextHeight = firstPartHeight + secondPartHeight + gap;

        // Position the text inside the rectangle with padding and center vertically
        const textWidth = rectWidth / 1.5 - padding; // Allocate half the rectangle width minus padding
        const textX = rectX + padding;
        const textY = rectY + (rectHeight - totalTextHeight) / 2 + 2; // Center vertically

        // Define the gradient colors
        const gradientColors = ["#345C9B", "#70BB23", "#F1460C"];
        // Create a linear gradient fill
        const gradientFill = doc.linearGradient(
          textX,
          textY,
          textX + employee_name.length * 7,
          textY
        );
        gradientFill.stop(0, gradientColors[0]);
        gradientFill.stop(0.4, gradientColors[1]);
        gradientFill.stop(1, gradientColors[2]);

        // Set the gradient fill for the text
        doc.fill(gradientFill);

        // Add your gradient-filled text
        doc
          .font("Montserrat-SemiBold")
          .fontSize(12)
          .text(employee_name, textX, textY - 4, {
            width: textWidth,
            align: "left",
          })
          .font("Montserrat-Medium", 8)
          .fillColor("black")
          .text(designation, {
            width: textWidth,
            align: "left",
          });

        // Add the gap between the two parts
        const secondPartY = textY + firstPartHeight + gap;

        // Size for icons (assuming line height of 9 points font size)
        const iconSize = 9; // Adjust this if needed
        const iconMargin = 5; // Margin between icon and text

        // Add the second part of the text (mobile number and email) with icons
        doc.image(mobileIconBase64, textX, secondPartY + 0.4, {
          width: iconSize,
          height: iconSize,
        });
        doc
          .font("Montserrat-Medium", 8)
          .text(
            `+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`,
            textX + iconSize + iconMargin,
            secondPartY,
            {
              width: textWidth - iconSize - iconMargin,
              // lineGap: 3,
              align: "left",
            }
          );

        const emailY = secondPartY + mobileHeight + doc.currentLineHeight() / 2;
        doc.image(emailIconBase64, textX, emailY + 0.5, {
          width: iconSize + 1,
          height: iconSize + 1,
        });
        doc
          .font("Montserrat-Medium", 8)
          .text(email, textX + iconSize + iconMargin, emailY, {
            width: textWidth - iconSize - iconMargin,
            align: "left",
          });

        // Draw the QR code on the right side of the rectangle
        const qrCodePath = await QRCode.toDataURL(qrCodeUrl, {
          errorCorrectionLevel: "L",
          margin: 0,
        }); // Path to your QR code image
        const qrCodeSize = 63; // Size of the QR code (1 inch)
        const qrX = rectX + rectWidth - qrCodeSize - padding; // 10 points padding from the right edge of the rectangle
        const qrY = rectY + (rectHeight - qrCodeSize) / 2; // Center vertically within the rectangle

        doc.image(qrCodePath, qrX, qrY, {
          fit: [qrCodeSize, qrCodeSize],
        });

        doc.end();
        //   return Response.responseStatus(res, 200, "Employee Data", rows[0]);
      } else {
        // return Response.responseStatus(res, 400, "No data found");
        // Only send error response if headers haven't already been sent
        if (!res.headersSent) {
          return Response.responseStatus(res, 400, "No data found");
        }
      }
    } catch (error) {
      console.error("Error in generateVCardPDF:", error);

      // Only send error response if headers haven't already been sent
      if (!res.headersSent) {
        return Response.responseStatus(res, 500, "Internal server error", {
          error: error.message,
        });
      }
    }
  },
  deletePrintRequest: async (req, res) => {
    try {
      // const request_id = req.params.request_id;
      const { request_ids = [] } = req.body;

      for (let i = 0; i < request_ids.length; i++) {
        const request_id = request_ids[i];
        await PrintEmployeeModel.deletePrintEmployeeByCondition({
          request_id,
        });
        const result = await PrintRequestModel.deleteRequestByCondition({
          request_id,
        });
        if (!result.affectedRows > 0)
          return Response.responseStatus(
            res,
            400,
            "Failed to delete the print request"
          );
      }

      return Response.responseStatus(
        res,
        200,
        "Print requests deleted successfully"
      );
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = PrintRequestController;
