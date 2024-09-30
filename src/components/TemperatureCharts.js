import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export function TemperatureCharts({ hourlyData, forecastData }) {
  console.log("TemperatureCharts renderizzato");
  console.log("Tipo di forecastData in TemperatureCharts:", typeof forecastData);
  console.log("Contenuto di forecastData in TemperatureCharts:", forecastData);

  try {
    if (!forecastData) {
      console.log("forecastData è undefined o null");
      return <div>Nessun dato previsionale disponibile (forecastData è undefined)</div>;
    }

    if (!Array.isArray(forecastData)) {
      console.log("forecastData non è un array");
      return <div>Formato dei dati previsionali non valido</div>;
    }

    if (forecastData.length === 0) {
      console.log("forecastData è un array vuoto");
      return <div>Nessun dato previsionale disponibile</div>;
    }

    if (typeof forecastData === 'string') {
      try {
        forecastData = JSON.parse(forecastData);
        console.log("forecastData era una stringa, ora è stato parsato:", forecastData);
      } catch (e) {
        console.error("Errore nel parsing di forecastData:", e);
        return <div>Errore nel parsing dei dati previsionali</div>;
      }
    }

  const formattedForecastData = forecastData.map((item, index) => {
    console.log(`Analisi elemento ${index}:`, item);

    if (!item) {
      console.log(`Elemento ${index} è null o undefined`);
      return null;
    }

    let date, min, max;

    // Estrazione della data
    if (item.dt) {
      date = new Date(item.dt * 1000).toLocaleDateString();
      console.log(`Data estratta da dt per elemento ${index}:`, date);
    } else if (item.date) {
      date = new Date(item.date).toLocaleDateString();
      console.log(`Data estratta da date per elemento ${index}:`, date);
    } else {
      console.log(`Nessuna data valida trovata per elemento ${index}`);
      date = `Giorno ${index + 1}`;
    }

    // Estrazione delle temperature
    if (item.temp && typeof item.temp.min === 'number' && typeof item.temp.max === 'number') {
      min = item.temp.min;
      max = item.temp.max;
      console.log(`Temperature estratte da temp per elemento ${index}:`, { min, max });
    } else if (typeof item.min === 'number' && typeof item.max === 'number') {
      min = item.min;
      max = item.max;
      console.log(`Temperature estratte direttamente per elemento ${index}:`, { min, max });
    } else {
      console.log(`Nessuna temperatura valida trovata per elemento ${index}`);
      return null;
    }

    return { date, min, max };
  }).filter(item => item !== null);

    console.log("Dati formattati finali:", formattedForecastData);

    if (formattedForecastData.length === 0) {
      console.log("Nessun dato previsionale valido dopo la formattazione");
      return <div>Nessun dato previsionale valido trovato</div>;
    }
    return (
      <div>
        <h3>Previsioni Temperature Min/Max</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={formattedForecastData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="min" stroke="#8884d8" name="Temp Min" />
            <Line type="monotone" dataKey="max" stroke="#82ca9d" name="Temp Max" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error("Errore imprevisto in TemperatureCharts:", error);
    return <div>Si è verificato un errore imprevisto nel caricamento dei dati</div>;
  }
}
