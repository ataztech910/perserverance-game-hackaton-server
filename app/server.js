const express = require('express')
const http = require('http')
const socket_io = require('socket.io')
const LobbyService = require('./service')
const utils = require('./utils')

const app = express()
const server = http.Server(app)
const io = socket_io.listen(server)

app.get('/', (req, res) => {
	res.redirect('/public/index.html')
});

app.get('/public/*', (req, res) => {
	res.sendFile(process.env.PUBLIC_DIR + '/' + req.params[0])
});

//app.get('/assets/*', (req, res) => {
//	res.sendFile(process.env.PUBLIC_DIR + '/' + req.params[0])
//});


const lobby = io.of('/lobby')
const service = new LobbyService(lobby)

io.on('connection', (socket) => {
	const sid = utils.getRootSid(socket)
	utils.logSocket(sid, 'a user connected');
	socket.on('disconnect', () => {
		service.signOut(socket)
		utils.logSocket(sid, 'user disconnected');
	})
})

lobby.on('connection', (socket) => {
	const sid = utils.getRootSid(socket)
	utils.logSocket(sid, 'a user connected to lobby');

	socket.on('disconnected', (socket) => {
		service.signOut(socket)
		utils.logSocket(sid, 'user disconnected from lobby');
	})
	socket.on('sign-out', (socket) => {
		service.signOut(socket)
	})
	socket.on('sign-in', (...args) => {
		service.signIn(socket, ...args)
	})
	socket.on('matchNew', (...args) => {
		service.matchNew(socket, ...args)
	})
	socket.on('matchJoin', (...args) => {
		service.matchJoin(socket, ...args)
	})
	socket.on('matchLeave', (...args) => {
		service.matchLeave(socket, ...args)
	})
	socket.on('matchReady', (...args) => {
		service.matchReady(socket, ...args)
	})
})

server.listen(process.env.PORT || 8081, function() {
		console.log('Listening on '+ server.address().port);
});

