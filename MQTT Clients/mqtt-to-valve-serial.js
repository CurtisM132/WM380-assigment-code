var SerialPort = require('serialport');
var mqtt = require('mqtt');


function createBrokerClient() {
	console.log("Connecting to MQTT broker");
	return mqtt.connect("mqtt://localhost", { clientId: "mqttjs01" });
}

function subscribeToSensorData(client, serialPort) {
	console.log("Subscribing to Sensor Data");
	client.subscribe("sensor-data", { qos: 1 });

	// handle incoming messages
	client.on('message', function (topic, message, packet) {
		console.log("Recieved Sensor Data: ", message.toString())
		
		const angle = `${interpretSensorData(JSON.parse(message.toString()))}`
		serialPort.write(angle)
	});
}

function interpretSensorData(data) {
	let angle = 0

	try {
		let temp = data['temperature']
		let humid = data['humidity']

		if (humid < 40) {
			angle = 50

			if (temp > 30) {
				angle += 50
			}
			else if (temp > 25) {
				angle += 25
			}
		}
	}
	catch (err) {
		console.log("invalid sensor data")
	}

	// return '{angle:' + angle + '}'
	console.log("angle", angle);
	return angle;
}

var serialPort = new SerialPort('COM3', {
	baudRate: 9600
});

const client = createBrokerClient()
client.on("connect", function () {
	if (client.connected) {
		subscribeToSensorData(client, serialPort)
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

