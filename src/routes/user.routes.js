const express = require("express");

const { createUser } = require("../controllers/user.controller.js");

const router = express.Router();

router.post("/create", createUser);

module.exports = router;


