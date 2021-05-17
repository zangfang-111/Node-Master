import express from "express";
import bodyParser from "body-parser";
import path from "path";
import swaggerUI from "swagger-ui-express";
import cors from "cors";
import morgan from "morgan";
import * as NodeCron from "node-cron";
import moment from "moment";

import routes from "./routes";
import appSwaggerDocument from "./docs/app";
import adminSwaggerDocument from "./docs/admin";
import ScheduleHandler from "./utils/job";

// Create Express server
const app = express();

// CORS
app.use(cors());

// Logging
app.use(morgan("combined"));

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

// Serve Cron Job Log File
app.use(express.static(path.join(__dirname, "../Logs")));

app.use("/", routes);
// Swagger Documentation Router
app.use("/app-docs", swaggerUI.serve, swaggerUI.setup(appSwaggerDocument));
app.use("/admin-docs", swaggerUI.serve, swaggerUI.setup(adminSwaggerDocument));

try {
  // Node Cron Running Every 10 Minutes
  const scheduleJob = NodeCron.schedule("0 */10 * * * *", ScheduleHandler);
  scheduleJob.start();
  console.log("CRON JOB STARTED ===> %s", moment().toISOString());
} catch (e) {
  console.log("CRON JOB FAILED ===> %s", e.message);
}

export default app;
