export type LanguageResource = Record<string, string>;
export type LanguageResources = Record<string, LanguageResource>;
export type TranslateParams = Record<string, string | number>;

export interface SignalTranslateConfig {
  path?: string;
}
