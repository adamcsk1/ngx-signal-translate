import { InjectionToken } from '@angular/core';
import { SignalTranslateConfig } from './ngx-signal-translate.interface';

const defaultConfig: SignalTranslateConfig = { path: '' };

export const signalTranslateConfig = new InjectionToken<SignalTranslateConfig>('SignalTranslateConfig', {
  factory: () => defaultConfig,
});

export const provideSignalTranslateConfig = (config: SignalTranslateConfig) => ({ provide: signalTranslateConfig, useValue: config });
