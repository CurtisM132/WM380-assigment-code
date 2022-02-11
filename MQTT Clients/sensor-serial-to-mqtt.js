var SerialPort = require('serialport');
const fs = require('fs');

const {
	SENSOR_DATA_TOPIC,
	SENSOR_MICROCONTROLLER_SERIAL_PORT,
	createBrokerClient,
} = require('./common');


function publishSensorData(mqttClient, data, log) {
	if (mqttClient.connected == true) {
		var options = {
			retain: true,
			qos: 1
		};

		log.write(`INFO: Publishing data to ${SENSOR_DATA_TOPIC} topic - ${data}\n`);
		mqttClient.publish(SENSOR_DATA_TOPIC, data, options);
	}
}

function handleSerialPortMessage(serialPort, mqttClient) {
	const Readline = SerialPort.parsers.Readline
	const parser = serialPort.pipe(new Readline())

	parser.on('data', function (data) {
		logFile.write(`INFO: Received sensor data - ${data}\n`);
		publishSensorData(mqttClient, data, logFile)
	});
}


let logFile = fs.createWriteStream('sensorLog.txt');
const mqttClient = createBrokerClient("localhost", logFile)

var serialPort = new SerialPort(SENSOR_MICROCONTROLLER_SERIAL_PORT, {
	baudRate: 9600
},
	function (err) {
		if (err) {
			logFile.write(`FATAL: Failed to open Serial Port connection to ${SENSOR_MICROCONTROLLER_SERIAL_PORT} - ${err.message}\n`)
			throw new Error(`FATAL: Failed to open Serial Port connection to ${SENSOR_MICROCONTROLLER_SERIAL_PORT} - ${err.message}\n`);
		}

		logFile.write(`INFO: Successfully opened Serial Port connection to ${SENSOR_MICROCONTROLLER_SERIAL_PORT}\n`)
	}
);

handleSerialPortMessage(serialPort, mqttClient)


// Handle assorted client errors
mqttClient.on("error", function (err) {
	logFile.write(`ERROR: Received error from MQTT Client - ${err}\n`)
});
