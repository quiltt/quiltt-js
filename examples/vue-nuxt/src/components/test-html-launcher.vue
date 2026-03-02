<script setup lang="ts">

import { useQuilttConnector } from '@quiltt/vue'

const config = useRuntimeConfig()
const connectorId = config.public.quilttConnectorId

useQuilttConnector()
</script>

<template>
  <button type="button" :quiltt-button="connectorId" class="launcher-button">
    Launch with HTML
  </button>
</template>
