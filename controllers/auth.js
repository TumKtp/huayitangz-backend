const User = require("../models/user");
const { validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.signup = async (req, res) => {
  // Validate req.body from Auth Route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  // Create new user
  try {
    const newUser = new User(req.body);
    const user = await newUser.save();
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
    });
  } catch (e) {
    if (process.env.DEBUGMODE) console.log(e);
    return res.status(400).json({
      error: "Unable to save user in database",
    });
  }
};

exports.signin = async (req, res) => {
  // Validate req.body from Auth Route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  if (process.env.DEBUGMODE)
    console.log("Controller : SignIn " + JSON.stringify(req.body));

  //Find user with requested email
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user.autheticate(password)) {
      if (process.env.DEBUGMODE) console.log("Password Incorrect");
      throw e;
    }
    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    // Put token in cookie
    //TODO: need token in cookie or not?
    res.cookie("token", token, { expire: new Date() + 9999 });
    // Send response to front end
    const { _id, name, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  } catch (e) {
    if (process.env.DEBUGMODE) console.log(e);
    return res.status(400).json({
      error: "Email or password incorrect",
    });
  }
};

exports.signout = (_, res) => {
  console.log("Clear token from cookie");
  res.clearCookie("token");
  res.json({
    message: "User signout successfully",
  });
};

// Check token
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

// Custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};
