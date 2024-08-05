import { TestBed } from '@angular/core/testing';

import { NgxSignalTranslatePipe, NgxSignalTranslateService, TranslateParams } from '../../src/public-api';

describe('NgxSignalTranslatePipe', () => {
  let pipe: NgxSignalTranslatePipe;
  let service: NgxSignalTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxSignalTranslatePipe, { provide: NgxSignalTranslateService, useValue: { translate: jasmine.createSpy('translate') } }],
    });
    pipe = TestBed.inject(NgxSignalTranslatePipe);
    service = TestBed.inject(NgxSignalTranslateService);
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
});
