// Link local packages in React Native, metro doesn't like symlink.
// This is only for using the example app, you shouldn't need this in your app.
// Adding @quiltt/react-native in package.json should work just fine.
// https://medium.com/@alielmajdaoui/linking-local-packages-in-react-native-the-right-way-2ac6587dcfa2
// Learn more https://docs.expo.io/guides/customizing-metro

const { resolve } = require('path')

const siblings = {
  // Enable this to import local package
  // '@quiltt/react-native': resolve(__dirname, '..', 'src'),
}

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) =>
          name in siblings ? siblings[name] : resolve(process.cwd(), 'node_modules', name),
      }
    ),
  },
  watchFolders: [...Object.values(siblings)],
}
