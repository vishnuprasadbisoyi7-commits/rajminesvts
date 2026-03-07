import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FunctionMasterService } from '../../services/function-master.service';


@Component({
  selector: 'app-function-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `

    <div class="card">
      <h2>Function Master</h2>
      <small>Add and manage functions</small>
    </div>

    <div class="card">

      <div class="tabs">
        <div class="tab"
             [class.active]="activeTab==='add'"
             (click)="setTab('add')">Add</div>

        <div class="tab"
             [class.active]="activeTab==='view'"
             (click)="setTab('view')">View</div>
      </div>

      <!-- ================= ADD TAB ================= -->
      <div *ngIf="activeTab==='add'">

        <form #fmForm="ngForm">

          <div class="form-row">
            <label>Function Name *</label>
            <input type="text"
                   name="functionName"
                   [(ngModel)]="functionData.functionName"
                   required />
          </div>

          <div class="form-row">
            <label>Function URL *</label>
            <input type="text"
                   name="functionUrl"
                   [(ngModel)]="functionData.functionUrl"
                   required />
          </div>

          <div class="form-row">
            <label>Status *</label>
            <select name="status"
                    [(ngModel)]="functionData.status"
                    required>
              <option value="A">Active</option>
              <option value="I">Inactive</option>
            </select>
          </div>

          <div style="margin-top:15px;">
            <button type="button"
                    class="btn"
                    (click)="saveFunction(fmForm)">
              Submit
            </button>

            <button type="button"
                    class="btn ghost"
                    (click)="clearForm(fmForm)">
              Clear
            </button>
          </div>

        </form>

      </div>

      <!-- ================= VIEW TAB ================= -->
      <div *ngIf="activeTab==='view'">

        <table class="table" *ngIf="functionList.length > 0">
          <thead>
            <tr>
              <th>Function Name</th>
              <th>Function URL</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let fm of functionList">
              <td>{{ fm.functionName }}</td>
              <td>{{ fm.functionUrl }}</td>
              <td>
                <span [class]="fm.status==='A' ? 'status-active':'status-inactive'">
                  {{ fm.status==='A' ? 'Active':'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="functionList.length===0" class="empty">
          No Functions Created Yet
        </div>

      </div>

    </div>
  `,
  styles: [`
    .card { background:#fff;padding:20px;border-radius:8px;margin-bottom:15px;box-shadow:0 2px 6px rgba(0,0,0,0.1);}
    .tabs { display:flex; gap:15px; margin-bottom:20px; }
    .tab { cursor:pointer; padding:8px 15px; border-radius:4px; }
    .tab.active { background:#008080; color:#fff; }
    .form-row { margin-bottom:15px; display:flex; flex-direction:column; }
    input, select { padding:8px;border:1px solid #ccc;border-radius:4px;}
    .btn { background:#008080;color:white;padding:8px 15px;border:none;border-radius:4px;cursor:pointer;margin-right:10px;}
    .btn.ghost { background:#ccc;color:black; }
    .table { width:100%; border-collapse:collapse;}
    .table th, .table td { border:1px solid #ddd;padding:8px;}
    .table th { background:#f4f4f4;}
    .status-active { color:green;font-weight:600; }
    .status-inactive { color:red;font-weight:600; }
    .empty { text-align:center;padding:30px;color:#777; }
  `]
})
export class FunctionMasterComponent implements OnInit {
clearForm(_t44: NgForm) {
throw new Error('Method not implemented.');
}

  private baseUrl = 'http://localhost:8089/api/function';

  activeTab: string = 'add';

  functionList: any[] = [];

  functionData: any = {
    functionName: '',
    functionUrl: '',
    status: 'A'
  };

  constructor(private functionService: FunctionMasterService) {}


  ngOnInit(): void {
    this.loadFunctions();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'view') {
      this.loadFunctions();
    }
  }

 loadFunctions() {
  this.functionService.getAllFunctions()
    .subscribe({
      next: (data) => this.functionList = data,
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to load data', 'error');
      }
    });
}


  saveFunction(form: NgForm) {

  if (!form.valid) {
    Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
    return;
  }

  this.functionService.saveFunction(this.functionData)
    .subscribe({
      next: () => {
        Swal.fire('Success', 'Function saved successfully', 'success');
        form.resetForm({ status: 'A' });
        this.setTab('view');
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to save data', 'error');
      }
    });
}
}