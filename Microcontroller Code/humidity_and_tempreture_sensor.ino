//www.elegoo.com
//2018.10.25

#include <dht_nonblocking.h>
#define DHT_SENSOR_TYPE DHT_TYPE_11

static const int DHT_SENSOR_PIN = 7;
static const int LED_PIN = 13;
DHT_nonblocking dht_sensor( DHT_SENSOR_PIN, DHT_SENSOR_TYPE );

/*
 * Initialize the serial port.
 */
void setup( )
{
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);   // initialize digital pin LED_PIN as an output.
  digitalWrite(LED_PIN, LOW); // keep the LED off until a measurement is made
}

/*
 * Poll for a measurement, keeping the state machine alive.  Returns
 * true if a measurement is available.
 */
static bool measure_environment( float *temperature, float *humidity )
{
  static unsigned long measurement_timestamp = millis( );

  /* Measure once every four seconds. */
  if( millis( ) - measurement_timestamp > 3000ul )
  {
    if( dht_sensor.measure( temperature, humidity ) == true )
    {
      measurement_timestamp = millis( );
      return( true );
    }
  }

  return( false );
}

/*
 * Main program loop.
 */
void loop( )
{
  float temperature;
  float humidity;

  static unsigned long led_timestamp = millis( );

  /* Measure temperature and humidity.  If the functions returns
     true, then a measurement is available. */
  if( measure_environment( &temperature, &humidity ) == true )
  {
    Serial.print( "{ \"temperature\": ");
    Serial.print(temperature);
    Serial.print( ", \"temperatureUnit\": \"C\", \"humidity\": " );
    Serial.print( humidity);
    Serial.println( "}" );

    digitalWrite( LED_PIN, HIGH ); // turn the LED on
    led_timestamp = millis( );
  }
  if ( ( millis( ) - led_timestamp ) > 500ul )
  {
    digitalWrite( LED_PIN, LOW ); // turn the LED off a second after the last measurement
  }
}
