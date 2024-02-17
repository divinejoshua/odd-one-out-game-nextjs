// Check if user has network connection
export function isNetworkAvailable(): boolean {
      return navigator.onLine ? true : false;
}

export function isValidMessageText(value: string): boolean{
    // Check for whiteSpace
    if (!value.replace(/\s/g, '').length) {
        return false;
    }
    return true
}