import * as XLSX from 'xlsx';

export interface TeamMember {
  empId: string;
  name: string;
  department?: string;
  role?: string;
}

export const DEFAULT_38_TEAM_MEMBERS: TeamMember[] = [
  { empId: 'EMP101', name: 'Sarah Jenkins', department: 'Compliance & Risk', role: 'Senior Auditor' },
  { empId: 'EMP102', name: 'David Chen', department: 'Master Data Governance', role: 'Data Steward' },
  { empId: 'EMP103', name: 'Elena Rostova', department: 'Internal Controls', role: 'BP Specialist' },
  { empId: 'EMP104', name: 'Marcus Vance', department: 'Sanctions Monitoring', role: 'Lead Analyst' },
  { empId: 'EMP105', name: 'Amina Diallo', department: 'Financial Crime Unit', role: 'Risk Investigator' },
  { empId: 'EMP106', name: 'Kenji Takahashi', department: 'Audit Operations', role: 'Audit Manager' },
  { empId: 'EMP107', name: 'Sofia Rodriguez', department: 'Regulatory Affairs', role: 'Compliance Officer' },
  { empId: 'EMP108', name: 'Lucas Meyer', department: 'Finance Controls', role: 'Staff Auditor' },
  { empId: 'EMP109', name: 'Priya Sharma', department: 'Sanctions Screening', role: 'Senior Analyst' },
  { empId: 'EMP110', name: 'Liam O’Connor', department: 'Data Management', role: 'ERP Coordinator' },
  { empId: 'EMP111', name: 'Ananya Gupta', department: 'Internal Audit', role: 'Audit Senior' },
  { empId: 'EMP112', name: 'Matteo Rossi', department: 'Trade Compliance', role: 'Trade Specialist' },
  { empId: 'EMP113', name: 'Chloe Dubois', department: 'Vendor Risk', role: 'Risk Analyst' },
  { empId: 'EMP114', name: 'Sven Lindqvist', department: 'Nordic Operations', role: 'Audit Lead' },
  { empId: 'EMP115', name: 'Fatima Al-Mansoor', department: 'Global Screening', role: 'AML Analyst' },
  { empId: 'EMP116', name: 'Oliver Smith', department: 'Master Data', role: 'Data Architect' },
  { empId: 'EMP117', name: 'Isabella Silva', department: 'Compliance', role: 'Compliance Associate' },
  { empId: 'EMP118', name: 'Dae-Hyun Park', department: 'APAC Controls', role: 'Regional Auditor' },
  { empId: 'EMP119', name: 'Nadia Petrova', department: 'Sanctions Watch', role: 'Senior Investigator' },
  { empId: 'EMP120', name: 'Gabriel Santos', department: 'LATAM Audit', role: 'Audit Associate' },
  { empId: 'EMP121', name: 'Emma Wilson', department: 'Risk Analytics', role: 'Data Scientist' },
  { empId: 'EMP122', name: 'Hassan Mahmoud', department: 'MEA Compliance', role: 'Compliance Manager' },
  { empId: 'EMP123', name: 'Yuki Tanaka', department: 'Japan Operations', role: 'Internal Auditor' },
  { empId: 'EMP124', name: 'Zoe Kravitz', department: 'Financial Audit', role: 'Audit Lead' },
  { empId: 'EMP125', name: 'Arthur Pendelton', department: 'Governance', role: 'Chief Auditor' },
  { empId: 'EMP126', name: 'Marta Kowalska', department: 'CEE Controls', role: 'Risk Analyst' },
  { empId: 'EMP127', name: 'Noah Becker', department: 'DACH Compliance', role: 'BP Steward' },
  { empId: 'EMP128', name: 'Layla Hassan', department: 'Trade Operations', role: 'Sanctions Lead' },
  { empId: 'EMP129', name: 'Viktor Orban', department: 'Audit Systems', role: 'IT Auditor' },
  { empId: 'EMP130', name: 'Camila Fernandez', department: 'Procurement Audit', role: 'Staff Auditor' },
  { empId: 'EMP131', name: 'Stefan Mueller', department: 'SAP Controls', role: 'SAP Security Lead' },
  { empId: 'EMP132', name: 'Kavita Reddy', department: 'Vendor Screening', role: 'Compliance Senior' },
  { empId: 'EMP133', name: 'Ethan Taylor', department: 'Risk Operations', role: 'Operations Lead' },
  { empId: 'EMP134', name: 'Helena Berg', department: 'Internal Review', role: 'Audit Associate' },
  { empId: 'EMP135', name: 'Tariq Aziz', department: 'Middle East Review', role: 'Senior Auditor' },
  { empId: 'EMP136', name: 'Jessica Alba', department: 'Corporate Audit', role: 'Audit Specialist' },
  { empId: 'EMP137', name: 'Carlos Mendez', department: 'Trade Governance', role: 'Compliance Lead' },
  { empId: 'EMP138', name: 'Grace Hopper', department: 'Audit Automation', role: 'Principal Engineer' },
];

export function createDefaultTeamDetailsFile(): File {
  const headers = ['EMP ID', 'Name', 'Department', 'Role'];
  const rows = DEFAULT_38_TEAM_MEMBERS.map((m) => [
    m.empId,
    m.name,
    m.department || '',
    m.role || '',
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Team Roster');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  return new File([buffer], 'Team_details.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
