var SerialPort = require('serialport');
var mqtt = require('mqtt');

function createBrokerClient() {
	console.log("Connecting to MQTT broker")
	return mqtt.connect("mqtt://localhost", { clientId: "mqttjs01" });
}

function publishSensorData(client, data) {
	var options = {
		retain: true,
		qos: 1
	};
	
	if (client.connected == true) {
		console.log("Publishing to sensor-data topic: ", data);
		client.publish("sensor-data", data, options);
	}
}

const client = createBrokerClient()

    var serialPort = new SerialPort('COM4', {
        baudRate: 9600
    });
    
    // Recieve data from Arduino
    serialPort.on('readable', function () {
        publishSensorData(client, serialPort.read().toString())
    });

// DEBUG
// handle errors
client.on("error", function (error) {
	console.log("Can't connect: " + error);
	process.exit(1)
});
