// Servidor Express para exponer los MCPs como endpoints HTTP
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Configuración del entorno
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint para probar la conexión
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'MCP Travel Assistant API is running',
    endpoints: ['/wiki', '/clima', '/vuelos', '/hospedaje', '/consejos']
  });
});

// Endpoint para listar todas las herramientas disponibles
app.get('/tools', (req, res) => {
  const tools = [
    {
      name: "consultarWikipedia",
      description: "Consulta información sobre un destino en Wikipedia",
      parameters: {
        type: "object",
        properties: {
          ciudad: {
            type: "string",
            description: "Nombre de la ciudad o destino a consultar"
          }
        },
        required: ["ciudad"]
      }
    },
    {
      name: "consultarClima",
      description: "Consulta el clima actual en una ciudad específica",
      parameters: {
        type: "object",
        properties: {
          ciudad: {
            type: "string",
            description: "Nombre de la ciudad para consultar el clima"
          }
        },
        required: ["ciudad"]
      }
    },
    {
      name: "buscarVuelos",
      description: "Busca vuelos disponibles entre un origen y destino",
      parameters: {
        type: "object",
        properties: {
          origen: {
            type: "string",
            description: "Ciudad de origen"
          },
          destino: {
            type: "string",
            description: "Ciudad de destino"
          },
          fecha: {
            type: "string",
            description: "Fecha del vuelo en formato YYYY-MM-DD"
          }
        },
        required: ["origen", "destino", "fecha"]
      }
    },
    {
      name: "buscarHospedaje",
      description: "Busca opciones de hospedaje en un destino específico",
      parameters: {
        type: "object",
        properties: {
          ciudad: {
            type: "string",
            description: "Ciudad donde se busca hospedaje"
          },
          fechaEntrada: {
            type: "string",
            description: "Fecha de entrada en formato YYYY-MM-DD"
          },
          fechaSalida: {
            type: "string",
            description: "Fecha de salida en formato YYYY-MM-DD"
          }
        },
        required: ["ciudad"]
      }
    },
    {
      name: "obtenerRecomendaciones",
      description: "Obtiene recomendaciones personalizadas para un viaje",
      parameters: {
        type: "object",
        properties: {
          destino: {
            type: "string",
            description: "Destino del viaje"
          },
          tipoViaje: {
            type: "string",
            description: "Tipo de viaje (negocio, vacaciones, aventura, cultural, etc.)"
          },
          presupuesto: {
            type: "string",
            description: "Presupuesto para el viaje (bajo, medio, alto)"
          }
        },
        required: ["destino"]
      }
    }
  ];

  res.json({ tools });
});

// 1. Endpoint para consultar Wikipedia
app.get('/wiki', async (req, res) => {
  try {
    const { ciudad } = req.query;
    
    if (!ciudad) {
      return res.status(400).json({ error: 'Se requiere el parámetro ciudad' });
    }
    
    const response = await axios.get(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ciudad)}`);
    
    return res.json({
      titulo: response.data.title,
      extracto: response.data.extract,
      url: response.data.content_urls?.desktop?.page || '',
      imagen: response.data.thumbnail?.source || null
    });
  } catch (error) {
    console.error('Error consultando Wikipedia:', error.message);
    return res.status(500).json({ 
      error: 'Error al consultar Wikipedia',
      mensaje: error.message 
    });
  }
});

// 2. Endpoint para consultar el clima
app.get('/clima', async (req, res) => {
  try {
    const { ciudad } = req.query;
    
    if (!ciudad) {
      return res.status(400).json({ error: 'Se requiere el parámetro ciudad' });
    }
    
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key de OpenWeather no configurada' });
    }
    
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&units=metric&lang=es&appid=${API_KEY}`);
    
    return res.json({
      ciudad: response.data.name,
      pais: response.data.sys.country,
      temperatura: response.data.main.temp,
      sensacionTermica: response.data.main.feels_like,
      humedad: response.data.main.humidity,
      condicion: response.data.weather[0].description,
      icono: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
    });
  } catch (error) {
    console.error('Error consultando clima:', error.message);
    return res.status(500).json({ 
      error: 'Error al consultar el clima',
      mensaje: error.message 
    });
  }
});

