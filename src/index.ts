import Plugin from '@jbrowse/core/Plugin'
import packagejson from '../package.json'
export default class MyProjectPlugin extends Plugin {
  name = 'MyProject'
  version = packagejson.version
}
