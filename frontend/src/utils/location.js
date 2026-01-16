/**
 * Location utilities for geo-location and language detection
 */

// Regional language mapping based on Indian states
const REGION_LANGUAGE_MAP = {
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

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<{latitude: number, longitude: number, language: string}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Get language based on location
        const language = await detectLanguageFromLocation(latitude, longitude)
        
        resolve({
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          language
        })
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        
        reject(new Error(errorMessage))
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
 * Detect language based on latitude and longitude using reverse geocoding
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>}
 */
export const detectLanguageFromLocation = async (latitude, longitude) => {
  try {
    // Use OpenStreetMap Nominatim for reverse geocoding (free)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Mistribazar/1.0'
        }
      }
    )
    
    if (!response.ok) {
      return 'Hindi' // Default to Hindi
    }
    
    const data = await response.json()
    const state = data.address?.state || ''
    
    // Find matching language for the state
    const language = REGION_LANGUAGE_MAP[state] || 'Hindi'
    
    return language
  } catch (error) {
    console.error('Error detecting language:', error)
    return 'Hindi' // Default to Hindi on error
  }
}

/**
 * Get location display name from coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>}
 */
export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'Mistribazar/1.0'
        }
      }
    )
    
    if (!response.ok) {
      return 'Unknown Location'
    }
    
    const data = await response.json()
    return data.display_name || 'Unknown Location'
  } catch (error) {
    console.error('Error getting location name:', error)
    return 'Unknown Location'
  }
}
