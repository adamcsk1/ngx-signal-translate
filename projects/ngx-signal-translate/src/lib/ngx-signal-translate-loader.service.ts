import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { signalTransalteConfig } from './ngx-signal-translate.util';

@Injectable({
  providedIn: 'root',
})
export class NgxSignalTranslateLoaderService {
  readonly #config = inject(signalTransalteConfig);
  readonly #httpClient = inject(HttpClient);

  public loadTranslationFile(language: string): Observable<Record<string, string> | null> {
    const file = `${language}.json`;
    const basePath = this.#config.path ? `/${this.#config.path}` : '';
    return this.#httpClient.get<Record<string, string> | null>(`${basePath}/${file}`).pipe(catchError(() => of(null)));
  }
}
