import { Pipe, PipeTransform, Signal, computed, inject } from '@angular/core';
import { TranslateParams } from './ngx-signal-translate.interface';
import { NgxSignalTranslateService } from './ngx-signal-translate.service';

@Pipe({
  name: 'signalTransalte',
  standalone: true,
})
export class NgxSignalTranslatePipe implements PipeTransform {
  readonly #ngxSignalTranslateService = inject(NgxSignalTranslateService);
  readonly #translate = computed(() => this.#ngxSignalTranslateService.translate(this.#translateKey, this.#params));
  #translateKey = '';
  #params?: TranslateParams;

  public transform(translateKey: string, params?: TranslateParams): Signal<string> {
    this.#translateKey = translateKey;
    this.#params = params;
    return this.#translate;
  }
}
