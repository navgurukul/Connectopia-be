/**
 * The function `responseWrapper` takes in data, a message, and a status, and returns an object containing these values.
 * @param data - The `data` parameter in the `responseWrapper` function is used to pass the actual data that you want to
 * include in the response. This could be any type of data such as an object, array, string, number, etc.
 * @param message - The `message` parameter in the `responseWrapper` function is used to provide a message or description
 * related to the response being generated. It can be used to communicate information about the response data or the status
 * of the operation.
 * @param status - The `status` parameter in the `responseWrapper` function is used to indicate the status of the response,
 * such as success, error, or any other relevant status code. It helps in providing information about the outcome of the
 * operation that was performed.
 * @returns An object is being returned with three properties: `data`, `message`, and `status`.
 */
const responseWrapper = (data, message, status) => {
  return {
    data: data,
    message: message,
    status: status
  }
}

module.exports = responseWrapper;