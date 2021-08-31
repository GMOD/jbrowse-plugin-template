import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { isAbstractMenuManager } from '@jbrowse/core/util'
import { version } from '../package.json'
import {
  ReactComponent as HelloViewReactComponent,
  stateModel as helloViewStateModel,
} from './HelloView'

export default class MyProjectPlugin extends Plugin {
  name = 'MyProject'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() => {
      return new ViewType({
        name: 'HelloView',
        stateModel: helloViewStateModel,
        ReactComponent: HelloViewReactComponent,
      })
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
