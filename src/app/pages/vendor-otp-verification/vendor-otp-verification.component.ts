import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vendor-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header-bar">
      <div class="logo-section">
        <img src="https://mines.rajasthan.gov.in/dmgcms/Static/website/images/logo_img.png" 
             alt="Rajmines Logo" 
             onerror="this.src='assets/rmines-logo.png'">
        <div class="logo-text">
          <h1>RAJMINES VTS</h1>
          <small>GPS-RFID Based Vehicle Tracking System</small>
        </div>
      </div>
      <button class="back-btn" (click)="goBack()">Back</button>
    </div>

    <div class="main-content">
      <div class="content-card">
        <div class="content-section">
          <h2>OTP Verification</h2>
          <p class="subtitle">Please enter the OTP sent to your registered email</p>
          
          <div class="info-box">
            <div class="info-item">
              <strong>Email:</strong> {{ vendorEmail }}
            </div>
            <div class="info-item prototype-hint">
              <strong>Prototype OTP:</strong> <span class="otp-hint">123456</span>
            </div>
          </div>

          <form #otpForm="ngForm" class="otp-form">
            <div class="form-row">
              <label>Enter OTP <span class="required">*</span></label>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                name="otp" 
                [(ngModel)]="otpInput" 
                maxlength="6"
                pattern="[0-9]{6}"
                required 
                class="otp-input"
                (input)="onOtpInput($event)" />
              <div class="form-hint">Enter the 6-digit OTP sent to your email</div>
            </div>
            
            <div class="form-actions">
              <button class="btn-primary" type="button" (click)="verifyOTP(otpForm)" [disabled]="!otpForm.valid || otpInput.length !== 6">
                Verify OTP
              </button>
              <button class="btn-secondary" type="button" (click)="resendOTP()">Resend OTP</button>
            </div>

            <div class="prototype-bypass">
              <button class="btn-bypass" type="button" (click)="bypassOTP()">
                Skip Verification (Prototype Only)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :host {
      display: block;
      min-height: 100vh;
      background: #f5f7fa;
    }
    .header-bar {
      background: #003366;
      color: white;
      padding: 12px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-section img {
      height: 45px;
      width: 45px;
      object-fit: contain;
    }
    .logo-text h1 {
      font-size: 18px;
      font-weight: 600;
      color: white;
      margin: 0;
      line-height: 1.2;
    }
    .logo-text small {
      font-size: 12px;
      color: rgba(255,255,255,0.9);
      margin-top: 1px;
    }
    .back-btn {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
      transition: all 0.2s;
    }
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .main-content {
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .content-card {
      background: white;
      border-radius: 12px;
      padding: 35px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 500px;
    }
    .content-section h2 {
      color: #003366;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #008080;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 25px;
    }
    .info-item {
      margin-bottom: 8px;
      font-size: 14px;
      color: #333;
    }
    .info-item:last-child {
      margin-bottom: 0;
    }
    .prototype-hint {
      background: #fff3cd;
      padding: 8px;
      border-radius: 4px;
      margin-top: 8px;
    }
    .otp-hint {
      font-family: monospace;
      font-size: 16px;
      font-weight: 700;
      color: #008080;
      letter-spacing: 2px;
    }
    .otp-form {
      margin-top: 20px;
    }
    .form-row {
      margin-bottom: 20px;
    }
    .form-row label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .required {
      color: #ef4444;
    }
    .otp-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 4px;
      text-align: center;
      font-family: monospace;
      transition: border-color 0.2s;
    }
    .otp-input:focus {
      outline: none;
      border-color: #008080;
      box-shadow: 0 0 0 3px rgba(0,128,128,0.1);
    }
    .form-hint {
      font-size: 12px;
      color: #666;
      margin-top: 6px;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 25px;
    }
    .btn-primary {
      flex: 1;
      background: #008080;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #006666;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,128,128,0.3);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #f5f7fa;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: #e9ecef;
    }
    .prototype-bypass {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px dashed #ddd;
    }
    .btn-bypass {
      width: 100%;
      background: #ffc107;
      color: #333;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-bypass:hover {
      background: #ffb300;
    }
    @media (max-width: 768px) {
      .header-bar {
        padding: 10px 15px;
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
      .back-btn {
        align-self: flex-end;
      }
      .main-content {
        padding: 15px;
      }
      .content-card {
        padding: 20px 15px;
      }
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class VendorOTPVerificationComponent implements OnInit {
  otpInput = '';
  vendorEmail = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if vendor is registered
    const isVendorRegistered = sessionStorage.getItem('vendorRegistered') === 'true';
    if (!isVendorRegistered) {
      Swal.fire({
        icon: 'warning',
        title: 'Registration Required',
        text: 'Please register as a vendor first.',
        confirmButtonColor: '#008080'
      }).then(() => {
        this.router.navigate(['/vendor-registration']);
      });
      return;
    }

    // Get vendor email
    this.vendorEmail = sessionStorage.getItem('vendorEmail') || 'your-email@example.com';
    
    // Check if already verified
    const isVerified = sessionStorage.getItem('vendorOTPVerified') === 'true';
    if (isVerified) {
      this.router.navigate(['/role-selection']);
    }
  }

  onOtpInput(event: any): void {
    // Only allow numbers
    this.otpInput = event.target.value.replace(/[^0-9]/g, '');
  }

  verifyOTP(form: any): void {
    if (!form.valid || this.otpInput.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Please enter a valid 6-digit OTP',
        confirmButtonColor: '#008080'
      });
      return;
    }

    const storedOTP = sessionStorage.getItem('vendorOTP');
    const otpExpiry = sessionStorage.getItem('vendorOTPExpiry');
    
    // Check if OTP expired
    if (otpExpiry && new Date(otpExpiry) < new Date()) {
      Swal.fire({
        icon: 'error',
        title: 'OTP Expired',
        text: 'The OTP has expired. Please request a new one.',
        confirmButtonColor: '#008080'
      }).then(() => {
        this.resendOTP();
      });
      return;
    }

    // Verify OTP (for prototype, accept 123456 or any 6 digits)
    if (this.otpInput === storedOTP || this.otpInput === '123456') {
      sessionStorage.setItem('vendorOTPVerified', 'true');
      
      Swal.fire({
        icon: 'success',
        title: 'OTP Verified!',
        html: `Your email has been verified successfully.<br><br>You can now access GPS Vendor role.`,
        confirmButtonColor: '#008080',
        confirmButtonText: 'Continue'
      }).then(() => {
        this.router.navigate(['/role-selection']);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid OTP',
        text: 'The OTP you entered is incorrect. Please try again.',
        confirmButtonColor: '#008080'
      });
      this.otpInput = '';
    }
  }

  resendOTP(): void {
    // Generate new OTP (for prototype, use same simple OTP)
    const otp = '123456';
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    sessionStorage.setItem('vendorOTP', otp);
    sessionStorage.setItem('vendorOTPExpiry', otpExpiry.toISOString());
    
    Swal.fire({
      icon: 'success',
      title: 'OTP Resent',
      html: `A new OTP has been sent to <strong>${this.vendorEmail}</strong><br><br><small>(For prototype: OTP is <strong>123456</strong>)</small>`,
      confirmButtonColor: '#008080'
    });
  }

  bypassOTP(): void {
    // For prototype: Skip OTP verification
    sessionStorage.setItem('vendorOTPVerified', 'true');
    
    Swal.fire({
      icon: 'info',
      title: 'Verification Skipped',
      text: 'OTP verification bypassed for prototype. You can now access GPS Vendor role.',
      confirmButtonColor: '#008080',
      confirmButtonText: 'Continue'
    }).then(() => {
      this.router.navigate(['/role-selection']);
    });
  }

  goBack(): void {
    this.router.navigate(['/vendor-registration']);
  }
}

