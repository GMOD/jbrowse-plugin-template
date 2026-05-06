import { ElementId } from '@jbrowse/core/util/types/mst'
import { types } from '@jbrowse/mobx-state-tree'

import type { MenuItem } from '@jbrowse/core/ui'

const stateModel = types
  .model({
    id: ElementId,
    type: types.literal('HelloView'),
  })
  .actions(() => ({
    // Required by the view contract; called with panel width in pixels on resize.
    setWidth() {},
  }))
  .views(() => ({
    // Required by the view contract; populates the view's header kebab menu.
    menuItems(): MenuItem[] {
      return []
    },
  }))

export default stateModel
