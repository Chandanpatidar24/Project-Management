import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Layout, Users, Shield } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
                <div className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    ProManage
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                    <Link to="/login" className="text-sm md:text-base text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
                    <Link to="/register" className="px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-32">
                <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-4 md:mb-6">
                        Manage Projects with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Unmatched Efficiency
                        </span>
                    </h1>
                    <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-10 max-w-xl md:max-w-2xl mx-auto px-2">
                        Collaborate, track, and deliver projects on time. The most intuitive project management tool designed for teams that move fast.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4 sm:px-0">
                        <Link to="/register" className="flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-full text-base md:text-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/25">
                            Start for Free <ArrowRight size={20} />
                        </Link>
                        <button className="px-6 py-3 md:px-8 md:py-4 bg-gray-100 text-gray-700 rounded-full text-base md:text-lg font-bold hover:bg-gray-200 transition">
                            Live Demo
                        </button>
                    </div>
                </div>

                {/* Background Decorative Blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob animation-delay-2000"></div>
            </header>

            {/* Features Section */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Everything you need to succeed</h2>
                        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-2">Streamline your workflow with powerful features designed for modern teams.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <FeatureCard
                            icon={<Layout className="w-8 h-8 text-blue-600" />}
                            title="Project Dashboard"
                            description="Get a bird's eye view of all your projects and deadlines in one intuitive dashboard."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-purple-600" />}
                            title="Team Collaboration"
                            description="Assign tasks to members, track progress, and work together seamlessly."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-indigo-600" />}
                            title="Secure Handling"
                            description="Your data is protected with enterprise-grade security and authentication."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-8 md:py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center text-sm md:text-base text-gray-500">
                    © 2025 ProManage. Built with MERN Stack.
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
        <div className="p-3 bg-gray-50 rounded-xl w-fit mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
