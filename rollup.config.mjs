import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import JBrowseReExports from '@jbrowse/core/ReExports/list'
import externalGlobals from 'rollup-plugin-external-globals'

const isProd = process.env.NODE_ENV === 'production'

// Plugins must reuse the React/MUI/mobx instances JBrowse already loaded via
// window.JBrowseExports — bundling a second copy causes duplicate-React errors.
// externalGlobals replaces imports with inline JBrowseExports[...] references
// in the compiled code; rollup's built-in globals can't handle expression strings.
function createGlobalsMap(jbrowseGlobals) {
  const globals = {}
  for (const g of jbrowseGlobals) {
    globals[g] = `JBrowseExports["${g}"]`
  }
  // v4+ package name, but JBrowse exports it as 'mobx-state-tree' for back-compat.
  globals['@jbrowse/mobx-state-tree'] = `JBrowseExports["mobx-state-tree"]`
  return globals
}

const globalsMap = createGlobalsMap(JBrowseReExports)

export default {
  input: 'src/index.ts',
  output: {
    // JBrowse reads this off window after the UMD script loads — rename with the plugin.
    name: 'JBrowsePluginTemplate',
    file: isProd
      ? 'dist/jbrowse-plugin-template.umd.production.min.js'
      : 'dist/out.js',
    format: 'umd',
    // 'named' makes rollup wrap exports as { default: PluginClass } rather than
    // returning the class directly — JBrowse's plugin loader requires .default.
    exports: 'named',
    sourcemap: true,
  },
  plugins: [
    externalGlobals(globalsMap),
    nodeResolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
    commonjs(),
    typescript(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ),
      preventAssignment: true,
    }),
    ...(isProd ? [terser()] : []),
  ],
}
