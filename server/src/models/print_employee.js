const db = require("../services/db_service");
const table = "print_employees";

const PrintEmployeeModel = {
  createPrintEmployee: async (data) => {
    const [rows] = await db.query(`INSERT INTO ${table} SET ?`, data);
    return rows;
  },
  getPrintEmployeeByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT pe.id, pe.employee_id, employee_name,designation,mobile_number,email,landline,photo,is_active, emp.company_id, company_name, emp.branch_id,branch_name, pe.status FROM ${table} AS pe
      INNER JOIN employees AS emp ON emp.employee_id = pe.employee_id
      INNER JOIN companies AS cp ON emp.company_id = cp.company_id
      INNER JOIN company_branches AS cb ON emp.branch_id= cb.branch_id
      WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },
  updatePrintEmployeeById: async (id, update) => {
    const [rows] = await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [
      update,
      id,
    ]);
    return rows;
  },
  updatePrintEmployeeByCondition: async (cond, update) => {
    const [rows] = await db.query(
      `UPDATE ${table} SET ? WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`,
      [update]
    );
    return rows;
  },
  deletePrintEmployeeByCondition: async (cond) => {
    const [rows] = await db.query(
      `DELETE FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },
};

module.exports = PrintEmployeeModel;
