const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, deleteProject, addMember, updateProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/:id').get(protect, getProjectById).delete(protect, deleteProject).put(protect, updateProject);
router.route('/:id/members').put(protect, addMember);

module.exports = router;

