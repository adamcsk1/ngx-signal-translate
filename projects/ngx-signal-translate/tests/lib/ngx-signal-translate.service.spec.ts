import { TestBed } from '@angular/core/testing';
import { NgxSignalTranslateService, provideSignalTranslateConfig } from '../../src/public-api';
import { NgxSignalTranslateLoaderService } from '../../src/lib/ngx-signal-translate-loader.service';
import { lastValueFrom, of } from 'rxjs';
import { LanguageResource } from '../../src/lib/ngx-signal-translate.interface';
import { computed, EffectRef, Injector, runInInjectionContext } from '@angular/core';
import { createTestEffectFactory } from './ngx-signal-translate.service.util';
import { describe, vi, beforeEach, it, expect } from 'vitest';

describe('NgxSignalTranslateService', () => {
  let injector: Injector;
  let service: NgxSignalTranslateService;
  let loadTranslationFileSpy: ReturnType<typeof vi.fn>;
  let createTestEffect: (callback: () => void) => EffectRef;
  const mockLanguageFile: LanguageResource = {
    MOCK: 'Mock',
    MOCK_PARAM: 'Mock {param}',
    MOCK_MULTI_PARAM: 'Mock {param} {param2} {param}',
  };

  beforeEach(() => {
    loadTranslationFileSpy = vi.fn().mockReturnValue(of(mockLanguageFile));
    TestBed.configureTestingModule({
      providers: [provideSignalTranslateConfig({ path: '' }), NgxSignalTranslateService, { provide: NgxSignalTranslateLoaderService, useValue: { loadTranslationFile: loadTranslationFileSpy } }],
    });
    service = TestBed.inject(NgxSignalTranslateService);
    injector = TestBed.inject(Injector);
    createTestEffect = createTestEffectFactory(injector);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should setLanguage load language file', async () => {
    const language = 'en';
    service.setLanguage(language);
    TestBed.tick();
    expect(loadTranslationFileSpy).toHaveBeenCalledWith(language);
    expect(service.currentLanguage()).toBe(language);
  });

  it('should load every language file once', async () => {
    let language = 'en';
    service.setLanguage(language);
    TestBed.tick();
    expect(loadTranslationFileSpy).toHaveBeenCalledWith(language);
    service.setLanguage(language);
    TestBed.tick();
    expect(loadTranslationFileSpy).toHaveBeenCalledTimes(1);
    language = 'de';
    service.setLanguage(language);
    TestBed.tick();
    expect(loadTranslationFileSpy).toHaveBeenCalledWith(language);
    expect(loadTranslationFileSpy).toHaveBeenCalledTimes(2);
  });

  describe('translate', () => {
    beforeEach(async () => {
      service.setLanguage('en');
      TestBed.tick();
    });

    it('should return with the translated value', () => expect(service.translate('MOCK')).toBe(mockLanguageFile['MOCK']));

    it('should return with the translate key when the key is unknown', () => {
      const translateKey = 'MOCK_UNKNOWN';
      expect(service.translate(translateKey)).toBe(translateKey);
    });

    it('should return with the translate key when the selected language is unknown', async () => {
      loadTranslationFileSpy.mockReturnValue(of(null));
      service.setLanguage('de');
      TestBed.tick();
      const translateKey = 'MOCK_UNKNOWN_LANGUAGE';
      expect(service.translate(translateKey)).toBe(translateKey);
    });

    it('should replace params', () => expect(service.translate('MOCK_PARAM', { param: '42' })).toBe('Mock 42'));

    it('should replace all params', () => expect(service.translate('MOCK_MULTI_PARAM', { param: '42', param2: 'is' })).toBe('Mock 42 is 42'));

    it('should trigger effect', async () => {
      let effectTriggerTimes = 0;
      const mockLanguageFileDe: LanguageResource = { MOCK: 'Mock de' };

      createTestEffect(() => {
        effectTriggerTimes++;

        if (effectTriggerTimes === 1) expect(service.translate('MOCK')).toBe('Mock');
        else if (effectTriggerTimes === 2) expect(service.translate('MOCK')).toBe(mockLanguageFileDe['MOCK']);
      });
      TestBed.tick();
      loadTranslationFileSpy.mockReturnValue(of(mockLanguageFileDe));
      service.setLanguage('de');
      TestBed.tick();
    });

    it('should works with computed signal', async () =>
      runInInjectionContext(injector, async () => {
        const mockLanguageFileFr: LanguageResource = { MOCK: 'Mock fr' };
        const computedSignal = computed(() => service.translate('MOCK'));

        expect(computedSignal()).toBe(mockLanguageFile['MOCK']);

        loadTranslationFileSpy.mockReturnValue(of(mockLanguageFileFr));

        service.setLanguage('fr');
        TestBed.tick();
        expect(computedSignal()).toBe(mockLanguageFileFr['MOCK']);
      }));
  });

  describe('translate$', () => {
    it('should return push the late arrived translated value', async () => {
      let translatedValue: string | undefined;

      service.translate$('MOCK').subscribe((value) => {
        translatedValue = value;
      });

      service.setLanguage('en');
      TestBed.tick();

      expect(translatedValue).toBe(mockLanguageFile['MOCK']);
    });

    it('should return push the translated value', async () => {
      service.setLanguage('en');
      TestBed.tick();

      const translatedValue = await lastValueFrom(service.translate$('MOCK'));

      expect(translatedValue).toBe(mockLanguageFile['MOCK']);
    });
  });
});
