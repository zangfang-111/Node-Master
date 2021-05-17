/*
|--------------------------------------------------------------------------
| Migration - Add walletAddress field to Users table
|--------------------------------------------------------------------------
*/

"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.addColumn("Users", "walletAddress", { type: Sequelize.STRING })]);
  },

  down: (queryInterface) => {
    return Promise.all([queryInterface.removeColumn("Users", "walletAddress")]);
  },
};
