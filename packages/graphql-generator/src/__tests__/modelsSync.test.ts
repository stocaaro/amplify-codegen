import { generateModelsSync, GenerateModelsOptions, ModelsTarget } from '..';
import { readSchema } from './utils';

describe('generateModelsSync', () => {
  describe('targets', () => {
    const targets: ModelsTarget[] = ['java', 'swift', 'javascript', 'typescript', 'dart', 'introspection'];
    targets.forEach(target => {
      test(`basic ${target}`, async () => {
        const options: GenerateModelsOptions = {
          schema: readSchema('blog-model.graphql'),
          target,
        };
        const models = generateModelsSync(options);
        expect(models).not.toBeInstanceOf(Promise);
        expect(models).toMatchSnapshot();
      });
    });

    test(`improve pluralization swift`, async () => {
      const options: GenerateModelsOptions = {
        schema: readSchema('blog-model.graphql'),
        target: 'swift',
        improvePluralization: true,
      };
      const models = generateModelsSync(options);
      expect(models).not.toBeInstanceOf(Promise);
      expect(models).toMatchSnapshot();
    });
  });

  test('does not fail on custom directives', async () => {
    const options: GenerateModelsOptions = {
      schema: `
        type Blog @customModel {
          id: ID!
          name: String! @customField
        }`,
      target: 'introspection',
      directives: `
        directive @customModel on OBJECT
        directive @customField on FIELD_DEFINITION
      `,
    };
    const models = generateModelsSync(options);
    expect(models).not.toBeInstanceOf(Promise);
    expect(models).toMatchSnapshot();
  });
});
