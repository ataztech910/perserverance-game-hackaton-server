const utils = require('./utils')

class Service {
	constructor(lobby) {
		this.lobby = lobby
		this.users = {}
		this.sockets = {}
		this.matches = {}
	}

	signIn(socket, ...args) {
		const fn = args.pop()
		const sid = utils.getRootSid(socket)
		const [uid, nickname] = args

		var user = this.users[uid]
		if (user == undefined) {
			user = {}
			this.users[uid] = user
		}
		if (nickname != undefined)
			user.nickname = nickname
		this.sockets[sid] = uid

		fn(`Welcome to the lobby server, ${nickname} !`)

		utils.logSocket(socket, `user '${uid}' singed in`);
	}
	signOut(socket) {
		const sid = utils.getRootSid(socket)
		const uid = this.sockets[sid]
		delete this.sockets[sid]
		if (uid != null)
			utils.logSocket(socket, `user '${uid}' singed out`);
	}

	matchNew(socket, settings) {
		const mid = utils.generateUuid()
		const match = {
			id: mid,
			settings,
		}
		this.matches[mid] = match

		this.lobby.emit('matchAdd', match)
	}
}

module.exports = Service
