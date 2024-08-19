import { effect, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, Observable, of, skip, take, tap } from 'rxjs';
import { NgxSignalTranslateLoaderService } from './ngx-signal-translate-loader.service';
import { LanguageResources, TranslateParams } from './ngx-signal-translate.interface';

@Injectable({
  providedIn: 'root',
})
export class NgxSignalTranslateService {
  readonly #ngxSignalTranslateLoaderService = inject(NgxSignalTranslateLoaderService);
  readonly #languageResources = signal<LanguageResources>({});
  readonly #languageResources$ = toObservable(this.#languageResources);
  readonly #selectedLanguage = signal<string>('');
  public readonly currentLanguage = this.#selectedLanguage.asReadonly();

  constructor() {
    effect(
      async () => {
        const languageResources = this.#languageResources();
        const currentLanguage = this.currentLanguage();
        if (currentLanguage && !languageResources[currentLanguage]) this.#loadLangauge(currentLanguage).subscribe();
      },
      { allowSignalWrites: true },
    );
  }

  public setLanguage(language: string): void {
    this.#selectedLanguage.set(language);
  }

  public translate(key: string, params?: TranslateParams): string {
    const currentLanguage = this.currentLanguage();
    const languageResources = this.#languageResources();

    let translatedString = languageResources[currentLanguage]?.[key];

    if (translatedString && !!params) {
      for (const replaceKey in params) translatedString = translatedString.replaceAll(`{${replaceKey}}`, params[replaceKey]);
      return translatedString;
    } else return translatedString || key;
  }

  public translate$(key: string, params?: TranslateParams): Observable<string> {
    const currentLanguage = this.currentLanguage();
    const languageResources = this.#languageResources();
    if (!languageResources[currentLanguage])
      return this.#languageResources$.pipe(
        skip(1),
        take(1),
        map(() => this.translate(key, params)),
      );
    else return of(this.translate(key, params));
  }

  #loadLangauge(language: string): Observable<Record<string, string> | null> {
    return this.#ngxSignalTranslateLoaderService.loadTranslationFile(language).pipe(
      take(1),
      tap((resource) => this.#patchLanguageResource(language, resource)),
    );
  }

  #patchLanguageResource(key: string, resource: Record<string, string> | null): void {
    if (resource) this.#languageResources.update((state) => ({ ...state, [key]: resource }));
  }
}
