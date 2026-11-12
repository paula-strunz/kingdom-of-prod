import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const FIT = /fit\.spec\.ts/;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // A full game is 25 beats, and each beat waits for its entrance animation: about 27s on a
  // laptop, and slower on a CI machine. The default of 30s is too tight.
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"] }, testIgnore: FIT },
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: FIT },
    // "The game fits the screen" (spec 9.1): one full game per screen size, with no scrolling.
    // The iPhone and iPad sizes run in WebKit, Safari's engine.
    { name: "iphone-se", use: { ...devices["iPhone SE (3rd gen)"] }, testMatch: FIT },
    { name: "iphone", use: { ...devices["iPhone 15"] }, testMatch: FIT },
    { name: "ipad", use: { ...devices["iPad (gen 7)"] }, testMatch: FIT },
    { name: "ipad-landscape", use: { ...devices["iPad (gen 7) landscape"] }, testMatch: FIT },
    { name: "android", use: { ...devices["Pixel 7"] }, testMatch: FIT },
    { name: "laptop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } }, testMatch: FIT },
    { name: "wide", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } }, testMatch: FIT },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
