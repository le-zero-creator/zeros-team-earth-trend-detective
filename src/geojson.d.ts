declare module '*.geojson' {
  const value: {
    features: {
      properties: import('./lib/types').ZoneProps
      geometry: { coordinates: number[] }
    }[]
  }
  export default value
}
