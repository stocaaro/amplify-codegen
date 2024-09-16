import { SyncTypes } from '@aws-amplify/appsync-modelgen-plugin';
import { Types } from '@graphql-codegen/plugin-helpers';
import { DocumentNode, GraphQLSchema, buildASTSchema } from 'graphql';

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  parentConfig: Types.PluginConfig;
  schema: DocumentNode;
  schemaAst?: GraphQLSchema;
  documents: Types.DocumentFile[];
  outputFilename: string;
  allPlugins: Types.ConfiguredPlugin[];
  skipDocumentsValidation?: Types.SkipDocumentsValidationOptions;
  pluginContext?: { [key: string]: any };
}

export function executePlugin(options: ExecutePluginOptions, plugin: SyncTypes.CodegenPlugin): Types.PluginOutput {
  if (!plugin || !plugin.plugin || typeof plugin.plugin !== 'function') {
    throw new Error(
      `Invalid Custom Plugin "${options.name}" \n
        Plugin ${options.name} does not export a valid JS object with "plugin" function.

        Make sure your custom plugin is written in the following form:

        module.exports = {
          plugin: (schema, documents, config) => {
            return 'my-custom-plugin-content';
          },
        };
        `
    );
  }

  const outputSchema: GraphQLSchema = options.schemaAst || buildASTSchema(options.schema, options.config as any);
  const documents = options.documents || [];
  const pluginContext = options.pluginContext || {};

  if (plugin.validate && typeof plugin.validate === 'function') {
    try {
        plugin!.validate!(
          outputSchema,
          documents,
          options.config,
          options.outputFilename,
          options.allPlugins,
          pluginContext
        );
    } catch (e) {
        let error: Error;
        if (!(e instanceof Error)) {
          error = new Error(String(e));
        } else {
          error = e;
        }
        throw new Error(
          `Plugin "${options.name}" validation failed: \n
              ${error.message}
            `
        );
    }
  }

  return plugin.plugin(
    outputSchema,
    documents,
    typeof options.config === 'object' ? { ...options.config } : options.config,
    {
      outputFile: options.outputFilename,
      allPlugins: options.allPlugins,
      pluginContext,
    }
  );
}
