import json
import mqttclient
from gpio import *
from time import *


def on_connect(status, msg, packet):
    if status == "Success":
        print status + ": " + msg

        # Susbcribe to the water angle MQTT topic on a successful connection to the broker
        # Field and water valve ID's are hardcoded for this simulation
        mqttclient.subscribe("valve-angle/1/1")
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

        # Update the water detection topic
        # In the real sytem there would be a delay (to allow water to flow over the sensor)
        waterLevel = analogRead(A0)
        if waterLevel < 5:
            publishToWaterDetectedTopic("false", "1")
        else:
            publishToWaterDetectedTopic("true", "1")

    elif status == "":
        print msg


def publishToWaterDetectedTopic(data, valveId):
    topic = "water-detected/%s" % valveId

    print "Publish %s to topic: %s" % (data, topic)

    mqttclient.publish(topic, data, 1)


def main():
    mqttclient.init()
    mqttclient.onConnect(on_connect)
    mqttclient.onSubscribe(on_subscribe)
    mqttclient.onMessageReceived(on_message_received)

    mqttclient.connect("10.0.0.2", "", "")

    pinMode(A0, IN)  # set pin to read (water level)

    while True:
        delay(60000)


if __name__ == "__main__":
    main()
