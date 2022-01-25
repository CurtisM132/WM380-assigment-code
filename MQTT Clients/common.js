var mqtt = require('mqtt');

export const SENSOR_DATA_TOPIC = "sensor-data";

export const VALVE_MICROCONTROLLER_SERIAL_PORT = "COM3"
export const SENSOR_MICROCONTROLLER_SERIAL_PORT = "COM4"

// Creates and returns an MQTT client
export function createBrokerClient(host, log) {
    log.write("INFO: Connecting to MQTT broker\n");
    return mqtt.connect(`mqtt://${host}`, { clientId: "mqttjs01" });
}