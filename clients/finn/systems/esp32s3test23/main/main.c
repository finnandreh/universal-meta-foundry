#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"

static const char *TAG = "esp32s3test23";
static const gpio_num_t LED_GPIOS[] = {GPIO_NUM_4, GPIO_NUM_5, GPIO_NUM_6};
static const size_t LED_GPIO_COUNT = sizeof(LED_GPIOS) / sizeof(LED_GPIOS[0]);
static volatile uint32_t g_on_ms = 500;
static volatile uint32_t g_off_ms = 500;

static void set_all_leds(int level)
{
    for (size_t i = 0; i < LED_GPIO_COUNT; ++i) {
        gpio_set_level(LED_GPIOS[i], level);
    }
}

static void log_led_pin_set(void)
{
    ESP_LOGI(
        TAG,
        "Active LED pins: [%d, %d, %d]",
        LED_GPIOS[0],
        LED_GPIOS[1],
        LED_GPIOS[2]
    );
}

static bool parse_timing_line(const char *line, uint32_t *on_ms, uint32_t *off_ms)
{
    unsigned long parsed_on = 0;
    unsigned long parsed_off = 0;

    if (sscanf(line, "timing %lu %lu", &parsed_on, &parsed_off) != 2 &&
        sscanf(line, "%lu %lu", &parsed_on, &parsed_off) != 2) {
        return false;
    }

    if (parsed_on < 50 || parsed_on > 10000 || parsed_off < 50 || parsed_off > 10000) {
        return false;
    }

    *on_ms = (uint32_t)parsed_on;
    *off_ms = (uint32_t)parsed_off;
    return true;
}

static void serial_config_task(void *arg)
{
    char line[64];

    ESP_LOGI(TAG, "Serial timing config ready");
    ESP_LOGI(TAG, "Type: timing <on_ms> <off_ms>  (range 50..10000)");
    ESP_LOGI(TAG, "Example: timing 200 800");

    while (1) {
        if (fgets(line, sizeof(line), stdin) == NULL) {
            vTaskDelay(pdMS_TO_TICKS(20));
            continue;
        }

        if (strncmp(line, "help", 4) == 0) {
            ESP_LOGI(TAG, "Usage: timing <on_ms> <off_ms>  (range 50..10000)");
            continue;
        }

        uint32_t new_on_ms = 0;
        uint32_t new_off_ms = 0;
        if (!parse_timing_line(line, &new_on_ms, &new_off_ms)) {
            ESP_LOGW(TAG, "Invalid command. Use: timing <on_ms> <off_ms>");
            continue;
        }

        g_on_ms = new_on_ms;
        g_off_ms = new_off_ms;
        ESP_LOGI(TAG, "Updated blink timing: on=%lu ms off=%lu ms", (unsigned long)g_on_ms, (unsigned long)g_off_ms);
    }
}

static void blink_task(void *arg)
{
    for (size_t i = 0; i < LED_GPIO_COUNT; ++i) {
        gpio_reset_pin(LED_GPIOS[i]);
        gpio_set_direction(LED_GPIOS[i], GPIO_MODE_OUTPUT);
    }

    log_led_pin_set();

    while (1) {
        const uint32_t on_ms = g_on_ms;
        const uint32_t off_ms = g_off_ms;

        set_all_leds(1);
        ESP_LOGI(TAG, "LEDs ON | on=%lu ms off=%lu ms", (unsigned long)on_ms, (unsigned long)off_ms);
        vTaskDelay(pdMS_TO_TICKS(on_ms));

        set_all_leds(0);
        ESP_LOGI(TAG, "LEDs OFF | on=%lu ms off=%lu ms", (unsigned long)on_ms, (unsigned long)off_ms);
        vTaskDelay(pdMS_TO_TICKS(off_ms));
    }
}

void app_main(void)
{
    ESP_LOGI(TAG, "Starting LED blink app");

    xTaskCreate(
        blink_task,
        "blink_task",
        4096,
        NULL,
        5,
        NULL
    );

    xTaskCreate(
        serial_config_task,
        "serial_config_task",
        4096,
        NULL,
        4,
        NULL
    );
}
