#include <Servo.h>

int red=13;


Servo servo;  // create servo object to control a servo
int pos =0;

// the setup routine runs once when you press reset:
void setup() {
  pinMode(red, OUTPUT);

  servo.attach(3);
  Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop() {
  int value = analogRead(A0);
  float angle = Serial.read();
  servo.write(angle);
  Serial.println(angle);
  if(value >= 50)
  {
    Serial.println("Water is detected! Self destruct soon.");
    digitalWrite(red, HIGH);
  }
  else
  {
    digitalWrite(red, LOW);
  }
//  
  Serial.print("Water level: ");
  Serial.println(value);
//  
  delay(3000);
}
