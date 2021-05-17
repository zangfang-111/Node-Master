"use strict";
const uuid = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "Admins",
      [
        {
          email: "wei@smkservices.co",
          uuid: uuid.v4(),
          role: 1,
          confirmed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Admins", {
      email: "wei@smkservices.co",
    });
  },
};
