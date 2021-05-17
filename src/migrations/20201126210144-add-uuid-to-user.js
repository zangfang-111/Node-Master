"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.addColumn("Users", "uuid", { type: Sequelize.UUID })]);
  },

  down: (queryInterface) => {
    return Promise.all([queryInterface.removeColumn("Users", "uuid")]);
  },
};
