const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
    deadline: {
        type: String, // Or Date
        required: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // Project Owner
        required: true,
        ref: 'User',
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId, // Assigned Collaborators
        ref: 'User',
    }],
    comments: [{
        text: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }],
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
