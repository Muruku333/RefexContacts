const { check } = require("express-validator");

const PrintRequestValidation ={
    createPrintRequest: [
        check("printEmployees")
        .exists()
        .withMessage("Print Employees is required")
        .isArray({ min: 1 })
        .withMessage(
          "Print Employees should be array and must be atleast one brach"
        ),
        // check("createdBy")
        // .exists()
        // .withMessage("Created By is required")
        // .notEmpty()
        // .withMessage("Created By cannot be empty"),
    ]
}

module.exports = PrintRequestValidation;