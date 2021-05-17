"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("NotificationSettings", {
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
      agree: {
        type: Sequelize.BOOLEAN
      },
      buy: {
        type: Sequelize.BOOLEAN
      },
      withdraw: {
        type: Sequelize.BOOLEAN
      },
      recommended: {
        type: Sequelize.BOOLEAN
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
  down: (queryInterface) => {
    return queryInterface.dropTable("NotificationSettings");
  }
};
