var SerialPort = require('serialport');
var mqtt = require('mqtt');
const fs = require('fs');

function createBrokerClient() {
	logFile.write("Connecting to MQTT broker\n");
	return mqtt.connect("mqtt://localhost", { clientId: "mqttjs01" });
}

function publishSensorData(client, data, logFile) {
	var options = {
		retain: true,
		qos: 1
	};

	if (client.connected == true) {
		// console.log("Publishing to sensor-data topic: ", data);
		logFile.write(`Publishing to sensor-data MQTT topic: ${data}\n`);
		client.publish("sensor-data", data, options);
	}
}

let logFile = fs.createWriteStream('log.txt');
const client = createBrokerClient(logFile)

var serialPort = new SerialPort('COM4', {
	baudRate: 9600
});

const Readline = SerialPort.parsers.Readline
const parser = serialPort.pipe(new Readline())
parser.on('data', function(data) {
	logFile.write(`Recieved sensor data\n`);
	publishSensorData(client, data, logFile)
});

// DEBUG
// handle errors
client.on("error", function (error) {
	console.log("Can't connect: " + error);
	process.exit(1)
});
