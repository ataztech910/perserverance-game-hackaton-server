const express = require('express')
const http = require('http')
const socket_io = require('socket.io')

const app = express()
const server = http.Server(app)
const io = socket_io.listen(server)

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

users = {}

io.on('connection', (socket) => {
	console.log(`[${socket.id}]: connect`)
	socket.broadcast.emit('hello', {
		sid: socket.id,
	});

	socket.on('disconnect', () => {
		console.log(`[${socket.id}]: disconnect`)
		socket.broadcast.emit('buy', {
			sid: socket.id,
		});
		delete users[socket.id]
	})

	socket.on('broadcast', msg => {
		console.log(`[${socket.id}]:`, msg)
		if (msg.type === 'hello') {
			users[socket.id] = msg
		}
		socket.broadcast.emit('broadcast', {
			sid: socket.id,
			...msg,
		});
	})

	socket.on('users', (...args) => {
		console.log(`[${socket.id}]: users`)
		const fn = args.pop()
		fn(users)
	})
})

server.listen(process.env.PORT || 8081, function() {
	console.log('Listening on '+ server.address().port);
});

