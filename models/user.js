"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      User.hasMany(models.Token, {
        foreignKey: "user_uuid",
      }),
        User.hasMany(models.User_Chat, {
          foreignKey: "user_uuid",
        });

      User.hasMany(models.Message, {
        foreignKey: "sender_uuid",
      });
      User.hasMany(models.Offer, {
        foreignKey: "creator_uuid",
      });
      User.hasMany(models.Event, {
        foreignKey: "creator_uuid",
      });
    }
  }
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      verification_code: { type: DataTypes.STRING },
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
