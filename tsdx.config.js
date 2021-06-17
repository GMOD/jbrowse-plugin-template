const globals = require('@jbrowse/core/ReExports/list').default
const { createJBrowsePluginTsdxConfig } = require('@jbrowse/development-tools')
const externalGlobals = require('rollup-plugin-external-globals')

module.exports = {
  rollup(config, options) {
    // still need to fix createJBrowsePluginTsdxConfig to run on esm, not umd
    const newConfig = createJBrowsePluginTsdxConfig(config, options, globals)
    const globalMap = {}
    globals.forEach(g => {
      globalMap[g] = `JBrowseExports["${g}"]`
    })
    newConfig.plugins.push(externalGlobals(globalMap))
    return newConfig
  },
}
