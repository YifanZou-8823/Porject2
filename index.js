//Initialize the express 'app' object
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(port, HOST, () => {
    console.log("Server listening at port: " + port);
});

//Initialize socket.io
let io = require('socket.io');
io = new io.Server(server);

let private = io.of('/private');

//Listen for individual clients/users to connect
io.sockets.on('connection', function(socket) {
    console.log("We have a new client: " + socket.id);

    //Listen for a message named 'msg' from this client
    socket.on('msg', function(data) {
        //Data can be numbers, strings, objects
        console.log("Received a 'msg' event");
        console.log(data);

        //Send a response to all clients, including this one
        io.sockets.emit('msg', data);

        //Send a response to all other clients, not including this one
        // socket.broadcast.emit('msg', data);

        //Send a response to just this client
        // socket.emit('msg', data);
    });

    //Listen for this client to disconnect
    socket.on('disconnect', function() {
        console.log("A client has disconnected: " + socket.id);
    });
});

//Listen for individual clients/users to connect to the private namespace
private.on('connection', function(socket) {
    console.log("Private Namespace Connection");
    console.log("We have a new client: " + socket.id);

    socket.on('room',function(data){
        console.log("A room name was submitted.");
        console.log(data.roomName);
        
        //Add socket to room
        socket.join(data.roomName);
        //Add roomName property to the socket object
        socket.roomName = data.roomName;

        let welcomeMsg = "A new user has joined the room: " + data.roomName;
        private.to(data.roomName).emit("joined", {"msg": welcomeMsg});

    })

    //Listen for a message named 'msg' from this client
    socket.on('msg', function(data) {
        //Data can be numbers, strings, objects
        console.log("Received a 'msg' event");
        console.log(data);

        let curRoom = socket.roomName;
        console.log(curRoom);

        //Send a response to all clients, including this one
        private.to(curRoom).emit('msg', data);
    });

    //Listen for this client to disconnect
    socket.on('disconnect', function() {
        console.log("A client has disconnected: " + socket.id);
    });
});