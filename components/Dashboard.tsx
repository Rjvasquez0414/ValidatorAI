import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, PortfolioAnalysis } from '../types';
import { ProjectCard } from './ProjectCard';
import { MetricChart } from './MetricChart';
import { analyzePortfolio } from '../services/geminiService';
import { Plus, BarChart2, Calendar, Search, BrainCircuit, Sparkles, TrendingUp, AlertTriangle, ArrowRightCircle, ChevronRight } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onAddProject: () => void;
  onAnalyzeProject: (p: Project) => void;
  analyzingId: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  onSelectProject, 
  onAddProject, 
  onAnalyzeProject,
  analyzingId
}) => {
  const [filter, setFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [isAnalyzingPortfolio, setIsAnalyzingPortfolio] = useState(false);

  // Filter Projects by Status
  const statusFilteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === filter);

  // Filter Metrics logic used for Stats and Global Chart
  const getFilteredMetrics = (metrics: any[]) => {
      return metrics.filter(m => {
          if (dateRange.start && m.month < dateRange.start) return false;
          if (dateRange.end && m.month > dateRange.end) return false;
          return true;
      });
  };

  // Calculate dynamic stats based on selected date range
  const stats = useMemo(() => {
    let totalRevenue = 0;
    
    // Revenue is sum of the *latest available metric in range* for each project
    projects.forEach(p => {
        const relevantMetrics = getFilteredMetrics(p.metrics);
        if (relevantMetrics.length > 0) {
            // Get the last metric that falls within the selected window
            totalRevenue += relevantMetrics[relevantMetrics.length - 1].revenue;
        } else if (!dateRange.start && !dateRange.end && p.metrics.length > 0) {
            // Default to absolute last if no filter
             totalRevenue += p.metrics[p.metrics.length - 1].revenue;
        }
    });

    return {
        total: projects.length,
        active: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
        scaled: projects.filter(p => p.status === ProjectStatus.SCALED).length,
        revenue: totalRevenue
    };
  }, [projects, dateRange]);

  // Aggregate data for the global chart based on date range
  const globalPerformanceData = useMemo(() => {
    const historyMap: Record<string, { month: string, totalRevenue: number, totalBurn: number, totalUsers: number }> = {};
    
    projects.forEach(project => {
        // Only include metrics within the date range
        const validMetrics = getFilteredMetrics(project.metrics);

        validMetrics.forEach(metric => {
            if (!historyMap[metric.month]) {
                historyMap[metric.month] = { 
                    month: metric.month, 
                    totalRevenue: 0, 
                    totalBurn: 0,
                    totalUsers: 0
                };
            }
            historyMap[metric.month].totalRevenue += metric.revenue;
            historyMap[metric.month].totalBurn += metric.burnRate;
            historyMap[metric.month].totalUsers += metric.activeUsers;
        });
    });

    // Sort by date key (YYYY-MM string comparison works perfectly)
    return Object.values(historyMap).sort((a, b) => a.month.localeCompare(b.month));
  }, [projects, dateRange]);

  const handlePortfolioAnalysis = async () => {
      setIsAnalyzingPortfolio(true);
      const result = await analyzePortfolio(projects);
      setPortfolioAnalysis(result);
      setIsAnalyzingPortfolio(false);
  };

  const StatCard = ({ label, value, colorClass = "text-gray-900" }: { label: string, value: string | number, colorClass?: string }) => (
    <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-glass flex flex-col justify-center min-w-[140px] relative overflow-hidden group hover:bg-white/50 transition-all duration-500">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/40 to-transparent rounded-bl-[2rem] -mr-4 -mt-4 opacity-50"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 relative z-10">{label}</p>
        <p className={`text-3xl font-bold relative z-10 ${colorClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Active MVPs" value={stats.active} />
        <StatCard label="Total MRR (Filtered)" value={`$${stats.revenue.toLocaleString()}`} />
        <StatCard label="Scaled" value={stats.scaled} colorClass="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500" />
        
        <button 
          onClick={onAddProject}
          className="bg-gray-900 hover:bg-black text-white p-6 rounded-[2rem] shadow-xl shadow-gray-900/10 flex flex-col items-center justify-center gap-3 transition-all transform hover:-translate-y-1 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform relative z-10">
            <Plus size={24} />
          </div>
          <span className="font-bold relative z-10">Create MVP</span>
        </button>
      </div>

      {/* Date Filter & Global Analysis Controls */}
      <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-white/50 p-2 rounded-xl backdrop-blur-md shadow-sm border border-white/40">
                        <BarChart2 className="text-gray-700" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Global Performance</h2>
                </div>
                
                {/* Improved Date Range Picker */}
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-sm">
                    <div className="flex items-center gap-2 pl-3 pr-2 text-gray-500 border-r border-white/40 mr-1">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase hidden sm:inline">Timeframe</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <input 
                                type="month" 
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                className="bg-white/50 hover:bg-white/80 border border-white/40 text-gray-700 font-bold py-2 pl-3 pr-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm cursor-pointer transition-all text-sm w-36"
                            />
                             {!dateRange.start && (
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">From: Start</span>
                            )}
                        </div>
                        
                        <ChevronRight size={14} className="text-gray-400" />
                        
                        <div className="relative group">
                            <input 
                                type="month" 
                                value={dateRange.end}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                className="bg-white/50 hover:bg-white/80 border border-white/40 text-gray-700 font-bold py-2 pl-3 pr-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm cursor-pointer transition-all text-sm w-36"
                            />
                            {!dateRange.end && (
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">To: Present</span>
                            )}
                        </div>
                    </div>

                    {(dateRange.start || dateRange.end) && (
                        <button 
                            onClick={() => setDateRange({start: '', end: ''})}
                            className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-xl transition-colors ml-1"
                            title="Reset Dates"
                        >
                            <span className="text-[10px] font-bold">RESET</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Global Chart */}
            {globalPerformanceData.length > 0 ? (
                <div className="h-[350px]">
                    <MetricChart 
                        title={`Financial Overview ${dateRange.start ? `(from ${dateRange.start})` : ''}`}
                        data={globalPerformanceData}
                        dataKey1="totalRevenue"
                        dataKey2="totalBurn"
                        color1="#10b981" // Emerald for Revenue
                        color2="#ef4444" // Red for Burn
                        type="area"
                    />
                </div>
            ) : (
                <div className="h-[200px] bg-white/30 backdrop-blur-sm rounded-[2rem] border border-white/40 flex flex-col items-center justify-center text-gray-400">
                    <Search size={32} className="mb-2 opacity-50" />
                    <p className="font-medium">No data found in this range.</p>
                </div>
            )}
      </div>

      {/* Filters & Grid Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {['ALL', 'ACTIVE', 'SCALED', 'PAUSED', 'KILLED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-300 shadow-sm backdrop-blur-md ${
                  filter === f 
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-105' 
                    : 'bg-white/40 text-gray-500 hover:bg-white/60 border border-white/50'
                }`}
              >
                {f === 'ALL' ? 'All Projects' : f}
              </button>
            ))}
          </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {statusFilteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onSelect={onSelectProject} 
            onAnalyze={onAnalyzeProject}
            isAnalyzing={analyzingId === project.id}
          />
        ))}
        {statusFilteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-white/30 backdrop-blur-md border border-white/40 mb-4">
                     <Plus size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">No projects found for this filter.</p>
            </div>
        )}
      </div>

      {/* Portfolio AI Command Center - MOVED TO BOTTOM */}
      <div className="mt-16 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-gray-900 to-black p-1 shadow-2xl">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-brand-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
          
          <div className="relative z-10 bg-gray-900/90 backdrop-blur-md rounded-[2.3rem] p-8 md:p-10 border border-white/10">
              
              {!portfolioAnalysis ? (
                   <div className="flex flex-col items-center justify-center text-center py-8">
                       <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-brand-500 blur-[30px] opacity-20 animate-pulse"></div>
                            <BrainCircuit className="text-brand-400 relative z-10" size={64} />
                       </div>
                       <h3 className="text-2xl font-bold text-white mb-2">Portfolio Intelligence</h3>
                       <p className="text-gray-400 max-w-lg mb-8">
                           Use AI to analyze your entire portfolio's efficiency. Detect capital drains, identify scalability leaders, and get a holistic resource allocation strategy.
                       </p>
                       <button 
                            onClick={handlePortfolioAnalysis}
                            disabled={isAnalyzingPortfolio}
                            className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                       >
                            {isAnalyzingPortfolio ? (
                                <>
                                    <Sparkles className="animate-spin" size={20} /> Analyzing Data...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} /> Run Global Analysis
                                </>
                            )}
                       </button>
                   </div>
              ) : (
                  <div className="animate-fade-in">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8 border-b border-white/10 pb-8">
                          <div>
                              <div className="flex items-center gap-3 mb-3">
                                  <BrainCircuit className="text-brand-400" size={24} />
                                  <h3 className="text-2xl font-bold text-white">AI Executive Report</h3>
                              </div>
                              <p className="text-gray-300 leading-relaxed max-w-2xl text-lg font-light">"{portfolioAnalysis.executiveSummary}"</p>
                          </div>
                          
                          <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                              <div className="text-center">
                                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Portfolio Health</span>
                                  <span className={`text-4xl font-black ${
                                      portfolioAnalysis.portfolioHealthScore > 70 ? 'text-green-400' : 
                                      portfolioAnalysis.portfolioHealthScore > 40 ? 'text-amber-400' : 'text-red-400'
                                  }`}>{portfolioAnalysis.portfolioHealthScore}</span>
                              </div>
                              <div className="w-px h-12 bg-white/10"></div>
                              <div className="text-center">
                                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Market Trend</span>
                                  <div className="flex items-center gap-2 justify-center">
                                      {portfolioAnalysis.marketTrend === 'BULLISH' && <TrendingUp size={20} className="text-green-400" />}
                                      {portfolioAnalysis.marketTrend === 'BEARISH' && <TrendingUp size={20} className="text-red-400 transform rotate-180" />}
                                      <span className="text-lg font-bold text-white">{portfolioAnalysis.marketTrend}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Success Card */}
                          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl">
                               <div className="flex items-center gap-2 mb-4">
                                   <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                       <TrendingUp size={18} />
                                   </div>
                                   <span className="text-green-200 font-bold text-sm uppercase tracking-wider">Top Performer</span>
                               </div>
                               <p className="text-2xl font-bold text-white mb-2">{portfolioAnalysis.topPerformingProject}</p>
                               <p className="text-sm text-green-200/70">Showing highest traction and efficiency.</p>
                          </div>

                          {/* Risk Card */}
                          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl">
                               <div className="flex items-center gap-2 mb-4">
                                   <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                                       <AlertTriangle size={18} />
                                   </div>
                                   <span className="text-red-200 font-bold text-sm uppercase tracking-wider">Kill Candidates</span>
                               </div>
                               {portfolioAnalysis.killCandidates.length > 0 ? (
                                   <ul className="space-y-2">
                                       {portfolioAnalysis.killCandidates.map(k => (
                                           <li key={k} className="flex items-center gap-2 text-white font-medium">
                                               <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {k}
                                           </li>
                                       ))}
                                   </ul>
                               ) : (
                                   <p className="text-white font-bold">None detected.</p>
                               )}
                          </div>

                          {/* Strategy Card */}
                          <div className="bg-brand-500/10 border border-brand-500/20 p-6 rounded-3xl">
                               <div className="flex items-center gap-2 mb-4">
                                   <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
                                       <ArrowRightCircle size={18} />
                                   </div>
                                   <span className="text-brand-200 font-bold text-sm uppercase tracking-wider">Allocation Strategy</span>
                               </div>
                               <ul className="space-y-3">
                                   {portfolioAnalysis.allocationStrategy.map((s, i) => (
                                       <li key={i} className="text-xs text-white leading-relaxed flex gap-2">
                                           <span className="text-brand-400 font-bold">{i+1}.</span> {s}
                                       </li>
                                   ))}
                               </ul>
                          </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                          <button 
                            onClick={handlePortfolioAnalysis} 
                            className="text-xs font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                          >
                              <Sparkles size={12} /> RE-RUN ANALYSIS
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};