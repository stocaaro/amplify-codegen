import { Types, PluginFunction as PluginFunctionAsync, CodegenPlugin as CodegenPluginAsync } from "@graphql-codegen/plugin-helpers";

type PluginMapContainer = Pick<Types.GenerateOptions, 'pluginMap'>

type SyncPluginMap<Obj extends PluginMapContainer> = Omit<Obj, 'pluginMap'> & {
    pluginMap: {
        [name: string]: Omit<Obj['pluginMap'][string], 'plugin'> & {
        plugin: (
            ...args: Parameters<Obj['pluginMap'][string]['plugin']>
        ) => Awaited<ReturnType<Obj['pluginMap'][string]['plugin']>>;
        };
    };
};

export declare namespace SyncTypes {
    type GenerateOptions = SyncPluginMap<Types.GenerateOptions>;

    type PresetFnArgs<
        Config = any,
        PluginConfig = {
        [key: string]: any;
        }
    > = SyncPluginMap<Types.PresetFnArgs<Config, PluginConfig>>;

    type OutputPreset<TPresetConfig = any> = {
        buildGeneratesSection: (options: PresetFnArgs<TPresetConfig>) => GenerateOptions[];
    };

    type PluginFunction<T> = (...args: Parameters<PluginFunctionAsync<T>>) => Awaited<ReturnType<PluginFunctionAsync<T>>>;

    type CodegenPlugin<T = any> = Omit<CodegenPluginAsync<T>, 'plugin'> & {
        plugin: PluginFunction<T>;
    }
};