// 3. Endpoint para buscar vuelos
app.post('/vuelos', async (req, res) => {
  try {
    const { origen, destino, fecha } = req.body;
    
    if (!origen || !destino || !fecha) {
      return res.status(400).json({ error: 'Se requieren los parámetros origen, destino y fecha' });
    }
    
    // En un caso real, aquí se conectaría con una API como Amadeus o Skyscanner
    // Como ejemplo, usaremos datos simulados
    
    // Generamos algunos vuelos simulados
    const vuelos = [
      {
        aerolinea: 'Avianca',
        numeroVuelo: 'AV' + Math.floor(Math.random() * 1000),
        origen: origen,
        destino: destino,
        fecha: fecha,
        horaSalida: '08:30',
        horaLlegada: '10:45',
        duracion: '2h 15m',
        precio: Math.floor(Math.random() * 300) + 200,
        moneda: 'USD',
        escalas: 0
      },
      {
        aerolinea: 'LATAM',
        numeroVuelo: 'LA' + Math.floor(Math.random() * 1000),
        origen: origen,
        destino: destino,
        fecha: fecha,
        horaSalida: '12:15',
        horaLlegada: '14:50',
        duracion: '2h 35m',
        precio: Math.floor(Math.random() * 300) + 180,
        moneda: 'USD',
        escalas: 1
      },
      {
        aerolinea: 'Copa Airlines',
        numeroVuelo: 'CM' + Math.floor(Math.random() * 1000),
        origen: origen,
        destino: destino,
        fecha: fecha,
        horaSalida: '16:40',
        horaLlegada: '19:10',
        duracion: '2h 30m',
        precio: Math.floor(Math.random() * 300) + 220,
        moneda: 'USD',
        escalas: 0
      }
    ];
    
    return res.json({ vuelos });
  } catch (error) {
    console.error('Error buscando vuelos:', error.message);
    return res.status(500).json({ 
      error: 'Error al buscar vuelos',
      mensaje: error.message 
    });
  }
});

// 4. Endpoint para buscar hospedaje
app.get('/hospedaje', async (req, res) => {
  try {
    const { ciudad, fechaEntrada, fechaSalida } = req.query;
    
    if (!ciudad) {
      return res.status(400).json({ error: 'Se requiere el parámetro ciudad' });
    }
    
    // En un caso real, aquí se utilizaría una API como OpenBnB MCP server (@openbnb/mcp-server-airbnb)
    // Como ejemplo, usaremos datos simulados
    
    const hospedajes = [
      {
        nombre: 'Apartamento Céntrico',
        tipo: 'Apartamento entero',
        ubicacion: `Centro de ${ciudad}`,
        precio: Math.floor(Math.random() * 100) + 50,
        moneda: 'USD',
        porNoche: true,
        habitaciones: 2,
        banos: 1,
        capacidad: 4,
        calificacion: 4.8,
        opiniones: 123,
        imagen: 'https://via.placeholder.com/300x200?text=Apartamento'
      },
      {
        nombre: 'Hotel Boutique',
        tipo: 'Habitación de hotel',
        ubicacion: `Zona turística de ${ciudad}`,
        precio: Math.floor(Math.random() * 150) + 80,
        moneda: 'USD',
        porNoche: true,
        habitaciones: 1,
        banos: 1,
        capacidad: 2,
        calificacion: 4.6,
        opiniones: 87,
        imagen: 'https://via.placeholder.com/300x200?text=Hotel'
      },
      {
        nombre: 'Casa Familiar',
        tipo: 'Casa entera',
        ubicacion: `Zona residencial de ${ciudad}`,
        precio: Math.floor(Math.random() * 200) + 120,
        moneda: 'USD',
        porNoche: true,
        habitaciones: 3,
        banos: 2,
        capacidad: 6,
        calificacion: 4.9,
        opiniones: 45,
        imagen: 'https://via.placeholder.com/300x200?text=Casa'
      }
    ];
    
    return res.json({ hospedajes });
  } catch (error) {
    console.error('Error buscando hospedaje:', error.message);
    return res.status(500).json({ 
      error: 'Error al buscar hospedaje',
      mensaje: error.message 
    });
  }
});

