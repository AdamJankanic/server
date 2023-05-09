"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chat.hasMany(models.User_Chat, {
        foreignKey: "chat_uuid",
      });

      Chat.hasMany(models.Message, {
        foreignKey: "chat_uuid",
      });

      Chat.belongsTo(models.Offer, {
        foreignKey: "offer_uuid",
        targetKey: "uuid",
      });

      Chat.belongsTo(models.Event, {
        foreignKey: "event_uuid",
        targetKey: "uuid",
      });
    }
  }

  //
  Chat.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      event_uuid: {
        type: DataTypes.UUID,
      },

      offer_uuid: {
        type: DataTypes.UUID,
      },
    },
    {
      sequelize,
      tableName: "chats",
      modelName: "Chat",
    }
  );
  return Chat;
};
