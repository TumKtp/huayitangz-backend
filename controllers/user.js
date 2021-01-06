const User = require("../models/user");
const Order = require("../models/order");

// Params Extractor
exports.getUserById = async (req, res, next, id) => {
  try {
    const foundUser = await User.findById(id);
    req.profile = foundUser;
    // Hide crucial information before sending to other middlewares
    req.profile.salt = undefined;
    req.profile.encry_password = undefined;
    //console.log("USERID PARAMS: " + foundUser);
    next();
  } catch (e) {
    return res.status(400).json({
      error: "No user was found in DB",
    });
  }
};

exports.getUser = (req, res) => {
  return res.json(req.profile);
};

exports.getAllUsers = async (req, res) => {
  const foundUsers = await User.find();
  return res.json(foundUsers);
};

// exports.updateUser = (req, res) => {
//   User.findByIdAndUpdate(
//     { _id: req.profile._id },
//     { $set: req.body },
//     { new: true, useFindAndModify: false },
//     (err, user) => {
//       if (err) {
//         return res.status(400).json({
//           error: "You are not authorized to update this user",
//         });
//       }
//       user.salt = undefined;
//       user.encry_password = undefined;
//       res.json(user);
//     }
//   );
// };

exports.userPurchaseList = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.profile._id }).populate(
      "user",
      "_id name"
    );
    console.log("Controller : " + JSON.stringify(orders));
    return res.json(orders);
  } catch (e) {
    return res.status(400).json({
      error: "No Order in this account",
    });
  }
};
