const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const history = require('connect-history-api-fallback');
const Response = require('./src/helpers/response.js');

dotenv.config();
const app = express();

// Middleware to parse incoming JSON data ==================================
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Configuration for CORS Origin ------------------------------------------------------
app.use(
    cors({
      origin: ["http://localhost:3030", "http://192.168.14.121:3030"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    })
  );


app.use(
    "/api",
    require("./src/routes/auth.js"),
    require("./src/routes/users.js"),
    require("./src/routes/employee.js"),
    require("./src/routes/company.js"),
    // require("./src/routes/company_branches.js")
  );
  // app.get("/api", (req, res) => {
  //     return res.json({
  //       success: true,
  //       message: "Refex Contacts backend is running well",
  //     });
  //   });
app.all("/api/*", (req, res) => {
    return Response.responseStatus(res, 404, "Endpoint Not Found");
  });

// Serve static files from the 'client/dist' directory
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(history());

// Serve the index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Refex Contacts server listening at http://localhost:${PORT}`);
  });