"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.addColumn("Admins", "uuid", { type: Sequelize.UUID })]);
  },

  down: (queryInterface) => {
    return Promise.all([queryInterface.removeColumn("Admins", "uuid")]);
  },
};
