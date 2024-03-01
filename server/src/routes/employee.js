const express = require("express");
const multer = require("multer");
const EmployeeController = require("../controllers/employee");
const auth = require("../middlewares/auth");
const validation = require("../middlewares/employeeValidator");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route("/employees/inactive")
  .get(
    auth.authCheck,
    EmployeeController.getAllInActiveEmployeesWithMappedData
  );

router
  .route("/import-employees")
  .post(
    auth.authCheck,
    upload.single("file"),
    EmployeeController.importEmployees
  );

router
  .route("/export-employees")
  .get(auth.authCheck, EmployeeController.exportEmployee);

router
  .route("/employees")
  .get(auth.authCheck, EmployeeController.listEmployees)
  .post(
    auth.authCheck,
    validation.createEmployeeData,
    EmployeeController.createEmployee
  );

// .get(EmployeeController.getAllEmployees);

// router
// .route("/employees/:id")
// .get(EmployeeController.getEmployeeById)
// .put(validation.updateEmployeeData,EmployeeController.updateEmployeeById)
// .delete(EmployeeController.deleteEmployeeById);

router
  .route("/employees/:employee_id")
  // .get(EmployeeController.getEmployeeByEmployeeId)
  .get(auth.authCheck, EmployeeController.getEmployeeByEmployeeIdWithMappedData)
  .put(
    auth.authCheck,
    validation.updateEmployeeData,
    EmployeeController.updateEmployeeByEmployeeId
  )
  .delete(auth.authCheck, EmployeeController.deleteEmployeeByEmployeeId)
  .patch(auth.authCheck, EmployeeController.updateActiveEmployeeByEmployeeId);

router
  .route("/vcard/:employee_id")
  .get(EmployeeController.getEmployeeByEmployeeIdWithMappedData);

router
  .route("/download-vcard/:employee_id")
  .get(EmployeeController.getVCardByEmployeeId);

module.exports = router;
