// Clave de API de OpenCage (geolocalización)
const apiKeyGeocoding = "0ba86b40e3424cc0a9aa6641e1b3ff68";

// Elementos del DOM
const inputCiudad = document.getElementById("cityInput");
const botonBuscar = document.getElementById("searchBtn");
const nombreCiudad = document.getElementById("cityName");
const fechaActual = document.getElementById("currentDate");
const iconoClima = document.getElementById("weatherIcon");
const temperatura = document.getElementById("temperature");
const sensacion = document.getElementById("feelsLike");
const humedad = document.getElementById("humidity");
const viento = document.getElementById("wind");
const precipitacion = document.getElementById("precipitation");
const contenedorDias = document.getElementById("forecastDays");
const contenedorHoras = document.getElementById("forecastHours");

// Evento de búsqueda
botonBuscar.addEventListener("click", () => {
  const ciudad = inputCiudad.value.trim();
  if (ciudad === "") return;

  obtenerCoordenadas(ciudad);
});

// Obtener coordenadas desde OpenCage
function obtenerCoordenadas(ciudad) {
  const urlGeo = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(ciudad)}&key=${apiKeyGeocoding}&language=es`;

  fetch(urlGeo)
    .then(res => res.json())
    .then(data => {
      if (data.results.length === 0) {
        alert("Ciudad no encontrada.");
        return;
      }

      const { lat, lng } = data.results[0].geometry;
      const nombre = data.results[0].formatted;
      obtenerClima(lat, lng, nombre);
    })
    .catch(err => console.error("Error en geolocalización:", err));
}

// Obtener clima desde Open-Meteo
function obtenerClima(lat, lng, nombre) {
  const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=temperature_2m,weathercode&timezone=auto`;

  fetch(urlClima)
    .then(res => res.json())
    .then(data => {
      mostrarClimaActual(data.current_weather, nombre);
      mostrarPronosticoDiario(data.daily);
      mostrarPronosticoPorHora(data.hourly);
    })
    .catch(err => console.error("Error en clima:", err));
}

// Mostrar clima actual
function mostrarClimaActual(clima, ciudad) {
  nombreCiudad.textContent = ciudad;
  fechaActual.textContent = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  iconoClima.innerHTML = obtenerIcono(clima.weathercode);
  temperatura.textContent = `${clima.temperature}°C`;
  sensacion.textContent = `Feels like: ${clima.temperature - 2}°C`;
  humedad.textContent = `Humidity: 50%`; 
  viento.textContent = `Wind: ${clima.windspeed} km/h`;
  precipitacion.textContent = `Precipitation: 0 mm`;
}

// Mostrar pronóstico diario
function mostrarPronosticoDiario(daily) {
  contenedorDias.innerHTML = "";
  for (let i = 0; i < daily.time.length; i++) {
    const dia = new Date(daily.time[i]).toLocaleDateString("es-CO", { weekday: "short" });
    const max = daily.temperature_2m_max[i];
    const min = daily.temperature_2m_min[i];
    const icono = obtenerIcono(daily.weathercode[i]);

    contenedorDias.innerHTML += `
      <div class="day-card">
        <p>${dia}</p>
        ${icono}
        <p>${max}° / ${min}°</p>
      </div>
    `;
  }
}

// Mostrar pronóstico por hora (solo de 15:00 a 22:00)
function mostrarPronosticoPorHora(hourly) {
  contenedorHoras.innerHTML = "";
  for (let i = 0; i < hourly.time.length; i++) {
    const hora = new Date(hourly.time[i]).getHours();
    if (hora >= 15 && hora <= 22) {
      const temp = hourly.temperature_2m[i];
      const icono = obtenerIcono(hourly.weathercode[i]);

      contenedorHoras.innerHTML += `
        <div class="hour-card">
          <p>${hora}:00</p>
          ${icono}
          <p>${temp}°C</p>
        </div>
      `;
    }
  }
}

// Obtener ícono según código de clima
function obtenerIcono(codigo) {
  const iconos = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️", 51: "🌦️", 61: "🌧️",
    71: "🌨️", 80: "🌦️", 95: "⛈️"
  };
  return `<span class="weather-icon">${iconos[codigo] || "❓"}</span>`;
}