const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });

// Models
const User = require("../models/user");

// Function to check if username and password are valid.
const checkCredsValidity = (username, password) => {
  const usernameRegex = /^[a-zA-Z0-9]{6,16}$/;
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  const result = {
    valid: true,
    msg: "",
  };

  if (!usernameRegex.test(username)) {
    result["valid"] = false;
    result["msg"] = "Invalid Username.";
    return result;
  }
  if (!passwordRegex.test(password)) {
    result["valid"] = false;
    result["msg"] = "Invalid Password";
    return result;
  }
  return result;
};

/*
  API: Register - /api/user/register
  DESC: API to register a new user.
*/
exports.register = (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Check if creds are entered
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ msg: "Please enter all the fields." });
  }

  // Check if creds are valid
  const checkValidity = checkCredsValidity(username, password);
  if (!checkValidity.valid) {
    return res.status(400).json({ msg: checkValidity.msg });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords didn't match." });
  }

  User.findOne({ username })
    .then((user) => {
      // Check if user already exists
      if (user) {
        return res.status(400).json({ msg: "User already exists." });
      }

      // Create new user
      const newUser = new User({
        username,
        password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) return err;
          newUser.password = hash;
          newUser.save().then((user) => {
            res
              .status(200)
              .json({ msg: `${user.username} registered successfully.` });
          });
        });
      });
    })
    .catch(() => res.status(400).json({ msg: "Something went wrong." }));
};

/*
  API: Register - /api/user/login
  DESC: API to login a user.
*/
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Check if creds are entered
  if (!username || !password) {
    return res.status(400).json({ msg: "Please enter all the fields." });
  }

  // Check if Creds are valid
  const checkValidity = checkCredsValidity(username, password);
  if (!checkValidity.valid) {
    return res.status(400).msg({ msg: checkValidity.msg });
  }

  User.findOne({ username }).then((user) => {
    // Check if user does not exist
    if (!user) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    // Compare password
    bcrypt
      .compare(password, user.password)
      .then((isMatch) => {
        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid credentials." });
        }

        jwt.sign({ id: user.id }, process.env.JWT_SECRET, (err, token) => {
          if (err) throw err;
          return res.status(200).json({ token, username: user.username });
        });
      })
      .catch(() => res.status(400).json("Something went wrong."));
  });
};
