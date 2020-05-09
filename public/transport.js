
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

lobby.on('connect', () => {
	lobby.emit('sign-in', uid, 'dmitry', (result) => {
		console.log(result)

		const settings = {
			map: 'random',
			players: 4,
		}

		lobby.emit('matchNew', settings, (result) => {
			console.log(result)
		})
	})

	lobby.on('matchAdd', (settings) => {
		console.log(settings)
	})

	lobby.on('matchJoined', (settings) => {
		console.log(settings)
	})

	lobby.on('matchStarted', (settings) => {
		console.log(settings)
	})

	lobby.on('matchFinished', (settings) => {
		console.log(settings)
	})
})

