import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { signalTranslateConfig } from './ngx-signal-translate.util';

@Injectable({
  providedIn: 'root',
})
export class NgxSignalTranslateLoaderService {
  readonly #config = inject(signalTranslateConfig);
  readonly #httpClient = inject(HttpClient);

  public loadTranslationFile(language: string): Observable<Record<string, string> | null> {
    return this.#httpClient.get<Record<string, string> | null>(this.#buildUrl(language)).pipe(catchError(() => of(null)));
  }

  #buildUrl(language: string): string {
    const file = `${language}.json`;
    const basePath = (this.#config.path || '').trim();

    if (!basePath) return `/${file}`;

    const trimmed = basePath.replace(/\/+$/, '');
    if (/^https?:\/\//i.test(trimmed)) return `${trimmed}/${file}`;

    const relative = trimmed.replace(/^\/+/, '');
    return `/${relative ? `${relative}/` : ''}${file}`;
  }
}
