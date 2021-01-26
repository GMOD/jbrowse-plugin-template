import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import { isAbstractMenuManager } from '@jbrowse/core/util'
import ReactComponent from './components/ReactComponent'

export default class MyProjectPlugin extends Plugin {
  name = 'MyProject'

  install(pluginManager: PluginManager) {
    const { jbrequire } = pluginManager
    const { types } = pluginManager.lib['mobx-state-tree']

    const ViewType = jbrequire('@jbrowse/core/pluggableElementTypes/ViewType')
    const stateModel = types
      .model({ type: types.literal('HelloView') })
      .actions(() => ({
        setWidth() {
          // unused but required by your view
        },
      }))

    pluginManager.addViewType(() => {
      return new ViewType({ name: 'HelloView', stateModel, ReactComponent })
    })
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      // @ts-ignore
      pluginManager.rootModel.appendToSubMenu(['File', 'Add'], {
        label: 'Open Hello!',
        // @ts-ignore
        onClick: session => {
          session.addView('HelloView', {})
        },
      })
    }
  }
}