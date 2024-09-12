import * as path from 'path';
import { parse } from 'graphql';
import * as appSyncDataStoreCodeGen from '@aws-amplify/appsync-modelgen-plugin';
import { DefaultDirectives } from '@aws-amplify/graphql-directives';
import { codegen } from './codegenSync';
import { GenerateModelsOptions, GeneratedOutput } from './typescript';
const { version: packageVersion } = require('../package.json');

const directiveDefinitions = DefaultDirectives.map(directive => directive.definition).join('\n');

export function generateModelsSync(options: GenerateModelsOptions): GeneratedOutput {
  const {
    schema,
    target,
    directives = directiveDefinitions,
    isDataStoreEnabled,

    // feature flags
    generateIndexRules = true,
    emitAuthProvider = true,
    useExperimentalPipelinedTransformer = true,
    transformerVersion = 2,
    respectPrimaryKeyAttributesOnConnectionField = true,
    improvePluralization = false,
    generateModelsForLazyLoadAndCustomSelectionSet = true,
    addTimestampFields = true,
    handleListNullabilityTransparently = true,
  } = options;

  const parsedSchema = parse(schema);

  const overrideOutputDir = '';
  const appsyncLocalConfig = appSyncDataStoreCodeGen.presetSync.buildGeneratesSection({
    schema: parsedSchema,
    baseOutputDir: '',
    config: {
      target,
      directives,
      isDataStoreEnabled,
      isTimestampFieldsAdded: addTimestampFields,
      emitAuthProvider,
      generateIndexRules,
      handleListNullabilityTransparently,
      usePipelinedTransformer: useExperimentalPipelinedTransformer,
      transformerVersion,
      respectPrimaryKeyAttributesOnConnectionField,
      improvePluralization,
      generateModelsForLazyLoadAndCustomSelectionSet,
      codegenVersion: packageVersion,
      overrideOutputDir,
    },
    presetConfig: {
      overrideOutputDir,
      target,
    },
    plugins: [
      {
        appSyncLocalCodeGen: {},
      },
    ],
    pluginMap: {
      appSyncLocalCodeGen: appSyncDataStoreCodeGen.pluginSync,
    },
    documents: [],
  });

  return appsyncLocalConfig.map((config) => {
      const content = codegen(config);

      // set the keys to always use posix path separators
      // Fallback to \ because path.win32 is not implemented by path-browserify
      return { [config.filename.split(path.win32?.sep || '\\').join(path.posix.sep)]: content };
    }).reduce((curr, next) => ({ ...curr, ...next }), {});
}
