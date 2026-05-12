# NgxSignalTranslate

Signal-first i18n for Angular: lazy-loaded JSON resources, and a service with sync, signal, and observable APIs.

## Highlights
- Lazy-load language JSON over HTTP; each language loads once and caches.
- Service APIs: `translate` (sync, signal-friendly), `translate$` (observable that waits for language load), and `setLanguage`.
- Placeholder replacement with `string | number` params.

## Install

```bash
npm install ngx-signal-translate
```

## Configure

Register the config provider in `app.config.ts` (or your bootstrap providers). The `path` is optional; default is the app root.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideSignalTranslateConfig } from 'ngx-signal-translate';

export const appConfig: ApplicationConfig = {
  providers: [provideSignalTranslateConfig({ path: 'assets/i18n' })],
};
```

Set the initial language (for example in your root component):

```ts
import { Component, inject } from '@angular/core';
import { NgxSignalTranslateService } from 'ngx-signal-translate';

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
})
export class AppComponent {
  readonly #translate = inject(NgxSignalTranslateService);

  constructor() {
    this.#translate.setLanguage('en');
  }
}
```

## Language files

- Files are JSON, named by language code (e.g., `en.json`, `de.json`).
- Keys map to strings; unknown keys return the key name.

Example `en.json`:

```json
{
  "HELLO": "Hello",
  "HELLO_NAME": "Hello {name}"
}
```

Placeholders use `{key}` syntax and are replaced with `TranslateParams` values (string or number).

## Usage

### Templates (recommended)

Since Angular tracks signal reads inside template expressions, you can call `translate()` directly — it's already reactive.

```ts
import { Component, inject } from '@angular/core';
import { NgxSignalTranslateService } from 'ngx-signal-translate';

@Component({
  selector: 'demo-cmp',
  standalone: true,
  template: `
    <p>{{ ngxSignalTranslate.translate('HELLO') }}</p>
    <p>{{ ngxSignalTranslate.translate('HELLO_NAME', { name: 'Ada' }) }}</p>

    <input [placeholder]="ngxSignalTranslate.translate('Search')" />
    <button [attr.aria-label]="ngxSignalTranslate.translate('Save')">💾</button>
  `,
})
export class DemoComponent {
  protected readonly ngxSignalTranslate = inject(NgxSignalTranslateService);
}
```

### Service in TypeScript

```ts
import { Component, computed, effect, inject } from '@angular/core';
import { NgxSignalTranslateService } from 'ngx-signal-translate';

@Component({
  selector: 'demo-logic',
  template: '{{ greeting() }}',
})
export class DemoLogicComponent {
  readonly #translate = inject(NgxSignalTranslateService);
  readonly greeting = computed(() => this.#translate.translate('HELLO'));

  constructor() {
    this.#translate.setLanguage('en');

    effect(() => {
      // Runs whenever language resources change
      console.log(this.#translate.translate('HELLO_NAME', { name: 'Ada' }));
    });

    this.#translate.translate$('HELLO').subscribe(console.log);
  }
}
```

**Behavior notes**
- `translate` returns the key if the language or key is missing.
- `translate$` waits for the language to be selected and loaded before emitting.
- Language files load once per language; failed loads resolve to empty resources and also fall back to returning the key.

## Breaking changes

### 21.0.5
- The `signalTranslate` pipe has been removed. Use `NgxSignalTranslateService.translate()` directly in templates instead. Angular's reactive context re-evaluates the expression automatically whenever the language or resources change.

## Compatibility

<table>
  <thead>
    <tr>
      <th>ngx-signal-translate</th>
      <th>Angular</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>-</td>
      <td>Newer versions follow Angular versioning.</td>
    </tr>
    <tr>
      <td>3.x</td>
      <td>>= 20.x.x</td>
    </tr>
    <tr>
      <td>2.x</td>
      <td>19.x.x</td>
    </tr>
    <tr>
      <td>1.x</td>
      <td>18.x.x</td>
    </tr>
  </tbody>
</table>
