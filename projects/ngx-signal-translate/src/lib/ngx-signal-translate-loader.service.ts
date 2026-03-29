import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LanguageResource } from './ngx-signal-translate.interface';
import { signalTranslateConfig } from './ngx-signal-translate.util';

@Injectable({
  providedIn: 'root',
})
export class NgxSignalTranslateLoaderService {
  readonly #config = inject(signalTranslateConfig);
  readonly #httpClient = inject(HttpClient);

  public loadTranslationFile(language: string): Observable<LanguageResource> {
    return this.#httpClient.get<LanguageResource>(this.#buildUrl(language));
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
