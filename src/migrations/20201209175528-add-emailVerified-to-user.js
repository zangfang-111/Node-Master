"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.addColumn("Users", "emailVerified", { type: Sequelize.BOOLEAN })]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("Users", "emailVerified")]);
  },
};
