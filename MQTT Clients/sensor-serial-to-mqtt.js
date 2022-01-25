var SerialPort = require('serialport');
const fs = require('fs');

import {
	SENSOR_DATA_TOPIC,
	SENSOR_MICROCONTROLLER_SERIAL_PORT,
	createBrokerClient,
} from "./common.js"


function publishSensorData(mqttClient, data, log) {
	if (mqttClient.connected == true) {
		var options = {
			retain: true,
			qos: 1
		};

		log.write(`INFO: Publishing to ${SENSOR_DATA_TOPIC} topic: ${data}\n`);
		mqttClient.publish(SENSOR_DATA_TOPIC, data, options);
	}
}

function handleSerialPortMessage(serialPort, mqttClient) {
	const Readline = SerialPort.parsers.Readline
	const parser = serialPort.pipe(new Readline())

	parser.on('data', function(data) {
		logFile.write(`INFO: Recieved sensor data - ${data}\n`);
		publishSensorData(mqttClient, data, logFile)
	});
}


let logFile = fs.createWriteStream('log.txt');
const mqttClient = createBrokerClient(logFile)

var serialPort = new SerialPort(SENSOR_MICROCONTROLLER_SERIAL_PORT, {
	baudRate: 9600
});

handleSerialPortMessage(serialPort, mqttClient)


// Handle assorted client errors
mqttClient.on("error", function (err) {
	logFile.write(`ERROR: Recieved error from MQTT Client - ${err}\n`)
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