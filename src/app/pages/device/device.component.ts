import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import Swal from 'sweetalert2';
import { DeviceService } from '../../services/device.service';

interface Device {
  deviceName: string;
  imeiSerial: string;
  model?: string;
  firmwareVersion?: string;
  deviceStatus?: string;
  vendorName?: string;
  healthStatus?: string;
}

interface VendorOption {
  id: string;
  name: string;
  label: string;
}

@Component({
  selector: 'app-device',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">{{ translate('device.title') }}</div>
      <div class="small">{{ translate('device.subtitle') }}</div>
    </div>

    <!-- Registered Device Section -->
    <div *ngIf="currentSection === 'registered'" class="device-section">
      <div class="card">
        <div style="font-weight:700;font-size:18px;color:var(--title-color);margin-bottom:16px;">1. Registered Device</div>
        <div class="tabs">
          <div class="tab" [class.active]="activeTab === 'add'" (click)="setActiveTab('add')">Add</div>
          <div class="tab" [class.active]="activeTab === 'view'" (click)="setActiveTab('view')">View</div>
        </div>

        <div id="device-add" class="tab-content" [class.active]="activeTab === 'add'">
          <form #deviceForm="ngForm">
            <div class="form-row">
              <label>Vendor <span style="color:#ef4444">*</span></label>
              <select name="vendor" [(ngModel)]="deviceFormData.vendor" required #vendorCtrl="ngModel">
                <option value="">Select vendor (only active vendors shown)</option>
                <option *ngFor="let vendor of vendorsList" [value]="vendor.id">{{ vendor.label }}</option>
              </select>
              <div *ngIf="showDeviceFieldError(deviceForm, 'vendor')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                Vendor is required.
              </div>
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label>Device Name <span style="color:#ef4444">*</span></label>
                <input type="text" placeholder="Enter device name" name="deviceName" [(ngModel)]="deviceFormData.deviceName" required minlength="3" #deviceNameCtrl="ngModel" />
                <div *ngIf="showDeviceFieldError(deviceForm, 'deviceName')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                  Device name is required (min 3 characters).
                </div>
              </div>
              <div>
                <label>IMEI / Serial <span style="color:#ef4444">*</span></label>
                <input type="text" placeholder="Enter IMEI or serial number" name="imei" [(ngModel)]="deviceFormData.imei" required minlength="10" maxlength="20" pattern="[0-9A-Za-z-]{10,20}" #imeiCtrl="ngModel" />
                <div *ngIf="showDeviceFieldError(deviceForm, 'imei')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                  IMEI / Serial must be 10-20 characters.
                </div>
              </div>
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label>Model <span style="color:#ef4444">*</span></label>
                <input type="text" placeholder="Enter device model" name="model" [(ngModel)]="deviceFormData.model" required minlength="2" #modelCtrl="ngModel" />
                <div *ngIf="showDeviceFieldError(deviceForm, 'model')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                  Model is required.
                </div>
              </div>
              <div>
                <label>Firmware</label>
                <input type="text" placeholder="Enter firmware version" name="firmware" [(ngModel)]="deviceFormData.firmware" />
              </div>
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label>SIM ICCID / MSISDN 1 <span style="color:#ef4444">*</span></label>
                <input type="text" placeholder="Enter SIM ICCID or MSISDN" name="sim1Info" [(ngModel)]="deviceFormData.sim1Info" required minlength="10" maxlength="25" pattern="[0-9]{10,25}" #sim1Ctrl="ngModel" />
                <div *ngIf="showDeviceFieldError(deviceForm, 'sim1Info')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                  SIM 1 must be 10-25 digits.
                </div>
              </div>
              <div>
                <label>Health Status 1 <span style="color:#ef4444">*</span></label>
                <select name="sim1HealthStatus" [(ngModel)]="deviceFormData.sim1HealthStatus" required #sim1HealthCtrl="ngModel">
                  <option value="">Select health status</option>
                  <option value="healthy">Healthy</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="unknown">Unknown</option>
                </select>
                <div *ngIf="showDeviceFieldError(deviceForm, 'sim1HealthStatus')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                  Health status 1 is required.
                </div>
              </div>
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label>SIM ICCID / MSISDN 2 <span style="color:#ef4444">*</span></label>
                <input type="text" placeholder="Enter SIM ICCID or MSISDN" name="sim2Info" [(ngModel)]="deviceFormData.sim2Info" required minlength="10" maxlength="25" pattern="[0-9]{10,25}" #sim2Ctrl="ngModel" />
                <div *ngIf="showDeviceFieldError(deviceForm, 'sim2Info')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                  SIM 2 must be 10-25 digits.
                </div>
              </div>
              <div>
                <label>Health Status 2 <span style="color:#ef4444">*</span></label>
                <select name="sim2HealthStatus" [(ngModel)]="deviceFormData.sim2HealthStatus" required #sim2HealthCtrl="ngModel">
                  <option value="">Select health status</option>
                  <option value="healthy">Healthy</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="unknown">Unknown</option>
                </select>
                <div *ngIf="showDeviceFieldError(deviceForm, 'sim2HealthStatus')" style="margin-top:4px;color:#dc2626;font-size:12px;">
                  Health status 2 is required.
                </div>
              </div>
            </div>
            <div *ngIf="deviceSubmitAttempted && deviceValidationMessage" style="margin-top:8px;color:#dc2626;font-size:12px;">
              {{ deviceValidationMessage }}
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="btn" type="button" (click)="registerDevice(deviceForm)">Register Device</button>
              <button class="btn ghost" type="button" (click)="clearForm(deviceForm)">Clear</button>
            </div>
          </form>
        </div>

        <div id="device-view" class="tab-content" [class.active]="activeTab === 'view'">
          <table class="table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>IMEI</th>
                <th>Model</th>
                <th>Vendor</th>
                <th>Health Status</th>
                <th>Device Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let device of availableDevices">
                <td>{{ device.deviceName || '-' }}</td>
                <td>{{ device.imeiSerial || '-' }}</td>
                <td>{{ device.model || '-' }}</td>
                <td>{{ device.vendorName || '-' }}</td>
                <td>
                  <span [class.status-active]="(device.healthStatus || '').toLowerCase() === 'healthy'"
                        [class.status-inactive]="(device.healthStatus || '').toLowerCase() !== 'healthy'">
                    {{ device.healthStatus || '-' }}
                  </span>
                </td>
                <td>
                  <span [class.status-active]="(device.deviceStatus || '').toLowerCase() === 'active'"
                        [class.status-inactive]="(device.deviceStatus || '').toLowerCase() !== 'active'">
                    {{ device.deviceStatus || '-' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="availableDevices.length === 0">
                <td colspan="6" style="text-align:center;">No devices found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Fit & Activate Section -->
    <div *ngIf="currentSection === 'fitment'" class="device-section">
      <div class="card">
        <div style="font-weight:700;font-size:18px;color:var(--title-color);margin-bottom:16px;">2. Fit & Activate</div>
        <div class="tabs">
          <div class="tab" [class.active]="fitmentTab === 'fitment-add'" (click)="setFitmentTab('fitment-add')">Add Fitment</div>
          <div class="tab" [class.active]="fitmentTab === 'fitment-view'" (click)="setFitmentTab('fitment-view')">View Fitment</div>
        </div>

        <div id="fitment-add" class="tab-content" [class.active]="fitmentTab === 'fitment-add'">
          <!-- Device Testing Section (shown first) -->
          <div *ngIf="!testPassed" style="margin-bottom:30px;padding:20px;background:#f8f9fa;border-radius:8px;border-left:4px solid #008080;">
            <div style="font-weight:700;font-size:16px;color:var(--title-color);margin-bottom:16px;">Step 1: Test Device (Optional - Prototype Mode)</div>
            <form #testForm="ngForm">
              <div class="form-row">
                <label>Select Device <span style="color:#ef4444">*</span></label>
                <select name="device" [(ngModel)]="testFormData.device" required>
                  <option value="">Select device to test</option>
                  <option *ngFor="let device of availableDevices" [ngValue]="device">
  {{ device.deviceName }} ({{ device.imeiSerial }})
</option>
                </select>
                <div class="small" style="margin-top:4px;">Only registered devices can be tested</div>
              </div>
              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label>GPS Signal Strength <span style="color:#ef4444">*</span></label>
                  <select name="gpsSignal" [(ngModel)]="testFormData.gpsSignal" required>
                    <option value="">Select signal strength</option>
                    <option value="excellent">Excellent (4+ satellites)</option>
                    <option value="good">Good (3 satellites)</option>
                    <option value="fair">Fair (2 satellites)</option>
                    <option value="poor">Poor (1 satellite)</option>
                    <option value="no-signal">No Signal</option>
                  </select>
                </div>
                <div>
                  <label>Network Connectivity <span style="color:#ef4444">*</span></label>
                  <select name="networkConnectivity" [(ngModel)]="testFormData.networkConnectivity" required>
                    <option value="">Select connectivity status</option>
                    <option value="connected">Connected</option>
                    <option value="weak">Weak Signal</option>
                    <option value="disconnected">Disconnected</option>
                  </select>
                </div>
              </div>
              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label>Battery Status <span style="color:#ef4444">*</span></label>
                  <select name="batteryStatus" [(ngModel)]="testFormData.batteryStatus" required>
                    <option value="">Select battery status</option>
                    <option value="full">Full (80-100%)</option>
                    <option value="good">Good (50-79%)</option>
                    <option value="low">Low (20-49%)</option>
                    <option value="critical">Critical (&lt;20%)</option>
                  </select>
                </div>
                <div>
                  <label>Data Transmission <span style="color:#ef4444">*</span></label>
                  <select name="dataTransmission" [(ngModel)]="testFormData.dataTransmission" required>
                    <option value="">Select transmission status</option>
                    <option value="working">Working</option>
                    <option value="intermittent">Intermittent</option>
                    <option value="not-working">Not Working</option>
                  </select>
                </div>
              </div>
              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label>Test Date & Time <span style="color:#ef4444">*</span></label>
                  <input type="datetime-local" name="testDateTime" [(ngModel)]="testFormData.testDateTime" required />
                </div>
                <div>
                  <label>Tester Name <span style="color:#ef4444">*</span></label>
                  <input type="text" placeholder="Enter tester name" name="testerName" [(ngModel)]="testFormData.testerName" required />
                </div>
              </div>
              <div class="form-row">
                <label>Test Location</label>
                <input type="text" placeholder="Enter test location (optional)" name="testLocation" [(ngModel)]="testFormData.testLocation" />
              </div>
              <div class="form-row">
                <label>Test Notes / Observations</label>
                <textarea placeholder="Enter test notes, observations, or issues found (optional)" name="testNotes" [(ngModel)]="testFormData.testNotes" rows="2"></textarea>
              </div>
              <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="btn" type="button" (click)="submitTest(testForm)">Test Device</button>
                <button class="btn ghost" type="button" (click)="skipTest()">Skip Test (Prototype)</button>
                <button class="btn ghost" type="button" (click)="clearTestForm(testForm)">Clear</button>
              </div>
            </form>
          </div>

          <!-- Fitment Form (shown after test passes or skipped) -->
          <div *ngIf="testPassed" style="margin-top:20px;">
            <div style="font-weight:700;font-size:16px;color:var(--title-color);margin-bottom:16px;padding:12px;background:#e8f5e9;border-radius:6px;border-left:4px solid #4caf50;">
              ✓ Proceed with Fitment (Prototype Mode)
            </div>
            <form #fitmentForm="ngForm">
              <div class="form-row">
                <label>Select Device <span style="color:#ef4444">*</span></label>
                <select name="device" [(ngModel)]="fitmentFormData.device" required>
                  <option value="">Select device</option>
                  <option *ngFor="let device of availableDevices" [ngValue]="device">
                    {{ device.deviceName }} ({{ device.imeiSerial }})
                  </option>
                </select>
              </div>
              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label>Vehicle Registration Number <span style="color:#ef4444">*</span></label>
                  <input type="text" placeholder="Enter vehicle registration number" name="vehicleRegNo" [(ngModel)]="fitmentFormData.vehicleRegNo" required />
                </div>
                <div>
                  <label>Date & Time of Installation <span style="color:#ef4444">*</span></label>
                  <input type="datetime-local" name="installDateTime" [(ngModel)]="fitmentFormData.installDateTime" required />
                </div>
              </div>
              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label>Installer Name <span style="color:#ef4444">*</span></label>
                  <input type="text" placeholder="Enter installer name" name="installerName" [(ngModel)]="fitmentFormData.installerName" required />
                </div>
                <div>
                  <label>Installer Contact No</label>
                  <input type="text" placeholder="Enter installer contact number" name="installerContact" [(ngModel)]="fitmentFormData.installerContact" />
                </div>
              </div>
              <div class="form-row">
                <label>Upload Photos <span style="color:#ef4444">*</span></label>
                <input type="file" multiple accept=".jpg,.jpeg,.png" name="photos" #fileInput />
                <div class="small" style="margin-top:4px;">Upload installation photos - JPG, PNG formats</div>
              </div>
              <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="btn" type="button" (click)="submitFitment()">Submit Fitment & Activate</button>
                <button class="btn ghost" type="button" (click)="resetFitmentFlow()">Start Over</button>
              </div>
            </form>
          </div>
        </div>

        <div id="fitment-view" class="tab-content" [class.active]="fitmentTab === 'fitment-view'">
          <table class="table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Vehicle Registration</th>
                <th>Installer</th>
                <th>Installation Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GPS-X100</td>
                <td>OD02AB1234</td>
                <td>R. Nayak</td>
                <td>2025-01-15 14:30</td>
                <td><span class="status-active">Active</span></td>
                <td>
                  <button class="btn ghost" style="padding:4px 8px;font-size:12px;" (click)="activateDevice('GPS-X100')">Activate</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Deactivate/Maintenance Modal -->
    <div id="deviceModal" class="modal" [class.show]="showModal">
      <div class="modal-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">{{ modalTitle }}</h3>
          <button class="btn ghost" (click)="closeDeviceModal()" style="padding:4px 8px;">✕</button>
        </div>
        <form #deviceActionForm="ngForm">
          <div class="form-row">
            <label>Device Name</label>
            <input type="text" [(ngModel)]="modalDeviceName" name="modalDeviceName" readonly style="background:#f4f8fa;" />
          </div>
          <div class="form-row">
            <label>Reason <span style="color:#ef4444">*</span></label>
            <select [(ngModel)]="modalReason" name="modalReason" required>
              <option value="">Select reason</option>
              <option value="maintenance">Maintenance</option>
              <option value="malfunction">Malfunction</option>
              <option value="theft">Theft</option>
              <option value="replacement">Replacement</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-row">
            <label>Additional Notes</label>
            <textarea [(ngModel)]="modalNotes" name="modalNotes" placeholder="Enter additional notes (optional)"></textarea>
          </div>
          <div style="display:flex;gap:8px;margin-top:16px;">
            <button class="btn" type="button" (click)="submitDeviceAction()">Confirm</button>
            <button class="btn ghost" type="button" (click)="closeDeviceModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})



export class DeviceComponent implements OnInit, OnDestroy {
  currentSection = 'registered';
  pageTitle = 'Device Tagging';
  activeTab = 'add';
  fitmentTab = 'fitment-add';
  testPassed = false;
  showModal = false;
  modalTitle = 'Deactivate Device';
  modalDeviceName = '';
  modalReason = '';
  modalNotes = '';
  currentAction = '';
  private languageSubscription?: Subscription;

  vendorsList: VendorOption[] = [];
  availableDevices: Device[] = [];


  deviceFormData = {
    deviceName: '',
    imei: '',
    model: '',
    firmware: '',
    sim1Info: '',
    sim1HealthStatus: '',
    sim2Info: '',
    sim2HealthStatus: '',
    vendor: ''
  };

  testFormData = {
    // device: '',
    device: null as Device | null,
    gpsSignal: '',
    networkConnectivity: '',
    batteryStatus: '',
    dataTransmission: '',
    testDateTime: '',
    testerName: '',
    testLocation: '',
    testResult: '',
    testNotes: ''
  };

  fitmentFormData = {
    // device: '',
    device: null as Device | null,
    vehicleRegNo: '',
    installDateTime: '',
    installerName: '',
    installerContact: ''
  };

  userRole = '';
  deviceSubmitAttempted = false;
  deviceValidationMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translationService: TranslationService,
    private deviceService: DeviceService
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.userRole = sessionStorage.getItem('role') || '';

    this.languageSubscription = this.translationService.language$.subscribe(() => {});

    this.route.data.subscribe(data => {
      if (data['section'] === 'fitment' || this.router.url.includes('/fitment')) {
        if (this.userRole !== 'system-admin') {
          Swal.fire('Access Denied', 'Only VTS Administrators can access Fitment.', 'warning');
          this.router.navigate(['/device']);
          return;
        }
        this.currentSection = 'fitment';
      } else {
        this.currentSection = 'registered';
      }
    });

    this.loadVendors();
    this.loadDevices();
  }

  loadVendors(): void {
    this.deviceService.getVendors().subscribe({
      next: (res) => {
        const rawVendors = this.extractArray(res);
        const normalized = rawVendors
          .map((vendor: any) => this.normalizeVendor(vendor))
          .filter((vendor: VendorOption) => !!vendor.name || !!vendor.label || !!vendor.id);

        this.vendorsList = normalized.length > 0 ? normalized : this.getSessionVendors();

        if (!this.deviceFormData.vendor && this.vendorsList.length > 0) {
          this.deviceFormData.vendor = this.vendorsList[0].id;
        }
      },
      error: (err) => {
        this.vendorsList = this.getSessionVendors();
        if (this.vendorsList.length > 0) {
          this.deviceFormData.vendor = this.vendorsList[0].id;
          return;
        }
        Swal.fire('Error', err?.error?.message || 'Failed to load vendors', 'error');
      }
    });
  }

  // loadDevices(): void {
  //   this.deviceService.listDevices().subscribe({
  //     next: (res) => {
  //       this.availableDevices = (res.data || []).map((d: any) =>
  //         `${d.deviceName} (${d.imeiSerial})`
  //       );
  //     }
  //   });
  // }


  loadDevices(): void {
    this.deviceService.listDevices().subscribe({
      next: (res) => {
        const rawDevices = this.extractArray(res);
        this.availableDevices = rawDevices.map((device: any) => this.normalizeDevice(device));
      },
      error: () => Swal.fire('Error', 'Failed to load devices', 'error')
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'view') this.loadDevices();
  }

  extractVendorId(label: string): string {
    const match = label?.match(/\((.*?)\)/);
    return match ? match[1] : label;
  }

  registerDevice(form?: any): void {
    this.deviceSubmitAttempted = true;
    this.deviceValidationMessage = '';
    form?.control?.markAllAsTouched();

    const deviceName = (this.deviceFormData.deviceName || '').trim();
    const imeiSerial = (this.deviceFormData.imei || '').trim();
    const model = (this.deviceFormData.model || '').trim();
    const sim1Info = (this.deviceFormData.sim1Info || '').trim();
    const sim2Info = (this.deviceFormData.sim2Info || '').trim();
    const vendorId = this.extractVendorId((this.deviceFormData.vendor || '').trim());
    const registeredBy = this.resolveRegisteredBy();
    const healthStatus = this.mapHealthStatus(this.deviceFormData.sim1HealthStatus);

    const missing: string[] = [];
    if (!deviceName) missing.push('Device Name');
    if (!imeiSerial) missing.push('IMEI / Serial');
    if (!model) missing.push('Model');
    if (!sim1Info) missing.push('SIM ICCID / MSISDN 1');
    if (!sim2Info) missing.push('SIM ICCID / MSISDN 2');
    if (!vendorId) missing.push('Vendor');
    if (!registeredBy) missing.push('Registered By');
    if (!healthStatus) missing.push('Health Status 1');

    if (missing.length > 0) {
      this.deviceValidationMessage = `Missing required fields: ${missing.join(', ')}`;
      Swal.fire('Validation Error', this.deviceValidationMessage, 'warning');
      return;
    }

    const payload = {
      deviceName,
      imeiSerial,
      model,
      firmwareVersion: (this.deviceFormData.firmware || '').trim() || null,
      simIccid: sim1Info,
      simMsisdn: sim1Info,
      simIccid2: sim2Info,
      simMsisdn2: sim2Info,
      healthStatus,
      deviceStatus: 'ACTIVE',
      vendorId,
      registeredBy,
      remarks: 'Registered from UI'
    };

    this.deviceService.registerDevice(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Device registered successfully', 'success');
        this.activeTab = 'view';
        this.loadDevices();
        this.clearForm({ reset: () => {} });
      },
      error: (err) => {
        Swal.fire('Error', err?.error?.message || 'Registration failed', 'error');
      }
    });
  }

  private mapHealthStatus(status: string): string {
    const normalized = (status || '').trim().toLowerCase();
    const map: Record<string, string> = {
      healthy: 'GOOD',
      warning: 'WARNING',
      critical: 'CRITICAL',
      unknown: 'UNKNOWN',
      good: 'GOOD',
      ok: 'OK'
    };
    return map[normalized] || '';
  }

  private resolveRegisteredBy(): string {
    const candidates = [
      sessionStorage.getItem('username'),
      sessionStorage.getItem('userId'),
      sessionStorage.getItem('vendorUserId'),
      sessionStorage.getItem('email'),
      sessionStorage.getItem('vendorEmail')
    ];

    const resolved = candidates.find((value) => !!(value || '').trim());
    return resolved ? resolved.trim() : '';
  }

  submitTest(form: any): void {
    if (!form.valid || !this.testFormData.device) {
      Swal.fire('Validation Error', 'Fill required fields and select a device', 'warning');
      return;
    }

    const d = this.testFormData.device;

    Swal.fire({
      icon: 'success',
      title: 'Test Passed',
      html: `
        <strong>Device:</strong> ${d.deviceName} (${d.imeiSerial})<br>
        <strong>Tester:</strong> ${this.testFormData.testerName}
      `
    });

    this.testPassed = true;
    Swal.fire('Success', 'Device tested (prototype)', 'success');
  }

  submitFitment(): void {
    const d = this.fitmentFormData.device || this.testFormData.device;

    if (!d || !this.fitmentFormData.vehicleRegNo) {
      Swal.fire('Missing Info', 'Select device and enter vehicle number', 'warning');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Fitment Submitted',
      html: `
        <strong>Device:</strong> ${d.deviceName} (${d.imeiSerial})<br>
        <strong>Vehicle:</strong> ${this.fitmentFormData.vehicleRegNo}
      `
    });

    this.resetFitmentFlow();
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }

  clearForm(form: any): void {
    if (form?.reset) {
      form.reset();
    }

    this.deviceSubmitAttempted = false;
    this.deviceValidationMessage = '';

    this.deviceFormData = {
      deviceName: '',
      imei: '',
      model: '',
      firmware: '',
      sim1Info: '',
      sim1HealthStatus: '',
      sim2Info: '',
      sim2HealthStatus: '',
      vendor: ''
    };
  }

  showDeviceFieldError(form: any, controlName: string): boolean {
    const control = form?.controls?.[controlName];
    return !!(control && control.invalid && (control.touched || this.deviceSubmitAttempted));
  }

skipTest(): void {
  Swal.fire({
    icon: 'info',
    title: 'Test Skipped',
    text: 'Device testing skipped (prototype mode). You can proceed with fitment.',
    confirmButtonColor: '#2563eb'
  });

  this.testPassed = true;
}

clearTestForm(form: any): void {
  if (form?.reset) {
    form.reset();
  }

  this.testFormData = {
    device: null as Device | null,
    gpsSignal: '',
    networkConnectivity: '',
    batteryStatus: '',
    dataTransmission: '',
    testDateTime: '',
    testerName: '',
    testLocation: '',
    testResult: '',
    testNotes: ''
  };
}

resetFitmentFlow(): void {
  this.testPassed = false;

  this.clearTestForm({ reset: () => {} });

  this.fitmentFormData = {
    device: null,
    vehicleRegNo: '',
    installDateTime: '',
    installerName: '',
    installerContact: ''
  };

  Swal.fire({
    icon: 'info',
    title: 'Flow Reset',
    text: 'Fitment flow has been reset. You can start again.',
    confirmButtonColor: '#2563eb'
  });
}

activateDevice(deviceName: string): void {
  Swal.fire({
    icon: 'question',
    title: 'Activate Device?',
    text: `Are you sure you want to activate ${deviceName}?`,
    showCancelButton: true,
    confirmButtonText: 'Yes, Activate',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#2563eb'
  }).then((result) => {
    if (result.isConfirmed) {
   
      Swal.fire({
        icon: 'success',
        title: 'Activated',
        text: `${deviceName} activated successfully.`,
        confirmButtonColor: '#2563eb'
      });
    }
  });
}

closeDeviceModal(): void {
  this.showModal = false;
  this.modalDeviceName = '';
  this.modalReason = '';
  this.modalNotes = '';
  this.currentAction = '';
}

submitDeviceAction(): void {
  if (!this.modalReason) {
    Swal.fire({
      icon: 'warning',
      title: 'Reason Required',
      text: 'Please select a reason before proceeding.',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const actionText =
    this.currentAction === 'deactivate'
      ? 'Device Deactivated'
      : 'Device Marked for Maintenance';

  
  Swal.fire({
    icon: 'success',
    title: actionText,
    html: `
      <strong>Device:</strong> ${this.modalDeviceName}<br>
      <strong>Reason:</strong> ${this.modalReason}<br>
      ${this.modalNotes ? `<strong>Notes:</strong> ${this.modalNotes}` : ''}
    `,
    confirmButtonColor: '#2563eb'
  });

  this.closeDeviceModal();
}

setFitmentTab(tab: 'fitment-add' | 'fitment-list' | 'fitment-history'|'fitment-view'): void {
  this.fitmentTab = tab;


  if (tab === 'fitment-add') {
    this.resetFitmentFlow();
  }

  if (tab === 'fitment-list') {
    this.loadFitmentList();
  }

  if (tab === 'fitment-view') {
    this.loadFitmentView();
  }

  if (tab === 'fitment-history') {
    this.loadFitmentHistory();
  }
}
loadFitmentList(): void {
  console.log('Loading fitment list...');

}

loadFitmentView(): void {
  console.log('Loading fitment view...');

}

loadFitmentHistory(): void {
  console.log('Loading fitment history...');

}

private extractArray(response: any): any[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.content)) {
    return response.content;
  }
  if (Array.isArray(response?.result)) {
    return response.result;
  }
  const deepArray = this.findFirstArray(response);
  if (deepArray.length > 0) {
    return deepArray;
  }
  return [];
}

private findFirstArray(value: any): any[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  for (const key of Object.keys(value)) {
    const current = value[key];
    if (Array.isArray(current)) {
      return current;
    }
  }

  for (const key of Object.keys(value)) {
    const nested = this.findFirstArray(value[key]);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

private normalizeVendor(vendor: any): VendorOption {
  if (typeof vendor === 'string') {
    const id = this.extractVendorId(vendor);
    const name = vendor.replace(/\((.*?)\)/, '').trim();
    return {
      id: id || vendor,
      name,
      label: id ? `${name} (${id})` : name
    };
  }

  const id =
    vendor?.vendorId ||
    vendor?.vendorID ||
    vendor?.VENDOR_ID ||
    vendor?.id ||
    vendor?.ssoId ||
    vendor?.ssoid ||
    vendor?.code ||
    '';

  const name =
    vendor?.vendorName ||
    vendor?.VENDOR_NAME ||
    vendor?.name ||
    vendor?.vendorOrgName ||
    vendor?.organizationName ||
    vendor?.displayName ||
    vendor?.title ||
    '';

  const resolvedId = String(id || name || '').trim();
  const resolvedName = String(name || id || '').trim();

  return {
    id: resolvedId,
    name: resolvedName,
    label: id && name ? `${resolvedName} (${resolvedId})` : String(resolvedName || resolvedId).trim()
  };
}

private getSessionVendors(): VendorOption[] {
  const fromList = this.safeParseArray(sessionStorage.getItem('vendors_list'))
    .map((vendor: any) => this.normalizeVendor(vendor))
    .filter((vendor: VendorOption) => !!vendor.id || !!vendor.name);

  if (fromList.length > 0) {
    return fromList;
  }

  const fromSingle = this.safeParseObject(sessionStorage.getItem('vendorData'));
  if (fromSingle) {
    const normalized = this.normalizeVendor(fromSingle);
    if (normalized.id || normalized.name) {
      return [normalized];
    }
  }

  return [];
}

private safeParseArray(value: string | null): any[] {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

private safeParseObject(value: string | null): any | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

private normalizeDevice(device: any): Device {
  const vendorId = device?.vendorId || device?.VENDOR_ID || device?.vendor || '';
  const vendorName =
    device?.vendorName ||
    device?.VENDOR_NAME ||
    this.vendorsList.find(v => v.id === vendorId)?.name ||
    vendorId ||
    '';

  return {
    deviceName: device?.deviceName || device?.DEVICE_NAME || device?.name || '',
    imeiSerial: device?.imeiSerial || device?.IMEI_SERIAL || device?.imei || device?.serialNo || '',
    model: device?.model || device?.MODEL || '',
    firmwareVersion: device?.firmwareVersion || device?.FIRMWARE_VERSION || device?.firmware || '',
    deviceStatus: device?.deviceStatus || device?.DEVICE_STATUS || device?.status || '',
    vendorName,
    healthStatus: device?.healthStatus || device?.HEALTH_STATUS || ''
  };
}

}
