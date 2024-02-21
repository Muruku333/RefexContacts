const db = require("../services/db_service");
const table = "print_employees";

const PrintEmployeeModel = {
  createPrintEmployee: async (data) => {
    const [rows] = await db.query(`INSERT INTO ${table} SET ?`, data);
    return rows;
  },
  getPrintEmployeeByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
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
