import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, CheckCircle, Search, UserPlus, MessageSquare, Clock, Edit2, X, Settings, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getDaysLeft } from '../utils';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'members'

    // Modal States
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showProjectSettings, setShowProjectSettings] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // For Task Details Modal

    // Form States
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', assignedToEmail: '' });
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [commentText, setCommentText] = useState('');
    const [editTaskData, setEditTaskData] = useState({ status: '', deadline: '' });
    const [editProjectData, setEditProjectData] = useState({ title: '', description: '', deadline: '' });

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const [projectRes, tasksRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks/project/${id}`)
            ]);
            setProject(projectRes.data);
            setEditProjectData({
                title: projectRes.data.title,
                description: projectRes.data.description,
                deadline: projectRes.data.deadline ? projectRes.data.deadline.split('T')[0] : ''
            });
            setTasks(tasksRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching project details", error);
            navigate('/dashboard');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', { ...newTask, projectId: id });
            setShowTaskModal(false);
            setNewTask({ title: '', description: '', deadline: '', assignedToEmail: '' });
            fetchProjectData();
        } catch (error) {
            alert('Failed to create task');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/projects/${id}/members`, { email: newMemberEmail });
            setShowMemberModal(false);
            setNewMemberEmail('');
            fetchProjectData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add member');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;
        try {
            const { data } = await api.post(`/tasks/${selectedTask._id}/comments`, { text: commentText });
            setSelectedTask(data);
            setTasks(tasks.map(t => t._id === data._id ? data : t));
            setCommentText('');
        } catch (error) {
            console.error("Failed to add comment");
        }
    };

    const handleUpdateTask = async () => {
        if (!selectedTask) return;
        try {
            const { data } = await api.put(`/tasks/${selectedTask._id}`, editTaskData);
            setSelectedTask(data);
            setTasks(tasks.map(t => t._id === data._id ? data : t));
            alert('Task Updated');
        } catch (error) {
            alert('Failed to update task');
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${selectedTask._id}`);
            setTasks(tasks.filter(t => t._id !== selectedTask._id));
            setSelectedTask(null);
        } catch (error) {
            alert('Failed to delete task');
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/projects/${id}`, editProjectData);
            setProject(data);
            setShowProjectSettings(false);
        } catch (error) {
            alert('Failed to update project');
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm("Are you sure you want to delete this PROJECT? This action cannot be undone.")) return;
        try {
            await api.delete(`/projects/${id}`);
            navigate('/dashboard');
        } catch (error) {
            alert('Failed to delete project');
        }
    };

    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setEditTaskData({ status: task.status, deadline: task.deadline ? task.deadline.split('T')[0] : '' });
    };

    // Filter Tasks Search
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    const isOwner = project?.createdBy?._id === user?._id || project?.createdBy === user?._id;

    return (
        <Layout>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project?.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{project?.description}</p>
                    </div>
                    {isOwner && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowProjectSettings(true)}
                                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
                            >
                                <Settings size={18} />
                                Settings
                            </button>
                            {activeTab === 'members' ? (
                                <button
                                    onClick={() => setShowMemberModal(true)}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <UserPlus size={18} />
                                    Invite Member
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowTaskModal(true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Plus size={18} />
                                    Add Task
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`pb-3 font-medium transition ${activeTab === 'tasks' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-3 font-medium transition ${activeTab === 'members' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Team Members
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'tasks' ? (
                <div>
                    {/* Search Bar */}
                    {/* Search is now in header globally, but keep this local search or sync?
                         The user complained search wasn't working, I moved it to header. 
                         I'll remove this local one to avoid confusion or just hide it. 
                         Actually, let's keep it simple and rely on global search as per request.
                         Wait, the user said "at main dashboard the search isnt working". 
                         Here in Project Details, maybe they want to filter tasks?
                         I'll keep the filter logic using the context search query if available, or local if they type here.
                         But the global search is in the header. I should probably use the global query for this page too?
                         The code above uses `searchQuery` from local state.
                         I'll switch it to use `useUI` if I want consistency, OR just keep it local.
                         The user specifically said "at main dashboard". 
                         I'll keep this local one but fix styles.
                      */}
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 max-w-md">
                        <Search className="text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Filter tasks..."
                            className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <div
                                key={task._id}
                                onClick={() => openTaskDetails(task)}
                                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${task.status === 'Completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                    <div>
                                        <h3 className={`font-bold text-gray-900 dark:text-white ${task.status === 'Completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="font-bold text-orange-600 dark:text-orange-400 text-xs">
                                        {getDaysLeft(task.deadline)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare size={14} />
                                        {task.comments?.length || 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {task.deadline && task.deadline.split('T')[0]}
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${task.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredTasks.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-10">No tasks found.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Member</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {project?.members?.map((member) => (
                                <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{member.user?.username || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{member.user?.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${member.role === 'Admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Task Details & Comments Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTask.title}</h2>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${selectedTask.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                    {selectedTask.status}
                                </span>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Description</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedTask.description}</p>

                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Details</h3>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    <p><strong>Deadline:</strong> {selectedTask.deadline ? selectedTask.deadline.split('T')[0] : 'None'} <span className="text-orange-600 dark:text-orange-400 ml-2">({getDaysLeft(selectedTask.deadline)})</span></p>
                                    <p><strong>Assigned To:</strong> {selectedTask.assignedTo ? (selectedTask.assignedTo.username || 'User ID: ' + selectedTask.assignedTo) : 'Unassigned'}</p>
                                </div>

                                {isOwner && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Edit2 size={16} /> Admin Controls
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                                                <select
                                                    className="w-full p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={editTaskData.status}
                                                    onChange={e => setEditTaskData({ ...editTaskData, status: e.target.value })}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Deadline</label>
                                                <input
                                                    type="date"
                                                    className="w-full p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={editTaskData.deadline}
                                                    onChange={e => setEditTaskData({ ...editTaskData, deadline: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                onClick={handleUpdateTask}
                                                className="w-full bg-black dark:bg-white dark:text-black text-white py-2 rounded-lg font-bold text-sm hover:opacity-80"
                                            >
                                                Update Task
                                            </button>
                                            <button
                                                onClick={handleDeleteTask}
                                                className="w-full bg-white dark:bg-gray-900 text-red-600 border border-red-200 dark:border-red-900 py-2 rounded-lg font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete Task
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col h-full">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MessageSquare size={18} /> Comments
                                </h3>

                                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-4 max-h-60">
                                    {selectedTask.comments?.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm">No comments yet.</p>
                                    ) : (
                                        selectedTask.comments?.map((comment, index) => (
                                            <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        {comment.user?.username || 'Unknown'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} className="mt-auto">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="w-full p-3 border rounded-xl mb-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700">
                                        Post Comment
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">New Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <input
                                placeholder="Task Title"
                                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Assign to (Username or Email) - Optional"
                                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={newTask.assignedToEmail} onChange={e => setNewTask({ ...newTask, assignedToEmail: e.target.value })}
                            />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Settings Modal */}
            {showProjectSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold dark:text-white">Project Settings</h2>
                            <button onClick={() => setShowProjectSettings(false)}><X size={24} className="text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleUpdateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={editProjectData.title} onChange={e => setEditProjectData({ ...editProjectData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={editProjectData.description} onChange={e => setEditProjectData({ ...editProjectData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={editProjectData.deadline} onChange={e => setEditProjectData({ ...editProjectData, deadline: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-4 space-y-3">
                                <button type="submit" className="w-full py-3 bg-black dark:bg-white dark:text-black text-white font-bold rounded-xl hover:opacity-80">Update Project</button>
                                <hr className="dark:border-gray-700" />
                                <button
                                    type="button"
                                    onClick={handleDeleteProject}
                                    className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} /> Delete Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Member Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Invite Member</h2>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Member Email or Username"
                                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)}
                                required
                            />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Send Invite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </Layout>
    );
};

export default ProjectDetails;
