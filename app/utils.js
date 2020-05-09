const { v4: uuidv4 } = require('uuid')

function getSessionIds(socket) {
	const sid = socket.id
	return sid.split('#')
}

function getRootSid(socket) {
	const ids = getSessionIds(socket)
	return ids.length == 1 ? sid : ids[1]
}

function logSocket(socket, ...args) {
	console.log(`[${socket.id}]: `, ...args)
}

function generateUuid() {
	return uuidv4()
}

module.exports = {
	getSessionIds,
	getRootSid,
	logSocket,
	generateUuid,
}
