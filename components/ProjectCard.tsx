import React from 'react';
import { Project, ProjectStatus } from '../types';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onAnalyze: (project: Project) => void;
  isAnalyzing: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onAnalyze, isAnalyzing }) => {
  const latestMetric = project.metrics[project.metrics.length - 1] || { revenue: 0, activeUsers: 0 };
  const prevMetric = project.metrics[project.metrics.length - 2] || { revenue: 0, activeUsers: 0 };
  
  const revenueGrowth = prevMetric.revenue > 0 
    ? ((latestMetric.revenue - prevMetric.revenue) / prevMetric.revenue) * 100 
    : 0;

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'bg-blue-50/50 text-blue-600 border-blue-200/50';
      case ProjectStatus.SCALED: return 'bg-green-50/50 text-green-600 border-green-200/50';
      case ProjectStatus.PAUSED: return 'bg-amber-50/50 text-amber-600 border-amber-200/50';
      case ProjectStatus.KILLED: return 'bg-red-50/50 text-red-600 border-red-200/50';
      default: return 'bg-gray-50/50 text-gray-600 border-gray-200/50';
    }
  };

  const getRecommendationBadge = () => {
    if (!project.lastAnalysis) return null;
    const rec = project.lastAnalysis.recommendation;
    let colorClass = 'bg-gray-100/50 text-gray-600 border-gray-200';
    if (rec === 'SCALE') colorClass = 'bg-green-500 text-white shadow-lg shadow-green-500/30 border-transparent';
    if (rec === 'PIVOT') colorClass = 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 border-transparent';
    if (rec === 'KILL') colorClass = 'bg-red-500 text-white shadow-lg shadow-red-500/30 border-transparent';
    if (rec === 'MONITOR') colorClass = 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-transparent';

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colorClass} backdrop-blur-sm`}>
        {rec}
      </span>
    );
  };

  return (
    <div 
      className="group relative bg-white/40 backdrop-blur-xl border border-white/60 shadow-glass hover:shadow-glass-hover hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={() => onSelect(project)}
    >
      {/* Glossy Reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none opacity-50"></div>
      
      <div className="p-7 flex-1 relative z-10">
        <div className="flex justify-between items-center mb-5">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          {getRecommendationBadge()}
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">{project.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-white/40 rounded-2xl p-3 border border-white/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">MRR</p>
            <div className="flex items-end gap-2">
              <span className="text-lg font-bold text-gray-800">${latestMetric.revenue.toLocaleString()}</span>
              {revenueGrowth !== 0 && (
                 <span className={`text-[10px] font-bold mb-1.5 ${revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {revenueGrowth > 0 ? '↑' : '↓'}{Math.abs(revenueGrowth).toFixed(0)}%
                 </span>
              )}
            </div>
          </div>
          <div className="bg-white/40 rounded-2xl p-3 border border-white/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Active Users</p>
            <p className="text-lg font-bold text-gray-800">{latestMetric.activeUsers.toLocaleString()}</p>
          </div>
        </div>

        {project.lastAnalysis && (
            <div className="mt-5 pt-4 border-t border-gray-200/40">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 flex-1 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div 
                            className={`h-full rounded-full shadow-sm ${project.lastAnalysis.score > 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : project.lastAnalysis.score > 40 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} 
                            style={{ width: `${project.lastAnalysis.score}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 bg-white/50 px-2 py-0.5 rounded-lg">{project.lastAnalysis.score}/100</span>
                </div>
                <p className="text-xs text-gray-500 italic font-medium leading-relaxed opacity-80">"{project.lastAnalysis.reasoning}"</p>
            </div>
        )}
      </div>

      <div className="relative z-10 bg-white/30 backdrop-blur-md p-4 border-t border-white/40 flex justify-between items-center group-hover:bg-white/50 transition-colors">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze(project);
          }}
          disabled={isAnalyzing}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex items-center gap-1.5 bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100 transition-colors"
        >
            {isAnalyzing ? 'Analyzing...' : (
                <>
                <TrendingUp size={14} /> AI Validation
                </>
            )}
        </button>
        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-gray-400 group-hover:text-brand-600 group-hover:scale-110 transition-all shadow-sm">
            <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};