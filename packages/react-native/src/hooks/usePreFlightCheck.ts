import { type PreFlightCheck, checkConnectorUrl } from '@/utils/url-helpers'
import { useEffect, useState } from 'react'

export const usePreFlightCheck = (connectorUrl: string) => {
  const [preFlightCheck, setPreFlightCheck] = useState<PreFlightCheck>({ checked: false })

  useEffect(() => {
    if (preFlightCheck.checked) return

    const fetchDataAndSetState = async () => {
      const connectorUrlStatus = await checkConnectorUrl(connectorUrl)
      setPreFlightCheck(connectorUrlStatus)
    }

    fetchDataAndSetState()
  }, [connectorUrl, preFlightCheck])

  return preFlightCheck
}
