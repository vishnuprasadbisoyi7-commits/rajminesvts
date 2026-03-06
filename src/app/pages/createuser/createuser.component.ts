import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateUserResponse, CreateUserService, GroupListItem } from '../../services/create-user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-createuser.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">Create User</div>
      <div class="small">Select group and enter user details to create a new admin user.</div>
    </div>

    <div class="card">
      <form (ngSubmit)="submitUser()" #userForm="ngForm">
        <div class="grid">
          <div class="field">
            <label class="field-label" for="groupName">Group Name</label>
            <select
              id="groupName"
              name="groupName"
              class="field-input"
              [(ngModel)]="form.groupname"
              required
              [disabled]="isGroupsLoading || isSubmitting">
              <option value="" disabled>Select group</option>
              <option *ngFor="let group of groups" [value]="group.group_name">
                {{ group.group_name }}
              </option>
            </select>
          </div>

          <div class="field">
            <label class="field-label" for="fullname">Full Name</label>
            <textarea
              id="fullname"
              name="fullname"
              rows="2"
              class="field-input"
              placeholder="Enter full name"
              [(ngModel)]="form.fullname"
              required
              [disabled]="isSubmitting"></textarea>
          </div>

          <div class="field">
            <label class="field-label" for="username">Username</label>
            <textarea
              id="username"
              name="username"
              rows="2"
              class="field-input"
              placeholder="Enter username"
              [(ngModel)]="form.username"
              required
              [disabled]="isSubmitting"></textarea>
          </div>

          <div class="field">
            <label class="field-label" for="mobileno">Mobile Number</label>
            <textarea
              id="mobileno"
              name="mobileno"
              rows="2"
              class="field-input"
              placeholder="Enter mobile number"
              [(ngModel)]="form.mobileno"
              required
              [disabled]="isSubmitting"></textarea>
          </div>

          <div class="field">
            <label class="field-label" for="email">Email ID</label>
            <textarea
              id="email"
              name="email"
              rows="2"
              class="field-input"
              placeholder="Enter email id"
              [(ngModel)]="form.email"
              required
              [disabled]="isSubmitting"></textarea>
          </div>
        </div>

        <div class="action-row">
          <button
            class="btn-submit"
            type="submit"
            [disabled]="isSubmitting || isGroupsLoading || !userForm.form.valid">
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

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .field {
      display: flex;
      flex-direction: column;
    }

    .field-label {
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
      min-height: 44px;
      resize: vertical;
      font-family: inherit;
      background: #fff;
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
export class CreateuserComponent implements OnInit {
  groups: GroupListItem[] = [];
  isGroupsLoading = false;
  isSubmitting = false;

  form = {
    groupname: '',
    fullname: '',
    username: '',
    mobileno: '',
    email: '',
    role: 'ADMIN',
    isActive: 'ACTIVE'
  };

  constructor(private createUserService: CreateUserService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  private loadGroups(): void {
    this.isGroupsLoading = true;
    this.createUserService.getGroups().subscribe({
      next: (response) => {
        this.groups = response?.['#result-set-1'] || [];
        if (this.groups.length > 0 && !this.form.groupname) {
          this.form.groupname = this.groups[0].group_name;
        }
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

  submitUser(): void {
    if (this.isSubmitting || !this.isFormValid()) {
      return;
    }

    const payload = {
      groupname: this.form.groupname.trim(),
      fullname: this.form.fullname.trim(),
      username: this.form.username.trim(),
      mobileno: this.form.mobileno.trim(),
      email: this.form.email.trim(),
      role: this.form.role,
      isActive: this.form.isActive
    };

    this.isSubmitting = true;
    this.createUserService.createUser(payload).subscribe({
      next: (response: CreateUserResponse) => {
        const row = response?.['#result-set-1']?.[0];
        const status = (row?.status || '').toUpperCase();
        const userId = row?.user_id;

        if (status === 'SUCCESS') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: userId ? `User created successfully (User ID: ${userId})` : 'User created successfully',
            confirmButtonColor: '#008080'
          });
          this.resetFormAfterSubmit();
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Request Completed',
            text: 'API returned non-success status.',
            confirmButtonColor: '#008080'
          });
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        const message = error?.error?.message || error?.error?.error || 'Unable to create user';
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Create User Failed',
          text: message,
          confirmButtonColor: '#008080'
        });
      }
    });
  }

  private isFormValid(): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return !!(
      this.form.groupname.trim() &&
      this.form.fullname.trim() &&
      this.form.username.trim() &&
      this.form.email.trim() &&
      phoneRegex.test(this.form.mobileno.trim())
    );
  }

  private resetFormAfterSubmit(): void {
    this.form.fullname = '';
    this.form.username = '';
    this.form.mobileno = '';
    this.form.email = '';
    this.form.role = 'ADMIN';
    this.form.isActive = 'ACTIVE';
  }
}
