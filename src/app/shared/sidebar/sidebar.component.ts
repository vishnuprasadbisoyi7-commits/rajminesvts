import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';

interface MenuItem {
  id: string;
  title: string;
  route?: string;
  type: 'link' | 'section';
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.hidden]="isHidden" aria-label="Sidebar">
      <div class="sidebar-header">
        <div style="display:flex;align-items:center;gap:16px;width:100%;">
          <div style="background:#e3f2fd;padding:8px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <img src="https://mines.rajasthan.gov.in/dmgcms/Static/website/images/logo_img.png" alt="DMG Logo" style="height:50px;width:50px;object-fit:contain;">
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:800;font-size:16px;color:var(--teal);">Rajmines</div>
            <div class="small" style="margin-top:2px;">VTS – DMG</div>
            <div class="small" style="margin-top:2px;">Rajasthan</div>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <ng-container *ngFor="let item of menuStructure">
          <a
            *ngIf="item.type === 'link'"
            [routerLink]="item.route"
            class="sidebar-link"
            [class.active]="isActive(item)"
            (click)="onLinkClick(item)">
            <span>{{ item.title }}</span>
          </a>
          <div *ngIf="item.type === 'section'" class="sidebar-section">
            <div class="sidebar-section-header" (click)="toggleSection(item.id)">
              <span class="sidebar-section-title">{{ item.title }}</span>
              <span class="sidebar-chevron">{{ isExpanded(item.id) ? '▲' : '▼' }}</span>
            </div>
            <div class="sidebar-section-content" [class.expanded]="isExpanded(item.id)">
              <a
                *ngFor="let child of item.children"
                [routerLink]="child.route"
                class="sidebar-link sidebar-sublink"
                [class.active]="isActive(child)"
                (click)="onLinkClick(child)">
                <span>{{ child.title }}</span>
              </a>
            </div>
          </div>
        </ng-container>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background: var(--sidebar-bg);
      padding: 18px;
      border-radius: 10px;
      color: #fff;
      min-height: calc(100vh - 120px);
    }
    .sidebar.hidden {
      display: none;
    }
    .sidebar-header {
      margin-bottom: 20px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sidebar-link {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: 6px;
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      transition: background 0.2s ease;
      cursor: pointer;
    }
    .sidebar-link:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .sidebar-link.active {
      border-left: 4px solid var(--teal);
      padding-left: 10px;
      background: rgba(0, 180, 216, 0.1);
    }
    .sidebar-section {
      margin-bottom: 4px;
    }
    .sidebar-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s ease;
      font-weight: 700;
    }
    .sidebar-section-header:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .sidebar-section-title {
      flex: 1;
    }
    .sidebar-chevron {
      font-size: 12px;
      transition: transform 0.2s ease;
    }
    .sidebar-section-content {
      display: none;
      margin-top: 4px;
      padding-left: 8px;
    }
    .sidebar-section-content.expanded {
      display: block;
    }
    .sidebar-sublink {
      padding-left: 24px;
      font-size: 14px;
      font-weight: 600;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isHidden = false;
  expandedSections: Set<string> = new Set();
  private routerSubscription?: Subscription;
  private toggleSubscription?: Subscription;
  private previousUrl: string = '';

  menuStructure: MenuItem[] = [];

  constructor(
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Load menu based on role
    this.loadMenuForRole();

    // Listen for language changes to reload menu
    this.translationService.language$.subscribe(() => {
      this.loadMenuForRole();
    });

    // Listen for toggle events
    this.toggleSubscription = new Subscription();
    const toggleHandler = () => {
      this.isHidden = !this.isHidden;
    };
    window.addEventListener('toggleSidebar', toggleHandler);
    this.toggleSubscription.add({ unsubscribe: () => window.removeEventListener('toggleSidebar', toggleHandler) });

    // Track router changes to expand sections and reset tabs on navigation
    this.previousUrl = this.router.url;
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveState(event.url);
        // Reset tab state only when navigating to a different route
        if (this.previousUrl !== event.url) {
          this.resetTabStateForRoute(event.url);
          this.previousUrl = event.url;
        }
      });

    // Initialize expanded sections
    this.updateActiveState(this.router.url);
  }

  loadMenuForRole(): void {
    const role = sessionStorage.getItem('role') || 'system-admin';
    
    const menus: { [key: string]: MenuItem[] } = {
      'system-admin': [
        // {
        //   id: 'index',
        //   title: this.translationService.translate('sidebar.dashboard'),
        //   route: '/dashboard',
        //   type: 'link'
        // },
        // {
        //   id: 'vendor',
        //   title: this.translationService.translate('sidebar.vendorEnrollment'),
        //   route: '/vendor',
        //   type: 'link'
        // },
        // {
        //   id: 'device',
        //   title: this.translationService.translate('sidebar.deviceTagging'),
        //   type: 'section',
        //   children: [
        //     { id: 'device-fitment', title: this.translationService.translate('sidebar.fitAndActivate'), route: '/device/fitment', type: 'link' }
        //   ]
        // },
        // {
        //   id: 'geofence',
        //   title: this.translationService.translate('sidebar.geoFencing'),
        //   route: '/geofence',
        //   type: 'link'
        // },
        // {
        //   id: 'tracking',
        //   title: this.translationService.translate('sidebar.endToEndTracking'),
        //   route: '/tracking',
        //   type: 'link'
        // },
        // {
        //   id: 'trip-assignment',
        //   title: this.translationService.translate('sidebar.tripAssignment'),
        //   route: '/trip-assignment',
        //   type: 'link'
        // },
        {
        id: 'function-master',
        title: this.translationService.translate('sidebar.functionMaster'),
         type: 'section',
         children: [
          { id: 'function-master-link', title: 'Function Master', route: '/function-master', type: 'link' }
         ]
},

{
  id: 'global-link',
  title: this.translationService.translate('sidebar.globalLink'),
  type: 'section',
  children: [
    { id: 'global-link-link', title: 'Global Link', route: '/global-link', type: 'link' }
  ]
},


{
  id: 'primary-link',
  title: this.translationService.translate('sidebar.primaryLink'),
  type: 'section',
  children: [
    {id: 'primary-link-link', title:'Primary Link',route: '/primary-link',type: 'link'}
  ]
},
        {
          id: 'create-group',
          title: this.translationService.translate('sidebar.createGroup'),
          route: '/create-group',
          type: 'link'
        },
        {
          id: 'create-user',
          title: this.translationService.translate('sidebar.createUser'),
          route: '/create-user',
          type: 'link'
        },
        {
          id: 'user-menu-mapping',
          title: this.translationService.translate('sidebar.userMenuMapping'),
          route: '/user-menu-mapping',
          type: 'link'
        }     
        // {
        //   id: 'notifications',
        //   title: this.translationService.translate('sidebar.notifications'),
        //   route: '/notifications',
        //   type: 'link'
        // }
      ],
      'gps-vendor': [
        {
          id: 'index',
          title: this.translationService.translate('sidebar.dashboard'),
          route: '/dashboard',
          type: 'link'
        },
        {
          id: 'device',
          title: this.translationService.translate('sidebar.deviceTagging'),
          type: 'section',
          children: [
            { id: 'device-registered', title: this.translationService.translate('sidebar.registerGpsDevice'), route: '/device', type: 'link' }
          ]
        }
        // {
        //   id: 'notifications',
        //   title: this.translationService.translate('sidebar.notifications'),
        //   route: '/notifications',
        //   type: 'link'
        // }
      ],
      'occ': [
        {
          id: 'index',
          title: this.translationService.translate('sidebar.occDashboard'),
          route: '/dashboard',
          type: 'link'
        }
      ]
    };

    this.menuStructure = menus[role] || menus['system-admin'];
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.toggleSubscription?.unsubscribe();
  }

  private updateActiveState(url: string): void {
    // Expand device section if on device routes
    if (url.startsWith('/device')) {
      this.expandedSections.add('device');
    }
  }

  private resetTabStateForRoute(url: string): void {
    // Determine which module this route belongs to and reset its tab state
    if (url === '/vendor') {
      sessionStorage.removeItem('tab_vendor');
      sessionStorage.setItem('freshNav_vendor', 'true');
    } else if (url === '/device') {
      sessionStorage.removeItem('tab_device');
      sessionStorage.setItem('freshNav_device-registered', 'true');
    } else if (url === '/device/fitment') {
      sessionStorage.removeItem('tab_fitment');
      sessionStorage.setItem('freshNav_device-fitment', 'true');
    } else if (url === '/geofence') {
      sessionStorage.removeItem('tab_geofence');
      sessionStorage.setItem('freshNav_geofence', 'true');
    } else if (url === '/tracking') {
      sessionStorage.removeItem('tab_tracking');
      sessionStorage.setItem('freshNav_tracking', 'true');
    } else if (url === '/notifications') {
      sessionStorage.removeItem('tab_notifications');
      sessionStorage.setItem('freshNav_notifications', 'true');
    }
  }

  isActive(item: MenuItem): boolean {
    const currentUrl = this.router.url;
    if (item.route) {
      if (item.route === '/device' && currentUrl === '/device') {
        return true;
      }
      if (item.route === '/device/fitment' && currentUrl === '/device/fitment') {
        return true;
      }
      return currentUrl === item.route;
    }
    return false;
  }

  isExpanded(sectionId: string): boolean {
    return this.expandedSections.has(sectionId);
  }

  toggleSection(sectionId: string): void {
    if (this.expandedSections.has(sectionId)) {
      this.expandedSections.delete(sectionId);
    } else {
      this.expandedSections.add(sectionId);
    }
  }

  onLinkClick(item: MenuItem): void {
    // Clear tab state for the module being navigated to, so it defaults to "Add" tab
    if (item.id && item.id !== 'index') {
      // Clear the tab state for this module
      sessionStorage.removeItem('tab_' + item.id);
      // Set fresh nav flag to indicate this is a new navigation
      sessionStorage.setItem('freshNav_' + item.id, 'true');
    }
    // Also clear child tab states if it's a section
    if (item.children) {
      item.children.forEach(child => {
        if (child.id) {
          sessionStorage.removeItem('tab_' + child.id);
          sessionStorage.setItem('freshNav_' + child.id, 'true');
        }
      });
    }
  }
}

