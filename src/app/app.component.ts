import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule],
  template: `
    <ng-container *ngIf="showLayout">
      <app-header></app-header>
      <div class="container">
        <app-sidebar></app-sidebar>
        <main class="main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </ng-container>
    <ng-container *ngIf="!showLayout">
      <router-outlet></router-outlet>
    </ng-container>
  `,
  styles: [`
    .container {
      display: flex;
      gap: 20px;
      padding: 20px;
    }
    .main {
      flex: 1;
    }
    @media (max-width: 880px) {
      .container {
        flex-direction: column;
        padding: 12px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Rajmines VTS';
  showLayout = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Clear all storage and cookies on every page load/reload
    this.clearAllStorageAndCookies();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;
        this.showLayout = url !== '/role-selection' && url !== '/' && url !== '/vendor-registration' && url !== '/vendor-otp-verification';
      });
    
    // Initialize based on current route
    const currentUrl = this.router.url;
    this.showLayout = currentUrl !== '/role-selection' && currentUrl !== '/' && currentUrl !== '/vendor-registration' && currentUrl !== '/vendor-otp-verification';
  }

  clearAllStorageAndCookies(): void {
    try {
      // Clear all localStorage
      localStorage.clear();
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Clear all cookies
      this.clearAllCookies();
    } catch (e) {
      console.error('Error clearing storage and cookies:', e);
    }
  }

  clearAllCookies(): void {
    try {
      // Get all cookies
      const cookies = document.cookie.split(';');
      
      // Clear each cookie by setting it to expire in the past
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name) {
          // Set cookie to expire immediately by setting expiry date in the past
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });
    } catch (e) {
      console.error('Error clearing cookies:', e);
    }
  }
}

