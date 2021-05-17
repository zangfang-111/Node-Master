import User from "./user";
import History from "./history";
import Notification from "./notification";
import Payment from "./payment";
import Health from "./health";

const config = {
  apiVersion: "1.0.0",
  swagger: "2.0",
  basePath: "/app",
  produeces: ["application/json"],
  authorization: {},
  paths: {
    ...User,
    ...History,
    ...Notification,
    ...Payment,
    ...Health,
  },
  tags: [
    {
      name: "Health",
      description: "Service check",
    },
    {
      name: "Auth",
      description: "Firebase Authentication",
    },
    {
      name: "User",
      description: "Operations about user",
    },
    {
      name: "Notification",
      description: "Operations about notification",
    },
    {
      name: "Payment",
      description: "Operations about Payment(Simplex Service)",
    },
    {
      name: "Bitcoin",
      description: "Operations about Bitcoin history",
    },
    {
      name: "Transaction",
      description: "Operations about Account activities",
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  components: {
    schemas: {
      Token: {
        type: "object",
        properties: {
          token: {
            type: "string",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phoneNumber: { type: "string" },
          phoneVerified: { type: "boolean" },
        },
      },
      Notification: {
        type: "object",
        properties: {
          agree: { type: "boolean" },
          buy: { type: "boolean" },
          withdraw: { type: "boolean" },
          recommended: { type: "boolean" },
        },
      },
    },
  },
  info: {
    title: "SMK Services Rest API",
  },
};

export default config;
