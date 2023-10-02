import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: './infra/graphql/schema.graphql',
  generates: {
    'src/lambdas/queryResolver/types.ts': {
      plugins: ['typescript', 'typescript-resolvers']
    },
    'src/lambdas/mutationResolver/types.ts': {
      plugins: ['typescript', 'typescript-resolvers']
    }
  }
}

export default config
