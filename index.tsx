
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Location, EnvironmentData } from './types';
import { LOCATIONS } from './constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function App() {
  const [currentLocation, setCurrentLocation] = useState<Location>(LOCATIONS[0]);
  const [data, setData] = useState<EnvironmentData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{ title: string; type: string } | null>(null);
  const [insight, setInsight] = useState<string>('正在分析環境數據...');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch PM2.5 Data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(currentLocation.apiUrl);
      const json = await response.json();
      const freshData: EnvironmentData = {
        pm25: json.s_d0 || 0,
        temperature: json.s_t0 || 24.5,
        humidity: json.s_h0 || 65,
        co2: json.s_g1 || 420,
        tvoc: json.s_g0 || 0.15,
        windspeed: Math.random() * 5, // Simulated
        sunlight: 450 + Math.random() * 100, // Simulated
        electricity: 12.4 + Math.random(), // Simulated
        precipitation: Math.floor(Math.random() * 30), // Simulated
      };
      setData(freshData);
      generateInsight(freshData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  }, [currentLocation]);

  const generateInsight = async (envData: EnvironmentData) => {
    try {
      const prompt = `Based on these metrics at ${currentLocation.name}: 
      PM2.5: ${envData.pm25}μg/m³, 
      Temp: ${envData.temperature}°C, 
      CO2: ${envData.co2}ppm. 
      Provide a very short (1 sentence) friendly health advice or status in Traditional Chinese (Taiwan).`;
      
      // Use simplified contents property as per @google/genai guidelines for single prompts
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setInsight(response.text || '數據更新中...');
    } catch (e) {
      setInsight('環境品質良好，適宜活動。');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Clock Hand Angles
  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  const handleLocationSelect = (loc: Location) => {
    setCurrentLocation(loc);
    setIsDropdownOpen(false);
  };

  const openModal = (title: string, type: string) => {
    setActiveModal({ title, type });
  };

  return (
    <div className="app-root">
      <header className="header">芳和實驗中學環境現況</header>
      
      <div className="app-container">
        <aside className="sidebar">
          <div className="dropdown-container">
            <button className="dropdown-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {currentLocation.name} ▼
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-list">
                {LOCATIONS.map(loc => (
                  <li key={loc.id} onClick={() => handleLocationSelect(loc)}>
                    {loc.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className="menu">
            <div onClick={() => openModal('溫度', 'temperature')}>溫度</div>
            <div onClick={() => openModal('日照', 'sunlight')}>日照</div>
            <div onClick={() => openModal('風速', 'windspeed')}>風速</div>
            <div onClick={() => openModal('濕度', 'humidity')}>濕度</div>
            <div onClick={() => openModal('碳排放', 'co2')}>碳排放</div>
            <div onClick={() => openModal('有機物', 'tvoc')}>有機物</div>
            <div onClick={() => openModal('PM2.5', 'pm25')}>PM2.5</div>
            <div onClick={() => openModal('用電量', 'electricity')}>用電量</div>
          </nav>

          <div className="clock">
            <div className="clock-svg">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="4" />
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                  <circle key={deg} cx={50 + 38 * Math.cos((deg - 90) * Math.PI / 180)} cy={50 + 38 * Math.sin((deg - 90) * Math.PI / 180)} r="2" fill="#fff" />
                ))}
                <rect x="48" y="25" width="4" height="25" rx="2" fill="#ddd" transform={`rotate(${hourDeg}, 50, 50)`} />
                <rect x="48.5" y="18" width="3" height="32" rx="1.5" fill="#fff" transform={`rotate(${minuteDeg}, 50, 50)`} />
                <rect x="49" y="16" width="2" height="34" rx="1" fill="#ff4444" transform={`rotate(${secondDeg}, 50, 50)`} />
                <circle cx="50" cy="50" r="4" fill="#fff" />
              </svg>
            </div>
            <div className="clock-digital">
              <div className="date-display">
                {['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][currentTime.getDay()]} {currentTime.toLocaleDateString()}
              </div>
              <div className="time-display">
                {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
              </div>
            </div>
          </div>
        </aside>

        <main className="main">
          <section className="top-block columns">
            <div className="pm25-card">
              <div className="card-label">PM2.5</div>
              <div className="card-value large">{data?.pm25 || '--'} <small>μg/m³</small></div>
              <div className="ai-insight">{insight}</div>
            </div>
            <div className="right-stack">
              <div className="metric-card">
                <span className="label">溫度</span>
                <span className="value">{data?.temperature.toFixed(1) || '--'}°C</span>
              </div>
              <div className="metric-card">
                <span className="label">日照</span>
                <span className="value">{data?.sunlight.toFixed(0) || '--'} lx</span>
              </div>
              <div className="metric-card">
                <span className="label">風速</span>
                <span className="value">{data?.windspeed.toFixed(1) || '--'} m/s</span>
              </div>
              <div className="metric-card">
                <span className="label">濕度</span>
                <span className="value">{data?.humidity || '--'} %</span>
              </div>
            </div>
          </section>

          <section className="bottom-block columns">
            <div className="connected-group">
              <div className="connected-card">
                <span className="label">CO2</span>
                <span className="value">{data?.co2 || '--'} ppm</span>
              </div>
              <div className="connected-card">
                <span className="label">TVOC</span>
                <span className="value">{data?.tvoc.toFixed(2) || '--'} mg/m³</span>
              </div>
              <div className="connected-card">
                <span className="label">用電</span>
                <span className="value">{data?.electricity.toFixed(1) || '--'} kW</span>
              </div>
            </div>
            <div className="small-card-row">
              <div className="small-card">
                <div className="label">降雨機率</div>
                <div className="value">{data?.precipitation || '0'}%</div>
              </div>
              <div className="small-card icon-card">
                <div className="weather-icon">☀️</div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {activeModal && (
        <div className="modal-overlay active" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{currentLocation.name} {activeModal.title} 歷史數據</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>正在加載 {activeModal.title} 的歷史統計圖表...</p>
              <div className="placeholder-chart">
                {/* Visual placeholder for a chart */}
                <div className="bar" style={{ height: '40%' }}></div>
                <div className="bar" style={{ height: '70%' }}></div>
                <div className="bar" style={{ height: '50%' }}></div>
                <div className="bar" style={{ height: '90%' }}></div>
                <div className="bar" style={{ height: '60%' }}></div>
              </div>
              <p className="chart-footer">數據來源：LASS 開源感測網路</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
