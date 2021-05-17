import Admin from "./admin";

const config = {
  apiVersion: "1.0.0",
  swagger: "2.0",
  basePath: "/admin",
  produeces: ["application/json"],
  authorization: {},
  paths: {
    ...Admin,
  },
  tags: [
    {
      name: "Auth",
      description: "Admin Authentication",
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
      Admin: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phoneNumber: { type: "string" },
          phoneVerified: { type: "boolean" },
        },
      },
    },
  },
  info: {
    title: "SMK Services Rest API",
  },
};

export default config;
