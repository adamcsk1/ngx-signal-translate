# NgxSignalTranslate

A signal-driven translation service.

## Compatibility with Angular Versions

<table>
  <thead>
    <tr>
      <th>ngx-signal-translate</th>
      <th>Angular</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        1.x
      </td>
      <td>
        >= 18
      </td>
    </tr>
  </tbody>
</table>

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Language file](#a-language-file)
- [Params in the language file](#params-in-the-language-file)
- [Usage](#usage)
  - [Component template](#component-template)
  - [Typescript files](#typescript-files)

## Features

* Lazy load language JSON files via HTTP request.
* Pipe for translating the template strings. _(signal)_
* Service with a synchronous, signal and observable translate interface. *(The synchronous interface works with computed signal and signal effects.)*
* Option for the variable replace in the translated strings.

## Installation

```bash
npm ngx-signal-translate
# Or if you use yarn
yarn add ngx-signal-translate
```

### Configuration

Add configuration provider to your app.config.ts as provider.

```ts
import { provideSignalTranslateConfig } from 'ngx-signal-translate';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSignalTranslateConfig({path: ''}),
  ],
};
```

The path is a required config parameter, that will be the json language files base folder.

And finally set the default language in your AppComponent constructor:
```ts
import { NgxSignalTranslateService } from 'ngx-signal-translate';

@Component({})
export class AppComponent {
  readonly #signalTranslateService = inject(NgxSignalTranslateService);

  constructor(){
    this.#signalTranslateService.setLanguage('en');
  }
}
```

## A language file

The language files should be JSON files, and the language key should be the file name.

Example:
```json
{
  "DEMO": "Demo"
}
```


## Params in the language file

The language files be able to handle variables in the translation string. When the translation service gets variables for a replacement, it will try to replace these keys in the template string.
*You need to put the variable key inside brackets.*

Example:
```json
{
  "DEMO": "Demo {param}"
}
```

## Usage

### Component template

```ts
import { NgxSignalTranslatePipe } from 'ngx-signal-translate';

@Component({
  imports: [NgxSignalTranslatePipe]
})
export class DemoComponent {}
```

without params:

```html
<p>{{('Demo' | signalTransalte)()}}</p>
```

with params:

```html
<p>{{('Demo' | signalTransalte : {param: 'hello'})()}}</p>
```

### Typescript files

```ts
import { NgxSignalTranslateService } from 'ngx-signal-translate';

@Component({})
export class DemoComponent implements ngOnInit{
  readonly #signalTranslateService = inject(NgxSignalTranslateService);
  readonly #transaltedText = computed(() => this.#signalTranslateService.translate('DEMO'));

  constructor() {
    effect(() => {
      console.log(this.#signalTranslateService.translate('DEMO'));
    });
    /* The translate function triggers the signal effects. */
  } 

  public ngOnInit(): void {
    console.log(this.#signalTranslateService.translate('DEMO'));
    /* If the selected language files were not loaded, then the function will return with the translation key. */

    this.#signalTranslateService.translate$('DEMO').subscribe(console.log);
    /* The translate$ observable will wait for the language file to load. */

    console.log(this.#transaltedText());
    /* The translate function works with computed signals. That will trigger the value refresh when the language resource / selected language changed. */
  }
}
```

The second parameter can be used to pass translate variables to the _translate_ and _translate$_ function.
