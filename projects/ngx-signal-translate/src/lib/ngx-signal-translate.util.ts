import { InjectionToken } from '@angular/core';
import { SignalTranslateConfig } from './ngx-signal-translate.interface';

export const signalTranslateConfig = new InjectionToken<SignalTranslateConfig>('SignalTranslateConfig');
export const provideSignalTranslateConfig = (config: SignalTranslateConfig) => ({ provide: signalTranslateConfig, useValue: config });
