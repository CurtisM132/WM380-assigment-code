var mqtt = require('mqtt');


function createBrokerClient() {
	console.log("Connecting to MQTT broker")
	return mqtt.connect("mqtt://localhost", { clientId: "mqttjs01" });
}

function subscribeToSensorData(client) {
	console.log("Subscribing to Sensor Data")
	client.subscribe("sensor-data", { qos: 1 });

	// handle incoming messages
	client.on('message', function (topic, message, packet) {
		console.log("Recieved Sensor Data")

		valveRate = interpretSensorData(message.toString())
		publishValveAngle(client, valveRate)
	});
}

function interpretSensorData(data) {
	console.log(data)
	return `{angle: 59}`;
}

function publishValveAngle(client, data) {
	var options = {
		retain: true,
		qos: 1
	};
	
	if (client.connected == true) {
		console.log("Publishing to valve-angle topic: ", data);
		client.publish("valve-angle", data, options);
	}
}

const client = createBrokerClient()

client.on("connect", function () {
	if (client.connected) {
		subscribeToSensorData(client)
	} else {
		throw Error("can't connect to MQTT broker")
	}
});




// DEBUG PUBLISHING (example sensor data)
let count = 0
function publish(client, timerId) {
	var message = `{id: "29875-ag5", temperature: 5.5, humidity: 8}`;
	
	var options = {
		retain: true,
		qos: 1
	};
	
	if (client.connected == true) {
		// console.log("publishing", message);
		client.publish("sensor-data", message, options);
		count += 1
	}

	if (count > 5) {
		clearTimeout(timerId); // Stop publishing
		client.end();
	}
}

// DEBUG
client.on("connect", function () {
	console.log("Connected: " + client.connected);
});

// handle errors
client.on("error", function (error) {
	console.log("Can't connect: " + error);
	process.exit(1)
});

var timer_id = setInterval(function () { publish(client, timer_id); }, 5000);
