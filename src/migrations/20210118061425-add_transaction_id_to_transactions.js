"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Transactions", "transactionId", { type: Sequelize.STRING }),
      queryInterface.addColumn("Transactions", "toWalletAddress", { type: Sequelize.STRING }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Transactions", "transactionId"),
      queryInterface.removeColumn("Transactions", "toWalletAddress"),
    ]);
  },
};
