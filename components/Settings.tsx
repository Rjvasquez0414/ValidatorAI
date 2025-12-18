import React, { useRef, useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { Download, Upload, Database, AlertCircle, Check, Settings as SettingsIcon, FileSpreadsheet } from 'lucide-react';

interface SettingsProps {
  projects: Project[];
  onImport: (projects: Project[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ projects, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Description', 'Category', 'Status', 'StartDate', 'Metric_Month', 'Metric_Revenue', 'Metric_ActiveUsers', 'Metric_BurnRate', 'Metric_CAC', 'Metric_ChurnRate'];
    
    const rows: string[] = [];
    rows.push(headers.join(','));

    projects.forEach(p => {
        const pCommon = [
            `"${p.id}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.description.replace(/"/g, '""')}"`,
            `"${p.category}"`,
            `"${p.status}"`,
            `"${p.startDate}"`
        ];

        if (p.metrics.length === 0) {
            rows.push([...pCommon, '', '', '', '', '', ''].join(','));
        } else {
            p.metrics.forEach(m => {
                const mData = [
                    `"${m.month}"`,
                    m.revenue,
                    m.activeUsers,
                    m.burnRate,
                    m.cac,
                    m.churnRate
                ];
                rows.push([...pCommon, ...mData].join(','));
            });
        }
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `validator_ai_data_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessage({ type: 'success', text: 'Data exported successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    if (lines.length < 2) return null;

    // Simple CSV parser handling quotes
    const parseLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i+1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    const projectMap = new Map<string, Project>();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = parseLine(line);
        if (cols.length < 6) continue;

        const [id, name, desc, cat, status, startDate, mMonth, mRev, mUsers, mBurn, mCac, mChurn] = cols;
        
        const cleanId = id; 

        if (!projectMap.has(cleanId)) {
            projectMap.set(cleanId, {
                id: cleanId,
                name: name,
                description: desc,
                category: cat,
                startDate: startDate,
                status: status as ProjectStatus,
                metrics: []
            });
        }

        if (mMonth) {
            const project = projectMap.get(cleanId);
            if (project) {
                project.metrics.push({
                    month: mMonth,
                    revenue: Number(mRev),
                    activeUsers: Number(mUsers),
                    burnRate: Number(mBurn),
                    cac: Number(mCac),
                    churnRate: Number(mChurn)
                });
            }
        }
    }

    return Array.from(projectMap.values());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target?.result as string;
            const newProjects = parseCSV(text);
            if (newProjects && newProjects.length > 0) {
                onImport(newProjects);
                setMessage({ type: 'success', text: `Successfully imported ${newProjects.length} projects.` });
            } else {
                setMessage({ type: 'error', text: 'Failed to parse CSV or file is empty.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error reading file. Please ensure format is correct.' });
        }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Clear success message after 3s
    setTimeout(() => {
        if (message?.type === 'success') setMessage(null);
    }, 3000);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Data Management</h1>
            <p className="text-gray-500 font-medium">Export your data for analysis or import to restore/update.</p>
        </div>

        {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-100/50 text-green-700 border border-green-200' : 'bg-red-100/50 text-red-700 border border-red-200'
            }`}>
                {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                <span className="font-bold">{message.text}</span>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Card */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-glass relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-6">
                        <Download size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Export Data</h3>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Download all your projects and metrics in CSV format. Compatible with Excel, Google Sheets, and other analysis tools.
                    </p>
                    <button 
                        onClick={downloadCSV}
                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-[0.98]"
                    >
                        <FileSpreadsheet size={18} /> Download CSV
                    </button>
                </div>
            </div>

            {/* Import Card */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-glass relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-6">
                        <Upload size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Import Data</h3>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Upload a CSV file to update or restore your projects. 
                        <span className="block mt-1 font-bold text-amber-600/80 text-xs flex items-center gap-1">
                            <AlertCircle size={10} /> This will replace existing projects with matching IDs.
                        </span>
                    </p>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-white hover:bg-white/80 border border-gray-200 text-gray-900 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-[0.98]"
                    >
                        <Database size={18} /> Select File
                    </button>
                </div>
            </div>
        </div>
        
        {/* Helper Note */}
        <div className="bg-blue-50/50 border border-blue-100/50 p-6 rounded-3xl backdrop-blur-sm">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                <AlertCircle size={16} /> Format Guide
            </h4>
            <p className="text-xs text-blue-700/80 leading-relaxed">
                The CSV file should have headers: <code>ID, Name, Description, Category, Status, StartDate, Metric_Month, ...metrics</code>. 
                Each row represents a monthly metric entry for a project. Projects without metrics should have at least one row with empty metric columns.
            </p>
        </div>
    </div>
  );
};