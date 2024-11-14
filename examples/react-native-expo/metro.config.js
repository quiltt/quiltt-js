// Source: Adapted from https://docs.expo.dev/guides/monorepos/#modify-the-metro-config

const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')
const fs = require('node:fs')

// Manually resolve workspace root by looking for pnpm-workspace.yaml
function findWorkspaceRoot(currentDir) {
  const root = path.parse(currentDir).root
  let dir = currentDir

  while (dir !== root) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir
    }
    dir = path.dirname(dir)
  }
  return null
}

const projectRoot = __dirname
const workspaceRoot = findWorkspaceRoot(projectRoot)

if (!workspaceRoot) {
  throw new Error(
    "Expected to be in a workspace, but couldn't find workspace root. " +
      'Is your project set up correctly with a pnpm-workspace.yaml file in the root directory?'
  )
}

console.log('Found workspace root at:', workspaceRoot)
console.log('Project root at:', projectRoot)

const config = getDefaultConfig(projectRoot)

// Create a list of workspace package locations
const workspaceDependencies = [
  path.resolve(workspaceRoot, 'packages/core'),
  path.resolve(workspaceRoot, 'packages/react'),
  path.resolve(workspaceRoot, 'packages/react-native'),
]

// Verify all workspace dependencies exist
workspaceDependencies.forEach((dep) => {
  if (!fs.existsSync(dep)) {
    console.warn(`Warning: Workspace dependency ${dep} does not exist`)
  }
})

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot, ...workspaceDependencies]

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// 3. Configure extra node_modules to be resolved
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      // Handle workspace package resolution
      if (name.startsWith('@quiltt/')) {
        const packageName = name.replace('@quiltt/', '')
        const workspacePackage = workspaceDependencies.find((dep) =>
          dep.endsWith(`/packages/${packageName}`)
        )
        if (workspacePackage) {
          const distPath = path.join(workspacePackage, 'dist')
          if (fs.existsSync(distPath)) {
            return distPath
          }
          // Fall back to src if dist doesn't exist
          return path.join(workspacePackage, 'src')
        }
      }

      return path.join(projectRoot, `node_modules/${name}`)
    },
  }
)

// 4. Force Metro to resolve (sub)dependencies through the workspace directory
config.resolver.disableHierarchicalLookup = true

// 5. Enable symlink support for workspace packages
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@quiltt/')) {
    const packageName = moduleName.replace('@quiltt/', '')
    const workspacePackage = workspaceDependencies.find((dep) =>
      dep.endsWith(`/packages/${packageName}`)
    )

    if (workspacePackage) {
      const distIndex = path.join(workspacePackage, 'dist/index.js')
      const srcIndex = path.join(workspacePackage, 'src/index.ts')

      if (fs.existsSync(distIndex)) {
        return {
          type: 'sourceFile',
          filePath: distIndex,
        }
      }
      if (fs.existsSync(srcIndex)) {
        return {
          type: 'sourceFile',
          filePath: srcIndex,
        }
      }
    }
  }

  return context.resolveRequest(context, moduleName, platform)
}

// 6. Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs', 'css']

// Log the final configuration for debugging
console.log('Metro configuration:', {
  watchFolders: config.watchFolders,
  nodeModulesPaths: config.resolver.nodeModulesPaths,
})

module.exports = config
