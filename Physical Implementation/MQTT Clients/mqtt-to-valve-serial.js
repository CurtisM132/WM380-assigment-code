var SerialPort = require('serialport');
const fs = require('fs');

const {
	SENSOR_DATA_TOPIC,
	VALVE_MICROCONTROLLER_SERIAL_PORT,
	createBrokerClient,
} = require('./common');


// Subscribes to the sensor data topic 
function subscribeToSensorData(mqttClient, log) {
	log.write("INFO: Subscribing to Sensor Data topic\n");
	mqttClient.subscribe(SENSOR_DATA_TOPIC, { qos: 1 }, function (err) {
		if (err) {
			log.write(`FATAL: Failed to subscribe to ${SENSOR_DATA_TOPIC} topic - ${err}\n`)
			throw new Error(`FATAL: Failed to subscribe to ${SENSOR_DATA_TOPIC} topic`);
		}

		log.write("INFO: Successfully subscribed to Sensor Data topic\n");
	});
}

// Handles received sensor data messages by extracting the message data, calculating the water valve angle
// then sending that angle to the serial port for use by other microcontrollers
function handleSensorDataMessages(mqttClient, serialPort, log) {
	// Handle incoming messages
	mqttClient.on('message', function (topic, msgBuffer, packet) {
		if (topic == SENSOR_DATA_TOPIC) {
			// Incoming message is received as a DataBuffer
			const message = msgBuffer.toString()
			console.log(`INFO: Received Sensor Data - ${message}\n`)

			const angle = `${interpretSensorData(JSON.parse(message), log)}`;

			log.write(`INFO: Writing valve angle (${angle}) to serial port (${VALVE_MICROCONTROLLER_SERIAL_PORT})\n`)
			serialPort.write(angle)
		}
	});
}

// Takes in a JSON object containing various sensor data readings
// Extracts that data then calculates and returns the water valve angle
function interpretSensorData(data, log) {
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
		log.write(`ERROR: Failed to parse sensor data - ${err}\n`)
	}

	// return '{angle:' + angle + '}'
	return angle;
}


let logFile = fs.createWriteStream('valveLog.txt');
const mqttClient = createBrokerClient("localhost", logFile)

var serialPort = new SerialPort(VALVE_MICROCONTROLLER_SERIAL_PORT, {
	baudRate: 9600
},
	function (err) {
		if (err) {
			logFile.write(`FATAL: Failed to open Serial Port connection to ${VALVE_MICROCONTROLLER_SERIAL_PORT} - ${err.message}\n`)
			throw new Error(`FATAL: Failed to open Serial Port connection to ${VALVE_MICROCONTROLLER_SERIAL_PORT} - ${err.message}\n`);
		}

		logFile.write(`INFO: Successfully opened Serial Port connection to ${VALVE_MICROCONTROLLER_SERIAL_PORT}\n`)
	}
);

mqttClient.on("connect", function () {
	if (mqttClient.connected) {
		logFile.write("INFO: Connected to MQTT Broker\n")
		subscribeToSensorData(mqttClient, logFile)
		handleSensorDataMessages(mqttClient, serialPort, logFile)
	} else {
		logFile.write("FATAL: Failed to connect to MQTT broker\n")
		throw Error("FATAL: Failed to connect to MQTT broker")
	}
});


// Handle assorted MQTT client errors
mqttClient.on("error", function (err) {
	logFile.write(`ERROR: Received error from MQTT Client - ${err}\n`)
});
