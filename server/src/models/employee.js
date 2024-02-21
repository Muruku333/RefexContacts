const db = require("../services/db_service");
const table = "employees";
const table1 = "companies";
const table2 = "company_branches";

const EmployeeModel = {
  createEmployee: async (employeeData) => {
    const [rows] = await db.query(`INSERT INTO ${table} SET ?`, employeeData);
    return rows;
  },
  getAllEmployees: async () => {
    const [rows, fields] = await db.query(`SELECT * FROM ${table};`);
    return rows;
  },
  getEmployeeById: async (id) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id]
    );
    return rows;
  },

  getEmployeesByCondition: async (cond) => {
    const [rows, fields] = await db.query(`
            SELECT ep.id AS ep_id, ep.employee_id, ep.employee_name, ep.designation, ep.mobile_number, ep.landline, ep.email, ep.photo, ep.is_active, ep.company_id, ep.branch_id,
                cp.id AS cp_id, cp.company_id, cp.company_name, cp.company_website, cp.company_logo,  cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id
            FROM ${table} AS ep
            INNER JOIN ${table1} AS cp ON ep.company_id = cp.company_id
            INNER JOIN ${table2} AS cpb ON ep.branch_id = cpb.branch_id
            WHERE ${cond.field} LIKE "%${cond.search}%"
            ORDER BY ${cond.sort} ${cond.order} 
            LIMIT ${cond.dataLimit} OFFSET ${cond.offset}
        `);
    return rows;
  },

  getEmployeeByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT ep.id AS ep_id, ep.employee_id, ep.employee_name, ep.designation, ep.mobile_number, ep.landline, ep.email, ep.photo, ep.is_active, ep.company_id, ep.branch_id,
      cp.id AS cp_id, cp.company_id, cp.company_name, cp.company_website, cp.company_logo,  cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id
  FROM ${table} AS ep
  INNER JOIN ${table1} AS cp ON ep.company_id = cp.company_id
  INNER JOIN ${table2} AS cpb ON ep.branch_id = cpb.branch_id
  WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },

  getEmployeesCountByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT COUNT(ep.id) AS totalData FROM ${table} AS ep
      INNER JOIN ${table1} AS cp ON ep.company_id = cp.company_id
      INNER JOIN ${table2} AS cpb ON ep.branch_id = cpb.branch_id
      WHERE ${cond.field} LIKE "%${cond.search}%" ORDER BY ${cond.sort} ${cond.order}`
    );
    return rows;
  },

  getAllInActiveEmployeesWithMappedData: async () => {
    const [rows, fields] = await db.query(`
            SELECT ep.id AS ep_id, ep.employee_id, ep.employee_name, ep.designation, ep.mobile_number, ep.landline, ep.email, ep.photo, ep.is_active, ep.company_id, ep.branch_id,
                cp.id AS cp_id, cp.company_id, cp.company_name, cp.company_website, cp.company_logo,  cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id
            FROM ${table} AS ep
            INNER JOIN ${table1} AS cp ON ep.company_id = cp.company_id
            INNER JOIN ${table2} AS cpb ON ep.branch_id = cpb.branch_id WHERE ep.is_active = 0;
        `);
    return rows;
  },

  // getAllEmployeeWithBranch: async () => {
  //     const [rows, fields] = await db.query(`
  //         SELECT ep.id AS ep_id, ep.employee_id, ep.employee_name, ep.designation, ep.mobile_number, ep.landline, ep.email, ep.photo, ep.is_active, ep.company_id, ep.branch_id,
  //             cpb.id AS cpb_id, cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id
  //         FROM ${table} AS ep
  //         INNER JOIN ${table2} AS cp ON ep.branch_id = cpb.branch_id
  //     `);
  //     return rows;
  // },

  getEmployeeByEmployeeIdWithMappedData: async (id) => {
    const [rows, fields] = await db.query(
      `
            SELECT ep.id AS ep_id, ep.employee_id, ep.employee_name, ep.designation, ep.mobile_number, ep.landline, ep.email, ep.photo, ep.is_active, ep.company_id, ep.branch_id,
                cp.id AS cp_id, cp.company_id, cp.company_name, cp.company_website, cp.company_logo,  cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id
            FROM ${table} AS ep
            INNER JOIN ${table1} AS cp ON ep.company_id = cp.company_id
            INNER JOIN ${table2} AS cpb ON ep.branch_id = cpb.branch_id
            WHERE ep.employee_id = ?
        `,
      [id]
    );
    return rows;
  },

  // getEmployeeByEmployeeIdWithBranch: async (id) => {
  //     const [rows, fields] = await db.query(`
  //         SELECT ep.id AS ep_id, ep.employee_id, ep.employee_name, ep.designation, ep.mobile_number, ep.landline, ep.email, ep.photo, ep.is_active, ep.company_id, ep.branch_id,
  //             cpb.id AS cpb_id, cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id
  //         FROM ${table} AS ep
  //         INNER JOIN ${table2} AS cp ON ep.branch_id = cpb.branch_id
  //         WHERE ep.employee_id = ?
  //     `, [id]);
  //     return rows;
  // },

  updateEmployeeById: async (id, update) => {
    const [rows] = await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [
      update,
      id,
    ]);
    return rows;
  },

  updateEmployeeByCondition: async (cond, update) => {
    const [rows] = await db.query(
      `UPDATE ${table} SET ? WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`,
      [update]
    );
    return rows;
  },

  deleteEmployeeById: async (id) => {
    const [rows] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return rows;
  },

  deleteEmployeeByCondition: async (cond) => {
    const [rows] = await db.query(
      `DELETE FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },
};

module.exports = EmployeeModel;
