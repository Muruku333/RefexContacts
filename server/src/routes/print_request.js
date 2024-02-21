const express = require("express");
const PrintRequestController = require("../controllers/print_request");
const auth = require("../middlewares/auth");
const validation = require("../middlewares/printRequestValidator");

const router = express.Router();

router
  .route("/print_request")
  .post(
    auth.authCheck,
    validation.createPrintRequest,
    PrintRequestController.createPrintRequest
  );

router
  .route("/generate_vcard_pdf/:employee_id")
  .get(auth.authCheck, PrintRequestController.generateVCardPDF);

module.exports = router;
