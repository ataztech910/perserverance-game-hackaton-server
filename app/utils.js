const { v4: uuidv4 } = require('uuid')

function getSessionIds(socket) {
	const sid = socket.id
	return sid.split('#')
}

function getRootSid(socket) {
	const ids = getSessionIds(socket)
	return ids.length == 1 ? ids : ids[1]
}

function logSocket(sid, ...args) {
	console.log(`[${sid}]: `, ...args)
}

function logAndCall(sid, fn, ...args) {
	console.log(`[${sid}]:`, ...args)
	fn(...args)
}

function generateUuid() {
	return uuidv4()
}

module.exports = {
	getSessionIds,
	getRootSid,
	logSocket,
	logAndCall,
	generateUuid,
}
