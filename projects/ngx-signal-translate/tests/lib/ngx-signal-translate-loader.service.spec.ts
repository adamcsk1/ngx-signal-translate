import { TestBed } from '@angular/core/testing';
import { NgxSignalTranslateLoaderService } from '../../src/lib/ngx-signal-translate-loader.service';
import { provideSignalTranslateConfig, SignalTranslateConfig } from '../../src/public-api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { LanguageResource } from '../../src/lib/ngx-signal-translate.interface';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('NgxSignalTranslateLoaderService', () => {
  let service: NgxSignalTranslateLoaderService;
  let httpTesting: HttpTestingController;
  const config: SignalTranslateConfig = { path: '' };

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

    it('should trim leading slash in base path', async () => {
      config.path = '/language';
      const mockResponse: LanguageResource = { mock: 'Mock' };

      const responsePromise = lastValueFrom(service.loadTranslationFile('en'));
      const req = httpTesting.expectOne('/language/en.json');
      req.flush(mockResponse);

      expect(req.request.method).toBe('GET');
      expect(await responsePromise).toEqual(mockResponse);
    });

    it('should avoid double slashes with trailing slash in base path', async () => {
      config.path = 'language/';
      const mockResponse: LanguageResource = { mock: 'Mock' };

      const responsePromise = lastValueFrom(service.loadTranslationFile('en'));
      const req = httpTesting.expectOne('/language/en.json');
      req.flush(mockResponse);

      expect(req.request.method).toBe('GET');
      expect(await responsePromise).toEqual(mockResponse);
    });

    it('should support absolute URL base path', async () => {
      config.path = 'https://cdn.example.com/i18n';
      const mockResponse: LanguageResource = { mock: 'Mock' };

      const responsePromise = lastValueFrom(service.loadTranslationFile('en'));
      const req = httpTesting.expectOne('https://cdn.example.com/i18n/en.json');
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
