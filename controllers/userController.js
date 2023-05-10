const { User, Token } = require("../models");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { param } = require("../route");

const dotenv = require("dotenv").config();
/* User verify */
const verify = async (req, res) => {
  try {
    const verificationCode = req.body.verification_code;
    const user = await User.findOne({
      where: {
        uuid: req.body.uuid,
      },
    });

    if (user.verification_code === verificationCode) {
      user.verified = true;
      user.save();
      return res.status(200).send("User verified");
    } else {
      return res.status(400).send("Verification code is not correct");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Problem with a verification");
  }
};

/* User login */
const login = async (req, res) => {
  // return res.status(200).send("Login successful");
  try {
    // console.log(req.headers);
    console.log(req.body);

    const emailInput = req.body.email;
    const passwordInput = req.body.password;
    const user = await User.findOne({
      where: {
        email: emailInput,
      },
    });
    // return res.status(200).send(user);

    if (user?.password === passwordInput) {
      if (!user.verified) {
        return res.status(400).send("Verification is needed");
      }

      const token = jwt.sign({ uuid: user.uuid }, process.env.MY_SECRET, {
        expiresIn: "15s",
      });

      const decodedToken = jwt.decode(token);
      const tokenExpiry = decodedToken.exp;

      const tokenExpirationDate = new Date();

      const refreshToken = jwt.sign(
        { uuid: user.uuid },
        process.env.MY_SECRET,
        {
          expiresIn: "3d",
        }
      );

      const decodedRefresh = jwt.decode(refreshToken);
      const refreshExpiry = decodedRefresh.exp;

      const refreshExpirationDate = new Date();

      // console.log(token);
      const refresh = await Token.create({
        token: refreshToken,
        user_uuid: user.uuid,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });

      const responseToUser = {
        token: {
          token: token,
          expiration: tokenExpiry,
          refreshExpiration: refreshExpiry,
        },
        user: {
          uuid: user.uuid,
          email: user.email,
          username: user.username,
          verified: user.verified,
        },
      };

      return res.status(200).json(responseToUser);
    } else {
      return res.status(400).send("Email address or password is not correct");
    }
  } catch (error) {
    console.log("Error is: ");
    console.log(error);
    return res
      .status(400)
      .send(
        "Email address or password is not correct (Problem with a login)",
        error
      );
  }
};

/* User logout */
const logout = async (req, res) => {
  try {
    // delete refresh token from database by user uuid
    Token.destroy({
      where: {
        user_uuid: req.params.uuid,
      },
    });

    res.clearCookie("refreshToken").status(200).send("Logout successful");
  } catch (error) {
    console.log(error);
    return res.status(400).send("Problem with a logout");
  }
};

/* User refresh token*/
const refreshToken = async (req, res) => {
  try {
    console.log("Starting refresh token");
    const refreshToken = req.cookies.refreshToken;
    // const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).send("Refresh token is not provided");
    }

    //find user by refresh token
    const user_uuid = await Token.findOne({
      attributes: ["user_uuid"],
      where: {
        token: refreshToken,
      },
    });

    if (!user_uuid) {
      return res.status(400).send("Refresh token is not valid");
    }

    const user = await User.findOne({
      where: {
        uuid: user_uuid.user_uuid,
      },
    });

    const newToken = jwt.sign({ uuid: user.uuid }, process.env.MY_SECRET, {
      expiresIn: "15s",
    });

    const newRefreshToken = jwt.sign(
      { uuid: user.uuid },
      process.env.MY_SECRET,
      {
        expiresIn: "3d",
      }
    );

    const decodedToken = jwt.decode(newToken);
    const tokenExpiry = decodedToken.exp;

    // const tokenExpirationDate = new Date(toke);

    const decodedRefresh = jwt.decode(newRefreshToken);
    const refreshExpiry = decodedRefresh.exp;

    // const refreshExpirationDate = new Date();

    //add new refresh token to database
    Token.create({
      token: newRefreshToken,
      user_uuid: user.uuid,
    });

    console.log("Ending refresh token");

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    const responseToUser = {
      token: newToken,
      expiration: tokenExpiry,
      refreshExpiration: refreshExpiry,
    };

    return res.status(200).json(responseToUser);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Problem with a refresh token");
  }
};

/* User create */
const createUser = async (req, res) => {
  try {
    const randomNum = Math.random();
    // generate a 6 digit code
    const code = Math.floor(randomNum * 1000000);
    // add zeros until it is 6 digits long
    code.toString().padStart(6, "0");

    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      verification_code: code,
    });

    if (user) sendVerifiactioCode("xjankanic@stuba.sk", code);

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).send("User can not be created");
  }
};

function sendVerifiactioCode(emailTo, code) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
      clientId: process.env.EMAIL_CLIENT_ID,
      clientSecret: process.env.EMAIL_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: emailTo,
    subject: "Verification code",
    text: "Verification code is: " + code,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

/* Export */
module.exports = {
  verify,
  login,
  logout,
  refreshToken,
  createUser,
};
