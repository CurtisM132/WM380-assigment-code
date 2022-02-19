from http import *
from time import *

url = "http://10.0.0.30:1000"
http = HTTPClient()

def getRainfall():
	http.open(url + "/getRainfall")
	
def getTemperature():
	http.open(url + "/getTemperature")
	
def subscribeToWeatherData(subscription):
	http.onDone(subscription)
	
# test function, we need to actually do something with the weather data.	
def onHTTPDone(status, data):
	print("status: " + str(status))
	print("data: " + data)
	return data