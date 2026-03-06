import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService, Language } from '../../services/translation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">{{ translate('configuration.title') }}</div>
      <div class="small">{{ translate('configuration.subtitle') }}</div>
    </div>

    <div class="card">
      <div style="margin-bottom:20px;">
        <strong style="font-size:18px;color:var(--title-color);">{{ translate('configuration.languageSettings') }}</strong>
        <div class="small" style="margin-top:4px;">{{ translate('configuration.selectYourPreferredLanguage') }}</div>
      </div>

      <div style="padding:20px;background:#f8f9fa;border-radius:8px;">
        <div style="margin-bottom:16px;">
          <label style="display:block;font-weight:600;color:var(--title-color);margin-bottom:8px;">
            {{ translate('configuration.currentLanguage') }}
          </label>
          <select 
            [(ngModel)]="selectedLanguage" 
            (change)="onLanguageChange()"
            style="width:100%;max-width:300px;padding:10px;border:1px solid #dbe7ea;border-radius:6px;font-size:14px;">
            <option value="en">{{ translate('common.english') }}</option>
            <option value="hi">{{ translate('common.hindi') }}</option>
          </select>
        </div>

        <div style="display:flex;gap:12px;margin-top:20px;">
          <div style="flex:1;padding:16px;background:#fff;border-radius:6px;border:2px solid #dbe7ea;">
            <div style="font-weight:700;color:var(--title-color);margin-bottom:8px;">{{ translate('common.english') }}</div>
            <div class="small" style="color:var(--text-color);">
              {{ selectedLanguage === 'en' ? 'Currently selected' : 'Click to select English' }}
            </div>
          </div>
          <div style="flex:1;padding:16px;background:#fff;border-radius:6px;border:2px solid #dbe7ea;">
            <div style="font-weight:700;color:var(--title-color);margin-bottom:8px;">{{ translate('common.hindi') }}</div>
            <div class="small" style="color:var(--text-color);">
              {{ selectedLanguage === 'hi' ? 'वर्तमान में चयनित' : 'हिंदी चुनने के लिए क्लिक करें' }}
            </div>
          </div>
        </div>

        <div style="margin-top:20px;padding:12px;background:#e8f5e9;border-radius:6px;border-left:4px solid #4caf50;">
          <div style="font-size:13px;color:#2e7d32;">
            <strong>Note:</strong> Changing the language will update all labels throughout the application immediately.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConfigurationComponent implements OnInit {
  selectedLanguage: Language = 'en';

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.selectedLanguage = this.translationService.getCurrentLanguage();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onLanguageChange(): void {
    this.translationService.setLanguage(this.selectedLanguage);
    Swal.fire({
      icon: 'success',
      title: this.translate('configuration.languageChanged'),
      text: this.translate('configuration.languageChangedSuccessfully'),
      confirmButtonColor: '#008080',
      timer: 2000,
      timerProgressBar: true
    });
  }
}

