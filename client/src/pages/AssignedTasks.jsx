import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MessageSquare, CheckCircle, Search, X, User } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { getDaysLeft } from '../utils';

const AssignedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await api.get('/tasks/assigned');
                setTasks(data);
            } catch (error) {
                console.error("Failed to fetch assigned tasks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleStatusUpdate = async (e, taskId, currentStatus) => {
        e.stopPropagation(); // Prevent opening modal when clicking status button
        try {
            const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
            const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
            // Optimistic update
            setTasks(tasks.map(t => t._id === taskId ? data : t));
            if (selectedTask && selectedTask._id === taskId) {
                setSelectedTask(data);
            }
            success(`Task marked as ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status", err);
            error("Failed to update status");
        } finally { };
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assigned Tasks</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Tasks assigned to you by team members</p>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No tasks assigned to you yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => handleStatusUpdate(e, task._id, task.status)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-green-500'
                                        }`}
                                >
                                    <CheckCircle size={14} />
                                </button>
                                <div>
                                    <h3 className={`font-bold text-gray-900 dark:text-white ${task.status === 'Completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                        {task.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Project: <span className="text-blue-600 dark:text-blue-400 font-medium">{task.projectId?.title || 'Unknown Project'}</span></p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${task.status === 'Pending' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    }`}>
                                    <Clock size={14} />
                                    {task.deadline ? task.deadline.split('T')[0] : 'No Deadline'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
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

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Description</h3>
                                <p className="text-gray-600 dark:text-gray-300">{selectedTask.description}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Assignment Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Assigned By</span>
                                        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <User size={14} />
                                            {selectedTask.createdBy?.username || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Deadline</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {selectedTask.deadline ? selectedTask.deadline.split('T')[0] : 'None'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Project</span>
                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                            {selectedTask.projectId?.title || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => handleStatusUpdate(e, selectedTask._id, selectedTask.status)}
                                    className={`flex-1 py-3 rounded-xl font-bold text-white transition ${selectedTask.status === 'Pending'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-orange-500 hover:bg-orange-600'
                                        }`}
                                >
                                    {selectedTask.status === 'Pending' ? 'Mark as Completed' : 'Mark as Pending'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AssignedTasks;
