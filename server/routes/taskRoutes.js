const express = require('express');
const router = express.Router();
const { createTask, getTasksByProject, getAssignedTasks, updateTaskStatus, addTaskComment, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/assigned', protect, getAssignedTasks);
router.get('/project/:projectId', protect, getTasksByProject);
router.put('/:id', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);
router.post('/:id/comments', protect, addTaskComment);

module.exports = router;
