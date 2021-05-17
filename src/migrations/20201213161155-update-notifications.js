"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("NotificationSettings", "agree", "pushNotifications"),
      queryInterface.renameColumn("NotificationSettings", "buy", "emailNotification", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
      queryInterface.renameColumn("NotificationSettings", "withdraw", "smsNotification", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
      queryInterface.removeColumn("NotificationSettings", "recommended"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("NotificationSettings", "pushNotifications", "agree"),
      queryInterface.renameColumn("NotificationSettings", "emailNotification", "buy"),
      queryInterface.renameColumn("NotificationSettings", "smsNotification", "withdraw"),
      queryInterface.addColumn("NotificationSettings", "recommended", {
        type: Sequelize.BOOLEAN,
      }),
    ]);
  },
};
