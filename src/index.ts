import Plugin from '@jbrowse/core/Plugin'
import { version } from '../package.json'
export default class MyProjectPlugin extends Plugin {
  name = 'MyProject'
  version = version
}
