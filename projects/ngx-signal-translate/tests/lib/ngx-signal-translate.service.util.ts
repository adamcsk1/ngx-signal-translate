import { runInInjectionContext, effect, Injector } from '@angular/core';

export const createTestEffectFactory = (injector: Injector) => (callback: () => void) => runInInjectionContext(injector, () => effect(callback));
