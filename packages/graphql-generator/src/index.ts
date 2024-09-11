export { generateModels } from './models';
export { generateStatements } from './statements';
export { generateTypes } from './types';

export type {
  TypesTarget,
  ModelsTarget,
  StatementsTarget,
  GenerateTypesOptions,
  GenerateModelsOptions,
  GenerateStatementsOptions,
  GeneratedOutput
} from './typescript';

console.log('LOADED @aws-amplify/graphql-generator');