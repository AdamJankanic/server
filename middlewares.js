const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const { sequelize, School, Faculty, User } = require("./models");
const dotenv = require("dotenv").config();
//middleware to split email and check if it is from STU
async function checkDomain(req, res, next) {
  try {
    const email = req.body.email;
    const domain = email.split("@")[1];

    if (domain === "stuba.sk") {
      return next();
    }
    return res.status(400).send("Email is not from STU");
  } catch (error) {
    res.status(500).send({ message: error });
    return;
  }
}

//middleware to check if user is already in the database
async function checkEmailDupe(req, res, next) {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (user) {
      res.status(400).send("User already exists");
      return;
    }
    return next();
  } catch (error) {
    res.status(500).send({ message: error });
    return;
  }
}

//middleware to check if token is valid
async function checkToken(req, res, next) {
  next();
  //
  // try {
  //   // next();
  //   if (!req.headers.authorization) {
  //     return res.status(401).json({
  //       message: "Auth failed",
  //     });
  //   }
  //   console.log("Headers are: ");
  //   console.log(req.headers.authorization);
  //   const token = req.headers.authorization.split(" ")[1];
  //   // console.log(token.replace(/['"]+/g, ""));
  //   const decoded = jwt.verify(
  //     token.replace(/['"]+/g, ""),
  //     process.env.MY_SECRET
  //   );
  //   next();
  // } catch (error) {
  //   console.log("Error is: ");
  //   console.log(error);
  //   return res.status(401).json({
  //     message: "Auth failed",
  //   });
  // }
}

// async function allowCrossDomain(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// }

module.exports = {
  checkEmailDupe,
  checkDomain,
  checkToken,
  // allowCrossDomain,
};
