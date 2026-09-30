import * as XLSX from 'xlsx';

export interface SampleDataFiles {
  mainReportFile: File;
  teamDetailsFile: File;
}

export function generateSampleData(): SampleDataFiles {
  // 1. Team Details Roster
  const teamHeaders = ['EMP ID', 'Name', 'Department', 'Role'];
  const teamRows = [
    ['EMP101', 'Sarah Jenkins', 'Compliance & Risk', 'Senior Auditor'],
    ['EMP102', 'David Chen', 'Master Data Governance', 'Data Steward'],
    ['EMP103', 'Elena Rostova', 'Internal Controls', 'BP Specialist'],
    ['EMP104', 'Marcus Vance', 'Sanctions Monitoring', 'Lead Analyst'],
    ['EMP105', 'Amina Diallo', 'Financial Crime Unit', 'Risk Investigator'],
    ['EMP106', 'Kenji Takahashi', 'Audit Operations', 'Audit Manager'],
    ['EMP107', 'Sofia Rodriguez', 'Regulatory Affairs', 'Compliance Officer'],
  ];

  const teamSheet = XLSX.utils.aoa_to_sheet([teamHeaders, ...teamRows]);
  const teamWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(teamWb, teamSheet, 'Team Roster');
  const teamBuffer = XLSX.write(teamWb, { bookType: 'xlsx', type: 'array' });
  const teamDetailsFile = new File(
    [teamBuffer],
    'Team_Details_Roster_Sample.xlsx',
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );

  // 2. Main Input Report
  // Original column mapping:
  // 0: Business Partner
  // 1: BP Full Name
  // 2: Linked Names
  // 3: Changed By
  // 4: Changed On
  // 5: [To Delete] Legacy Code F
  // 6: [To Delete] Batch ID G
  // 7: [To Delete] Verification Hash H
  // 8: Country/Region Key (becomes col index 5)
  // 9: BP Role (becomes col index 6)
  // 10: Street Address (becomes col index 7)
  // 11: Postal Code (becomes col index 8)
  // 12: City (becomes col index 9)
  // 13: Tax Number (becomes col index 10)
  // 14: Payment Terms (becomes col index 11)
  // 15: Credit Limit (becomes col index 12 = Column M, formatted with commas to test Step 2!)
  // 16: Currency (becomes col index 13 = Column N)
  // 17: Approval Status (becomes col index 14 before Step 7, shifted to Col P after Column O is inserted!)
  // 18: Notes / Remarks

  const mainHeaders = [
    'Business Partner',
    'BP Full Name',
    'Linked Names',
    'Changed By',
    'Changed On',
    'Legacy Tech Code (F)',
    'Batch Audit ID (G)',
    'Checksum Hash (H)',
    'Country/Region Key',
    'BP Role',
    'Street Address',
    'Postal Code',
    'City',
    'Tax Number',
    'Payment Terms',
    'Credit Limit (Col M)',
    'Currency',
    'Approval Status',
    'Audit Notes',
  ];

  const mainRows = [
    // Priority Country 1: CU (Cuba)
    [
      'BP-200911',
      'Habana Logistics S.A.',
      'Caribbean Maritime Links',
      'EMP101',
      '2026-03-01',
      'DEL_F_01',
      'BATCH_G_01',
      'HASH_H_01',
      'CU',
      'Vendor',
      'Calle 23 Vedado',
      '10400',
      'Havana',
      'TAX-CU-9912',
      'NT30',
      '24,500.00',
      'EUR',
      'Approved',
      'Sanctions review required',
    ],
    // Priority Country 2: IR (Iran)
    [
      'BP-200912',
      'Pars Energy Trading',
      'Pars Petroleum Subsidiary',
      'EMP102',
      '2026-03-02',
      'DEL_F_02',
      'BATCH_G_02',
      'HASH_H_02',
      'IR',
      'Customer',
      'Valiasr St 88',
      '19697',
      'Tehran',
      'TAX-IR-3341',
      'NT15',
      '1,250,000.50',
      'USD',
      'Flagged',
      'Dual-use audit clearance pending',
    ],
    // Priority Country 3: KP (North Korea)
    [
      'BP-200913',
      'DPRK Minerals Co',
      'Pyongyang Mining Group',
      'EMP104',
      '2026-03-03',
      'DEL_F_03',
      'BATCH_G_03',
      'HASH_H_03',
      'KP',
      'Vendor',
      'Central District 12',
      '99999',
      'Pyongyang',
      'TAX-KP-0012',
      'CASH',
      '85,000.00',
      'EUR',
      'Blocked',
      'Direct embargo embargo rule',
    ],
    // Priority Country 4: RU (Russia)
    [
      'BP-200914',
      'Nordic Steel Trans LLC',
      'Baltic Metallurgy Branch',
      'EMP103',
      '2026-03-04',
      'DEL_F_04',
      'BATCH_G_04',
      'HASH_H_04',
      'RU',
      'Vendor',
      'Nevsky Prospekt 45',
      '191025',
      'Saint Petersburg',
      'TAX-RU-8821',
      'NT60',
      '480,200.00',
      'EUR',
      'Under Review',
      'Sectoral sanctions screening',
    ],
    // Duplicate test: identical (BP, Linked Names, Changed By, Changed On) to BP-200914 -> SHOULD BE REMOVED!
    [
      'BP-200914',
      'Nordic Steel Trans LLC',
      'Baltic Metallurgy Branch',
      'EMP103',
      '2026-03-04',
      'DEL_F_DUP',
      'BATCH_G_DUP',
      'HASH_H_DUP',
      'RU',
      'Vendor',
      'Nevsky Prospekt 45',
      '191025',
      'Saint Petersburg',
      'TAX-RU-8821',
      'NT60',
      '480,200.00',
      'EUR',
      'Under Review',
      'DUPLICATE RECORD TO BE PURGED',
    ],
    // Priority Country 5: BY (Belarus)
    [
      'BP-200915',
      'Minsk Potash Export',
      'Belaruskali Partner Assoc',
      'EMP105',
      '2026-03-05',
      'DEL_F_05',
      'BATCH_G_05',
      'HASH_H_05',
      'BY',
      'Vendor',
      'Korzha St 14',
      '220036',
      'Minsk',
      'TAX-BY-5519',
      'NT30',
      '95,300.00',
      'EUR',
      'Pending',
      'Ownership percentage review',
    ],
    // Priority Country 6: VE (Venezuela)
    [
      'BP-200916',
      'Orinoco Petro Supplies',
      'Caracas Oilfields Sub',
      'EMP101',
      '2026-03-06',
      'DEL_F_06',
      'BATCH_G_06',
      'HASH_H_06',
      'VE',
      'Customer',
      'Av. Francisco de Miranda',
      '1060',
      'Caracas',
      'TAX-VE-1102',
      'NT30',
      '12,000.00',
      'USD',
      'Approved',
      'SDN list verified clear',
    ],
    // Priority Country 7: NI (Nicaragua)
    [
      'BP-200917',
      'Managua Agro Export S.A.',
      'Pacific Banana Holdings',
      'EMP106',
      '2026-03-07',
      'DEL_F_07',
      'BATCH_G_07',
      'HASH_H_07',
      'NI',
      'Vendor',
      'Pista Juan Pablo II',
      '11001',
      'Managua',
      'TAX-NI-9031',
      'NT45',
      '34,150.00',
      'USD',
      'Approved',
      'Quarterly compliance pass',
    ],
    // Priority Country 8: UA (Ukraine)
    [
      'BP-200918',
      'Dnipro Heavy Machinery',
      'Kyiv Industrial Group',
      'EMP107',
      '2026-03-08',
      'DEL_F_08',
      'BATCH_G_08',
      'HASH_H_08',
      'UA',
      'Customer',
      'Khreshchatyk 22',
      '01001',
      'Kyiv',
      'TAX-UA-4402',
      'NT30',
      '112,000.00',
      'EUR',
      'Approved',
      'Verified non-occupied territory',
    ],
    // Blank Linked Names test 1 -> SHOULD BE PURGED IN STEP 3!
    [
      'BP-200919',
      'Ghost Entity Corp',
      '', // BLANK LINKED NAME!
      'EMP101',
      '2026-03-09',
      'DEL_F_BLANK',
      'BATCH_G_BLANK',
      'HASH_H_BLANK',
      'US',
      'Customer',
      '100 Wall Street',
      '10005',
      'New York',
      'TAX-US-9999',
      'NT30',
      '50,000.00',
      'USD',
      'Rejected',
      'BLANK LINKED NAME RECORD',
    ],
    // Blank Linked Names test 2 (spaces only) -> SHOULD BE PURGED IN STEP 3!
    [
      'BP-200920',
      'Anonymous Trading LLC',
      '   ', // WHITESPACE ONLY LINKED NAME!
      'EMP102',
      '2026-03-10',
      'DEL_F_BLANK2',
      'BATCH_G_BLANK2',
      'HASH_H_BLANK2',
      'DE',
      'Customer',
      'Friedrichstrasse 10',
      '10117',
      'Berlin',
      'TAX-DE-0000',
      'NT30',
      '75,000.00',
      'EUR',
      'Rejected',
      'SPACES ONLY LINKED NAME',
    ],
    // Non-priority countries (should be sorted alphabetically: DE, FR, GB, US):
    // Germany (DE)
    [
      'BP-200921',
      'Siemens Werkzeugbau GmbH',
      'Bavaria Machinery Link',
      'EMP101',
      '2026-03-11',
      'DEL_F_09',
      'BATCH_G_09',
      'HASH_H_09',
      'DE',
      'Vendor',
      'Werner-von-Siemens-Strasse 1',
      '80333',
      'Munich',
      'DE-81112233',
      'NT60',
      '2,500,000.00',
      'EUR',
      'Approved',
      'Standard high volume supplier',
    ],
    // France (FR)
    [
      'BP-200922',
      'Rhone Valley Distribution SAS',
      'Lyon Freight Alliance',
      'EMP103',
      '2026-03-12',
      'DEL_F_10',
      'BATCH_G_10',
      'HASH_H_10',
      'FR',
      'Customer',
      'Rue de la Republique 15',
      '69002',
      'Lyon',
      'FR-45987123',
      'NT30',
      '310,000.00',
      'EUR',
      'Approved',
      'European cross-border partner',
    ],
    // United Kingdom (GB)
    [
      'BP-200923',
      'Thames Shipping & Logistics PLC',
      'Canary Wharf Marine',
      'EMP102',
      '2026-03-13',
      'DEL_F_11',
      'BATCH_G_11',
      'HASH_H_11',
      'GB',
      'Vendor',
      'Bank Street 25',
      'E14 5JP',
      'London',
      'GB-9823411',
      'NT30',
      '620,000.00',
      'GBP',
      'Approved',
      'UK logistics operator',
    ],
    // United States (US)
    [
      'BP-200924',
      'Pacific Rim Technologies Inc',
      'California Cloud Services',
      'EMP104',
      '2026-03-14',
      'DEL_F_12',
      'BATCH_G_12',
      'HASH_H_12',
      'US',
      'Vendor',
      'Market St 500',
      '94105',
      'San Francisco',
      'US-9428172',
      'NT30',
      '1,850,000.00',
      'USD',
      'Approved',
      'SaaS provider infrastructure',
    ],
    // Unmatched Employee ID test (EMP999 is NOT in the team roster):
    [
      'BP-200925',
      'Apex Financial Advisors',
      'Zurich Wealth Connect',
      'EMP999', // UNMATCHED EMPLOYEE ID!
      '2026-03-15',
      'DEL_F_13',
      'BATCH_G_13',
      'HASH_H_13',
      'CH',
      'Customer',
      'Bahnhofstrasse 45',
      '8001',
      'Zurich',
      'CHE-102.345.678',
      'NT15',
      '540,000.00',
      'CHF',
      'Pending',
      'Edited by contractor EMP999 - not in team list',
    ],
    // Another Unmatched ID: EXT_BOT_01
    [
      'BP-200926',
      'Nordic Clean Energy AB',
      'Stockholm Wind Power',
      'EXT_BOT_01', // UNMATCHED!
      '2026-03-16',
      'DEL_F_14',
      'BATCH_G_14',
      'HASH_H_14',
      'SE',
      'Vendor',
      'Sveavagen 12',
      '11157',
      'Stockholm',
      'SE-5560123456',
      'NT30',
      '180,000.00',
      'SEK',
      'Approved',
      'Automated batch ingestion account',
    ],
    // Duplicate test 2: identical to BP-200921 (Siemens) -> SHOULD BE REMOVED!
    [
      'BP-200921',
      'Siemens Werkzeugbau GmbH',
      'Bavaria Machinery Link',
      'EMP101',
      '2026-03-11',
      'DEL_F_DUP2',
      'BATCH_G_DUP2',
      'HASH_H_DUP2',
      'DE',
      'Vendor',
      'Werner-von-Siemens-Strasse 1',
      '80333',
      'Munich',
      'DE-81112233',
      'NT60',
      '2,500,000.00',
      'EUR',
      'Approved',
      'SECOND DUPLICATE INSTANCE',
    ],
  ];

  const mainSheet = XLSX.utils.aoa_to_sheet([mainHeaders, ...mainRows]);
  const mainWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(mainWb, mainSheet, 'BP_Audit_Raw');
  const mainBuffer = XLSX.write(mainWb, { bookType: 'xlsx', type: 'array' });
  const mainReportFile = new File(
    [mainBuffer],
    'SAP_BP_Change_Audit_Report_Sample.xlsx',
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );

  return {
    mainReportFile,
    teamDetailsFile,
  };
}

