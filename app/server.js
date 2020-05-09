const express = require('express')
const http = require('http')
const socket_io = require('socket.io')
const Service = require('./service')
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
//  res.sendFile(process.env.PUBLIC_DIR + '/' + req.params[0])
//});


io.on('connection', (socket) => {
  utils.logSocket(socket, 'a user connected');
  socket.on('disconnect', () => {
		utils.logSocket(socket, 'user disconnected');
  })
})

const lobby = io.of('/lobby')
const service = new Service(lobby)

lobby.on('connection', (socket) => {
  utils.logSocket(socket, 'a user connected');

	socket.on('disconnected', (socket) => {
		service.signOut(socket)
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
})

server.listen(process.env.PORT || 8081,function() {
    console.log('Listening on '+ server.address().port);
});

