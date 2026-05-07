const express = require("express");

const {
    getLiveContentByTeacher,
} = require("../controllers/live.controller");

const router = express.Router();

router.get("/:teacherId", getLiveContentByTeacher);

module.exports = router;