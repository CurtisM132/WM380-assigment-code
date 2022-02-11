var mqtt = require('mqtt');

exports.SENSOR_DATA_TOPIC = "sensor-data";

exports.VALVE_MICROCONTROLLER_SERIAL_PORT = "COM3"
exports.SENSOR_MICROCONTROLLER_SERIAL_PORT = "COM4"

// Creates and returns an MQTT client
function createBrokerClient(host, log) {
    log.write("INFO: Connecting to MQTT broker\n");
    return mqtt.connect(`mqtt://${host}`, { clientId: "mqttjs01" });
}
exports.createBrokerClient = createBrokerClient