// 5. Endpoint para recomendaciones de viaje
app.post('/consejos', async (req, res) => {
  try {
    const { destino, tipoViaje = 'vacaciones', presupuesto = 'medio' } = req.body;
    
    if (!destino) {
      return res.status(400).json({ error: 'Se requiere el parámetro destino' });
    }
    
    // En un caso real, aquí se utilizaría la API de OpenAI u otro sistema de recomendación
    // Como ejemplo, usaremos recomendaciones predefinidas según el tipo de viaje
    
    let recomendaciones = [];
    
    if (tipoViaje.toLowerCase().includes('negocio')) {
      recomendaciones = [
        `Hoteles de negocios cercanos al centro financiero de ${destino}`,
        `Restaurantes con ambiente tranquilo para reuniones en ${destino}`,
        `Servicios de taxi o transporte ejecutivo en ${destino}`,
        `Espacios de coworking populares en ${destino}`,
        `Conexiones Wi-Fi confiables en ${destino}`
      ];
    } else if (tipoViaje.toLowerCase().includes('aventura')) {
      recomendaciones = [
        `Rutas de senderismo populares cerca de ${destino}`,
        `Empresas de deportes extremos en ${destino}`,
        `Parques naturales que debes visitar en ${destino}`,
        `Equipamiento necesario para actividades al aire libre en ${destino}`,
        `Hospedajes con acceso rápido a actividades de aventura en ${destino}`
      ];
    } else if (tipoViaje.toLowerCase().includes('cultural')) {
      recomendaciones = [
        `Museos imperdibles en ${destino}`,
        `Sitios históricos para visitar en ${destino}`,
        `Eventos culturales programados en ${destino}`,
        `Tours guiados por el patrimonio de ${destino}`,
        `Gastronomía típica que debes probar en ${destino}`
      ];
    } else {
      // Vacaciones generales
      recomendaciones = [
        `Atracciones turísticas principales de ${destino}`,
        `Mejores playas o parques en ${destino}`,
        `Opciones de entretenimiento familiar en ${destino}`,
        `Restaurantes mejor valorados de ${destino}`,
        `Consejos de seguridad para turistas en ${destino}`
      ];
    }
    
    // Ajuste por presupuesto
    let consejoPresupuesto = '';
    if (presupuesto.toLowerCase() === 'bajo') {
      consejoPresupuesto = `Para ahorrar dinero en ${destino}, considera usar transporte público, comer en mercados locales y buscar actividades gratuitas como parques y museos con entrada libre.`;
    } else if (presupuesto.toLowerCase() === 'alto') {
      consejoPresupuesto = `Con un presupuesto alto en ${destino}, puedes disfrutar de hoteles boutique de lujo, restaurantes exclusivos y excursiones privadas personalizadas.`;
    } else {
      consejoPresupuesto = `Con un presupuesto medio en ${destino}, equilibra experiencias premium con opciones más económicas. Considera un hotel de 3-4 estrellas y mezcla restaurantes de diferentes categorías.`;
    }
    
    return res.json({ 
      destino,
      tipoViaje,
      presupuesto,
      recomendaciones,
      consejoPresupuesto
    });
  } catch (error) {
    console.error('Error generando recomendaciones:', error.message);
    return res.status(500).json({ 
      error: 'Error al generar recomendaciones',
      mensaje: error.message 
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor MCP en funcionamiento en http://localhost:${PORT}`);
});
