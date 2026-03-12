// user-menu-mapping.service.ts
import { Injectable, signal } from '@angular/core';

export interface PrimaryLink {
  id: number;
  name: string;
  checked: boolean;
}

export interface GlobalLink {
  id: number;
  name: string;
  checked: boolean;
  expanded: boolean;
  indeterminate: boolean;
  primaryLinks: PrimaryLink[];
}

export interface UserMenuData {
  userId: number;
  userName: string;
  globalLinks: GlobalLink[];
}

@Injectable({ providedIn: 'root' })
export class UserMenuMappingService {

  // All available global links with their primary links
  private readonly allGlobalLinks: GlobalLink[] = [
    {
      id: 1, name: 'User Management', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 101, name: 'View Users',            checked: false },
        { id: 102, name: 'Add User',              checked: false },
        { id: 103, name: 'Edit User',             checked: false },
        { id: 104, name: 'Delete User',           checked: false },
        { id: 105, name: 'Role Assignment',       checked: false },
        { id: 106, name: 'Reset Password',        checked: false },
        { id: 107, name: 'User Activity Log',     checked: false },
      ]
    },
    {
      id: 2, name: 'Master', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 201, name: 'State Master',          checked: false },
        { id: 202, name: 'District Master',       checked: false },
        { id: 203, name: 'Mine Type Master',      checked: false },
        { id: 204, name: 'Mineral Master',        checked: false },
        { id: 205, name: 'Vehicle Type Master',   checked: false },
        { id: 206, name: 'Route Master',          checked: false },
        { id: 207, name: 'Checkpoint Master',     checked: false },
        { id: 208, name: 'Holiday Master',        checked: false },
      ]
    },
    {
      id: 3, name: 'Vendor Enrollment', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 301, name: 'View Vendor Enrollment',   checked: false },
        { id: 302, name: 'Add Vendor',               checked: false },
        { id: 303, name: 'Edit Vendor',              checked: false },
        { id: 304, name: 'Vendor Approval',          checked: false },
        { id: 305, name: 'Vendor Documents',         checked: false },
        { id: 306, name: 'Vendor Payment History',   checked: false },
        { id: 307, name: 'Blacklist Vendor',         checked: false },
        { id: 308, name: 'Vendor Reports',           checked: false },
      ]
    },
    {
      id: 4, name: 'Device Tagging', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 401, name: 'View Tagged Devices',      checked: false },
        { id: 402, name: 'Tag New Device',           checked: false },
        { id: 403, name: 'Device Health Status',     checked: false },
        { id: 404, name: 'RFID Management',          checked: false },
        { id: 405, name: 'GPS Device Mapping',       checked: false },
        { id: 406, name: 'Device Replacement',       checked: false },
        { id: 407, name: 'Tamper Alerts',            checked: false },
      ]
    },
    {
      id: 5, name: 'Geo-Fencing', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 501, name: 'View Geo-Zones',           checked: false },
        { id: 502, name: 'Create Zone',              checked: false },
        { id: 503, name: 'Edit Zone',                checked: false },
        { id: 504, name: 'Zone Violation Alerts',    checked: false },
        { id: 505, name: 'Zone-Vehicle Mapping',     checked: false },
        { id: 506, name: 'Entry / Exit Logs',        checked: false },
        { id: 507, name: 'Zone Analytics',           checked: false },
        { id: 508, name: 'Restricted Area Setup',    checked: false },
      ]
    },
    {
      id: 6, name: 'Configuration', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 601, name: 'System Settings',          checked: false },
        { id: 602, name: 'Alert Configuration',      checked: false },
        { id: 603, name: 'SMS / Email Templates',    checked: false },
        { id: 604, name: 'API Integration',          checked: false },
        { id: 605, name: 'Audit Trail Settings',     checked: false },
        { id: 606, name: 'Backup & Restore',         checked: false },
        { id: 607, name: 'License Management',       checked: false },
      ]
    },
    {
      id: 7, name: 'Reports', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 701, name: 'Vehicle Trip Report',      checked: false },
        { id: 702, name: 'Daily Movement Report',    checked: false },
        { id: 703, name: 'Violation Report',         checked: false },
        { id: 704, name: 'Vendor Summary Report',    checked: false },
        { id: 705, name: 'Device Health Report',     checked: false },
        { id: 706, name: 'Challan Report',           checked: false },
        { id: 707, name: 'Mineral Dispatch Report',  checked: false },
        { id: 708, name: 'MIS Report',               checked: false },
        { id: 709, name: 'Custom Report Builder',    checked: false },
      ]
    },
    {
      id: 8, name: 'Challan Management', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 801, name: 'View Challans',            checked: false },
        { id: 802, name: 'Generate Challan',         checked: false },
        { id: 803, name: 'Challan Dispute',          checked: false },
        { id: 804, name: 'Payment Collection',       checked: false },
        { id: 805, name: 'Challan Analytics',        checked: false },
        { id: 806, name: 'Exemption Management',     checked: false },
      ]
    },
    {
      id: 9, name: 'Vehicle Tracking', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 901, name: 'Live Tracking Map',        checked: false },
        { id: 902, name: 'Trip History Playback',    checked: false },
        { id: 903, name: 'Speed Violation Alerts',   checked: false },
        { id: 904, name: 'Idle Time Analysis',       checked: false },
        { id: 905, name: 'Route Deviation Alerts',   checked: false },
        { id: 906, name: 'Vehicle Status Dashboard', checked: false },
        { id: 907, name: 'Driver Behaviour',         checked: false },
      ]
    },
    {
      id: 10, name: 'Dashboard', checked: false, expanded: false, indeterminate: false,
      primaryLinks: [
        { id: 1001, name: 'Overview Dashboard',      checked: false },
        { id: 1002, name: 'Analytics Dashboard',     checked: false },
        { id: 1003, name: 'Alert Summary',           checked: false },
        { id: 1004, name: 'KPI Metrics',             checked: false },
        { id: 1005, name: 'Heatmap View',            checked: false },
      ]
    },
  ];

  // Current user being mapped
  currentUser = signal<{ id: number; name: string }>({ id: 1, name: 'Sheetal Agarwal (sheetal)' });

  // Deep-clone so mutations don't affect the master list
  getGlobalLinks(): GlobalLink[] {
    return JSON.parse(JSON.stringify(this.allGlobalLinks));
  }

  // Simulate fetching saved mappings for a user (replace with HTTP call)
  getSavedMappings(userId: number): number[] {
    // Simulated: user 1 has Vendor Enrollment → View Vendor Enrollment pre-checked
    const saved: Record<number, number[]> = {
      1: [3, 301]
    };
    return saved[userId] ?? [];
  }

  // Apply saved mapping IDs onto a fresh link tree
  applyMappings(links: GlobalLink[], savedIds: number[]): GlobalLink[] {
    const idSet = new Set(savedIds);
    return links.map(global => {
      const updatedChildren = global.primaryLinks.map(p => ({
        ...p, checked: idSet.has(p.id)
      }));
      const anyChecked  = updatedChildren.some(p => p.checked);
      const allChecked  = updatedChildren.length > 0 && updatedChildren.every(p => p.checked);
      return {
        ...global,
        primaryLinks: updatedChildren,
        checked: idSet.has(global.id) || allChecked,
        indeterminate: anyChecked && !allChecked,
        expanded: anyChecked   // auto-expand if something is checked
      };
    });
  }

  // Collect all checked IDs (global + primary) for saving
  collectCheckedIds(links: GlobalLink[]): number[] {
    const ids: number[] = [];
    links.forEach(g => {
      if (g.checked || g.indeterminate) ids.push(g.id);
      g.primaryLinks.forEach(p => { if (p.checked) ids.push(p.id); });
    });
    return ids;
  }

  // Simulate save (replace with HttpClient POST)
  saveMappings(userId: number, selectedIds: number[]): void {
    console.log('Saving mappings for user', userId, ':', selectedIds);
    // this.http.post('/api/user-menu-mapping/save', { userId, selectedLinkIds: selectedIds }).subscribe(...)
  }

  // Simulate user search (replace with HttpClient GET)
  searchUsers(query: string): { id: number; name: string }[] {
    const users = [
      { id: 1, name: 'Sheetal Agarwal (sheetal)' },
      { id: 2, name: 'Ramesh Kumar (ramesh)'     },
      { id: 3, name: 'Priya Sharma (priya)'      },
      { id: 4, name: 'Amit Singh (amit)'         },
      { id: 5, name: 'Neha Gupta (neha)'         },
    ];
    return users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
  }
}