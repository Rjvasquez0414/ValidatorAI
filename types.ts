export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  SCALED = 'SCALED',
  PAUSED = 'PAUSED',
  KILLED = 'KILLED'
}

export enum UserRole {
  ADMIN = 'ADMIN',     // Can edit, delete, invite
  ANALYST = 'ANALYST', // Can add metrics, analyze
  VIEWER = 'VIEWER'    // Read only
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'Active' | 'Pending';
}

export interface MetricData {
  month: string; // e.g., "Jan 2024"
  revenue: number;
  activeUsers: number;
  burnRate: number;
  cac: number; // Customer Acquisition Cost
  churnRate: number; // Percentage 0-100
}

export interface AIAnalysis {
  recommendation: 'SCALE' | 'PIVOT' | 'KILL' | 'MONITOR';
  score: number; // 0-100
  reasoning: string;
  keyStrength: string;
  keyRisk: string;
  strategic_actions?: string[]; // New field for actionable steps
}

export interface PortfolioAnalysis {
  portfolioHealthScore: number; // 0-100
  executiveSummary: string;
  topPerformingProject: string;
  killCandidates: string[]; // List of project names to consider killing
  allocationStrategy: string[]; // Advice on where to move money/resources
  marketTrend: 'BULLISH' | 'BEARISH' | 'STAGNANT';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  startDate: string;
  status: ProjectStatus;
  metrics: MetricData[];
  lastAnalysis?: AIAnalysis;
}

export interface NewProjectData {
  name: string;
  description: string;
  category: string;
}