export function downloadSampleTemplate(type: 'main' | 'team'): void {
  if (type === 'main') {
    const headers = [
      'Business Partner',
      'Name 1',
      'Linked Names',
      'Changed By',
      'Changed On',
      'Col F (Will be deleted)',
      'Col G (Will be deleted)',
      'Col H (Will be deleted)',
      'Country/Region Key',
      'Role',
      'Address',
      'Postal Code',
      'City',
      'Tax No',
      'Payment Terms',
      'Amount / Limit (Col M)',
      'Currency',
      'Approval Status',
      'Comments',
    ];
    const dummyRows = [
      [
        'BP10001',
        'Acme International',
        'Acme Global Corp',
        'EMP001',
        '2026-03-01',
        'TEMP_F',
        'TEMP_G',
        'TEMP_H',
        'RU',
        'Vendor',
        'Central St 1',
        '10001',
        'Moscow',
        'TX1234',
        'NT30',
        '15,000.00',
        'USD',
        'Active',
        'Audit note',
      ],
      [
        'BP10002',
        'Havana Trading',
        'Caribbean Imports',
        'EMP002',
        '2026-03-02',
        'TEMP_F',
        'TEMP_G',
        'TEMP_H',
        'CU',
        'Customer',
        'Avenue 5',
        '10200',
        'Havana',
        'TX5678',
        'NT15',
        '2,400.00',
        'EUR',
        'Active',
        'Audit note',
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Main_Input_Report.xlsx');
  } else {
    const headers = ['EMP ID', 'Name', 'Department', 'Email'];
    const dummyRows = [
      ['EMP001', 'Alice Johnson', 'Compliance', 'alice@company.com'],
      ['EMP002', 'Bob Smith', 'Internal Controls', 'bob@company.com'],
      ['EMP003', 'Carlos Ruiz', 'Audit Management', 'carlos@company.com'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Team Roster');
    XLSX.writeFile(wb, 'Template_Team_Details.xlsx');
  }
}
