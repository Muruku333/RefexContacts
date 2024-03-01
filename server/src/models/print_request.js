const db = require("../services/db_service");
const table = "print_requests";

const PrintRequestModel = {
  createRequest: async (requestData) => {
    const [rows] = await db.query(`INSERT INTO ${table} SET ?`, requestData);
    return rows;
  },
  listRequests: async (cond) => {
    const [rows, fields] = await db.query(`
        SELECT pr.id, pr.request_id,pr.status,pr.created_by,cu.email AS cu_email,pr.created_at,pr.modified_by,mu.email AS mu_email,pr.modified_at FROM ${table} AS pr
        INNER JOIN users AS cu ON pr.created_by = cu.user_id
        INNER JOIN users AS mu ON pr.modified_by = mu.user_id
        WHERE ${cond.field} LIKE "%${cond.search}%"
        ORDER BY ${cond.sort} ${cond.order} 
        LIMIT ${cond.dataLimit} OFFSET ${cond.offset}
    `);
    return rows;
  },
  getRequestsCountByCondition: async(cond)=>{
    const [rows, fields] = await db.query(
        `SELECT COUNT(pr.id) AS totalData FROM ${table} AS pr
        INNER JOIN users AS cu ON pr.created_by = cu.user_id
        INNER JOIN users AS mu ON pr.modified_by = mu.user_id
        WHERE ${cond.field} LIKE "%${cond.search}%" ORDER BY ${cond.sort} ${cond.order}`
      );
      return rows;
  },
  getAllRequests: async () => {
    const [rows, fields] = await db.query(`SELECT * FROM ${table}`);
    return rows;
  },
  getRequestsById: async (id) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id]
    );
    return rows;
  },
  getRequestsByCondition: async (cond) => {
    const [rows, fields] = await db.query(
      `SELECT * FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  },
  updateRequestById:async (id, update) => {
    const [rows] = await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [
      update,
      id,
    ]);
    return rows;
  },
  updateRequestByCondition: async (cond, update) => {
    const [rows] = await db.query(
      `UPDATE ${table} SET ? WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`,
      [update]
    );
    return rows;
  },
  deleteRequestById: async (id) => {
    const [rows] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return rows;
  },
  deleteRequestByCondition: async (cond) => {
    const [rows] = await db.query(
      `DELETE FROM ${table} WHERE ${Object.keys(cond)
        .map((item) => `${item} = '${cond[item]}'`)
        .join(" AND ")}`
    );
    return rows;
  }
};

module.exports = PrintRequestModel;
