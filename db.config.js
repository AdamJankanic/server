const { Sequelize, Model, DataTypes } = require("sequelize");
const logger = require("../logger/api.logger");
import mysql2 from "mysql2"; // Needed to fix sequelize issues with WebPack

const connect = () => {
  const hostName = process.env.HOST;
  const userName = process.env.USER;
  const password = process.env.PASSWORD;
  const database = process.env.DB;
  const dialect = process.env.DIALECT;
  const port = process.env.PORT;

  const sequelize = new Sequelize(database, userName, password, {
    host: hostName,
    dialect: dialect,
    port: port,
    operatorsAliases: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 20000,
      idle: 5000,
    },
  });

  if (options.dialect === "mysql") {
    options.dialectModule = mysql2;
  }
  new Sequelize(options);

  const db = {};
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;
  db.tasks = require("../model/task.model")(sequelize, DataTypes, Model);

  return db;
};

module.exports = {
  connect,
};
