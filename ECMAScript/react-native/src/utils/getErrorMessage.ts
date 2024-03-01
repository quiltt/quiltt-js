const getErrorMessage = (responseStatus?: number): string => {
  return responseStatus
    ? `The URL is not routable. Response status: ${responseStatus}`
    : 'An error occurred while checking the connector URL'
}

export { getErrorMessage }
