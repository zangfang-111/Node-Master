"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "status", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([queryInterface.removeColumn("Users", "status")]);
  },
};
