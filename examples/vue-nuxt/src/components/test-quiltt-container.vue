<script setup lang="ts">

import { QuilttContainer } from '@quiltt/vue'

const config = useRuntimeConfig()
const connectorId = config.public.quilttConnectorId
</script>

<template>
  <QuilttContainer :connector-id="connectorId" as="div" class="container-frame" />
</template>
