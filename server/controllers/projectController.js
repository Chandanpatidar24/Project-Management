const Project = require('../models/projectModel');
const User = require('../models/userModel');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const { title, description, deadline } = req.body;

    if (!title || !description || !deadline) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    const project = await Project.create({
        title,
        description,
        deadline,
        createdBy: req.user._id,
        members: [{ user: req.user._id, role: 'Admin' }] // Owner is automatically an Admin member
    });

    res.status(201).json(project);
};

// @desc    Get all projects user is part of (Owner or Member)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    // Find projects where createdBy is user OR members array contains user
    const projects = await Project.find({
        $or: [
            { createdBy: req.user._id },
            { 'members.user': req.user._id }
        ]
    }).populate('members.user', 'username email'); // Populate member details for display

    res.json(projects);
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('members.user', 'username email')
        .populate('createdBy', 'username email');

    if (project) {
        // Check if user is authorized (Owner or Member)
        const isMember = project.members.some(member => member.user._id.toString() === req.user._id.toString());
        const isOwner = project.createdBy._id.toString() === req.user._id.toString();

        if (isMember || isOwner) {
            res.json(project);
        } else {
            res.status(401).json({ message: 'Not authorized to view this project' });
        }
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        // Check if user is owner
        if (project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner only)
const updateProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        if (project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.deadline = req.body.deadline || project.deadline;

        const updatedProject = await project.save();
        res.json(updatedProject);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Add member to project
// @route   PUT /api/projects/:id/members
// @access  Private (Admin/Owner only)
const addMember = async (req, res) => {
    const { email } = req.body; // Can be email or username
    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions (Owner or Admin role in members)
    const requestor = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (project.createdBy.toString() !== req.user._id.toString() && (!requestor || requestor.role !== 'Admin')) {
        return res.status(401).json({ message: 'Not authorized to add members' });
    }

    const userToAdd = await User.findOne({
        $or: [{ email: email }, { username: email }]
    });
    if (!userToAdd) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if already member
    if (project.members.some(m => m.user.toString() === userToAdd._id.toString())) {
        return res.status(400).json({ message: 'User is already a member' });
    }

    const Notification = require('../models/notificationModel');

    project.members.push({ user: userToAdd._id, role: 'Member' });
    await project.save();

    // Create Notification
    await Notification.create({
        recipient: userToAdd._id,
        sender: req.user._id,
        type: 'INVITE',
        message: `You have been added to project "${project.title}"`,
        relatedId: project._id,
    });

    // Populate and return updated project
    const updatedProject = await Project.findById(req.params.id).populate('members.user', 'username email');
    res.json(updatedProject);
};

module.exports = { createProject, getProjects, getProjectById, deleteProject, addMember, updateProject };
