const express = require('express')
const http = require('http')
const socket_io = require('socket.io')
const LobbyService = require('./service')
const utils = require('./utils')
const path = require('path')

const app = express()
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 // Add this
 if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, OPTIONS');
      res.header('Access-Control-Max-Age', 120);
      return res.status(200).json({});
  }
  next();
});

const server = http.Server(app)
const io = socket_io.listen(server)

app.get('/', (req, res) => {
	res.redirect('/public/index.html')
});

//app.use(express.static(process.env.PUBLIC_DIR + '/'));
app.get('/public/*', (req, res) => {
	const p = path.resolve(process.env.PUBLIC_DIR) + '/' + req.params[0]
	console.log(p)
	res.sendFile(p)
});

//app.get('/assets/*', (req, res) => {
//	const p = path.resolve(process.env.ASSETS_DIR) + '/' + req.params[0]
//	console.log(p)
//	res.sendFile(p)
//});


const lobby = io.of('/lobby')
const service = new LobbyService(io, lobby)

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
	socket.on('forceStart', (...args) => {
		service.forceStart(socket, ...args)
	})
})

server.listen(process.env.PORT || 8081, function() {
		console.log('Listening on '+ server.address().port);
});

