export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const earthRadiusMiles = 3959 // Radius of the Earth in miles

  const lat1Rad = (Math.PI * lat1) / 180
  const lon1Rad = (Math.PI * lon1) / 180
  const lat2Rad = (Math.PI * lat2) / 180
  const lon2Rad = (Math.PI * lon2) / 180

  const dLat = lat2Rad - lat1Rad
  const dLon = lon2Rad - lon1Rad

  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = earthRadiusMiles * c // Distance in miles
  return distance * 5280 // return distance in feet
}
