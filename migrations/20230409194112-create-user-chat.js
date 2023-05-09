"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("User_Chats", {
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      chat_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("User_Chats");
  },
};
