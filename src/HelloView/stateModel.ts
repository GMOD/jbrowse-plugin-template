import { ElementId } from '@jbrowse/core/util/types/mst'
import { types } from 'mobx-state-tree'

const stateModel = types
  .model({
    id: ElementId,
    type: types.literal('HelloView'),
  })
  .volatile(() => ({
    width: undefined as number | undefined,
  }))
  .actions((self) => ({
    // unused but required by your view
    setWidth(arg: number) {
      self.width = arg
    },
  }))

export default stateModel
