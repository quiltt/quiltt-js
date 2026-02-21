import { useState } from 'react'

import { QuilttButton, QuilttConnector, QuilttProvider } from '@quiltt/capacitor/react'

const defaultToken = import.meta.env.VITE_QUILTT_AUTH_TOKEN ?? 'test-auth-token'
const defaultConnectorId = import.meta.env.VITE_QUILTT_CONNECTOR_ID ?? 'connector'
const defaultAppLauncherUri = import.meta.env.VITE_APP_LAUNCHER_URL ?? 'myapp://oauth'

export const App = () => {
  const [events, setEvents] = useState<string[]>([])

  const addEvent = (message: string) => {
    setEvents((prev) => [message, ...prev].slice(0, 8))
  }

  return (
    <QuilttProvider token={defaultToken}>
      <main className="app-shell">
        <header className="app-header">
          <h1>Quiltt Capacitor React Example</h1>
          <p>Connector ID: {defaultConnectorId}</p>
        </header>

        <section className="app-content">
          <div className="panel">
            <h2>Modal Connector</h2>
            <QuilttButton
              connectorId={defaultConnectorId}
              appLauncherUrl={defaultAppLauncherUri}
              onExitSuccess={(metadata) =>
                addEvent(`ExitSuccess: ${metadata.connectionId ?? 'n/a'}`)
              }
              onExitAbort={() => addEvent('ExitAbort')}
              onExitError={() => addEvent('ExitError')}
              className="launch-button"
            >
              Connect Account
            </QuilttButton>
          </div>

          <div className="panel connector-panel">
            <h2>Inline Connector</h2>
            <QuilttConnector
              connectorId={defaultConnectorId}
              appLauncherUrl={defaultAppLauncherUri}
              onLoad={() => addEvent('Load')}
              onExitSuccess={(metadata) =>
                addEvent(`Inline ExitSuccess: ${metadata.connectionId ?? 'n/a'}`)
              }
              onExitAbort={() => addEvent('Inline ExitAbort')}
              onExitError={() => addEvent('Inline ExitError')}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div className="panel">
            <h2>Recent Events</h2>
            <ul className="events-list">
              {events.length === 0 ? (
                <li>No events yet.</li>
              ) : (
                events.map((event) => <li key={event}>{event}</li>)
              )}
            </ul>
          </div>
        </section>
      </main>
    </QuilttProvider>
  )
}
