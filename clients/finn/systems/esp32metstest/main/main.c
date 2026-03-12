#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_log.h"

static const char *TAG = "esp32metstest";

#define DIGITAL_PIN_COUNT 2U
#define PWM_CHANNEL_COUNT 8U

static const gpio_num_t DIGITAL_GPIOS[] = {GPIO_NUM_2, GPIO_NUM_4};
static const size_t DIGITAL_GPIO_COUNT = sizeof(DIGITAL_GPIOS) / sizeof(DIGITAL_GPIOS[0]);

static const gpio_num_t PWM_GPIOS[] = {
    GPIO_NUM_13,
    GPIO_NUM_14,
    GPIO_NUM_15,
    GPIO_NUM_16,
    GPIO_NUM_17,
    GPIO_NUM_18,
    GPIO_NUM_19,
    GPIO_NUM_21
};
static const size_t PWM_GPIO_COUNT = sizeof(PWM_GPIOS) / sizeof(PWM_GPIOS[0]);

static const ledc_mode_t PWM_MODE = LEDC_LOW_SPEED_MODE;
static const ledc_timer_t PWM_TIMER = LEDC_TIMER_0;
static const ledc_timer_bit_t PWM_DUTY_RES = LEDC_TIMER_12_BIT;
static const uint32_t PWM_DUTY_MAX = (1U << 12) - 1U;

static volatile uint32_t g_pwm_freq = 5000;
static volatile uint32_t g_pwm_duty[PWM_CHANNEL_COUNT] = {2048, 2048, 2048, 2048, 2048, 2048, 2048, 2048};
static volatile int g_digital_level[DIGITAL_PIN_COUNT] = {0, 0};

static void init_digital_outputs(void)
{
    for (size_t i = 0; i < DIGITAL_GPIO_COUNT; ++i) {
        gpio_reset_pin(DIGITAL_GPIOS[i]);
        gpio_set_direction(DIGITAL_GPIOS[i], GPIO_MODE_OUTPUT);
        gpio_set_level(DIGITAL_GPIOS[i], g_digital_level[i]);
    }
}

static bool init_pwm_outputs(void)
{
    ledc_timer_config_t timer_cfg = {
        .speed_mode = PWM_MODE,
        .timer_num = PWM_TIMER,
        .duty_resolution = PWM_DUTY_RES,
        .freq_hz = g_pwm_freq,
        .clk_cfg = LEDC_AUTO_CLK
    };

    if (ledc_timer_config(&timer_cfg) != ESP_OK) {
        ESP_LOGE(TAG, "Failed to configure LEDC timer");
        return false;
    }

    for (size_t i = 0; i < PWM_GPIO_COUNT; ++i) {
        ledc_channel_config_t channel_cfg = {
            .gpio_num = PWM_GPIOS[i],
            .speed_mode = PWM_MODE,
            .channel = (ledc_channel_t)i,
            .intr_type = LEDC_INTR_DISABLE,
            .timer_sel = PWM_TIMER,
            .duty = g_pwm_duty[i],
            .hpoint = 0
        };

        if (ledc_channel_config(&channel_cfg) != ESP_OK) {
            ESP_LOGE(TAG, "Failed to configure PWM channel %u", (unsigned)i);
            return false;
        }
    }

    return true;
}

static void apply_pwm_channel(size_t channel_index)
{
    ledc_set_duty(PWM_MODE, (ledc_channel_t)channel_index, g_pwm_duty[channel_index]);
    ledc_update_duty(PWM_MODE, (ledc_channel_t)channel_index);
}

static void print_status(void)
{
    ESP_LOGI(TAG, "---- status ----");

    for (size_t i = 0; i < DIGITAL_GPIO_COUNT; ++i) {
        ESP_LOGI(TAG, "digital[%u] gpio=%d level=%d", (unsigned)i, DIGITAL_GPIOS[i], g_digital_level[i]);
    }

    ESP_LOGI(TAG, "pwm freq=%lu", (unsigned long)g_pwm_freq);
    for (size_t i = 0; i < PWM_GPIO_COUNT; ++i) {
        ESP_LOGI(
            TAG,
            "pwm[%u] gpio=%d duty=%lu",
            (unsigned)i,
            PWM_GPIOS[i],
            (unsigned long)g_pwm_duty[i]
        );
    }
}

