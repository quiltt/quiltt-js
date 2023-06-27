import { useEffect, useId, useMemo, useState } from 'react'

type SharedConfig = {
  connectorId: string
  token?: string
}

type ModalConfig = SharedConfig & {
  button: string
}

type InlineConfig = SharedConfig & {
  container: string
}

export type QuilttConnectorConfig = ModalConfig | InlineConfig

export type UseQuilttConnectorReturn = {
  ready: boolean
}

const QUILTT_CDN_BASE = process.env.QUILTT_CDN_BASE || 'https://cdn.quiltt.io'

export const useQuilttConnector = (options: QuilttConnectorConfig): UseQuilttConnectorReturn => {
  const id = useId() // Generates a unique stable ID between server and client components
  const [ready, setReady] = useState(false)

  const dataset: DOMStringMap = useMemo(() => {
    const { connectorId, token } = options
    const button = (options as ModalConfig)?.button
    const container = (options as InlineConfig)?.container

    return {
      quilttConnectorId: connectorId,
      quilttToken: token,
      quilttButton: button,
      quilttContainer: container,
    }
  }, [options])

  useEffect(() => {
    const { connectorId } = options
    const script = document.createElement('script')

    script.src = `${QUILTT_CDN_BASE}/v1/connector.js?id=${connectorId}`
    script.id = `quiltt-connector-${id}-${connectorId}`
    for (const key in dataset) {
      if (dataset[key]) {
        script.dataset[key] = dataset[key]
      }
    }

    // Append the script to the <body> tag unless it's already injected
    if (!document.getElementById(script.id)) {
      document.body.appendChild(script)
    }

    setReady(true)

    // Remove the script when the component unmounts
    return () => {
      document
        .querySelectorAll(`[data-quiltt-connector-id="${connectorId}"]`)
        .forEach((element) => {
          element.remove()
        })

      if (document.getElementById(script.id)) {
        document.body.removeChild(script)
      }

      setReady(false)
    }
  }, [options, dataset, id])

  return {
    ready,
  }
}
