import { InjectionToken } from '@angular/core';
import { SignalTransalteConfig } from './ngx-signal-translate.interface';

export const signalTransalteConfig = new InjectionToken<SignalTransalteConfig>('SignalTransalteConfig');
export const provideSignalTranslateConfig = (config: SignalTransalteConfig) => ({ provide: signalTransalteConfig, useValue: config });
