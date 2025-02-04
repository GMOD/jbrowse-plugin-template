import { MenuItem } from '@jbrowse/core/ui'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { types } from 'mobx-state-tree'

const stateModel = types
  .model({
    id: ElementId,
    type: types.literal('HelloView'),
  })
  .actions(() => ({
    // unused by this view but it is updated with th current width in pixels of
    // the view panel
    setWidth() {},
  }))
  .views(() => ({
    // unused by this view, but represents of 'view level' menu items
    menuItems(): MenuItem[] {
      return []
    },
  }))

export default stateModel
