// Location utility for GPS detection and distance calculations

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationError {
  message: string
  code?: number
}

/**
 * Get current GPS location using browser Geolocation API
 * @returns Promise with coordinates or error
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        message: 'Geolocation is not supported by your browser',
        code: 0
      } as LocationError)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let message = 'Unable to retrieve your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            message = 'Location request timed out.'
            break
        }
        
        reject({
          message,
          code: error.code
        } as LocationError)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 First latitude
 * @param lon1 First longitude
 * @param lat2 Second latitude
 * @param lon2 Second longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * Get regional language based on coordinates (Indian states)
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Language code (hi, ta, te, etc.)
 */
export const getRegionalLanguage = (latitude: number, longitude: number): string => {
  // Approximate state boundaries for language detection
  // Tamil Nadu
  if (latitude >= 8 && latitude <= 13.5 && longitude >= 76.5 && longitude <= 80.5) {
    return 'ta' // Tamil
  }
  // Karnataka
  if (latitude >= 11.5 && latitude <= 18.5 && longitude >= 74 && longitude <= 78.5) {
    return 'kn' // Kannada
  }
  // Kerala
  if (latitude >= 8 && latitude <= 12.5 && longitude >= 74.5 && longitude <= 77.5) {
    return 'ml' // Malayalam
  }
  // Andhra Pradesh & Telangana
  if (latitude >= 12.5 && latitude <= 19.5 && longitude >= 77 && longitude <= 84.5) {
    return 'te' // Telugu
  }
  // Maharashtra
  if (latitude >= 15.5 && latitude <= 22 && longitude >= 72.5 && longitude <= 80.5) {
    return 'mr' // Marathi
  }
  // West Bengal
  if (latitude >= 21.5 && latitude <= 27.5 && longitude >= 85.5 && longitude <= 89.5) {
    return 'bn' // Bengali
  }
  // Gujarat
  if (latitude >= 20 && latitude <= 24.5 && longitude >= 68.5 && longitude <= 74.5) {
    return 'gu' // Gujarati
  }
  // Punjab
  if (latitude >= 29.5 && latitude <= 32.5 && longitude >= 73.5 && longitude <= 76.5) {
    return 'pa' // Punjabi
  }
  
  // Default to Hindi for North India and other regions
  return 'hi'
}
