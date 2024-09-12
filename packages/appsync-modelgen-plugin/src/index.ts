import { RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';

export interface AppSyncModelPluginConfig extends RawDocumentsConfig {
  directives?: string;
}

export * from './plugin';
export * from './pluginSync';
export * from './preset';
export * from './presetSync';
export * from './interfaces/introspection';

export { SyncTypes } from './syncTypes';

export const addToSchema = (config: AppSyncModelPluginConfig) => {
  const result: string[] = [];
  if (config.scalars) {
    if (typeof config.scalars === 'string') {
      result.push(config.scalars);
    } else {
      result.push(...Object.keys(config.scalars).map(scalar => `scalar ${scalar}`));
    }
  }
  if (config.directives) {
    if (typeof config.directives === 'string') {
      result.push(config.directives);
    }
  }

  return result.join('\n');
};
