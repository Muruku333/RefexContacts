const db = require("../services/db_service");
const table = "companies";

const CompanyModel = {
  createCompany: async (company) => {
    const [rows] = await db.query(`INSERT INTO ${table} SET ?`, company);
    return rows;
  },

  listCompanies: async (cond) => {
    const [rows, fields] = await db.query(`
            SELECT * FROM ${table}
            WHERE ${cond.field} LIKE "%${cond.search}%"
            ORDER BY ${cond.sort} ${cond.order} 
            LIMIT ${cond.dataLimit} OFFSET ${cond.offset}
        `);
    return rows;
  },
  getAllCompanies: async () => {
    const [rows, fields] = await db.query(`SELECT * FROM ${table}`);
    return rows;
  },

  getCompaniesCountByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT COUNT(id) AS totalData FROM ${table}
      WHERE ${cond.field} LIKE "%${cond.search}%" ORDER BY ${cond.sort} ${cond.order}`
    );
    return rows;
  },
  getCompanyById: async (id) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id]
    );
    return rows;
  },
  getCompanyByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },
  updateCompanyById: async (id, update) => {
    const [rows] = await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [
      update,
      id,
    ]);
    return rows;
  },
  updateCompanyByCondition: async (cond, update) => {
    const [rows] = await db.query(
      `UPDATE ${table} SET ? WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`,
      [update]
    );
    return rows;
  },
  deleteCompanyById: async (id) => {
    const [rows] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return rows;
  },
  deleteCompanyByCondition: async (cond) => {
    const [rows] = await db.query(
      `DELETE FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },
};

module.exports = CompanyModel;
