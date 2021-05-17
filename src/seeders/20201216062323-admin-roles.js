"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "AdminRoles",
      [
        {
          id: 1,
          name: "super",
        },
        {
          id: 2,
          name: "admin",
        },
        {
          id: 3,
          name: "viewer",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("AdminRoles", null, { truncate: true });
  },
};
