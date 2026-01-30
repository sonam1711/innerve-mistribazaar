/**
 * Location utilities for geo-location and language detection
 */

// Regional language mapping based on Indian states
const REGION_LANGUAGE_MAP: Record<string, string> = {
  // North India
  'Delhi': 'Hindi',
  'Haryana': 'Hindi',
  'Punjab': 'Punjabi',
  'Uttar Pradesh': 'Hindi',
  'Uttarakhand': 'Hindi',
  'Rajasthan': 'Hindi',
  'Himachal Pradesh': 'Hindi',
  'Jammu and Kashmir': 'Urdu',
  
  // South India
  'Tamil Nadu': 'Tamil',
  'Karnataka': 'Kannada',
  'Kerala': 'Malayalam',
  'Andhra Pradesh': 'Telugu',
  'Telangana': 'Telugu',
  'Puducherry': 'Tamil',
  
  // East India
  'West Bengal': 'Bengali',
  'Odisha': 'Odia',
  'Bihar': 'Hindi',
  'Jharkhand': 'Hindi',
  'Assam': 'Assamese',
  
  // West India
  'Maharashtra': 'Marathi',
  'Gujarat': 'Gujarati',
  'Goa': 'Konkani',
  
  // Central India
  'Madhya Pradesh': 'Hindi',
  'Chhattisgarh': 'Hindi',
}

interface LocationData {
  latitude: number
  longitude: number
  language: string
}

/**
 * Get user's current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Round to 6 decimal places to match backend DecimalField(max_digits=9, decimal_places=6)
        // Format: XXX.XXXXXX (max 9 digits total)
        const latitude = Math.round(position.coords.latitude * 1000000) / 1000000
        const longitude = Math.round(position.coords.longitude * 1000000) / 1000000
        
        // Get language based on location
        const language = await detectLanguageFromLocation(latitude, longitude)
        
        resolve({
          latitude,
          longitude,
          language,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Detect language from GPS coordinates using reverse geocoding
 */
export const detectLanguageFromLocation = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Use OpenStreetMap Nominatim for reverse geocoding (free)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    )
    
    const data = await response.json()
    const state = data.address?.state
    
    // Map state to language
    if (state && REGION_LANGUAGE_MAP[state]) {
      return REGION_LANGUAGE_MAP[state]
    }
    
    // Default to Hindi if state not found
    return 'Hindi'
  } catch (error) {
    console.error('Error detecting language:', error)
    return 'Hindi' // Default fallback
  }
}

/**
 * Format address from coordinates
 */
export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    )
    
    const data = await response.json()
    return data.display_name || 'Address not found'
  } catch (error) {
    console.error('Error getting address:', error)
    return 'Address not available'
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal
}

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}
