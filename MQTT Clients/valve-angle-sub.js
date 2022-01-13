var mqtt = require('mqtt');


function createBrokerClient() {
	console.log("Connecting to MQTT broker")
	return mqtt.connect("mqtt://localhost", { clientId: "mqttjs01" });

}

function subscribeToValveAngle(client) {
	console.log("Subscribing to Valve Angle")
	client.subscribe("valve-angle", { qos: 1 });

	// handle incoming messages
	client.on('message', function (topic, message, packet) {
		console.log("Recieved Valve Angle: ", message.toString())
	});
}

const client = createBrokerClient()

client.on("connect", function () {
	if (client.connected) {
		subscribeToValveAngle(client)
	} else {
		throw Error("can't connect to MQTT broker")
	}
});



// DEBUG
client.on("connect", function () {
	console.log("Connected: " + client.connected);
});

// handle errors
client.on("error", function (error) {
	console.log("Can't connect: " + error);
	process.exit(1)
});

