
function getUid() {
	var uid = localStorage.getItem('uid')
	if (uid == null) {
		uid = uuidv4()
		localStorage.setItem('uid', uid)
	}
	return uid
}

const uid = getUid()
const socket = io('http://localhost:8081')
const lobby = io('/lobby')

matches = {}
users = {}


function makeTextCell(text) {
	return document.createTextNode(text)
}

function makeButtonCell(text, fn) {
	const btn = document.createElement('button')
	btn.setAttribute('onclick', fn)
	btn.setAttribute('width', '100%')
	btn.setAttribute('height', '100%')
	btn.appendChild(makeTextCell(text))
	return btn
}

function makeRow(...args) {
	const row = document.createElement('tr')
	for (const arg of args) {
		const td = document.createElement('td')
		td.appendChild(arg)
		row.appendChild(td)
	}
	return row
}

function joinMatch(mid) {
	console.log('matchJoin', mid)
	lobby.emit('matchJoin', mid, (result) => {
		console.log(result)
	})
}

function leaveMatch(mid) {
	console.log('matchLeave', mid)
	lobby.emit('matchLeave', mid, (result) => {
		console.log(result)
	})
}

function readyMatch(mid) {
	console.log('matchReady', mid)
	lobby.emit('matchReady', mid, (result) => {
		console.log(result)
	})
}

function matchToDOM(match) {
		const row = makeRow(
			makeTextCell(Object.keys(matches).length),
			makeTextCell(match.settings.name),
			makeTextCell(match.settings.players),
			makeTextCell(Object.keys(match.players).map(uid => (uid in users) ? users[uid].nickname : uid).join(', ')),
			makeTextCell(match.settings.map),
			makeTextCell(match.status),
			makeButtonCell('join', `joinMatch('${match.id}')`),
			makeButtonCell('leave', `leaveMatch('${match.id}')`),
			makeButtonCell('ready', `readyMatch('${match.id}')`),
		)
		row.setAttribute('id', match.id)
		return row
}

function rerenderMatch(mid) {
	if (mid in matches) {
		const match = matches[mid]
		const row = matchToDOM(match)
		const matchEl = document.getElementById(mid)
		if (matchEl != null) {
			matchEl.innerHTML = row.innerHTML
		} else {
			const matchesEl = document.getElementById('matches')
			matchesEl.appendChild(row)
		}
	}
}

function recreateTable() {
	const matchesEl = document.getElementById('matches')
	matchesEl.innerHTML =
`
	<tr>
		<th>#</th>
		<th>Name</th>
		<th>Max Players</th>
		<th>Players</th>
		<th>Map</th>
		<th>Status</th>
		<th>Join</th>
		<th>Leave</th>
		<th>Ready</th>
	</tr>
`
}

lobby.on('connect', () => {

	matches = {}
	users = {}

	recreateTable()

	lobby.emit('sign-in', uid, 'dmitry', (result) => {
		console.log(result)

		const settings = {
			name: 'dmitry\' match',
			map: 'random',
			players: 4,
		}

		lobby.emit('matchNew', settings, (result) => {
			console.log(result)
		})
	})

	lobby.on('userEnter', (uid, user) => {
		console.log('userEnter', uid, user)
		users[uid] = user
	})
	lobby.on('userLeave', (uid, user) => {
		console.log('userLeave', uid, user)
		delete users[uid]
	})

	lobby.on('matchAdd', (match) => {
		console.log('matchAdd', match)
		matches[match.id] = match
		rerenderMatch(match.id)
	})

	lobby.on('matchUpdated', (match) => {
		console.log('matchUpdated', match)
		matches[match.id] = match
		rerenderMatch(match.id)
	})

	lobby.on('matchJoined', (mid, uid) => {
		console.log('matchJoined', mid, uid)
		matches[mid].players[uid] = false
		rerenderMatch(mid)
	})

	lobby.on('matchReady', (mid, uid) => {
		console.log('matchReady', mid, uid)
		matches[mid].players[uid] = true
		rerenderMatch(mid)
	})

	lobby.on('matchLeaved', (mid, uid) => {
		console.log('matchLeaved', mid, uid)
		delete matches[mid].players[uid]
		rerenderMatch(mid)
	})

	lobby.on('matchStarted', (mid) => {
		console.log('matchStarted', mid)
		matches[mid].status = 'playing'
		rerenderMatch(mid)
	})

	lobby.on('matchFinished', (mid) => {
		console.log('matchFinished', mid)
		const matchEl = document.getElementById(mid)
		if (matchEl != null)
			matchEl.outerHTML = ''
		matches[mid] = {}
	})
})

