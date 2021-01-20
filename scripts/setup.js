const fs = require('fs')
const path = require('path')

/* 
****************************
Update package.json
****************************
*/

const packageJSON = require('../package.json')
const { name: projectName } = packageJSON

// ensure that yarn init has been run
if (projectName === undefined) {
  console.log(
    'Warning: no name defined in package.json. Please run "yarn init" before "yarn setup".',
  )
  process.exit(1)
}

// 1. Change "name" in the "jbrowse-plugin" field to the name of your project (e.g. "MyProject")
packageJSON['jbrowse-plugin'].name = projectName

// 2. In the "scripts" field, replace the default name with the name of your project, prefixed with "JBrowsePlugin" in the "start" and "build" entries
packageJSON.scripts.start = `tsdx watch --verbose --noClean --format umd --name JBrowsePlugin${projectName} --onFirstSuccess "yarn serve --cors --listen 9000 ."`

packageJSON.scripts.build = `tsdx build --format cjs,esm,umd --name JBrowsePlugin${projectName}`

// 3. In the "module" field, replace jbrowse-plugin-my-project with the name of your project (leave off the @myscope if using a scoped package name) (you can double-check that the filename is correct after running the build step below and comparing the filename to the file in the dist/ folder)
packageJSON.module = `dist/${projectName}.esm.js`

// this overwrites package.json
writeJSON(packageJSON, 'package.json')

/* 
****************************
Update jbrowse_config.json
****************************
*/

// replace default plugin name and url with project name and dist file
const jbrowseConfig = require('../jbrowse_config.json')
jbrowseConfig.plugins[0].name = projectName
jbrowseConfig.plugins[0].url = `http://localhost:9000/dist/${projectName}.umd.development.js`
writeJSON(jbrowseConfig, 'jbrowse_config.json')

/* 
****************************
Update example fixture
****************************
*/

// replace default plugin name and url with project name and dist file
const exampleFixture = require('../cypress/fixtures/hello_view.json')
exampleFixture.plugins[0].name = projectName
exampleFixture.plugins[0].url = `http://localhost:9000/dist/${projectName}.umd.development.js`
writeJSON(exampleFixture, 'cypress/fixtures/hello_view.json')

/* 
****************************
Set up Github action
****************************
*/

// move integration test into workflow folder
if (fs.existsSync(path.join('.github', 'workflows'))) {
  fs.mkdirSync(path.join('.github', 'workflows'), { recursive: true })
}
fs.renameSync(
  'integration.yml',
  path.join('.github', 'workflows', 'integration.yml'),
)

// add status badge to README
let README = readFile('README.md').split(/\r?\n/)
README[0] = `# ${projectName} ![Integration](${packageJSON.repository.slice(
  0,
  -4,
)}/workflows/Integration/badge.svg?branch=main)`
const stream = fs.createWriteStream('README.md')
README.forEach(line => stream.write(`${line}\r\n`))

/* 
****************************
Helpers
****************************
*/

function writeJSON(data, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error(err)
  }
}

function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(err)
    return false
  }
}
