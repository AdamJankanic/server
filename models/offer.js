"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Offer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Offer.belongsTo(models.User, {
        foreignKey: "creator_uuid",
        targetKey: "uuid",
      });

      Offer.hasMany(models.Chat, {
        foreignKey: "offer_uuid",
      });

      Offer.belongsTo(models.Category, {
        foreignKey: "category",
        targetKey: "uuid",
      });
    }
  }
  Offer.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.UUID, allowNull: false },
      creator_uuid: { type: DataTypes.UUID, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      delivery: { type: DataTypes.BOOLEAN, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Offer",
      tableName: "offers",
    }
  );
  return Offer;
};
