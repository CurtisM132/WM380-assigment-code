var SerialPort = require('serialport');
var mqtt = require('mqtt');
const fs = require('fs');

const SENSOR_DATA_TOPIC = "sensor-data";
const VALVE_MICROCONTROLLER_SERIAL_PORT = "COM3"

// Creates and returns an MQTT client
function createBrokerClient(host, log) {
	log.write("INFO: Connecting to MQTT broker");
	return mqtt.connect(`mqtt://${host}`, { clientId: "mqttjs01" });
}

// Subscribes to the sensor data topic 
function subscribeToSensorData(client, log) {
	log.write("INFO: Subscribing to Sensor Data");
	client.subscribe(SENSOR_DATA_TOPIC, { qos: 1 }, function (err) {
		if (err) {
			throw new Error(`FATAL: Failed to subscribe to ${SENSOR_DATA_TOPIC}`);
		}
	});
}

// Handles received sensor data messages by extracting the message data, calculating the water valve angle
// then sending that angle to the serial port for use by other microcontrollers
function handleSensorDataMessages(client, serialPort, log) {
	// Handle incoming messages
	client.on('message', function (topic, msgBuffer, packet) {
		if (topic == SENSOR_DATA_TOPIC) {
			// Incoming message is received as a DataBuffer
			const message = msgBuffer.toString()
			console.log("INFO: Received Sensor Data - ", message)

			const angle = `${interpretSensorData(JSON.parse(message), log)}`;

			log.write(`INFO: Writing valve angle (${angle}) to serial port (${VALVE_MICROCONTROLLER_SERIAL_PORT})`)
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
		log.write("ERROR: Failed to parse sensor data - ", data)
	}

	// return '{angle:' + angle + '}'
	return angle;
}

let logFile = fs.createWriteStream('log.txt');
const client = createBrokerClient("localhost", logFile)

var serialPort = new SerialPort(VALVE_MICROCONTROLLER_SERIAL_PORT, {
	baudRate: 9600
});

client.on("connect", function () {
	if (client.connected) {
		subscribeToSensorData(client, logFile)
		handleSensorDataMessages(client, serialPort, logFile)
	} else {
		logFile.write("FATAL: Failed to connect to MQTT broker")
		throw Error("FATAL: Failed to connect to MQTT broker")
	}
});

// Handle assorted client errors
client.on("error", function (err) {
	logFile.write("ERROR: Recieved error from MQTT Client - ", err)
});

