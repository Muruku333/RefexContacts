const db = require("../services/db_service");
const table = "company_branches";
const table1 = "companies";

const CompanyBranchesModel = {
  createCompanyBranches: async (branchesData) => {
    const [rows] = await db.query(`INSERT INTO ${table} SET ?`, branchesData);
    return rows;
  },
  getAllCompanyBranches: async () => {
    const [rows, fields] = await db.query(`SELECT * FROM ${table};`);
    return rows;
  },
  getCompanyBranchesById: async (id) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id]
    );
    return rows;
  },
  getCompanyBranchesByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },

  getAllCompanyBranchesWithCompany: async () => {
    const [rows, fields] = await db.query(`
                SELECT cpb.id AS cpb_id, cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id,
                    cp.id AS cp_id, cp.company_id, cp.company_name, cp.company_website, cp.company_logo
                FROM ${table} AS cpb
                INNER JOIN ${table1} AS cp ON cpb.company_id = cp.company_id
            `);
    return rows;
  },

  getCompanyBranchesByBranchesIdWithCompany: async (id) => {
    const [rows, fields] = await db.query(
      `
                SELECT cpb.id AS cpb_id, cpb.branch_id, cpb.branch_name, cpb.branch_address, cpb.google_map_link, cpb.company_id,
                    cp.id AS cp_id, cp.company_id, cp.company_name, cp.company_website, cp.company_logo
                FROM ${table} AS cpb
                INNER JOIN ${table1} AS cp ON cpb.company_id = cp.company_id
                WHERE cpb.branch_id = ?
            `,
      [id]
    );
    return rows;
  },

  updateCompanyBranchesById: async (id, update) => {
    const [rows] = await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [
      update,
      id,
    ]);
    return rows;
  },

  updateCompanyBranchesByCondition: async (cond, update) => {
    const [rows] = await db.query(
      `UPDATE ${table} SET ? WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`,
      [update]
    );
    return rows;
  },

  deleteCompanyBranchesById: async (id) => {
    const [rows] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return rows;
  },

  deleteCompanyBranchesByCondition: async (cond) => {
    const [rows] = await db.query(
      `DELETE FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },
};

module.exports = CompanyBranchesModel;
