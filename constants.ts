import { Project, ProjectStatus, User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@validator.ai',
    role: UserRole.ADMIN,
    status: 'Active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  },
  {
    id: '2',
    name: 'Sarah Analyst',
    email: 'sarah@validator.ai',
    role: UserRole.ANALYST,
    status: 'Active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '3',
    name: 'Mike Investor',
    email: 'mike@vc.fund',
    role: UserRole.VIEWER,
    status: 'Pending',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'EcoDelivery MVP',
    description: 'Last-mile delivery using electric bikes for local organic markets.',
    category: 'Logistics',
    startDate: '2023-10-01',
    status: ProjectStatus.ACTIVE,
    metrics: [
      { month: '2023-10', revenue: 1200, activeUsers: 45, burnRate: 3000, cac: 50, churnRate: 15 },
      { month: '2023-11', revenue: 2500, activeUsers: 90, burnRate: 2800, cac: 45, churnRate: 10 },
      { month: '2023-12', revenue: 4100, activeUsers: 150, burnRate: 2900, cac: 40, churnRate: 8 },
      { month: '2024-01', revenue: 6500, activeUsers: 280, burnRate: 3100, cac: 35, churnRate: 5 },
    ]
  },
  {
    id: '2',
    name: 'FitAI Coach',
    description: 'AI-generated workout plans based on available equipment.',
    category: 'SaaS / Health',
    startDate: '2023-11-01',
    status: ProjectStatus.ACTIVE,
    metrics: [
      { month: '2023-11', revenue: 200, activeUsers: 20, burnRate: 1500, cac: 10, churnRate: 30 },
      { month: '2023-12', revenue: 250, activeUsers: 22, burnRate: 1500, cac: 12, churnRate: 28 },
      { month: '2024-01', revenue: 300, activeUsers: 25, burnRate: 1600, cac: 15, churnRate: 25 },
    ]
  },
  {
    id: '3',
    name: 'CryptoArbitrage Bot',
    description: 'Automated arbitrage trading between DEXs.',
    category: 'Fintech',
    startDate: '2023-09-01',
    status: ProjectStatus.KILLED,
    metrics: [
      { month: '2023-09', revenue: 0, activeUsers: 5, burnRate: 5000, cac: 200, churnRate: 0 },
      { month: '2023-10', revenue: 100, activeUsers: 8, burnRate: 4800, cac: 180, churnRate: 20 },
      { month: '2023-11', revenue: 50, activeUsers: 4, burnRate: 5200, cac: 300, churnRate: 60 },
    ]
  }
];