# esp32s3test23

Generated project for client `finn` under `clients/finn/systems/esp32s3test23`.

## Scope

- In scope: this project folder only
- Out of scope: Foundry core files

## What this starter includes

- ESP-IDF C project scaffold for ESP32-S3
- Blink control on three GPIO pins (GPIO 4, 5, 6)
- Build entry files and default sdkconfig values

## Behavior

- Initializes GPIO 4, GPIO 5, and GPIO 6 as outputs
- Toggles LED ON/OFF with configurable on/off timing
- Default timing is 500 ms ON / 500 ms OFF
- Reads timing commands from serial monitor at runtime

## Build (ESP-IDF)

From this project folder:

1. `idf.py set-target esp32s3`
2. `idf.py build`
3. `idf.py flash monitor`

## Notes

- If your board LEDs are on different GPIOs, update `LED_GPIOS[]` in `main/main.c`.
- In monitor, set timing with: `timing <on_ms> <off_ms>`
- Example: `timing 200 800`
- Valid range for each value: `50..10000` ms

## Progress (Start Cycle)

Completed from todo list:

1. Refactored single-pin output to three-pin output (`GPIO 4, 5, 6`)
2. Added multi-pin output initialization loop
3. Updated blink logic to toggle all configured pins together
4. Kept serial command format unchanged (`timing <on_ms> <off_ms>`)
5. Added logs showing active pins and ON/OFF cycles
