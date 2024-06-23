module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  cache: true,
  globals: {
        'ts-jest': {
            isolatedModules: true
        }
    },
  verbose: true,
  // Add any other Jest configurations as needed
};

// Jest wants globals above to be written like this
// But this is slow
// transform: {
//   '^.+\\.tsx?$': ['ts-jest', {
//     'ts-jest': {
//         isolatedModules: true
//     }
// }]
// },