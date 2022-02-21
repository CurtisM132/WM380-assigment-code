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