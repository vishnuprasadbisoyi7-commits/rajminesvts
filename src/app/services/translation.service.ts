import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import enTranslations from '../../assets/translations/en.json';
import hiTranslations from '../../assets/translations/hi.json';

export type Language = 'en' | 'hi';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage: Language = 'en';
  private languageSubject = new BehaviorSubject<Language>(this.currentLanguage);
  public language$: Observable<Language> = this.languageSubject.asObservable();

  private translations: { [key: string]: { [key: string]: string } } = {
    en: enTranslations as any,
    hi: hiTranslations as any
  };

  constructor() {
    // Load saved language preference
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
      this.currentLanguage = savedLang;
      this.languageSubject.next(this.currentLanguage);
    }
  }

  setLanguage(language: Language): void {
    if (language === 'en' || language === 'hi') {
      this.currentLanguage = language;
      localStorage.setItem('app_language', language);
      this.languageSubject.next(this.currentLanguage);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  translate(key: string, params?: { [key: string]: string }): string {
    // Handle nested keys with dot notation (e.g., "dashboard.title")
    const getNestedValue = (obj: any, path: string): string | undefined => {
      return path.split('.').reduce((current, prop) => {
        return current && current[prop] !== undefined ? current[prop] : undefined;
      }, obj);
    };

    const translations = this.translations[this.currentLanguage] || this.translations['en'] || {};
    let translation = getNestedValue(translations, key);
    
    // Fallback to English if not found in current language
    if (!translation && this.currentLanguage !== 'en') {
      translation = getNestedValue(this.translations['en'], key);
    }
    
    // If still not found, return the key itself
    if (!translation || typeof translation !== 'string') {
      return key;
    }
    
    if (params) {
      return this.interpolate(translation, params);
    }
    
    return translation;
  }

  private interpolate(template: string, params: { [key: string]: string }): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  // Method to get translation object for direct access in templates
  getTranslations(): { [key: string]: string } {
    return this.translations[this.currentLanguage] || this.translations['en'] || {};
  }
}

