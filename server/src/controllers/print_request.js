const Response = require("../helpers/response");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const PrintRequestModel = require('../models/print_request');
const PrintEmployeeModel = require('../models/print_employee');
const EmployeeModel = require("../models/employee");
const { validationResult } = require("express-validator");
const { APP_URL, LIMIT_DATA } = process.env;

const PrintRequestController = {
  createPrintRequest: async(req, res)=>{
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const {
        status='pending',
        printEmployees=[],
      } = req.body;
      
      const printRequestData ={
        status,
        created_by: req.userData.user_id,
        modified_by: req.userData.user_id
      }

      const result = await PrintRequestModel.createRequest(printRequestData);
      
      if(result.insertId>0){
        const requestResult = await PrintRequestModel.getRequestsByCondition({id:result.insertId});

        printEmployees.map(async (id,index)=>{
          const printEmployeeData = {
            employee_id: printEmployees[index],
            request_id: requestResult[0].request_id
          }
          await PrintEmployeeModel.createPrintEmployee(printEmployeeData);
        });
        return Response.responseStatus(
          res,
          201,
          `Print request send successfully`
        );
      }
      return Response.responseStatus(res, 400, `Failed to send print request`);
    } catch (error) {
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

        if(employee_name.length>21){
            adjust=adjust-8;
        }
        if(designation.length>35){
            adjust=adjust-4;
        }

        const doc = new PDFDocument({
          size: "A4", // Set A4 paper size
          margin: 0, // No margins
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${employee_name}_${employee_id}.pdf"`
        );
        doc.pipe(res);
        // Start of Front Side of the card -----------------------------------------------
        doc.rect(171.5, 260.5, 3.5 * 72.5, 2 * 73).stroke(); // Border dimensions in points
        doc.image(logo, 244.375, 297.5, {
          fit: [1.5 * 72, 1 * 72], // Constrain image size (adjust as needed)
          align: "center", // Center horizontally
          valign: "center", // Center vertically
        }); // .rect(244.375, 297.5, 1.5 * 72, 1* 72)
        doc.rect(171.5, 260.5, 3.5 * 72.5, 2 * 73).stroke(); // Border dimensions in points
        // End of Front Side of the card -------------------------------------------

        // Start of Back Side of the card -----------------------------------------
        doc.rect(171.5, 426.5, 3.5 * 72.5, 2 * 73).stroke(); // Border dimensions in points
        // Define the gradient colors
        const gradientColors = ["#345C9B", "#70BB23", "#F1460C"];
        // Create a linear gradient fill
        const gradientFill = doc.linearGradient(191.5, adjust, 191.5+employee_name.length*7, adjust);
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
            width: 140
          })
          .font("Times-Roman", 9)
          //   .moveDown()
          .fillColor("black")
          .text(designation, {
            width: 140,
          })
          .moveDown()
          .text(' ',{
            lineGap:-2
          })
          .text(`+91 ${mobile_number.slice(0, 5)} ${mobile_number.slice(5)}`, {
            width: 140,
            lineGap:3
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

        doc.image(await QRCode.toDataURL(qrCodeUrl, { errorCorrectionLevel: 'H',margin: 0 }), 341, 469.5, {
          fit: [61, 61], // Constrain image size (adjust as needed)
          align: "center", // Center horizontally
          valign: "center", // Center vertically
        });
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
