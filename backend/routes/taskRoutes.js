const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist } = require("../controllers/taskController");

const router = express.Router();

//Task Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks);//Get all tasks (Admin: alll, User: assigned)
router.get("/:id", protect, getTaskById);//Get task by id 
router.post("/", protect, createTask);//Create a task (Admin only)
router.put("/:id", protect, updateTask);//Update task details
router.delete("/:id", protect, deleteTask);// Deleting task (Admin only)
router.put("/:id/status", protect, updateTaskStatus);// update Task Status
router.put("/:id/todo", protect, updateTaskChecklist);//update Task Checklist 

module.exports = router;