static bool parse_digital_command(const char *line, size_t *index, int *level)
{
    unsigned long parsed_index = 0;
    int parsed_level = 0;

    if (sscanf(line, "dig %lu %d", &parsed_index, &parsed_level) != 2) {
        return false;
    }

    if (parsed_index >= DIGITAL_GPIO_COUNT || (parsed_level != 0 && parsed_level != 1)) {
        return false;
    }

    *index = (size_t)parsed_index;
    *level = parsed_level;
    return true;
}

static bool parse_pwm_command(const char *line, size_t *channel, uint32_t *duty, uint32_t *freq)
{
    unsigned long parsed_channel = 0;
    unsigned long parsed_duty = 0;
    unsigned long parsed_freq = 0;

    if (sscanf(line, "pwm %lu %lu %lu", &parsed_channel, &parsed_duty, &parsed_freq) != 3) {
        return false;
    }

    if (
        parsed_channel >= PWM_GPIO_COUNT ||
        parsed_duty > PWM_DUTY_MAX ||
        parsed_freq < 100 ||
        parsed_freq > 40000
    ) {
        return false;
    }

    *channel = (size_t)parsed_channel;
    *duty = (uint32_t)parsed_duty;
    *freq = (uint32_t)parsed_freq;
    return true;
}

static void serial_task(void *arg)
{
    char line[96];

    ESP_LOGI(TAG, "Serial control ready");
    ESP_LOGI(TAG, "Commands:");
    ESP_LOGI(TAG, "  dig <index_0_to_1> <0_or_1>");
    ESP_LOGI(TAG, "  pwm <channel_0_to_7> <duty_0_to_4095> <freq_hz_100_to_40000>");
    ESP_LOGI(TAG, "  status");
    ESP_LOGI(TAG, "  help");

    while (1) {
        if (fgets(line, sizeof(line), stdin) == NULL) {
            vTaskDelay(pdMS_TO_TICKS(20));
            continue;
        }

        if (strncmp(line, "help", 4) == 0) {
            ESP_LOGI(TAG, "Usage: dig <index_0_to_1> <0_or_1>");
            ESP_LOGI(TAG, "Usage: pwm <channel_0_to_7> <duty_0_to_4095> <freq_hz_100_to_40000>");
            ESP_LOGI(TAG, "Usage: status");
            continue;
        }

        if (strncmp(line, "status", 6) == 0) {
            print_status();
            continue;
        }

        size_t dig_index = 0;
        int dig_level = 0;
        if (parse_digital_command(line, &dig_index, &dig_level)) {
            g_digital_level[dig_index] = dig_level;
            gpio_set_level(DIGITAL_GPIOS[dig_index], dig_level);
            ESP_LOGI(TAG, "Set digital[%u] gpio=%d to %d", (unsigned)dig_index, DIGITAL_GPIOS[dig_index], dig_level);
            continue;
        }

        size_t pwm_channel = 0;
        uint32_t pwm_duty = 0;
        uint32_t pwm_freq = 0;
        if (parse_pwm_command(line, &pwm_channel, &pwm_duty, &pwm_freq)) {
            g_pwm_freq = pwm_freq;
            ledc_set_freq(PWM_MODE, PWM_TIMER, g_pwm_freq);
            g_pwm_duty[pwm_channel] = pwm_duty;
            apply_pwm_channel(pwm_channel);
            ESP_LOGI(
                TAG,
                "Set pwm[%u] gpio=%d duty=%lu freq=%lu",
                (unsigned)pwm_channel,
                PWM_GPIOS[pwm_channel],
                (unsigned long)pwm_duty,
                (unsigned long)g_pwm_freq
            );
            continue;
        }

        ESP_LOGW(TAG, "Invalid command. Type help.");
    }
}

void app_main(void)
{
    ESP_LOGI(TAG, "Starting esp32metstest: 2 digital + 8 PWM serial controller");

    init_digital_outputs();
    if (!init_pwm_outputs()) {
        ESP_LOGE(TAG, "PWM initialization failed");
    }

    for (size_t i = 0; i < DIGITAL_GPIO_COUNT; ++i) {
        ESP_LOGI(TAG, "Digital pin[%u]=GPIO %d", (unsigned)i, DIGITAL_GPIOS[i]);
    }

    for (size_t i = 0; i < PWM_GPIO_COUNT; ++i) {
        ESP_LOGI(TAG, "PWM pin[%u]=GPIO %d", (unsigned)i, PWM_GPIOS[i]);
    }

    print_status();

    xTaskCreate(serial_task, "serial_task", 4096, NULL, 5, NULL);
}
