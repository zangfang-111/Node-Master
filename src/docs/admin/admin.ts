export default {
  "/auth": {
    post: {
      operationId: "Login",
      tags: ["Auth"],
      summary: "Admin Login",
      parameters: [
        {
          name: "admin",
          description: "Login in admin platform",
          required: true,
          in: "body",
          schema: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string" },
              password: { type: "string" },
            },
          },
        },
      ],
      responses: {
        default: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Token",
              },
            },
          },
        },
      },
    },
  },
};
