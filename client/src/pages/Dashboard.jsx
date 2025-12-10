import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useUI } from '../context/UIContext';
import { getDaysLeft } from '../utils';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });
    const navigate = useNavigate();
    const { searchQuery } = useUI();

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', newProject);
            setShowModal(false);
            setNewProject({ title: '', description: '', deadline: '' });
            fetchProjects(); // Refresh list
        } catch (error) {
            alert('Failed to create project');
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <Layout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your projects and tasks</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <div
                        key={project._id}
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                Active
                            </span>
                            <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                {getDaysLeft(project.deadline)}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{project.description}</p>

                        <div className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-50 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{project.deadline ? project.deadline.split('T')[0] : 'No Date'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create New Card Placeholder */}
                <button
                    onClick={() => setShowModal(true)}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition min-h-[250px]"
                >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Create new project</span>
                </button>
            </div>

            {/* Create Project Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Project</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        required
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newProject.deadline}
                                        onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                                    Create Project
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </Layout >
    );
};

export default Dashboard;
