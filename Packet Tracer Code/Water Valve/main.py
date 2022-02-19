import json
import mqttclient
from gpio import *
from time import *


def on_connect(status, msg, packet):
    if status == "Success":
        print status + ": " + msg

        # Susbcribe to the water angle MQTT topic on a successfully connection to the broker
        mqttclient.subscribe("valve-angle")
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

        data = json.loads(packet["payload"])

        print "Extracted valve angle from message: %s degrees" % data["angle"]
        customWrite(0, data["angle"])

        # Update the water detection topic after a delay (to allow water to flow over the sensor)
        delay(5000)
        waterLevel = analogRead(A0)
        if waterLevel < 5:
            publishToWaterDetectedTopic("false", "1")
        else:
            publishToWaterDetectedTopic("true", "1")

    elif status == "":
        print msg


def publishToWaterDetectedTopic(data, valveId):
    mqttclient.publish("water-detected/%" % valveId, data, 1)


def main():
    mqttclient.init()
    mqttclient.onConnect(on_connect)
    mqttclient.onSubscribe(on_subscribe)
    mqttclient.onMessageReceived(on_message_received)

    mqttclient.connect("10.0.0.2", "", "")

    pinMode(A0, IN)  # read humdity

    while True:
        delay(60000)


if __name__ == "__main__":
    main()
