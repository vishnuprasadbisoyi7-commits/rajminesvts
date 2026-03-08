import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupSaveResponse, GroupService } from '../../services/group.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-creategroup.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">Create Group</div>
      <div class="small">Enter a group name and submit to save it in backend.</div>
    </div>

    <div class="card">
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

    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .field-input {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      resize: vertical;
      min-height: 84px;
      font-family: inherit;
    }

    .field-input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
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
  `]
})
export class CreategroupComponent {
  groupName = '';
  isSubmitting = false;

  constructor(private groupService: GroupService) {}

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
