import { TestBed } from '@angular/core/testing';
import { NgxSignalTranslateLoaderService } from '../../src/lib/ngx-signal-translate-loader.service';
import { provideSignalTranslateConfig, SignalTransalteConfig } from '../../src/public-api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { LanguageResource } from '../../src/lib/ngx-signal-translate.interface';

describe('NgxSignalTranslateLoaderService', () => {
  let service: NgxSignalTranslateLoaderService;
  let httpTesting: HttpTestingController;
  const config: SignalTransalteConfig = { path: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideSignalTranslateConfig(config), NgxSignalTranslateLoaderService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NgxSignalTranslateLoaderService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => expect(service).toBeTruthy());

  describe('loadTranslationFile', () => {
    it('should return with the language file body without base path', async () => {
      config.path = '';
      const mockResponse: LanguageResource = { mock: 'Mock' };

      const responsePromise = lastValueFrom(service.loadTranslationFile('en'));
      const req = httpTesting.expectOne('/en.json');
      req.flush(mockResponse);

      expect(req.request.method).toBe('GET');
      expect(await responsePromise).toEqual(mockResponse);
    });

    it('should return with the language file body with base path', async () => {
      config.path = 'language';
      const mockResponse: LanguageResource = { mock: 'Mock' };

      const responsePromise = lastValueFrom(service.loadTranslationFile('en'));
      const req = httpTesting.expectOne('/language/en.json');
      req.flush(mockResponse);

      expect(req.request.method).toBe('GET');
      expect(await responsePromise).toEqual(mockResponse);
    });

    it('should return with null when the pipe catch a http error', async () => {
      config.path = '';

      const responsePromise = lastValueFrom(service.loadTranslationFile('en'));
      const req = httpTesting.expectOne('/en.json');
      req.error(new ProgressEvent('404'), { status: 404 });

      expect(req.request.method).toBe('GET');
      expect(await responsePromise).toBe(null);
    });
  });
});
