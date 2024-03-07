const getErrorMessage = (responseStatus?: number, error?: Error): string => {
  if (error)
    return `An error occurred while checking the connector URL: ${error?.name} \n${error?.message}`
  return responseStatus
    ? `The URL is not routable. Response status: ${responseStatus}`
    : 'An error occurred while checking the connector URL'
}

export { getErrorMessage }
