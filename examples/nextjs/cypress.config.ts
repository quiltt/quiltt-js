import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  viewportWidth: 1280,
  viewportHeight: 720,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
