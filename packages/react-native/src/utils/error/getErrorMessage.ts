export const getErrorMessage = (responseStatus?: number, error?: Error): string => {
  if (error)
    return `An error occurred while checking the Connector URL: ${error?.name} \n${error?.message}`
  return responseStatus
    ? `An error occurred loading the Connector. Response status: ${responseStatus}`
    : 'An error occurred while checking the Connector URL'
}
