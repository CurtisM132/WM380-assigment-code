import mqttclient
from time import *
from physical import *
from gpio import *


# Used to convert sensor readings in to understandable units (e.g., temperature sensor reading to celsius)
def translate(value, leftMin, leftMax, rightMin, rightMax):
    # Figure out how 'wide' each range is
    leftSpan = leftMax - leftMin
    rightSpan = rightMax - rightMin

    # Convert the left range into a 0-1 range (float)
    valueScaled = float(value - leftMin) / float(leftSpan)

    # Convert the 0-1 range into a value in the right range.
    return rightMin + (valueScaled * rightSpan)


def on_connect(status, msg, packet):
    if status == "Success" or status == "Error":
        print status + ": " + msg
    elif status == "":
        print msg


def publishToSensorTopic(data, monitorId):
    topic = "sensor-data/%s" % monitorId

    print "Publishing sensor data: %s, topic: %s" % (data, topic)

    mqttclient.publish(topic, data, 1)


def main():
    mqttclient.init()
    mqttclient.onConnect(on_connect)
    mqttclient.connect("10.0.0.2", "", "")

    pinMode(A0, IN)  # set pin to read (humidity)
    pinMode(A1, IN)  # set pin to read (water level)
    pinMode(A2, IN)  # # set pin to read (temperature)

    while True:
        # read and map temperature to celsius
        humdity = translate(analogRead(A0), 0, 1023, 0, 100)

        # read water detection level
        water = analogRead(A1)

        # read and map humidity to 0-100%
        temperature = translate(analogRead(A2), 0, 1023, -100, 100)

        jsonData = "{\"id\": %s, \"humidity\": %s, \"water\": %s, \"temperature\": %s}" % (
            1, humdity, water, temperature)

        # Publish the sensor readings
        # For this simulated design the field and soil monitor IDs are hardcoded
        publishToSensorTopic(jsonData, "1/1")

        delay(8000)


if __name__ == "__main__":
    main()
