export const CIUDADES = [
  'La Paz',
  'Cabo San Lucas',
  'San José del Cabo',
  'Los Cabos',
  'Loreto',
  'Ciudad Constitución',
  'La Ventana',
  'Cerritos',
  'Todos Santos',
  'Madrid',
  'Barcelona',
  'Buenos Aires',
  'Toronto',
  'Sydney',
  'Melbourne',
  'Nueva York',
  'Los Angeles',
  'Londres',
  'París',
  'Ámsterdam',
  'Berlín',
  'Estocolmo',
  'Dublín',
  'Ciudad de México',
  'Santiago',
  'San Francisco',
  'Vancouver',
  'Brisbane',
  'Perth',
  'Zúrich',
  'Viena',
  'Praga',
  'Lisboa',
  'Roma',
  'Milán',
  'Valencia'
]

export const filterCiudades = (input) => {
  if (!input) return []
  return CIUDADES.filter(ciudad => 
    ciudad.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 5)
}
