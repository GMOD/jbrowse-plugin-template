const fs = require('fs')

/* 
****************************
Update package.json
****************************
*/

const packageJSON = require('../package.json')
const { name: projectName } = packageJSON

// ensure setup hasn't already been run
if (packageJSON['jbrowse-plugin'].name !== 'MyProject') {
  console.log(
    'Warning: It appears that setup has already been run. Terminating to avoid overwriting information.',
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

// replace default plugin name with project name
const jbrowseConfig = require('../jbrowse_config.json')
jbrowseConfig.plugins[0].name = projectName
writeJSON(jbrowseConfig, 'jbrowse_config.json')

/* 
****************************
Add badge in README
****************************
*/

let README = readFile('README.md').split(/\r?\n/)
README[0] = `${projectName} ![Integration](${packageJSON.repository.slice(
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
