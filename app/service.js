const utils = require('./utils')

const AUTOLEAVE_MATCHES_TIMEOUT = 30000

class LobbyService {
	constructor(lobby) {
		this.lobby = lobby
		this.users = {}
		this.sockets = {}
		this.matches = {}
		this.timers = {
			autoleave: {}
		}
	}

	signIn(socket, ...args) {
		const fn = args.pop()
		const sid = utils.getRootSid(socket)
		const [uid, nickname] = args

		this.sockets[sid] = uid

		var user = this.users[uid]
		if (user == null) {
			user = {
				timers: {},
			}
			this.users[uid] = user
		}
		if (nickname != null)
			user.nickname = nickname
		if (user.timers.autoleave != null) {
			clearTimeout(user.timers.autoleave)
			user.timers.autoleave = null
		}

		this.lobby.emit('userEnter', uid, user)

		utils.logAndCall(sid, fn, `Welcome to the lobby server, ${nickname} !`)
		utils.logSocket(sid, `user '${uid}' singed in`);

		for (const [uid, user] of Object.entries(this.users)) {
			socket.emit('userEnter', uid, user)
		}
		for (const [mid, match] of Object.entries(this.matches)) {
			socket.emit('matchUpdated', match)
		}
	}

	signOut(socket) {
		const sid = utils.getRootSid(socket)
		const uid = this.sockets[sid]
		delete this.sockets[sid]
		if (uid != null) {
			utils.logSocket(sid, `user '${uid}' singed out`);

			this.lobby.emit('userLeave', uid, this.users[uid])

			this.users[uid].timers.autoleave = setTimeout(() => {
				utils.logSocket(sid, `user '${uid}' doesn't com back for a long time`);

				this.users[uid].timers.autoleave = null

				for (const mid of Object.keys(this.matches)) {
					this.removeUserFromMatch(sid, uid, mid)
				}

			}, AUTOLEAVE_MATCHES_TIMEOUT)
		}
	}

	removeUserFromMatch(sid, uid, mid) {
		const match = this.matches[mid]
		if (uid in match.players) {
			delete match.players[uid]
			this.lobby.emit('matchLeaved', mid, uid)
			utils.logSocket(sid, `user '${uid}' leaved match ${mid}`);
			if (Object.keys(match.players).length == 0) {
				delete this.matches[mid]
				this.lobby.emit('matchFinished', mid)
				utils.logSocket(sid, `match ${mid} finished`);
			}
		}
		this.users[uid].mid = null
	}

	matchNew(socket, ...args) {
		const fn = args.pop()
		const sid = utils.getRootSid(socket)
		const uid = this.sockets[sid]

		if (this.users[uid].mid != null) {
			utils.logAndCall(sid, fn, 'you already in onther match')
			return
		}

		const [settings, ] = args

		const mid = utils.generateUuid()
		const match = {
			id: mid,
			settings,
			players: {},
			status: 'waiting',
		}
		match.players[uid] = false
		this.matches[mid] = match
		this.users[uid].mid = mid
		utils.logSocket(sid, `user '${uid}' made new game '${mid}'`);
		this.lobby.emit('matchAdd', match)
	}

	matchJoin(socket, ...args) {
		const sid = utils.getRootSid(socket)
		const uid = this.sockets[sid]
		const fn = args.pop()
		const [mid, ] = args
		if ( ! (mid in this.matches)) {
			utils.logAndCall(sid, fn, 'match not found')
			return
		}
		const match = this.matches[mid]
		if (match.settings.players == Object.keys(match.players).length) {
			utils.logAndCall(sid, fn, 'match is full')
			return
		}
		if (uid in match.players) {
			utils.logAndCall(sid, fn, 'you already in this match')
			return
		}
		const user = this.users[uid]
		if (user.mid != null) {
			utils.logAndCall(sid, fn, 'you already in onther match')
			return
		}
		utils.logAndCall(sid, fn, 'success')
		match.players[uid] = false
		user.mid = mid
		this.lobby.emit('matchJoined', mid, uid)
	}

	matchLeave(socket, ...args) {
		const sid = utils.getRootSid(socket)
		const uid = this.sockets[sid]
		const fn = args.pop()

		const [leaveMid, ] = args
		const otherMid = this.users[uid].mid

		for (const mid of [otherMid, leaveMid]) {
			if (mid in this.matches) {
				this.removeUserFromMatch(sid, uid, mid)
			}
		}

		utils.logAndCall(sid, fn, 'success')
	}

	matchReady(socket, ...args) {
		const sid = utils.getRootSid(socket)
		const uid = this.sockets[sid]
		const fn = args.pop()
		const [mid, ] = args
		if (! (mid in this.matches)) {
			utils.logAndCall(sid, fn, 'match not found')
			return
		}

		const match = this.matches[mid]
		if (! (uid in match.players)) {
			utils.logAndCall(sid, fn, 'you not joind the match')
			return
		}

		console.log(match)

		if (match.players[uid] == false) {
			match.players[uid] = true
			this.lobby.emit('matchReady', mid, uid)

			var allReady = true
			for (const [uid, ready] of Object.entries(match.players))
				allReady = allReady & ready

			if (allReady) {
				match.status = 'playing'
				utils.logSocket(sid, `match '${mid}' is going to start`);
				this.lobby.emit('matchStarted', mid)
			}
		}
		utils.logAndCall(sid, fn, 'success')
	}
}

module.exports = LobbyService

