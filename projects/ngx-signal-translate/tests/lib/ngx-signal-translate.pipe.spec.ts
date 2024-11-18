import { TestBed } from '@angular/core/testing';

import { NgxSignalTranslatePipe, NgxSignalTranslateService, TranslateParams } from '../../src/public-api';
import { Injector, EffectRef } from '@angular/core';
import { createTestEffectFactory } from './ngx-signal-translate.service.util';

describe('NgxSignalTranslatePipe', () => {
  let pipe: NgxSignalTranslatePipe;
  let service: NgxSignalTranslateService;
  let injector: Injector;
  let createTestEffect: (callback: () => void) => EffectRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxSignalTranslatePipe, { provide: NgxSignalTranslateService, useValue: { translate: jasmine.createSpy('translate') } }],
    });
    pipe = TestBed.inject(NgxSignalTranslatePipe);
    service = TestBed.inject(NgxSignalTranslateService);
    injector = TestBed.inject(Injector);
    createTestEffect = createTestEffectFactory(injector);
  });

  it('should be created', () => expect(pipe).toBeTruthy());

  it('should transform return with a translate signal', () => {
    const translateKey = 'TextForTranslate';
    const translateSignal = pipe.transform(translateKey);
    (service.translate as jasmine.Spy<jasmine.Func>).and.returnValue(translateKey);
    expect(translateSignal()).toBe(translateKey);
    expect(service.translate).toHaveBeenCalledWith(translateKey, undefined);
  });

  it('should transform pass params to the translate function', () => {
    const translateKey = 'TextForTranslate';
    const mockParam: TranslateParams = { mock: 'param' };
    const translateSignal = pipe.transform(translateKey, mockParam);
    translateSignal();
    expect(service.translate).toHaveBeenCalledWith(translateKey, mockParam);
  });

  it('should react the translate signal for the parameters change', () => {
    const translateKey = 'TextForTranslate';
    const translateSignal = pipe.transform('');
    createTestEffect(() => translateSignal());
    pipe.transform(translateKey);
    TestBed.flushEffects();
    expect(service.translate).toHaveBeenCalledWith(translateKey, undefined);
  });
});
