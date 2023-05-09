"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.belongsTo(models.User, {
        foreignKey: "creator_uuid",
        targetKey: "uuid",
      });

      Event.hasOne(models.Chat, {
        foreignKey: "event_uuid",
      });

      Event.belongsTo(models.Category, {
        foreignKey: "category",
        targetKey: "uuid",
      });
    }
  }
  Event.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      creator_uuid: { type: DataTypes.UUID, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: false },
      capacity: { type: DataTypes.INTEGER, allowNull: false },
      joined: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      price: { type: DataTypes.FLOAT, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      time: { type: DataTypes.DATE, allowNull: false },
      duration: { type: DataTypes.FLOAT, allowNull: false },
      date: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: "Event",
      tableName: "events",
    }
  );
  return Event;
};
