const fs = require('fs')

//if (! fs.existsSync(process.env.ASSETS_DIR)) {
//	throw Error( `Forlder '${process.env.ASSETS_DIR}' is not available. Please install properly environment variable ASSETS_DIR`)
//}

if (! fs.existsSync(process.env.PUBLIC_DIR)) {
	throw Error( `Forlder '${process.env.PUBLIC_DIR}' is not available. Please install properly environment variable PUBLIC_DIR`)
}

require('./app/server')

