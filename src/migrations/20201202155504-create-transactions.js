"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onDelete: "cascade",
        onUpdate: "cascade"
      },
      paymentId: {
        type: Sequelize.STRING
      },
      orderId: {
        type: Sequelize.STRING
      },
      orderType: {
        type: Sequelize.STRING
      },
      fiatAmount: {
        type: Sequelize.DOUBLE
      },
      fiatCurrency: {
        type: Sequelize.STRING
      },
      cryptoAmount: {
        type: Sequelize.DOUBLE
      },
      cryptoCurrency: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Transactions");
  }
};
