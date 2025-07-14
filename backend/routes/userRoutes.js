const { getUsers, getUserById, deleteUser } = require("../controllers/userController");
const { adminOnly, protect } = require("../middlewares/authMiddleware");

const express = require('express');
const router = express.Router();

//User Management Routes

router.get("/", protect, adminOnly, getUsers);//admin only
router.get("/:id", protect, getUserById);//get a specific user

module.exports = router;
