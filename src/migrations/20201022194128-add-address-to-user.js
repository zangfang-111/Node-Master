"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "country", { type: Sequelize.STRING }),
      queryInterface.addColumn("Users", "city", { type: Sequelize.STRING }),
      queryInterface.addColumn("Users", "zipcode", { type: Sequelize.STRING }),
      queryInterface.addColumn("Users", "homeAddress", { type: Sequelize.STRING }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "homeAddress"),
      queryInterface.removeColumn("Users", "zipcode"),
      queryInterface.removeColumn("Users", "city"),
      queryInterface.removeColumn("Users", "country"),
    ]);
  }
};
