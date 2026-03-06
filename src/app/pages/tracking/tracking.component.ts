import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="page-title">{{ translate('tracking.title') }}</div>
      <div class="small">{{ translate('tracking.subtitle') }}</div>
    </div>

    <div class="card">
      <div class="tabs">
        <div class="tab" [class.active]="activeTab === 'live'" (click)="setActiveTab('live')">{{ translate('tracking.live') }}</div>
        <div class="tab" [class.active]="activeTab === 'history'" (click)="setActiveTab('history')">{{ translate('tracking.history') }}</div>
      </div>

      <div id="tracking-live" class="tab-content" [class.active]="activeTab === 'live'">
        <div>
          <strong>{{ translate('tracking.liveTracking') }}</strong>
          <div class="small" style="margin-top:8px;">{{ translate('tracking.realTimeVehiclePositions') }}</div>
          <div style="margin-top:16px;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);position:relative;">
            <iframe
              src="https://www.google.com/maps?q=26.9124,75.7873&hl=en&z=11&output=embed"
              width="100%"
              height="500"
              style="border:0;display:block;pointer-events:none;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
            <!-- Vehicle Markers Overlay -->
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;">
              <div style="position:absolute;top:35%;left:48%;transform:translate(-50%,-50%);">
                <div style="font-size:32px;filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">🚛</div>
                <div style="background:#4285f4;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;margin-top:2px;white-space:nowrap;">OD02AB1234</div>
              </div>
              <div style="position:absolute;top:45%;left:52%;transform:translate(-50%,-50%);">
                <div style="font-size:32px;filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">🚛</div>
                <div style="background:#34a853;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;margin-top:2px;white-space:nowrap;">RJ14CD5678</div>
              </div>
              <div style="position:absolute;top:55%;left:46%;transform:translate(-50%,-50%);">
                <div style="font-size:32px;filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">🚛</div>
                <div style="background:#ea4335;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;margin-top:2px;white-space:nowrap;">RJ19EF9012</div>
              </div>
              <!-- DMG Logo Watermark -->
              <div style="position:absolute;bottom:80px;right:16px;background:rgba(255,255,255,0.95);padding:8px 12px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);pointer-events:auto;">
                <img src="https://mines.rajasthan.gov.in/dmgcms/Static/website/images/logo_img.png" alt="DMG Logo" style="height:40px;display:block;">
              </div>
            </div>
            <div style="padding:12px;background:#f8f9fa;border-top:1px solid #e6eef5;position:relative;z-index:10;">
              <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:16px;height:16px;background:#4285f4;border-radius:50%;display:inline-block;"></span>
                  Vehicle 1 (OD02AB1234)
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:16px;height:16px;background:#34a853;border-radius:50%;display:inline-block;"></span>
                  Vehicle 2 (RJ14CD5678)
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:16px;height:16px;background:#ea4335;border-radius:50%;display:inline-block;"></span>
                  Vehicle 3 (RJ19EF9012)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="tracking-history" class="tab-content" [class.active]="activeTab === 'history'">
        <div>
          <strong>{{ translate('tracking.trackingHistory') }}</strong>
          <div class="small" style="margin-top:8px;">{{ translate('tracking.viewHistoricalTrackingData') }}</div>
          <div style="margin-top:16px;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-bottom:16px;position:relative;">
            <iframe
              src="https://www.google.com/maps?q=26.9124,75.7873&hl=en&z=11&output=embed"
              width="100%"
              height="400"
              style="border:0;display:block;pointer-events:none;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
            <!-- Vehicle Markers Overlay for History -->
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;">
              <div style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);">
                <div style="font-size:28px;filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">🚛</div>
                <div style="background:#4285f4;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;margin-top:2px;white-space:nowrap;">OD02AB1234</div>
              </div>
              <div style="position:absolute;top:50%;left:48%;transform:translate(-50%,-50%);">
                <div style="font-size:28px;filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">🚛</div>
                <div style="background:#34a853;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;margin-top:2px;white-space:nowrap;">RJ14CD5678</div>
              </div>
              <!-- DMG Logo Watermark -->
              <div style="position:absolute;bottom:16px;right:16px;background:rgba(255,255,255,0.95);padding:8px 12px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);pointer-events:auto;">
                <img src="https://mines.rajasthan.gov.in/dmgcms/Static/website/images/logo_img.png" alt="DMG Logo" style="height:40px;display:block;">
              </div>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>{{ translate('tracking.vehicle') }}</th>
                <th>{{ translate('tracking.dateTime') }}</th>
                <th>{{ translate('tracking.location') }}</th>
                <th>{{ translate('common.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>OD02AB1234</td>
                <td>2025-01-15 14:30</td>
                <td>26.9124°N, 75.7873°E</td>
                <td class="status-active">{{ translate('tracking.moving') }}</td>
              </tr>
              <tr>
                <td>RJ14CD5678</td>
                <td>2025-01-15 13:15</td>
                <td>26.9150°N, 75.7900°E</td>
                <td class="status-inactive">{{ translate('tracking.stopped') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TrackingComponent implements OnInit, OnDestroy {
  activeTab = 'live';
  private languageSubscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageSubscription = this.translationService.language$.subscribe(() => {
      // Component will automatically update when language changes
    });
    // Check if this is a fresh navigation
    const isFreshNav = sessionStorage.getItem('freshNav_tracking') === 'true';
    if (isFreshNav) {
      // Remove fresh nav flag and default to 'live' tab
      sessionStorage.removeItem('freshNav_tracking');
      this.activeTab = 'live';
    } else {
      // Restore previous tab state
      const stored = sessionStorage.getItem('tab_tracking');
      if (stored) {
        this.activeTab = stored;
      } else {
        // Default to 'live' if no stored state
        this.activeTab = 'live';
      }
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    sessionStorage.setItem('tab_tracking', tab);
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }
}

