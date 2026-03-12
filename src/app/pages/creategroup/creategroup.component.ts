import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupListItem, GroupSaveResponse, GroupService } from '../../services/group.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-creategroup.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">Create Group</div>
      <div class="small">Create group and view group list.</div>
    </div>

    <div class="card">
      <div class="tabs">
        <div class="tab" [class.active]="activeTab === 'add'" (click)="setTab('add')">Add</div>
        <div class="tab" [class.active]="activeTab === 'view'" (click)="setTab('view')">View</div>
      </div>

      <div class="tab-content" [class.active]="activeTab === 'add'">
        <form (ngSubmit)="submitGroup()" #groupForm="ngForm">
          <label class="field-label" for="groupName">Group Name</label>
          <textarea
            id="groupName"
            name="groupName"
            class="field-input"
            rows="3"
            placeholder="Enter group name"
            [(ngModel)]="groupName"
            required
            [disabled]="isSubmitting"></textarea>

          <div class="action-row">
            <button
              class="btn-submit"
              type="submit"
              [disabled]="isSubmitting || !groupForm.form.valid">
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </form>
      </div>

      <div class="tab-content" [class.active]="activeTab === 'view'">
        <div class="table-wrap" *ngIf="groups.length > 0; else groupsEmpty">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Group Name</th>
                <th>Created Date</th>
                <th>Updated Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let group of groups">
                <td>{{ group.group_id }}</td>
                <td>{{ group.group_name }}</td>
                <td>{{ group.created_date ? (group.created_date | date: 'dd-MM-yyyy HH:mm:ss') : '-' }}</td>
                <td>{{ group.updated_date ? (group.updated_date | date: 'dd-MM-yyyy HH:mm:ss') : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #groupsEmpty>
          <div class="small">
            {{ isGroupsLoading ? 'Loading groups...' : 'No groups found.' }}
          </div>
        </ng-template>
        <div class="action-row">
          <button class="btn-submit" type="button" (click)="loadGroups()" [disabled]="isGroupsLoading">
            {{ isGroupsLoading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: #fff;
      border: 1px solid #dbe7ea;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 14px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--title-color);
      margin-bottom: 6px;
    }

    .small {
      font-size: 12px;
      color: #6b7280;
    }

    .tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 14px;
    }

    .tab {
      cursor: pointer;
      border: 1px solid #dbe7ea;
      border-radius: 8px;
      padding: 8px 14px;
      font-weight: 600;
      color: #374151;
      background: #f8fafc;
    }

    .tab.active {
      background: #008080;
      color: #fff;
      border-color: #008080;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .field-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: inherit;
      resize: vertical;
    }

    .field-input:focus {
      outline: none;
      border-color: #ccc;
      box-shadow: none;
    }

    .action-row {
      margin-top: 14px;
      display: flex;
      justify-content: flex-end;
    }

    .btn-submit {
      border: none;
      border-radius: 8px;
      background: #0ea5e9;
      color: #fff;
      font-weight: 600;
      padding: 10px 18px;
      cursor: pointer;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      min-width: 680px;
    }

    .table th, .table td {
      border: 1px solid #e5e7eb;
      padding: 8px 10px;
      text-align: left;
      font-size: 13px;
    }

    .table th {
      background: #f8fafc;
      font-weight: 700;
    }
  `]
})
export class CreategroupComponent implements OnInit {
  activeTab: 'add' | 'view' = 'add';
  groupName = '';
  groups: GroupListItem[] = [];
  isGroupsLoading = false;
  isSubmitting = false;

  constructor(private groupService: GroupService) {}

  ngOnInit(): void {}

  setTab(tab: 'add' | 'view'): void {
    this.activeTab = tab;
    if (tab === 'view') {
      this.loadGroups();
    }
  }

  loadGroups(): void {
    if (this.isGroupsLoading) {
      return;
    }
    this.isGroupsLoading = true;
    this.groupService.getGroups().subscribe({
      next: (response) => {
        this.groups = response?.['#result-set-1'] || [];
        this.isGroupsLoading = false;
      },
      error: (error) => {
        const message = error?.error?.message || error?.error?.error || 'Unable to load group list';
        this.isGroupsLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Group Load Failed',
          text: message,
          confirmButtonColor: '#008080'
        });
      }
    });
  }

  submitGroup(): void {
    const cleanGroupName = this.groupName.trim();
    if (!cleanGroupName || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.groupService.createGroup({ groupName: cleanGroupName }).subscribe({
      next: (response: GroupSaveResponse) => {
        const result = response?.['#result-set-1']?.[0];
        const status = (result?.status || '').toUpperCase();
        const message = result?.message || 'Group API response received.';
        const groupId = result?.group_id;

        if (status === 'SUCCESS') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: groupId ? `${message} (Group ID: ${groupId})` : message,
            confirmButtonColor: '#008080'
          });
          this.groupName = '';
          this.setTab('view');
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Request Completed',
            text: message,
            confirmButtonColor: '#008080'
          });
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        const message = error?.error?.message || error?.error?.error || 'Unable to create group';
        Swal.fire({
          icon: 'error',
          title: 'Create Group Failed',
          text: message,
          confirmButtonColor: '#008080'
        });
        this.isSubmitting = false;
      },
      complete: () => {}
    });
  }
}
