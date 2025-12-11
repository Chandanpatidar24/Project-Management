import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, LogOut } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const { sidebarOpen, toggleSidebar } = useUI();

    const navItems = [
        { icon: LayoutDashboard, label: 'My Projects', path: '/dashboard' },
        { icon: CheckSquare, label: 'Assigned Tasks', path: '/dashboard/assigned-tasks' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen fixed left-0 top-0 flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        ProManage
                    </h1>
                    {/* Close Button (Mobile Only) */}
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <LogOut className="w-6 h-6 rotate-180" /> {/* Reusing LogOut icon as 'Back/Close' or use X */}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/dashboard'}
                            onClick={() => window.innerWidth < 768 && toggleSidebar()} // Close on mobile navigation
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50 dark:border-gray-800 space-y-2">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition duration-200 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
