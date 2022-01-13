var SerialPort = require('serialport');
var mqtt = require('mqtt');
const fs = require('fs');


function createBrokerClient(logFile) {
	logFile.write("Connecting to MQTT broker");
	return mqtt.connect("mqtt://localhost", { clientId: "mqttjs01" });
}

function subscribeToSensorData(client, serialPort, logFile) {
	logFile.write("Subscribing to Sensor Data");
	client.subscribe("sensor-data", { qos: 1 });

	// handle incoming messages
	client.on('message', function (topic, message, packet) {
		console.log("Recieved Sensor Data: ", message.toString())
		
		const angle = `${interpretSensorData(JSON.parse(message.toString(), logFile))}`;
		logFile.write(`Write valve angle to serial port: ${angle}`)

		serialPort.write(angle)
	});
}

function interpretSensorData(data, logFile) {
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
		logFile.write("invalid sensor data")
	}

	// return '{angle:' + angle + '}'
	return angle;
}

let logFile = fs.createWriteStream('log.txt');
const client = createBrokerClient()

var serialPort = new SerialPort('COM3', {
	baudRate: 9600
});

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

