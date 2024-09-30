import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import WeatherChart from './components/WeatherChart';
import ForecastChart from './components/ForecastChart';

const SERVER_URL = 'https://b0e0-95-232-172-92.ngrok-free.app';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Componente mappa separato
const Map = ({ center, zoom, cityInfo, weatherData }) => {
  return (
    <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={zoom} style={{ height: '200px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center}>
        <Popup>
          <b>{cityInfo.name}</b><br />
          {weatherData && (
            <>
              Temp: {weatherData.temp}°C<br />
              {weatherData.description}
            </>
          )}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

function AppMobile() {
  const [currentCity, setCurrentCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cityInfo, setCityInfo] = useState({ name: '', lat: 0, lon: 0 });

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    fetchWeatherData(currentCity);
  }, [currentCity]);

  useEffect(() => {
    if (weatherData) {
      updateWindRose(weatherData.wind_speed, weatherData.wind_deg);
    }
  }, [weatherData]);

  const fetchWeatherData = async (city) => {
    setIsLoading(true);
    try {
//      const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
      const response = await fetch(`${SERVER_URL}/weather?city=${encodeURIComponent(city)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Dati ricevuti:", data);
      if (data.forecast_data) {
        console.log("Impostazione dei dati di previsione:", data.forecast_data);
        setForecastData(data.forecast_data);
      } else {
        console.warn("Dati di previsione mancanti nella risposta del server");
      }

      setWeatherData(data.weather_data);
      setForecastData(data.forecast_data);
      setHistoricalData(data.historical_data);
      setCityInfo({
        name: city,
        lat: data.weather_data.lat,
        lon: data.weather_data.lon
      });
    } catch (error) {
      console.error('Errore:', error);
      setWeatherData({
        temp: 0,
        description: 'Dati non disponibili',
        wind_speed: 0,
        wind_deg: 0,
        humidity: 0,
        pressure: 0,
        visibility: 0,
        clouds: 0,
        icon: '01d',
        lat: 0,
        lon: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (userInput.trim()) {
      setIsLoading(true);
      setChatMessages([...chatMessages, { text: userInput, isUser: true }]);
      setUserInput('');

      try {
//        const response = await fetch('/chat', {
        const response = await fetch(`${SERVER_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput,
            city: currentCity,
          }),
        });

        if (!response.ok) {
          throw new Error(`Errore HTTP! stato: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dati ricevuti:", data);

        setChatMessages(prev => [...prev, { text: data.response, isUser: false }]);

        if (data.weather_data) {
          setWeatherData(data.weather_data);
        }
        if (data.forecast_data) {
          setForecastData(data.forecast_data);
        }
        if (data.historical_data) {
          setHistoricalData(data.historical_data);
        }
        if (data.city) {
          setCityInfo(data.city);
        }
      } catch (error) {
        console.error('Errore completo:', error);
        setChatMessages(prev => [...prev, { text: `Errore: ${error.message}`, isUser: false }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const selectCity = (city) => {
    setCurrentCity(city);
    fetchWeatherData(city);
  };

  const updateWindRose = (speed, direction) => {
    const svg = d3.select("#wind-rose");
    svg.selectAll("*").remove();
    
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 10;

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    // Aggiungi un cerchio di sfondo
    g.append("circle")
      .attr("r", radius)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#ccc");

    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const angleScale = d3.scaleLinear()
      .domain([0, 360])
      .range([0, 2 * Math.PI]);

    // Aggiungi linee per ogni direzione principale
    directions.forEach((_, i) => {
      const angle = i * 45;
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.sin(angleScale(angle)))
        .attr("y2", -radius * Math.cos(angleScale(angle)))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
    });

    // Aggiungi etichette per le direzioni
    g.selectAll(".direction")
      .data(directions)
      .enter().append("text")
      .attr("class", "direction")
      .attr("x", (d, i) => (radius + 15) * Math.sin(angleScale(i * 45)))
      .attr("y", (d, i) => -(radius + 15) * Math.cos(angleScale(i * 45)))
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(d => d);

    g.append("path")
      .attr("d", d3.symbol().type(d3.symbolTriangle).size(200))
      .attr("fill", "red")
      .attr("transform", `rotate(${direction}) translate(0, -${radius * 0.7})`);

    // Aggiungi un cerchio al centro
    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "red");

    // Aggiungi il testo per la velocità del vento
    g.append("text")
      .attr("x", 0)
      .attr("y", radius / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`${speed} km/h`);
  };

  const MapComponent = React.memo(() => (
    <MapContainer center={[cityInfo.lat, cityInfo.lon]} zoom={10} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[cityInfo.lat, cityInfo.lon]}>
        <Popup>
          <b>{cityInfo.name}</b><br />
          Temp: {weatherData.temp}°C<br />
          {weatherData.description}
        </Popup>
      </Marker>
    </MapContainer>
  ));

  const getDayName = (addDays = 0) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return days[date.getDay()];
  };

  if (!weatherData) return <div>Caricamento...</div>;

  return (
    <div className="App mobile">
      <div className="app-header">
        <img 
          src="/ui/images/windly-icon.png" 
          alt="Windly icon" 
          className="app-icon"
        />
        <h1>Windly - Meteo Salento</h1>
      </div>
      
      <div className="mobile-dashboard">
        <div className="mobile-chat-section">
          <h3>Chat Assistente Meteo</h3>
          <div className="chat-messages" ref={chatRef}>
            {chatMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}>
                <span className="message-sender">{msg.isUser ? 'Tu: ' : 'AI: '}</span>
                <span className="message-text">{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Chiedi informazioni sul meteo..."
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? 'Invio...' : 'Invia'}
            </button>
          </div>
        </div>

        <div className="current-temp">
          <div className="temp-icon-container">
            {weatherData && weatherData.icon && (
              <img 
                src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} 
                alt="Condizioni meteo" 
                className="weather-icon"
              />
            )}
          </div>
          <div className="weather-description">
            <p>
              {weatherData ? (
                <>
                  <span className="temp">{weatherData.temp}°C</span>
                  <span className="separator"> - </span>
                  <span className="description">{weatherData.description}</span>
                </>
              ) : ''}
            </p>
          </div>
        </div>

        <div className="mobile-map-container">
          {cityInfo.lat !== 0 && cityInfo.lon !== 0 && (
            <Map 
              center={[cityInfo.lat, cityInfo.lon]} 
              zoom={10} 
              cityInfo={cityInfo}
              weatherData={weatherData}
            />
          )}
        </div>

        <div className="mobile-wind-section">
          <h3>Vento</h3>
          <svg id="wind-rose" width="150" height="150"></svg>
          {weatherData && (
            <p>{weatherData.wind_speed} km/h, {weatherData.wind_deg}°</p>
          )}
        </div>

        <div className="mobile-info-section">
          {weatherData && (
            <>
              <div>Umidità: {weatherData.humidity}%</div>
              <div>Pressione: {weatherData.pressure} hPa</div>
              <div>Visibilità: {weatherData.visibility} m</div>
              <div>Nuvolosità: {weatherData.clouds}%</div>
            </>
          )}
        </div>

        {forecastData && historicalData && (
          <div className="mobile-weather-charts-section">
            <h3>Temperatura ultime 24 ore</h3>
            <WeatherChart 
              historicalData={historicalData}
              currentTemp={weatherData ? weatherData.temp : 0}
            />
            <h3>Previsioni prossimi giorni</h3>
            <ForecastChart forecastData={forecastData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AppMobile;

