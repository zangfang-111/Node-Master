"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.renameTable("PhoneVerifies", "Verifications")]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.renameTable("Verifications", "PhoneVerifies")]);
  },
};
