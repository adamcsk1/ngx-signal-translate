import { effect, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap, filter, switchMap, take } from 'rxjs/operators';
import { NgxSignalTranslateLoaderService } from './ngx-signal-translate-loader.service';
import { LanguageResources, TranslateParams } from './ngx-signal-translate.interface';

@Injectable({
  providedIn: 'root',
})
export class NgxSignalTranslateService {
  readonly #ngxSignalTranslateLoaderService = inject(NgxSignalTranslateLoaderService);
  readonly #languageResources = signal<LanguageResources>({});
  readonly #selectedLanguage = signal<string>('');
  readonly #inFlightLoads = new Map<string, Observable<void>>();
  public readonly currentLanguage = this.#selectedLanguage.asReadonly();
  readonly #currentLanguage$ = toObservable(this.currentLanguage);

  constructor() {
    effect(() => {
      const language = this.currentLanguage();
      if (!language) return;
      this.#ensureLanguageLoaded(language).subscribe();
    });
  }

  public setLanguage(language: string): void {
    this.#selectedLanguage.set(language);
  }

  public translate(key: string, params?: TranslateParams): string {
    const currentLanguage = this.currentLanguage();
    const languageResources = this.#languageResources();

    const value = languageResources[currentLanguage]?.[key];

    if (!value) return key;
    if (!params) return value;

    return Object.entries(params).reduce((previousValue, [paramKey, paramValue]) => previousValue.replaceAll(`{${paramKey}}`, String(paramValue)), value);
  }

  public translate$(key: string, params?: TranslateParams): Observable<string> {
    const currentLanguage = this.currentLanguage();
    const waitForLanguage$ = currentLanguage
      ? of(currentLanguage)
      : this.#currentLanguage$.pipe(
          filter((language): language is string => !!language),
          take(1),
        );

    return waitForLanguage$.pipe(switchMap((language) => this.#ensureLanguageLoaded(language).pipe(map(() => this.translate(key, params)))));
  }

  #ensureLanguageLoaded(language: string): Observable<void> {
    if (!language) return of(void 0);
    if (this.#languageResources()[language]) return of(void 0);

    const inFlight = this.#inFlightLoads.get(language);
    if (inFlight) return inFlight;

    const load$ = this.#ngxSignalTranslateLoaderService.loadTranslationFile(language).pipe(
      tap((resource) => this.#patchLanguageResource(language, resource || {})),
      catchError(() => {
        this.#patchLanguageResource(language, {});
        return of(null);
      }),
      map(() => void 0),
      finalize(() => this.#inFlightLoads.delete(language)),
      shareReplay(1),
    );

    this.#inFlightLoads.set(language, load$);
    return load$;
  }

  #patchLanguageResource(language: string, resource: Record<string, string>): void {
    this.#languageResources.update((state) => ({ ...state, [language]: resource }));
  }
}
