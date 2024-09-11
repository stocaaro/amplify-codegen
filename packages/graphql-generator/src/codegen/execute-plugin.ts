import { Types, CodegenPlugin, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { DocumentNode, GraphQLSchema, buildASTSchema } from 'graphql';

type AmplifyPluginFunction<T> = (...args: Parameters<PluginFunction<T>>) => Awaited<ReturnType<PluginFunction<T>>>;

type AmplifyCodegenPlugin<T = any> = Omit<CodegenPlugin, 'plugin'> & {
  plugin: AmplifyPluginFunction<T>;
};

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

export function executePlugin(options: ExecutePluginOptions, plugin: AmplifyCodegenPlugin): Types.PluginOutput {
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
        `,
    );
  }

  const outputSchema: GraphQLSchema = options.schemaAst || buildASTSchema(options.schema, options.config as any);
  const documents = options.documents || [];
  const pluginContext = options.pluginContext || {};

  if (plugin.validate && typeof plugin.validate === 'function') {
    try {
      // FIXME: Sync validate signature with plugin signature
      plugin.validate(outputSchema, documents, options.config, options.outputFilename, options.allPlugins, pluginContext);
    } catch (e) {
      if (e instanceof Error)
        throw new Error(`Plugin "${options.name}" validation failed: \n
        ${e.message}
      `);
    }
  }

  return plugin.plugin(outputSchema, documents, typeof options.config === 'object' ? { ...options.config } : options.config, {
    outputFile: options.outputFilename,
    allPlugins: options.allPlugins,
    pluginContext,
  });
}
