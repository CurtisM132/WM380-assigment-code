import json
from time import *

import mqttbroker
import mqttclient

import weatherClient

currentRainFall = None


def on_connect(status, msg, packet):
    if status == "Success":
        print status + ": " + msg

        # Susbcribe to the sensor data MQTT topic on a successfully connection to the broker
        mqttclient.subscribe("sensor-data/#")
    elif status == "Error":
        print status + ": " + msg
    elif status == "":
        print msg


def on_subscribe(status, msg, packet):
    if status == "Success" or status == "Error":
        print status + ": " + msg
    elif status == "":
        print msg


def on_message_received(status, msg, packet):
    if status == "Success" or status == "Error":
        print status + ": " + msg

        # Hardcoded to only pay attention to the first barley field soil monitor
        if packet["topic"] == "sensor-data/1/1":
            processSensorData(json.loads(packet["payload"]))

    elif status == "":
        print msg


# Callback to receive the weather data
def onHTTPDone(status, data):
    global currentRainFall
    if str(status) == "200":
        currentRainFall = data


# Process the sensor data and weather data into an appropriate water valve angle
def processSensorData(sensorData):
    angle = 0

    # In the deployed system this would be a sophisticated algoritm (probably AI driven)
    # For now this static algorithm suffices for proof of concept
    if sensorData["temperature"] > 15:
        angle += (25 + sensorData["humidity"] / 10)
    if sensorData["temperature"] > 20:
        angle += (50 + sensorData["humidity"] / 10)
    elif sensorData["temperature"] > 25:
        angle += (75 + sensorData["humidity"] / 10)

    if angle > 160:
        angle = 160

    # Publish the angle to the appropriate water valve
    # For this simulated design the field and water valve ID is hardcoded
    publishWaterValveAngle(angle, "1/1")


# Publish the water valve angle to a MQTT topic ready for a water valve microcontroller consumer
def publishWaterValveAngle(angle, valveId):
    topic = "valve-angle/%s" % valveId
    data = "{\"angle\": %d}" % angle

    print "Publishing water valve angle: %d, topic: %s" % (angle, topic)

    mqttclient.publish(topic, data, 1)


def main():
    mqttbroker.init()
    mqttclient.init()
    mqttclient.onConnect(on_connect)
    mqttclient.onSubscribe(on_subscribe)
    mqttclient.onMessageReceived(on_message_received)

    mqttclient.connect("10.0.0.2", "", "")

    weatherClient.subscribeToWeatherData(onHTTPDone)

    while True:
        delay(60000)
        weatherClient.getRainfall()
        # weatherClient.getTemperature()


if __name__ == "__main__":
    main()
