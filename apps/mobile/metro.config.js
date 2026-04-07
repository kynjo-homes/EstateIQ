const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
/** Monorepo root (`estateiq/`), two levels above `apps/mobile` */
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

module.exports = config
