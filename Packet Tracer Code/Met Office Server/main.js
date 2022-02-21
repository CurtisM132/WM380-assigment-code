function setup() {
    var testRainFall = "{\"rainfall\": [300, 0, 0, 100, 50, 200, 100]}";
    var testTemperatures = "{\"temperature\": [17,10,11,25,18,19,10]}";

    var port = 1000;

    HTTPServer.route("/", function (url, res) {
        Serial.println("Request for /");
        res.send("welcome to the met office");
    });

    HTTPServer.route("/getRainfall", function (url, res) {
        Serial.println("Rainfall for next seven days:" + testRainFall);

        res.setContentType("application/json");
        res.send(testRainFall);
    });

    HTTPServer.route("/getTemperature", function (url, res) {
        Serial.println("Temperature for next seven days:" + testTemperatures);

        res.setContentType("application/json");
        res.send(testTemperatures);
    });

    // wild card
    HTTPServer.route("/*", function (url, res) {
        Serial.println("Request sent with invalid url: " + url);
        res.send(404);
    });

    HTTPServer.start(port);

    Serial.println("Server started: listening on port: " + port);
}
