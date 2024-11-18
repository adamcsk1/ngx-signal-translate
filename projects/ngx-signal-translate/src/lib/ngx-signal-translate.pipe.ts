import { Pipe, PipeTransform, Signal, computed, inject, signal, untracked } from '@angular/core';
import { TranslateParams } from './ngx-signal-translate.interface';
import { NgxSignalTranslateService } from './ngx-signal-translate.service';

@Pipe({
  name: 'signalTranslate',
  standalone: true,
})
export class NgxSignalTranslatePipe implements PipeTransform {
  readonly #ngxSignalTranslateService = inject(NgxSignalTranslateService);
  readonly #translated = computed(() => this.#ngxSignalTranslateService.translate(this.#translateKey(), this.#params()));
  readonly #translateKey = signal('');
  readonly #params = signal<TranslateParams | undefined>(undefined);

  public transform(translateKey: string, params?: TranslateParams): Signal<string> {
    untracked(() => {
      this.#translateKey.set(translateKey);
      this.#params.set(params);
    });
    return this.#translated;
  }
}
