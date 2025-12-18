import React, { useState } from 'react';
import { Project, ProjectStatus, MetricData } from '../types';
import { MetricChart } from './MetricChart';
import { ArrowLeft, PlusCircle, CheckCircle, AlertOctagon, TrendingUp, DollarSign, Users, Activity, BarChart2, Zap, Rocket, Skull, Microscope, X } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onAddMetric: (projectId: string, metric: MetricData) => void;
  onChangeStatus: (projectId: string, status: ProjectStatus) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onAddMetric, onChangeStatus }) => {
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<MetricData>>({
    month: '',
    revenue: 0,
    activeUsers: 0,
    burnRate: 0,
    cac: 0,
    churnRate: 0
  });

  const handleMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMetric.month) {
        onAddMetric(project.id, newMetric as MetricData);
        setShowAddMetric(false);
        setNewMetric({ month: '', revenue: 0, activeUsers: 0, burnRate: 0, cac: 0, churnRate: 0 });
    }
  };

  const latest = project.metrics[project.metrics.length - 1] || {};

  // Calculate Derived Metrics for advanced visualization
  const derivedMetrics = project.metrics.map(m => ({
    ...m,
    netIncome: m.revenue - m.burnRate,
    arpu: m.activeUsers > 0 ? Math.round(m.revenue / m.activeUsers) : 0,
    ltvProxy: m.activeUsers > 0 ? Math.round((m.revenue / m.activeUsers) * (100 / (m.churnRate || 5))) : 0 // Very rough LTV proxy
  }));

  const getStrategyIcon = (rec: string) => {
      switch(rec) {
          case 'SCALE': return <Rocket size={20} className="text-white" />;
          case 'PIVOT': return <Zap size={20} className="text-white" />;
          case 'KILL': return <Skull size={20} className="text-white" />;
          default: return <Microscope size={20} className="text-white" />;
      }
  };

  const KPICard = ({ title, value, icon: Icon, colorClass = "" }: { title: string, value: string, icon: any, colorClass?: string }) => (
    <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-glass hover:shadow-glass-hover transition-all duration-300">
        <div className="flex items-center gap-2 text-gray-500 mb-3">
            <div className="p-1.5 rounded-lg bg-white/50 border border-white/60 shadow-sm">
                <Icon size={14} className="text-gray-700" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
        </div>
        <p className={`text-3xl font-bold text-gray-900 tracking-tight ${colorClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
            <button onClick={onBack} className="p-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl hover:bg-white/60 transition-colors shadow-sm group">
                <ArrowLeft size={20} className="text-gray-600 group-hover:text-gray-900" />
            </button>
            <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">{project.name}</h1>
                <div className="flex items-center gap-3">
                    <span className="bg-white/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/60 text-xs font-bold text-gray-600 shadow-sm">{project.category}</span>
                    <p className="text-gray-500 font-medium line-clamp-1">{project.description}</p>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <select 
                    value={project.status}
                    onChange={(e) => onChangeStatus(project.id, e.target.value as ProjectStatus)}
                    className="appearance-none bg-white/40 backdrop-blur-xl border border-white/60 text-gray-700 font-bold py-3 pl-5 pr-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm cursor-pointer hover:bg-white/50 transition-colors"
                >
                    {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
            </div>
            <button 
                onClick={() => setShowAddMetric(true)}
                className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-gray-900/10 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
                <PlusCircle size={18} /> Add Data
            </button>
        </div>
      </div>

      {/* AI Insight Banner & Roadmap */}
      {project.lastAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Score & Recommendation */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                {/* Decorative mesh inside the card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row gap-8 relative z-10 h-full">
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-white/10 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-white/10">Expert Analysis</span>
                            <span className={`font-black tracking-widest uppercase text-lg ${
                                project.lastAnalysis.recommendation === 'SCALE' ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300' : 
                                project.lastAnalysis.recommendation === 'KILL' ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200'
                            }`}>{project.lastAnalysis.recommendation}</span>
                        </div>
                        <p className="text-xl leading-relaxed text-gray-200 mb-8 font-light italic">"{project.lastAnalysis.reasoning}"</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <CheckCircle className="text-green-400 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Unfair Advantage</span>
                                    <span className="text-sm font-semibold">{project.lastAnalysis.keyStrength}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <AlertOctagon className="text-red-400 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Major Risk</span>
                                    <span className="text-sm font-semibold">{project.lastAnalysis.keyRisk}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center md:border-l border-white/10 md:pl-8 min-w-[180px]">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                    className={`${project.lastAnalysis.score > 70 ? 'text-green-500' : project.lastAnalysis.score > 40 ? 'text-yellow-500' : 'text-red-500'}`} 
                                    strokeDasharray={283} 
                                    strokeDashoffset={283 * (1 - project.lastAnalysis.score / 100)} 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-4xl font-black">{project.lastAnalysis.score}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mt-4">Viability Score</span>
                    </div>
                </div>
            </div>

            {/* Strategic Roadmap Card */}
            <div className={`rounded-[2.5rem] p-8 shadow-glass border flex flex-col backdrop-blur-xl ${
                project.lastAnalysis.recommendation === 'SCALE' ? 'bg-green-50/40 border-green-200/50' :
                project.lastAnalysis.recommendation === 'KILL' ? 'bg-red-50/40 border-red-200/50' :
                'bg-amber-50/40 border-amber-200/50'
            }`}>
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                         project.lastAnalysis.recommendation === 'SCALE' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                         project.lastAnalysis.recommendation === 'KILL' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                         'bg-gradient-to-br from-amber-400 to-orange-500'
                    }`}>
                        {getStrategyIcon(project.lastAnalysis.recommendation)}
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-bold uppercase text-xs tracking-widest mb-1">Strategic Roadmap</h3>
                        <p className="text-sm text-gray-600 font-medium">
                            {project.lastAnalysis.recommendation === 'SCALE' ? 'Aggressive Growth Plan' :
                             project.lastAnalysis.recommendation === 'KILL' ? 'Exit Strategy' : 'Pivot / Validation Plan'}
                        </p>
                    </div>
                </div>
                
                <div className="flex-1 space-y-4">
                    {project.lastAnalysis.strategic_actions?.map((action, idx) => (
                        <div key={idx} className="flex gap-4 bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm backdrop-blur-sm">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md mt-0.5 ${
                                project.lastAnalysis?.recommendation === 'SCALE' ? 'bg-green-500' :
                                project.lastAnalysis?.recommendation === 'KILL' ? 'bg-red-500' :
                                'bg-amber-500'
                            }`}>{idx + 1}</span>
                            <p className="text-sm text-gray-800 font-medium leading-relaxed">{action}</p>
                        </div>
                    ))}
                    {(!project.lastAnalysis.strategic_actions || project.lastAnalysis.strategic_actions.length === 0) && (
                        <p className="text-sm text-gray-500 italic">No specific actions generated yet.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPICard title="Revenue" value={`$${(latest.revenue || 0).toLocaleString()}`} icon={DollarSign} />
        <KPICard title="Burn Rate" value={`$${(latest.burnRate || 0).toLocaleString()}`} icon={Activity} />
        <KPICard title="CAC" value={`$${(latest.cac || 0).toFixed(2)}`} icon={Users} />
        <KPICard 
            title="Churn Rate" 
            value={`${(latest.churnRate || 0)}%`} 
            icon={TrendingUp} 
            colorClass={(latest.churnRate || 0) > 10 ? 'text-red-500' : 'text-green-500'} 
        />
      </div>

      {/* Charts Grid */}
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="bg-brand-100 p-2 rounded-lg">
             <BarChart2 className="text-brand-600" size={20} /> 
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Performance Evolution</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MetricChart 
            title="Revenue vs Burn Rate"
            data={project.metrics}
            dataKey1="revenue"
            dataKey2="burnRate"
            color1="#16a34a" // green
            color2="#dc2626" // red
            type="line"
        />
        <MetricChart 
            title="Net Cash Flow (Revenue - Burn)"
            data={derivedMetrics}
            dataKey1="netIncome"
            color1="#2563eb" // blue
            type="bar"
        />
        <MetricChart 
            title="User Growth (Active Users)"
            data={project.metrics}
            dataKey1="activeUsers"
            color1="#8b5cf6" // violet
            type="area"
        />
        <MetricChart 
            title="Unit Economics (ARPU vs CAC)"
            data={derivedMetrics}
            dataKey1="arpu"
            dataKey2="cac"
            color1="#059669" // emerald
            color2="#f59e0b" // amber
            type="line"
        />
      </div>

      {/* Historical Data Table */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-glass overflow-hidden">
        <div className="px-8 py-6 border-b border-white/50 bg-white/20 flex justify-between items-center backdrop-blur-md">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Historical Data</h3>
            <span className="bg-white/50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 border border-white/60 shadow-sm">{project.metrics.length} MONTHS</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-gray-400 font-bold uppercase bg-white/10 tracking-wider">
                    <tr>
                        <th className="px-8 py-4">Month</th>
                        <th className="px-8 py-4">Revenue</th>
                        <th className="px-8 py-4">Burn Rate</th>
                        <th className="px-8 py-4">Active Users</th>
                        <th className="px-8 py-4">CAC</th>
                        <th className="px-8 py-4">Churn</th>
                        <th className="px-8 py-4">Net Income</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                    {[...derivedMetrics].reverse().map((m, idx) => (
                        <tr key={idx} className="hover:bg-white/40 transition-colors group">
                            <td className="px-8 py-5 font-bold text-gray-800">{m.month}</td>
                            <td className="px-8 py-5 font-medium text-gray-600">${m.revenue.toLocaleString()}</td>
                            <td className="px-8 py-5 font-medium text-red-500/80">${m.burnRate.toLocaleString()}</td>
                            <td className="px-8 py-5 font-medium text-gray-600">{m.activeUsers.toLocaleString()}</td>
                            <td className="px-8 py-5 font-medium text-gray-600">${m.cac}</td>
                            <td className="px-8 py-5 font-medium text-gray-600">{m.churnRate}%</td>
                            <td className="px-8 py-5 font-bold">
                                <span className={`px-2 py-1 rounded-lg ${m.netIncome >= 0 ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-600'}`}>
                                    {m.netIncome >= 0 ? '+' : ''}${m.netIncome.toLocaleString()}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add Metric Modal Overlay - Liquid Glass */}
      {showAddMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowAddMetric(false)}></div>
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/60 animate-fade-in-up">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Add Monthly Metrics</h3>
                    <button onClick={() => setShowAddMetric(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleMetricSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Month</label>
                        <input required type="text" placeholder="e.g., Feb 2024" className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner" 
                            value={newMetric.month} onChange={e => setNewMetric({...newMetric, month: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Revenue ($)</label>
                            <input required type="number" className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner" 
                                value={newMetric.revenue} onChange={e => setNewMetric({...newMetric, revenue: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Burn Rate ($)</label>
                            <input required type="number" className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner" 
                                value={newMetric.burnRate} onChange={e => setNewMetric({...newMetric, burnRate: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Active Users</label>
                            <input required type="number" className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner" 
                                value={newMetric.activeUsers} onChange={e => setNewMetric({...newMetric, activeUsers: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">CAC ($)</label>
                            <input required type="number" className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner" 
                                value={newMetric.cac} onChange={e => setNewMetric({...newMetric, cac: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Churn Rate (%)</label>
                            <input required type="number" className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-brand-500/10 focus:outline-none focus:border-brand-500/50 transition-all font-medium shadow-inner" 
                                value={newMetric.churnRate} onChange={e => setNewMetric({...newMetric, churnRate: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowAddMetric(false)} className="flex-1 py-3.5 text-gray-600 font-bold hover:bg-white/50 rounded-2xl transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg shadow-gray-900/20 transition-all transform hover:-translate-y-0.5">Save Data</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};