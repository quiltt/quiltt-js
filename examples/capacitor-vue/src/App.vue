<script setup lang="ts">
import { ref } from 'vue'

import { QuilttButton, QuilttConnector } from '@quiltt/capacitor/vue'

const connectorId = import.meta.env.VITE_QUILTT_CONNECTOR_ID ?? 'connector'
const appLauncherUrl = import.meta.env.VITE_APP_LAUNCHER_URL ?? 'myapp://oauth'

const events = ref<string[]>([])

const addEvent = (message: string) => {
  events.value = [message, ...events.value].slice(0, 8)
}
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <h1>Quiltt Capacitor Vue Example</h1>
      <p>Connector ID: {{ connectorId }}</p>
    </header>

    <section class="app-content">
      <div class="panel">
        <h2>Modal Connector</h2>
        <QuilttButton
          :connector-id="connectorId"
          :app-launcher-uri="appLauncherUrl"
          class="launch-button"
          @exit-success="(metadata: any) => addEvent(`ExitSuccess: ${metadata.connectionId ?? 'n/a'}`)"
          @exit-abort="() => addEvent('ExitAbort')"
          @exit-error="() => addEvent('ExitError')"
        >
          Connect Account
        </QuilttButton>
      </div>

      <div class="panel connector-panel">
        <h2>Inline Connector</h2>
        <QuilttConnector
          :connector-id="connectorId"
          :app-launcher-uri="appLauncherUrl"
          style="width: 100%; height: 100%"
          @load="() => addEvent('Load')"
          @exit-success="(metadata: any) => addEvent(`Inline ExitSuccess: ${metadata.connectionId ?? 'n/a'}`)"
          @exit-abort="() => addEvent('Inline ExitAbort')"
          @exit-error="() => addEvent('Inline ExitError')"
        />
      </div>

      <div class="panel">
        <h2>Recent Events</h2>
        <ul class="events-list">
          <li v-if="events.length === 0">No events yet.</li>
          <li v-for="event in events" :key="event">{{ event }}</li>
        </ul>
      </div>
    </section>
  </main>
</template>
