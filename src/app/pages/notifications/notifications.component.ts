import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">{{ translate('notifications.title') }}</div>
      <div class="small">{{ translate('notifications.subtitle') }}</div>
    </div>

    <div class="card">
      <!-- Alerts Section -->
      <div id="notifications-alerts">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button 
              class="btn ghost" 
              [class.active-filter]="selectedFilter === 'all'"
              (click)="filterAlerts('all')"
              style="padding:6px 12px;font-size:13px;">
              All
            </button>
            <button 
              class="btn ghost" 
              [class.active-filter]="selectedFilter === 'route-deviation'"
              (click)="filterAlerts('route-deviation')"
              style="padding:6px 12px;font-size:13px;">
              Route Deviations
            </button>
            <button 
              class="btn ghost" 
              [class.active-filter]="selectedFilter === 'device-status'"
              (click)="filterAlerts('device-status')"
              style="padding:6px 12px;font-size:13px;">
              Device Status
            </button>
            <button 
              class="btn ghost" 
              [class.active-filter]="selectedFilter === 'device-failure'"
              (click)="filterAlerts('device-failure')"
              style="padding:6px 12px;font-size:13px;">
              Device Failures
            </button>
          </div>
          <div style="font-size:13px;color:#6b7280;">
            Total: {{ filteredAlerts.length }} alert(s)
          </div>
        </div>

        <div *ngIf="filteredAlerts.length > 0" style="display:flex;flex-direction:column;gap:12px;">
          <div 
            *ngFor="let alert of filteredAlerts; let i = index" 
            class="alert-card"
            [class.alert-unread]="!alert.read"
            [class.alert-critical]="alert.severity === 'critical'"
            [class.alert-warning]="alert.severity === 'warning'"
            [class.alert-info]="alert.severity === 'info'">
            <div style="display:flex;justify-content:space-between;align-items:start;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <span class="alert-icon">{{ getAlertIcon(alert.type) }}</span>
                  <strong style="color:var(--title-color);">{{ alert.title }}</strong>
                  <span class="badge" [style.background]="getSeverityColor(alert.severity)">{{ alert.severity }}</span>
                  <span *ngIf="!alert.read" class="badge" style="background:#ef4444;">New</span>
                </div>
                <div style="color:var(--text-color);font-size:13px;margin-bottom:8px;">
                  {{ alert.description }}
                </div>
                <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:#6b7280;">
                  <span><strong>Device:</strong> {{ alert.deviceName || 'N/A' }}</span>
                  <span><strong>Vehicle:</strong> {{ alert.vehicleReg || 'N/A' }}</span>
                  <span><strong>Time:</strong> {{ formatDateTime(alert.timestamp) }}</span>
                </div>
                <div style="display:flex;gap:12px;margin-top:8px;font-size:12px;">
                  <span [class]="alert.emailSent ? 'status-active' : 'status-inactive'">
                    📧 Email: {{ alert.emailSent ? 'Sent' : 'Pending' }}
                  </span>
                  <span [class]="alert.inAppSent ? 'status-active' : 'status-inactive'">
                    🔔 In-App: {{ alert.inAppSent ? 'Sent' : 'Pending' }}
                  </span>
                </div>
              </div>
              <div style="display:flex;gap:4px;">
                <button 
                  class="btn ghost" 
                  style="padding:4px 8px;font-size:11px;"
                  (click)="markAsRead(alert.id)"
                  *ngIf="!alert.read">
                  Mark Read
                </button>
                <button 
                  class="btn ghost" 
                  style="padding:4px 8px;font-size:11px;"
                  (click)="viewAlertDetails(alert)">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="filteredAlerts.length === 0" style="text-align:center;padding:40px;color:#6b7280;">
          <div style="font-size:18px;margin-bottom:8px;">No alerts found</div>
          <div class="small">No alerts match the selected filter</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-card {
      border: 1px solid #dbe7ea;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
      transition: all 0.2s ease;
    }
    .alert-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .alert-unread {
      border-left: 4px solid var(--teal);
      background: #f0f9ff;
    }
    .alert-critical {
      border-left-color: #ef4444;
    }
    .alert-warning {
      border-left-color: #f59e0b;
    }
    .alert-info {
      border-left-color: #3b82f6;
    }
    .alert-icon {
      font-size: 20px;
    }
    .active-filter {
      background: var(--teal) !important;
      color: #012a4a !important;
      border-color: var(--teal) !important;
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  selectedFilter = 'all';
  private languageSubscription?: Subscription;

  alerts: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    deviceName?: string;
    vehicleReg?: string;
    timestamp: string;
    emailSent: boolean;
    inAppSent: boolean;
    read: boolean;
  }> = [];

  filteredAlerts: any[] = [];

  constructor(private translationService: TranslationService) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageSubscription = this.translationService.language$.subscribe(() => {
      // Component will automatically update when language changes
    });

    // Load alerts from sessionStorage
    this.loadAlerts();
    
    // If no alerts exist, add sample records
    if (this.alerts.length === 0) {
      this.addSampleAlerts();
    }

    this.filterAlerts('all');
  }

  loadAlerts(): void {
    const stored = sessionStorage.getItem('notifications_list');
    if (stored) {
      try {
        this.alerts = JSON.parse(stored);
      } catch (e) {
        this.alerts = [];
      }
    }
  }

  saveAlerts(): void {
    sessionStorage.setItem('notifications_list', JSON.stringify(this.alerts));
  }

  addSampleAlerts(): void {
    const sampleAlerts = [
      {
        id: 'ALERT-001',
        type: 'route-deviation',
        title: 'Route Deviation Detected',
        description: 'Vehicle OD02AB1234 has deviated from the planned route by more than 15 minutes. Current location: 26.9200°N, 75.8000°E',
        severity: 'warning',
        deviceName: 'GPS-X100',
        vehicleReg: 'OD02AB1234',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        emailSent: true,
        inAppSent: true,
        read: false
      },
      {
        id: 'ALERT-002',
        type: 'device-status',
        title: 'Device Activated',
        description: 'Device GPS-X100 has been activated and is now tracking vehicle OD02AB1234',
        severity: 'info',
        deviceName: 'GPS-X100',
        vehicleReg: 'OD02AB1234',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        emailSent: true,
        inAppSent: true,
        read: false
      },
      {
        id: 'ALERT-003',
        type: 'device-failure',
        title: 'Device Offline Alert',
        description: 'Device GPS-Mini has been offline for more than 10 minutes. Last seen: 2025-01-15 14:20',
        severity: 'critical',
        deviceName: 'GPS-Mini',
        vehicleReg: 'RJ14CD5678',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        emailSent: true,
        inAppSent: true,
        read: false
      },
      {
        id: 'ALERT-004',
        type: 'route-deviation',
        title: 'Delay Detected',
        description: 'Vehicle RJ19EF9012 is delayed by 35 minutes from the scheduled arrival time',
        severity: 'warning',
        deviceName: 'GPS-X100',
        vehicleReg: 'RJ19EF9012',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        emailSent: true,
        inAppSent: true,
        read: true
      },
      {
        id: 'ALERT-005',
        type: 'device-status',
        title: 'Device Maintenance',
        description: 'Device GPS-X100 has been marked for maintenance. Reason: Scheduled maintenance',
        severity: 'info',
        deviceName: 'GPS-X100',
        vehicleReg: 'OD02AB1234',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        emailSent: true,
        inAppSent: true,
        read: true
      },
      {
        id: 'ALERT-006',
        type: 'device-status',
        title: 'Device Deactivated',
        description: 'Device GPS-Mini has been deactivated. Reason: Replacement',
        severity: 'warning',
        deviceName: 'GPS-Mini',
        vehicleReg: 'RJ14CD5678',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        emailSent: true,
        inAppSent: true,
        read: true
      }
    ];

    this.alerts = sampleAlerts;
    this.saveAlerts();
  }

  filterAlerts(filter: string): void {
    this.selectedFilter = filter;
    if (filter === 'all') {
      this.filteredAlerts = [...this.alerts];
    } else {
      this.filteredAlerts = this.alerts.filter(a => a.type === filter);
    }
    // Sort by timestamp (newest first)
    this.filteredAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      this.saveAlerts();
      this.filterAlerts(this.selectedFilter);
    }
  }

  viewAlertDetails(alert: any): void {
    Swal.fire({
      icon: alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info',
      title: alert.title,
      html: `
        <div style="text-align:left;">
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Type:</strong> ${this.getAlertTypeLabel(alert.type)}</p>
          <p><strong>Severity:</strong> <span class="badge" style="background:${this.getSeverityColor(alert.severity)}">${alert.severity}</span></p>
          <p><strong>Device:</strong> ${alert.deviceName || 'N/A'}</p>
          <p><strong>Vehicle:</strong> ${alert.vehicleReg || 'N/A'}</p>
          <p><strong>Time:</strong> ${this.formatDateTime(alert.timestamp)}</p>
          <p><strong>Email Notification:</strong> ${alert.emailSent ? '✅ Sent' : '❌ Pending'}</p>
          <p><strong>In-App Notification:</strong> ${alert.inAppSent ? '✅ Sent' : '❌ Pending'}</p>
        </div>
      `,
      confirmButtonColor: '#2563eb'
    });
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'route-deviation': '🚨',
      'device-status': '📱',
      'device-failure': '⚠️'
    };
    return icons[type] || '🔔';
  }

  getAlertTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'route-deviation': 'Route Deviation / Delay',
      'device-status': 'Device Status Change',
      'device-failure': 'Device Failure'
    };
    return labels[type] || type;
  }

  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'critical': '#ef4444',
      'warning': '#f59e0b',
      'info': '#3b82f6'
    };
    return colors[severity] || '#6b7280';
  }

  formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }
}

