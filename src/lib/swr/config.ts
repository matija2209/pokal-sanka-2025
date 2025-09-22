import { SWRConfiguration } from 'swr'

// SWR fetcher function
export const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  fetcher,
  refreshInterval: 10000, // 10 seconds
  revalidateOnFocus: false, // Don't refetch when window gains focus (TV display)
  revalidateOnReconnect: true, // Refetch when connection is restored
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 2000, // Wait 2 seconds between retries
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors, do retry on network/5xx errors
    return error.status >= 500 || error.status === 0
  }
}