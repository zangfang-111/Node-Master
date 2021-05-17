import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf } = format;

interface customFormatType {
  level: string;
  message: string;
  label: string;
  timestamp: string;
}

const customFormat = printf(
  ({ level, message, label, timestamp }: customFormatType) => `${timestamp} [${label}] ${level}: ${message}`
);

const logger = createLogger({
  level: "info",
  format: combine(label({ label: "Digital Money" }), timestamp(), customFormat, format.splat()),
  transports: [new transports.File({ filename: "Logs/scheudle_job_log.log" })],
});

export default logger;
