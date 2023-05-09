"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User_Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User_Chat.belongsTo(models.User, {
        foreignKey: "user_uuid",
        targetKey: "uuid",
      });

      User_Chat.belongsTo(models.Chat, {
        foreignKey: "chat_uuid",
        targetKey: "uuid",
      });
    }
  }
  User_Chat.init(
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      chat_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User_Chat",
      tableName: "user_chats",
    }
  );
  return User_Chat;
};
