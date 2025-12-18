import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { PlusCircle, X, Shield, ShieldAlert, Eye, MoreHorizontal, Mail, Search } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onInviteUser: (email: string, role: UserRole) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onInviteUser }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.ANALYST);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    onInviteUser(newUserEmail, newUserRole);
    setShowInviteModal(false);
    setNewUserEmail('');
    setNewUserRole(UserRole.ANALYST);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
        case UserRole.ADMIN:
            return <span className="flex items-center gap-1 bg-purple-100/50 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold border border-purple-200"><Shield size={12} /> Admin</span>;
        case UserRole.ANALYST:
            return <span className="flex items-center gap-1 bg-blue-100/50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-200"><ShieldAlert size={12} /> Analyst</span>;
        case UserRole.VIEWER:
            return <span className="flex items-center gap-1 bg-gray-100/50 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold border border-gray-200"><Eye size={12} /> Viewer</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Team Management</h1>
                <p className="text-gray-500 font-medium">Manage access and roles for your organization.</p>
            </div>
            {currentUser.role === UserRole.ADMIN && (
                <button 
                    onClick={() => setShowInviteModal(true)}
                    className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-gray-900/10 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                    <PlusCircle size={18} /> Invite Member
                </button>
            )}
        </div>

        {/* Search Bar */}
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
            </div>
            <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl pl-12 pr-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-glass"
            />
        </div>

        {/* Users Table */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-glass overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-gray-400 font-bold uppercase bg-white/20 tracking-wider border-b border-white/40">
                        <tr>
                            <th className="px-8 py-5">User</th>
                            <th className="px-8 py-5">Role</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/40 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full bg-white shadow-sm" />
                                        <div>
                                            <div className="font-bold text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        user.status === 'Active' ? 'bg-green-100/50 text-green-700' : 'bg-amber-100/50 text-amber-700'
                                    }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}></div>
                <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/60 ring-1 ring-white/50 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
                        <button onClick={() => setShowInviteModal(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleInvite} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    required 
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full bg-white/50 border border-white/50 rounded-xl pl-12 pr-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner"
                                    placeholder="colleague@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Role</label>
                            <div className="relative">
                                <select 
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                                    className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner appearance-none"
                                >
                                    <option value={UserRole.ADMIN}>Admin (Full Access)</option>
                                    <option value={UserRole.ANALYST}>Analyst (Edit Data)</option>
                                    <option value={UserRole.VIEWER}>Viewer (Read Only)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                             <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-white/50 rounded-xl transition-colors">Cancel</button>
                             <button type="submit" className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-600/20 transition-all">Send Invite</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};