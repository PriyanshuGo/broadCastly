const User = require("../models/user.model");
const Role = require("../models/role.model");

const createUser = async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    const role = await Role.findOne({ name: roleName });

    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role._id,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createUser };
