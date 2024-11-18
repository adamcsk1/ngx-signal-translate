import { TestBed } from '@angular/core/testing';
import { NgxSignalTranslateService, provideSignalTranslateConfig } from '../../src/public-api';
import { NgxSignalTranslateLoaderService } from '../../src/lib/ngx-signal-translate-loader.service';
import { lastValueFrom, of } from 'rxjs';
import { LanguageResource } from '../../src/lib/ngx-signal-translate.interface';
import { computed, EffectRef, Injector, runInInjectionContext } from '@angular/core';
import { createTestEffectFactory } from './ngx-signal-translate.service.util';

describe('NgxSignalTranslateService', () => {
  let injector: Injector;
  let service: NgxSignalTranslateService;
  let loaderService: NgxSignalTranslateLoaderService;
  let createTestEffect: (callback: () => void) => EffectRef;
  const mockLanguageFile: LanguageResource = {
    MOCK: 'Mock',
    MOCK_PARAM: 'Mock {param}',
    MOCK_MULTI_PARAM: 'Mock {param} {param2} {param}',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideSignalTranslateConfig({ path: '' }),
        NgxSignalTranslateService,
        { provide: NgxSignalTranslateLoaderService, useValue: { loadTranslationFile: jasmine.createSpy('loadTranslationFile').and.returnValue(of(mockLanguageFile)) } },
      ],
    });
    service = TestBed.inject(NgxSignalTranslateService);
    loaderService = TestBed.inject(NgxSignalTranslateLoaderService);
    injector = TestBed.inject(Injector);
    createTestEffect = createTestEffectFactory(injector);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should setLanguage load language file', () => {
    const language = 'en';
    service.setLanguage(language);
    TestBed.flushEffects();
    expect(loaderService.loadTranslationFile).toHaveBeenCalledWith(language);
    expect(service.currentLanguage()).toBe(language);
  });

  it('should load every language file once', () => {
    let language = 'en';
    service.setLanguage(language);
    TestBed.flushEffects();
    expect(loaderService.loadTranslationFile).toHaveBeenCalledWith(language);
    service.setLanguage(language);
    TestBed.flushEffects();
    expect(loaderService.loadTranslationFile).toHaveBeenCalledTimes(1);
    language = 'de';
    service.setLanguage(language);
    TestBed.flushEffects();
    expect(loaderService.loadTranslationFile).toHaveBeenCalledWith(language);
    expect(loaderService.loadTranslationFile).toHaveBeenCalledTimes(2);
  });

  describe('translate', () => {
    beforeEach(() => {
      service.setLanguage('en');
      TestBed.flushEffects();
    });

    it('should return with the translated value', () => expect(service.translate('MOCK')).toBe(mockLanguageFile['MOCK']));

    it('should return with the translate key when the key is unknown', () => {
      const translateKey = 'MOCK_UNKNOWN';
      expect(service.translate(translateKey)).toBe(translateKey);
    });

    it('should return with the translate key when the selected language is unknown', () => {
      (loaderService.loadTranslationFile as jasmine.Spy<jasmine.Func>).and.returnValue(of(null));
      service.setLanguage('de');
      TestBed.flushEffects();
      const translateKey = 'MOCK_UNKNOWN_LANGUAGE';
      expect(service.translate(translateKey)).toBe(translateKey);
    });

    it('should replace params', () => expect(service.translate('MOCK_PARAM', { param: '42' })).toBe('Mock 42'));

    it('should replace all params', () => expect(service.translate('MOCK_MULTI_PARAM', { param: '42', param2: 'is' })).toBe('Mock 42 is 42'));

    it('should trigger effect', () => {
      let effectTriggerTimes = 0;
      const mockLanguageFileDe: LanguageResource = { MOCK: 'Mock de' };

      createTestEffect(() => {
        effectTriggerTimes++;

        if (effectTriggerTimes === 1) expect(service.translate('MOCK')).toBe('Mock');
        else if (effectTriggerTimes === 2) expect(service.translate('MOCK')).toBe(mockLanguageFileDe['MOCK']);
      });
      TestBed.flushEffects();
      (loaderService.loadTranslationFile as jasmine.Spy<jasmine.Func>).and.returnValue(of(mockLanguageFileDe));
      service.setLanguage('de');
      TestBed.flushEffects();
    });

    it('should works with computed signal', () =>
      runInInjectionContext(injector, () => {
        const mockLanguageFileFr: LanguageResource = { MOCK: 'Mock fr' };
        const computedSignal = computed(() => service.translate('MOCK'));

        expect(computedSignal()).toBe(mockLanguageFile['MOCK']);

        (loaderService.loadTranslationFile as jasmine.Spy<jasmine.Func>).and.returnValue(of(mockLanguageFileFr));

        service.setLanguage('fr');
        TestBed.flushEffects();
        expect(computedSignal()).toBe(mockLanguageFileFr['MOCK']);
      }));
  });

  describe('translate$', () => {
    it('should return push the late arrived translated value', (done) => {
      service.translate$('MOCK').subscribe((translatedValue) => {
        expect(translatedValue).toBe(mockLanguageFile['MOCK']);
        done();
      });

      service.setLanguage('en');
      TestBed.flushEffects();
    });

    it('should return push the translated value', async () => {
      service.setLanguage('en');
      TestBed.flushEffects();

      const translatedValue = await lastValueFrom(service.translate$('MOCK'));

      expect(translatedValue).toBe(mockLanguageFile['MOCK']);
    });
  });
});
