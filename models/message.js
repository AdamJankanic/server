"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.User, {
        foreignKey: "sender_uuid",
        targetKey: "uuid",
      });

      Message.belongsTo(models.Chat, {
        foreignKey: "chat_uuid",
        targetKey: "uuid",
      });
    }
  }
  Message.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      sender_uuid: { type: DataTypes.UUID, allowNull: false },
      chat_uuid: { type: DataTypes.UUID, allowNull: false },
      content: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
    }
  );
  return Message;
};
