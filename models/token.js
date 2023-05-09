"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // Many-to-One relationship with User model
    static associate(models) {
      Token.belongsTo(models.User, {
        foreignKey: "user_uuid",
        targetKey: "uuid",
      });
    }
  }
  Token.init(
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      token: { type: DataTypes.STRING(1234), allowNull: false },
      user_uuid: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "Token",
      tableName: "tokens",
    }
  );
  return Token;
};
