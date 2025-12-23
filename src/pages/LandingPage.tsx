import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Terminal, Globe, ArrowRight, Cpu, Layers, Server, Database, Box } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
    const { currentUser } = useAuth();

    React.useEffect(() => {
        document.title = "Spectra - Advanced Cloud-Native Pentesting Environment";
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/30 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-indigo-900/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 font-sans">
                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight flex items-center gap-1">Spectra <span className="text-lg">✨</span></span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
                        <a href="https://github.com/NishithP2004/spectra" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <Link to="/dashboard" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center">
                                Go to Dashboard
                                <ArrowRight className="ml-1.5 w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                    Log in
                                </Link>
                                <Link to="/login" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-all transform hover:scale-105">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                    <div className="inline-flex items-center px-3 py-1 mb-8 rounded-full bg-white/5 border border-white/10 text-sm text-blue-400 animate-fadeIn backdrop-blur-md">
                        <span className="flex w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                        Orchestrate Intelligent Agents
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
                        Complete Pentesting <br />
                        <span className="text-gradient animate-text-glow">Cloud Environment</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
                        Advanced cloud-native pentesting environment with access to powerful tools bundled into one.
                        Instant access to a fully equipped security toolkit.
                    </p>

                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                        <Link to={currentUser ? "/dashboard" : "/login"} className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 flex items-center group">
                            {currentUser ? "Go to Dashboard" : "Start Orchestrating"}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <a href="https://github.com/NishithP2004/spectra" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-full text-white font-medium hover:bg-white/10 transition-all backdrop-blur-md">
                            View Documentation
                        </a>
                    </div>
                </header>

                {/* Features Grid */}
                <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Powering the Next Gen of AI</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Built on a microservices architecture to provide robust tools for your agents.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Globe className="w-6 h-6 text-blue-400" />}
                            title="Browser Environment"
                            description="Isolated Chrome sessions with noVNC access, automated via Playwright."
                            delay="0"
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-red-400" />}
                            title="Pentesting Toolkit"
                            description="Full Kali Linux suite (Nmap, SQLMap) accessible via specialized MCP interfaces."
                            delay="100"
                        />
                        <FeatureCard
                            icon={<Terminal className="w-6 h-6 text-green-400" />}
                            title="CyberChef Integration"
                            description="Automated data manipulation and decoding tools exposed directly to agents."
                            delay="200"
                        />
                        <FeatureCard
                            icon={<Cpu className="w-6 h-6 text-purple-400" />}
                            title="Agent Orchestration"
                            description="Hierarchical planner and worker agents (Clicker, CyberChef) for complex tasks."
                            delay="300"
                        />
                        <FeatureCard
                            icon={<Server className="w-6 h-6 text-yellow-400" />}
                            title="Kubernetes Ready"
                            description="Dynamic pod provisioning for scalable, multi-user session management."
                            delay="400"
                        />
                        <FeatureCard
                            icon={<Layers className="w-6 h-6 text-pink-400" />}
                            title="MCP Support"
                            description="Standardized communication via the Model Context Protocol for all tools."
                            delay="500"
                        />
                    </div>
                </section>

                {/* Architecture Section */}
                <section id="architecture" className="py-24 px-4 bg-white/2">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
                            <h2 className="text-3xl font-bold mb-6">Designed for Scale & Security</h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Whether running locally with Docker Compose or scaling on Kubernetes, Spectra ensures complete isolation.
                                The central Router manages user sessions, spinning up dedicated pods containing the Agent, Browser, and Tooling services on demand.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center text-gray-300">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                                    Dynamic Pod Provisioning
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                                    Firebase Authentication
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                                    Redis Session State
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2">
                            <div className="relative glass-card p-10 aspect-video flex items-center justify-center overflow-hidden group hover:bg-white/10 transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                                {/* Connecting Lines (Animated) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50">
                                    {/* Router to Pod */}
                                    <path
                                        d="M140 100 L140 160 L280 160 L280 200"
                                        fill="none"
                                        stroke="url(#gradient-line)"
                                        strokeWidth="2"
                                        className="animate-pulse"
                                        style={{ strokeDasharray: '5,5' }}
                                    />
                                    {/* Router to Redis */}
                                    <line
                                        x1="18%"
                                        y1="22%"
                                        x2="82%"
                                        y2="22%"
                                        stroke="rgba(16, 185, 129, 0.4)"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        className="animate-pulse"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                                            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.5)" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <div className="relative z-10 w-full h-full flex flex-col justify-between py-4">
                                    {/* Top Layer: Router & Redis */}
                                    <div className="flex justify-between items-start px-8">
                                        {/* Router Service */}
                                        <div className="flex flex-col items-center group/item">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/item:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                                <Server className="w-8 h-8 text-white" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-300 tracking-wider">ROUTER</span>
                                        </div>

                                        {/* Redis Service */}
                                        <div className="flex flex-col items-center group/item mt-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-500/20 mb-2 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/item:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                                <Database className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-green-300 tracking-wider">REDIS</span>
                                        </div>
                                    </div>

                                    {/* Bottom Layer: Namespace & Pod Details */}
                                    <div className="mx-4 mt-6">
                                        {/* Namespace Container */}
                                        <div className="relative rounded-xl border-2 border-dashed border-blue-500/20 bg-blue-900/5 p-4 pt-6 transition-all hover:border-blue-500/40 group/ns">
                                            <div className="absolute -top-3 left-4 px-2 bg-[#0a0a0a] text-[10px] text-blue-400 font-mono flex items-center gap-1.5 border border-blue-900/30 rounded-full">
                                                <Layers className="w-3 h-3" />
                                                namespace: user-[id]
                                            </div>

                                            {/* Pod Container */}
                                            <div className="relative rounded-lg border border-purple-500/30 bg-purple-900/10 p-3 transition-all hover:bg-purple-900/20 hover:border-purple-500/50">
                                                <div className="absolute -top-2.5 right-4 px-2 bg-[#0a0a0a] text-[9px] text-purple-300 font-mono border border-purple-900/30 rounded-full flex items-center gap-1">
                                                    <Box className="w-3 h-3" />
                                                    pod: spectra-session
                                                </div>

                                                <div className="grid grid-cols-3 gap-3 mt-1">
                                                    {/* Agent Service */}
                                                    <div className="bg-gray-900/90 p-2.5 rounded border border-gray-700 flex flex-col items-center hover:border-red-500/50 transition-colors">
                                                        <Cpu className="w-4 h-4 text-red-400 mb-1.5" />
                                                        <span className="text-[9px] text-gray-300">Agent</span>
                                                    </div>

                                                    {/* Browser Service */}
                                                    <div className="bg-gray-900/90 p-2.5 rounded border border-gray-700 flex flex-col items-center hover:border-blue-500/50 transition-colors">
                                                        <Globe className="w-4 h-4 text-blue-400 mb-1.5" />
                                                        <span className="text-[9px] text-gray-300">Browser</span>
                                                    </div>

                                                    {/* Tooling Service */}
                                                    <div className="bg-gray-900/90 p-2.5 rounded border border-gray-700 flex flex-col items-center hover:border-yellow-500/50 transition-colors">
                                                        <Terminal className="w-4 h-4 text-yellow-400 mb-1.5" />
                                                        <span className="text-[9px] text-gray-300">Tools</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Spectra Platform. Open source on GitHub.</p>
                </footer>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) => (
    <div
        className="p-6 p-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300 animate-fadeIn backdrop-blur-lg"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="mb-4 p-3 bg-white/5 rounded-lg inline-block text-white">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">
            {description}
        </p>
    </div>
);

export default LandingPage;
