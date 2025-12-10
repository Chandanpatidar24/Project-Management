import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUI } from '../context/UIContext';

const Layout = ({ children }) => {
    const { sidebarOpen } = useUI();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            <Sidebar />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Header />
                <main className="pt-24 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
