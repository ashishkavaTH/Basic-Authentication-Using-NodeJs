import pino from "pino";

const { LOG_LEVEL, APP_NAME } = process.env;

const logger = pino({
  level: LOG_LEVEL || "info",
  name: APP_NAME || "MyApp",
});

export default logger;
