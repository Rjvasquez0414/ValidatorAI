import React, { useState } from 'react';
import { Layers, ArrowRight, Lock, Mail } from 'lucide-react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9275 23.766 12.2764Z" fill="#4285F4"/>
        <path d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3275 18.1056C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853"/>
        <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
        <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50253 9.70575C6.45046 6.86143 9.10935 4.74966 12.24 4.74966Z" fill="#EA4335"/>
    </svg>
);

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication simulation
    setTimeout(() => {
        // Simple mock check - in reality, use backend
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // Backdoor for demo: if email is valid formatted but not in mock, login as admin
        if (user) {
            onLogin(user);
        } else if (email.includes('@')) {
             // Create temp session user
             onLogin({
                id: 'temp',
                name: 'Demo User',
                email: email,
                role: UserRole.ADMIN,
                status: 'Active',
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
             });
        } else {
            setError('Invalid credentials. Try admin@validator.ai');
            setIsLoading(false);
        }
    }, 1000);
  };

  const handleGoogleLogin = () => {
      setError('');
      setIsLoading(true);
      
      // Mock Google Auth delay
      setTimeout(() => {
          onLogin({
            id: 'google-user',
            name: 'Alex from Google',
            email: 'alex.founder@gmail.com',
            role: UserRole.ANALYST,
            status: 'Active',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexGoogle'
          });
      }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
       {/* Background is handled by global CSS in index.html, but we add an overlay */}
       
       <div className="w-full max-w-md">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 mb-4 animate-bounce-slow">
                    <Layers size={32} />
                </div>
            </div>
            
            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-glass p-8 md:p-10 relative overflow-hidden animate-fade-in-up">
                {/* Decorative mesh inside card */}
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-purple-300/30 blur-[60px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-500 font-medium">Sign in to manage your MVPs</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/50 border border-white/50 rounded-xl pl-12 pr-4 py-3.5 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner placeholder:text-gray-400"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-white/50 rounded-xl pl-12 pr-4 py-3.5 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50/50 border border-red-200/50 text-red-600 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold shadow-xl shadow-gray-900/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? 'Signing In...' : (
                                <>
                                    Sign In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-6 flex items-center gap-3">
                        <div className="h-px bg-gray-300/50 flex-1"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Or continue with</span>
                        <div className="h-px bg-gray-300/50 flex-1"></div>
                    </div>

                    <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white/70 hover:bg-white border border-white/60 text-gray-700 py-3.5 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        <GoogleIcon />
                        <span className="group-hover:text-gray-900 transition-colors">Google</span>
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account? <span className="text-brand-600 font-bold cursor-pointer hover:underline">Contact Admin</span>
                        </p>
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};