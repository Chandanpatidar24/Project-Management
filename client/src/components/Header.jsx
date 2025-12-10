import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, User, Mail, LogOut } from 'lucide-react'; // Menu icon
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Header = () => {
    const { user, logout } = useAuth();
    const { searchQuery, setSearchQuery, toggleSidebar } = useUI();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, []);


    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.isRead) {
                await api.put(`/notifications/${notif._id}/read`);
                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            setShowNotifications(false);

            if (notif.type === 'INVITE') {
                navigate(`/projects/${notif.relatedId}`);
            } else if (notif.type === 'ASSIGNMENT' || notif.type === 'COMMENT') {
                navigate('/dashboard/assigned-tasks');
            }
        } catch (error) {
            console.error("Failed to handle notification", error);
        }
    };

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 fixed top-0 left-0 right-0 z-20">
            {/* Left logic: Logo or Toggle + Search */}
            <div className="flex items-center gap-6">
                <div className="w-64 flex-shrink-0 flex items-center gap-2">
                    <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-xl text-blue-600 hidden md:block">ProManage</span>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-full w-96">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects or tasks..."
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-400 hover:text-gray-600 transition"
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">{unreadCount} New</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500 text-sm">No notifications yet</p>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif._id}
                                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <p className="text-sm text-gray-800 line-clamp-2">{notif.message}</p>
                                            <span className="text-xs text-gray-400 mt-1 block">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100 relative" ref={profileRef}>
                    <div className="text-right hidden md:block cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
                        <p className="text-sm font-bold text-gray-900">{user?.username || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'No Email'}</p>
                    </div>
                    <div
                        className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        {user?.username ? user.username[0].toUpperCase() : 'G'}
                    </div>

                    {/* Profile Popup */}
                    {showProfile && (
                        <div className="absolute right-0 top-12 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-4">
                            <div className="flex flex-col items-center mb-4 border-b border-gray-50 pb-4">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                                    {user?.username ? user.username[0].toUpperCase() : 'G'}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{user?.username || 'Guest'}</h3>
                                <p className="text-sm text-gray-500">{user?.email || 'No Email'}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-gray-600 text-sm">
                                    <User size={16} />
                                    <span>Profile</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-gray-600 text-sm">
                                    <Mail size={16} />
                                    <span>{user?.email}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-red-50 text-red-600 rounded-lg text-sm mt-2 font-medium"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
