import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, NewProjectData, MetricData, UserRole } from './types';
import { Dashboard } from './components/Dashboard';
import { ProjectDetail } from './components/ProjectDetail';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { Settings } from './components/Settings';
import { AuthProvider, useAuthContext } from './providers/AuthProvider';
import { useProjects } from './hooks/useProjects';
import { userService } from './services/userService';
import { Layers, X, Users as UsersIcon, LogOut, LayoutDashboard, Settings as SettingsIcon, Loader2 } from 'lucide-react';

type ViewMode = 'DASHBOARD' | 'TEAM' | 'SETTINGS';

// Main App Content (inside AuthProvider)
const AppContent: React.FC = () => {
  const { user: currentUser, loading: authLoading, signOut } = useAuthContext();
  const { projects, loading: projectsLoading, addProject, updateStatus, addMetric, analyzeAndSave, refresh } = useProjects();

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('DASHBOARD');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // UI State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // New Project Form State
  const [newProject, setNewProject] = useState<NewProjectData>({ name: '', description: '', category: '' });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Load users when authenticated
  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // --- Handlers ---

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentView('DASHBOARD');
      setSelectedProjectId(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleInviteUser = async (email: string, role: UserRole) => {
    if (!currentUser) return;
    try {
      await userService.inviteUser(email, role, currentUser.id);
      // Reload users to show the pending invitation
      await loadUsers();
    } catch (err) {
      console.error('Error inviting user:', err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await addProject(newProject, currentUser.id);
      setShowNewProjectModal(false);
      setNewProject({ name: '', description: '', category: '' });
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleAddMetric = async (projectId: string, metric: MetricData) => {
    if (currentUser?.role === UserRole.VIEWER) return;
    try {
      await addMetric(projectId, metric);
    } catch (err) {
      console.error('Error adding metric:', err);
    }
  };

  const handleChangeStatus = async (projectId: string, status: ProjectStatus) => {
    if (currentUser?.role !== UserRole.ADMIN) return;
    try {
      await updateStatus(projectId, status);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAnalyze = async (project: Project) => {
    setAnalyzingId(project.id);
    try {
      await analyzeAndSave(project);
    } catch (err) {
      console.error('Error analyzing project:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleImportProjects = async (importedProjects: Project[]) => {
    // For now, just refresh from the database
    // In a real implementation, you would upload the imported projects
    await refresh();
  };

  // --- Loading State ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // --- Auth Check ---
  if (!currentUser) {
    return <Login />;
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen pb-20 relative">
        {/* Navigation - Glass Effect */}
        <nav className="sticky top-0 z-40 w-full transition-all duration-300">
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSelectedProjectId(null); setCurrentView('DASHBOARD'); }}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-emerald-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform duration-300">
                        <Layers size={22} />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-gray-800">Validator<span className="text-brand-600">.ai</span></span>
                </div>

                <div className="flex items-center gap-6">
                    {/* Menu Links */}
                    <div className="hidden md:flex items-center gap-1 bg-white/40 p-1 rounded-full border border-white/50">
                        <button
                            onClick={() => { setCurrentView('DASHBOARD'); setSelectedProjectId(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentView === 'DASHBOARD' && !selectedProjectId ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button
                            onClick={() => { setCurrentView('TEAM'); setSelectedProjectId(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentView === 'TEAM' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <UsersIcon size={16} /> Team
                        </button>
                        <button
                            onClick={() => { setCurrentView('SETTINGS'); setSelectedProjectId(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentView === 'SETTINGS' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <SettingsIcon size={16} /> Data
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200/50">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 leading-none">{currentUser.name}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-1">{currentUser.role}</p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <img
                                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                                alt={currentUser.name}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                            <button
                                onClick={handleLogout}
                                className="absolute -bottom-1 -right-1 bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                title="Logout"
                            >
                                <LogOut size={10} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
            {projectsLoading && !projects.length ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
            ) : selectedProjectId ? (
                <ProjectDetail
                    project={selectedProject!}
                    onBack={() => setSelectedProjectId(null)}
                    onAddMetric={handleAddMetric}
                    onChangeStatus={handleChangeStatus}
                />
            ) : currentView === 'TEAM' ? (
                <UserManagement
                    users={users}
                    currentUser={currentUser}
                    onInviteUser={handleInviteUser}
                />
            ) : currentView === 'SETTINGS' ? (
                <Settings
                    projects={projects}
                    onImport={handleImportProjects}
                />
            ) : (
                <Dashboard
                    projects={projects}
                    onSelectProject={(p) => setSelectedProjectId(p.id)}
                    onAddProject={() => setShowNewProjectModal(true)}
                    onAnalyzeProject={handleAnalyze}
                    analyzingId={analyzingId}
                />
            )}
        </main>

        {/* New Project Modal - Liquid Glass */}
        {showNewProjectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowNewProjectModal(false)}></div>
                <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 w-full max-w-lg shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] border border-white/60 ring-1 ring-white/50 animate-fade-in-up">
                    <button
                        onClick={() => setShowNewProjectModal(false)}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Launch New MVP</h2>
                    <p className="text-gray-500 mb-8 font-medium">Define the hypothesis you want to validate.</p>

                    <form onSubmit={handleAddProject} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 ml-1">Project Name</label>
                            <input
                                required
                                className="w-full bg-white/50 border border-white/50 focus:border-brand-500/50 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-inner font-medium"
                                placeholder="e.g. Uber for Dog Walkers"
                                value={newProject.name}
                                onChange={e => setNewProject({...newProject, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 ml-1">Category</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white/50 border border-white/50 focus:border-brand-500/50 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-inner font-medium appearance-none"
                                    value={newProject.category}
                                    onChange={e => setNewProject({...newProject, category: e.target.value})}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="SaaS">SaaS</option>
                                    <option value="E-commerce">E-commerce</option>
                                    <option value="Marketplace">Marketplace</option>
                                    <option value="Fintech">Fintech</option>
                                    <option value="Service">Service</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 ml-1">Value Proposition (Description)</label>
                            <textarea
                                required
                                className="w-full bg-white/50 border border-white/50 focus:border-brand-500/50 rounded-2xl px-5 py-3 h-32 focus:ring-4 focus:ring-brand-500/10 focus:outline-none resize-none transition-all shadow-inner font-medium"
                                placeholder="What problem are you solving? How does it work?"
                                value={newProject.description}
                                onChange={e => setNewProject({...newProject, description: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowNewProjectModal(false)}
                                className="flex-1 py-3.5 text-gray-600 font-bold hover:bg-white/50 rounded-2xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold rounded-2xl shadow-lg shadow-gray-900/20 transform transition-all active:scale-[0.98]"
                            >
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

// App wrapper with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
