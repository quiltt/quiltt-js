// TODO: Not currently in use, but would be great if we could just link local packages

/**
 * Link local packages in React Native, metro doesn't like symlink.
 * This is only for using the example app, you shouldn't need this in your app.
 * Adding `@quiltt/react-native` in `package.json` should work just fine.
 *
 * @see https://medium.com/@alielmajdaoui/linking-local-packages-in-react-native-the-right-way-2ac6587dcfa2
 *
 * @see https://docs.expo.io/guides/customizing-metro
 */

const path = require('path')
const { getDefaultConfig } = require('@expo/metro-config')

const root = path.resolve(__dirname, '..', '..')
const packages = path.resolve(root, 'packages')

const defaultConfig = getDefaultConfig(__dirname)

const siblings = {
  // Enable this to import local package
  '@quiltt/react-native': path.resolve(packages, 'react-native', 'dist'),
}

module.exports = {
  ...defaultConfig,
  projectRoot: __dirname,
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      ...defaultConfig.transformer.getTransformOptions(),
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: new Proxy(
      {},
      {
        get: (_target, name) =>
          name in siblings ? siblings[name] : path.resolve(process.cwd(), 'node_modules', name),
      }
    ),
  },
  server: {
    ...defaultConfig.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // When an asset is imported outside the project root, it has wrong path on Android
        // So we fix the path to correct one
        if (/\/packages\/.+\.png\?.+$/.test(req.url)) {
          req.url = `/assets/../${req.url}`
        }

        return middleware(req, res, next)
      }
    },
  },
  watchFolders: [...defaultConfig.watchFolders, root, ...Object.values(siblings)],
}
