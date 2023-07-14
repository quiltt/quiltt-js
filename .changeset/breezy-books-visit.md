---
"@quiltt/react-test-nextjs": minor
"@quiltt/react": minor
"@quiltt/core": minor
---

This introduces a new Javascript API that can be used instead of or with the DOM API, giving exposure to exit events. There are a few ways to use it:

## 1. HTML5

If you're using the HTML interface, and need to upgrade to using some Javascript code, you can; but all event registrations are on a global level. This means that if you have multiple buttons, you will look at the metadata of the response to see which one you're reacting to.

```html
<head>
  <script src="https://cdn.quiltt.io/v1/connector.js"></script>
  <script language="JavaScript">
    Quiltt.onExitSuccess((metadata) =>
      console.log("Global onExitSuccess", metadata.connectionId)
    );
  </script>
</head>
<body>
  <button quiltt-button="<CONNECTOR_ID">Click Here!</button>
</body>
```

## 2. Javascript

Now if you want to do something more complex, and expect to be working with multiple buttons in different ways, then the Javascript SDK may be the way to go. With this, you can control everything in JS.

```html
<head>
  <script src="https://cdn.quiltt.io/v1/connector.js"></script>
  <script language="JavaScript">
    Quiltt.authenticate("<SESSION_TOKEN>");

    const connector = Quiltt.connect("<CONNECTOR_ID>", {
      onExitSuccess: (metadata) => {
        console.log("Connector onExitSuccess", metadata.connectionId),
      });

    connector.open();
  </script>
</head>
```

## 3. React

With these new hooks, the React components now support callbacks.

```tsx
import { QuilttButton } from '@quiltt/react'

export const App = () => {
  const [connectionId, setConnectionId] = useState<string>()
  const handleSuccess = (metadata) => setConnectionId(metadata?.connectionId)

  return (
    <QuilttButton connectorId="<CONNECTOR_ID>" onExitSuccess={handleSuccess}>
      Add
    </QuilttButton>

    <QuilttButton connectorId="<CONNECTOR_ID>" connectionId={connectionId}>
      Repair
    </QuilttButton>
  )
}
```
