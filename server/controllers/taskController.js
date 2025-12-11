const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Owner only)
const createTask = async (req, res) => {
    const { title, description, deadline, projectId, assignedToEmail } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can create tasks
    if (project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    let assignedToIds = [];
    if (assignedToEmail) {
        // Split by comma and trim to handle multiple inputs usually sent as string "user1, user2"
        const emailsOrUsernames = assignedToEmail.split(',').map(e => e.trim());

        for (const identifier of emailsOrUsernames) {
            if (!identifier) continue;

            // Try finding by email first
            let userToAssign = await User.findOne({ email: identifier });

            // If not found, try finding by username
            if (!userToAssign) {
                userToAssign = await User.findOne({ username: identifier });
            }

            if (userToAssign) {
                assignedToIds.push(userToAssign._id);

                // Auto-add to project members if not already
                const isMember = project.members.some(m => m.user.toString() === userToAssign._id.toString());
                if (!isMember) {
                    project.members.push({ user: userToAssign._id, role: 'Member' });
                    // Notify about Project Invite
                    await Notification.create({
                        recipient: userToAssign._id,
                        sender: req.user._id,
                        type: 'INVITE',
                        message: `You have been added to project "${project.title}"`,
                        relatedId: project._id,
                    });
                }
            }
        }
        if (assignedToIds.length > 0) await project.save();
    }

    const task = await Task.create({
        title,
        description,
        deadline,
        projectId,
        createdBy: req.user._id,
        assignedTo: assignedToIds,
    });

    // Notify all assignees
    if (assignedToIds.length > 0) {
        for (const recipientId of assignedToIds) {
            await Notification.create({
                recipient: recipientId,
                sender: req.user._id,
                type: 'ASSIGNMENT',
                message: `You have been assigned to task "${task.title}"`,
                relatedId: task._id,
            });
        }
    }

    res.status(201).json(task);
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Owner only)
const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    // Only owner can delete
    if (task.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addTaskComment = async (req, res) => {
    const { text } = req.body;
    const task = await Task.findById(req.params.id).populate('projectId');

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is member of project
    const project = task.projectId;
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    const isOwner = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const comment = {
        text,
        user: req.user._id,
        createdAt: new Date(),
    };

    task.comments.push(comment);
    await task.save();

    let recipient = null;
    if (req.user._id.toString() === project.createdBy.toString()) {
        // Sender is Owner, notify Assignee if exists
        if (task.assignedTo) recipient = task.assignedTo;
    } else {
        // Sender is NOT Owner, notify Owner
        recipient = project.createdBy;
    }

    if (recipient && recipient.toString() !== req.user._id.toString()) {
        await Notification.create({
            recipient,
            sender: req.user._id,
            type: 'COMMENT',
            message: `New comment on task "${task.title}"`,
            relatedId: task._id,
        });
    }

    res.status(201).json(task);
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private (Owner or Assigned Member)
const getTasksByProject = async (req, res) => {
    const tasks = await Task.find({ projectId: req.params.projectId })
        .populate('assignedTo', 'username email')
        .populate('comments.user', 'username');
    res.json(tasks);
};

// @desc    Get tasks assigned to logged in user
// @route   GET /api/tasks/assigned
// @access  Private
const getAssignedTasks = async (req, res) => {
    const tasks = await Task.find({ assignedTo: req.user._id })
        .populate('projectId', 'title')
        .populate('createdBy', 'username email'); // Populate creator info
    res.json(tasks);
};

// @desc    Update task status or deadline
// @route   PUT /api/tasks/:id
// @access  Private (Owner or Assigned Member)
const updateTaskStatus = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    // Check permission: Owner or Assigned User
    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.some(id => id.toString() === req.user._id.toString());

    if (!isOwner && !isAssigned) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // Owner can update everything (via details page), Assigned can only update Status
    if (isOwner) {
        if (req.body.status) task.status = req.body.status;
        if (req.body.deadline !== undefined) task.deadline = req.body.deadline;
        if (req.body.title) task.title = req.body.title;
        if (req.body.description) task.description = req.body.description;



    } else {
        task.status = req.body.status || task.status;
    }

    await task.save();

    // Populate before returning for UI updates
    const updatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'username email')
        .populate('comments.user', 'username');

    res.json(updatedTask);
};



module.exports = { createTask, getTasksByProject, getAssignedTasks, updateTaskStatus, addTaskComment, deleteTask };
