#include <Arduino.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

static constexpr uint8_t DIGITAL_PIN_COUNT = 2;
static constexpr uint8_t PWM_CHANNEL_COUNT = 8;
static constexpr uint8_t PWM_RESOLUTION_BITS = 12;
static constexpr uint32_t PWM_DUTY_MAX = (1U << PWM_RESOLUTION_BITS) - 1U;

static const uint8_t DIGITAL_GPIOS[DIGITAL_PIN_COUNT] = {2, 4};
static const uint8_t PWM_GPIOS[PWM_CHANNEL_COUNT] = {13, 14, 15, 16, 17, 18, 19, 21};

static uint32_t gPwmFreq = 5000;
static uint32_t gPwmDuty[PWM_CHANNEL_COUNT] = {2048, 2048, 2048, 2048, 2048, 2048, 2048, 2048};
static uint8_t gDigitalLevel[DIGITAL_PIN_COUNT] = {0, 0};

static void printStatus()
{
  Serial.println("---- status ----");
  for (uint8_t i = 0; i < DIGITAL_PIN_COUNT; ++i) {
    Serial.printf("digital[%u] gpio=%u level=%u\n", i, DIGITAL_GPIOS[i], gDigitalLevel[i]);
  }

  Serial.printf("pwm freq=%lu\n", static_cast<unsigned long>(gPwmFreq));
  for (uint8_t i = 0; i < PWM_CHANNEL_COUNT; ++i) {
    Serial.printf(
      "pwm[%u] gpio=%u duty=%lu\n",
      i,
      PWM_GPIOS[i],
      static_cast<unsigned long>(gPwmDuty[i])
    );
  }
}

static void initDigitalOutputs()
{
  for (uint8_t i = 0; i < DIGITAL_PIN_COUNT; ++i) {
    pinMode(DIGITAL_GPIOS[i], OUTPUT);
    digitalWrite(DIGITAL_GPIOS[i], gDigitalLevel[i]);
  }
}

static void initPwmOutputs()
{
  for (uint8_t i = 0; i < PWM_CHANNEL_COUNT; ++i) {
    ledcSetup(i, gPwmFreq, PWM_RESOLUTION_BITS);
    ledcAttachPin(PWM_GPIOS[i], i);
    ledcWrite(i, gPwmDuty[i]);
  }
}

static void applyPwmChannel(uint8_t channel)
{
  ledcSetup(channel, gPwmFreq, PWM_RESOLUTION_BITS);
  ledcWrite(channel, gPwmDuty[channel]);
}

static void printHelp()
{
  Serial.println("Commands:");
  Serial.println("  dig <index_0_to_1> <0_or_1>");
  Serial.println("  pwm <channel_0_to_7> <duty_0_to_4095> <freq_hz_100_to_40000>");
  Serial.println("  status");
  Serial.println("  help");
}

static bool parseDig(const char *line, uint8_t *index, uint8_t *level)
{
  unsigned long parsedIndex = 0;
  unsigned int parsedLevel = 0;

  if (sscanf(line, "dig %lu %u", &parsedIndex, &parsedLevel) != 2) {
    return false;
  }

  if (parsedIndex >= DIGITAL_PIN_COUNT || (parsedLevel != 0 && parsedLevel != 1)) {
    return false;
  }

  *index = static_cast<uint8_t>(parsedIndex);
  *level = static_cast<uint8_t>(parsedLevel);
  return true;
}

static bool parsePwm(const char *line, uint8_t *channel, uint32_t *duty, uint32_t *freq)
{
  unsigned long parsedChannel = 0;
  unsigned long parsedDuty = 0;
  unsigned long parsedFreq = 0;

  if (sscanf(line, "pwm %lu %lu %lu", &parsedChannel, &parsedDuty, &parsedFreq) != 3) {
    return false;
  }

  if (parsedChannel >= PWM_CHANNEL_COUNT || parsedDuty > PWM_DUTY_MAX || parsedFreq < 100 || parsedFreq > 40000) {
    return false;
  }

  *channel = static_cast<uint8_t>(parsedChannel);
  *duty = static_cast<uint32_t>(parsedDuty);
  *freq = static_cast<uint32_t>(parsedFreq);
  return true;
}

static void processLine(const char *line)
{
  if (strncmp(line, "help", 4) == 0) {
    printHelp();
    return;
  }

  if (strncmp(line, "status", 6) == 0) {
    printStatus();
    return;
  }

  uint8_t digIndex = 0;
  uint8_t digLevel = 0;
  if (parseDig(line, &digIndex, &digLevel)) {
    gDigitalLevel[digIndex] = digLevel;
    digitalWrite(DIGITAL_GPIOS[digIndex], digLevel);
    Serial.printf("Set digital[%u] gpio=%u to %u\n", digIndex, DIGITAL_GPIOS[digIndex], digLevel);
    return;
  }

  uint8_t pwmChannel = 0;
  uint32_t pwmDuty = 0;
  uint32_t pwmFreq = 0;
  if (parsePwm(line, &pwmChannel, &pwmDuty, &pwmFreq)) {
    gPwmFreq = pwmFreq;
    gPwmDuty[pwmChannel] = pwmDuty;
    for (uint8_t ch = 0; ch < PWM_CHANNEL_COUNT; ++ch) {
      ledcSetup(ch, gPwmFreq, PWM_RESOLUTION_BITS);
    }
    applyPwmChannel(pwmChannel);
    Serial.printf(
      "Set pwm[%u] gpio=%u duty=%lu freq=%lu\n",
      pwmChannel,
      PWM_GPIOS[pwmChannel],
      static_cast<unsigned long>(pwmDuty),
      static_cast<unsigned long>(gPwmFreq)
    );
    return;
  }

  Serial.println("Invalid command. Type help.");
}

void setup()
{
  Serial.begin(115200);
  delay(300);

  Serial.println("Starting esp32metstest PlatformIO app: 2 digital + 8 PWM serial controller");
  initDigitalOutputs();
  initPwmOutputs();

  for (uint8_t i = 0; i < DIGITAL_PIN_COUNT; ++i) {
    Serial.printf("Digital pin[%u]=GPIO %u\n", i, DIGITAL_GPIOS[i]);
  }

  for (uint8_t i = 0; i < PWM_CHANNEL_COUNT; ++i) {
    Serial.printf("PWM pin[%u]=GPIO %u\n", i, PWM_GPIOS[i]);
  }

  printHelp();
  printStatus();
}

void loop()
{
  static char line[96];
  static size_t linePos = 0;

  while (Serial.available() > 0) {
    const char ch = static_cast<char>(Serial.read());

    if (ch == '\r') {
      continue;
    }

    if (ch == '\n') {
      line[linePos] = '\0';
      if (linePos > 0) {
        processLine(line);
      }
      linePos = 0;
      continue;
    }

    if (linePos < sizeof(line) - 1U) {
      line[linePos++] = ch;
    }
  }

  delay(10);
}
