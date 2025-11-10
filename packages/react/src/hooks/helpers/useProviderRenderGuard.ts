let isRenderingProvider = false

export const markProviderRender = (start: boolean): void => {
  isRenderingProvider = start
}

export const useProviderRenderGuard = (componentName: string): void => {
  if (isRenderingProvider) {
    console.error(
      `⚠️ ${componentName} should not be rendered inside the *same component* that renders QuilttProvider. ` +
        `Move it into a child component instead.`
    )
  }
}
