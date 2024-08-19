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

  it('should transform return with a transalte signal', () => {
    const transalteKey = 'TextForTransalte';
    const translateSignal = pipe.transform(transalteKey);
    (service.translate as jasmine.Spy<jasmine.Func>).and.returnValue(transalteKey);
    expect(translateSignal()).toBe(transalteKey);
    expect(service.translate).toHaveBeenCalledWith(transalteKey, undefined);
  });

  it('should transform pass params to the translate function', () => {
    const transalteKey = 'TextForTransalte';
    const mockParam: TranslateParams = { mock: 'param' };
    const translateSignal = pipe.transform(transalteKey, mockParam);
    translateSignal();
    expect(service.translate).toHaveBeenCalledWith(transalteKey, mockParam);
  });
});
