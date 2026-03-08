// Theme toggle (dark/light)
(function () {
    var saved = localStorage.getItem('aircare-theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

function toggleTheme() {
    var html = document.documentElement;
    var icon = document.getElementById('themeIcon');
    if (html.getAttribute('data-theme') === 'light') {
        html.removeAttribute('data-theme');
        icon.textContent = '🌙';
        localStorage.setItem('aircare-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
        icon.textContent = '☀️';
        localStorage.setItem('aircare-theme', 'light');
    }
}

// Set icon on page load
window.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    var icon = document.getElementById('themeIcon');
    if (btn) btn.addEventListener('click', toggleTheme);
    if (document.documentElement.getAttribute('data-theme') === 'light' && icon) {
        icon.textContent = '☀️';
    }
});

// API Keys - Replace with your own API keys
// Steps to get free API key:
// 1. Go to https://openweathermap.org/api
// 2. Sign up for a free account
// 3. Go to API keys section
// 4. Copy your API key and paste it below
// Note: Free tier allows 60 calls per minute

// DATA ACCURACY NOTE:
// The data from OpenWeatherMap is ACCURATE and CURRENT, but not "live" (updating every second)
// - Weather data: Updated every 10 minutes to a few hours (varies by weather station)
// - Air Quality data: Updated every few hours (varies by monitoring station)
// This app auto-refreshes every 5 minutes to keep data current

// For more accurate AQI in Indian cities, we use AQICN API
// AQICN provides data from official government monitoring stations
// Get free token from: https://aqicn.org/api/
const WEATHER_API_KEY = '49c403366e439b4e4caa7acc88c18aec';
const AQICN_TOKEN = '9eee818981d5f6f5c24453d433069329bac42a25'; // Replace with your token from aqicn.org/api (free)
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AQI_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const AQI_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/air_pollution/forecast';
const AQI_HISTORY_URL = 'https://api.openweathermap.org/data/2.5/air_pollution/history';
const AQICN_API_URL = 'https://api.waqi.info/feed';
const AQICN_MAP_BOUNDS_URL = 'https://api.waqi.info/map/bounds/';
const AQICN_SEARCH_URL = 'https://api.waqi.info/search/';

// Get elements from HTML. 
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const lastUpdated = document.getElementById('lastUpdated');

// Variable to store current city and auto-refresh interval
let currentCity = '';
let autoRefreshInterval = null;

// Carousel variables
let currentCarouselIndex = 0;
let carouselInterval = null;

// Weather elements
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const tempHigh = document.getElementById('tempHigh');
const tempLow = document.getElementById('tempLow');
const windSpeedDetail = document.getElementById('windSpeedDetail');
const windDesc = document.getElementById('windDesc');
const windArrow = document.getElementById('windArrow');
const dewPoint = document.getElementById('dewPoint');
const dewPointDesc = document.getElementById('dewPointDesc');
const pressureDetail = document.getElementById('pressureDetail');
const pressureDesc = document.getElementById('pressureDesc');
const pressureGauge = document.getElementById('pressureGauge');
const visibility = document.getElementById('visibility');
const visibilityDesc = document.getElementById('visibilityDesc');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const dayLength = document.getElementById('dayLength');
const hourlyForecast = document.getElementById('hourlyForecast');
const dailyForecast = document.getElementById('dailyForecast');

// AQI elements
const aqiValue = document.getElementById('aqiValue');
const aqiStatus = document.getElementById('aqiStatus');
const pm25 = document.getElementById('pm25');
const pm10 = document.getElementById('pm10');
const co = document.getElementById('co');
const so2 = document.getElementById('so2');
const no2 = document.getElementById('no2');
const o3 = document.getElementById('o3');

// Function to show loading
function showLoading() {
    loading.style.display = 'block';
    error.style.display = 'none';
}

// Function to hide loading
function hideLoading() {
    loading.style.display = 'none';
}

// Function to show error
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    hideLoading();
}

// Function to get coordinates from city name
async function getCoordinates(city) {
    const url = `${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('City not found. Please try again.');
        }

        const data = await response.json();
        return {
            lat: data.coord.lat,
            lon: data.coord.lon,
            cityName: data.name,
            countryCode: data.sys.country
        };
    } catch (err) {
        throw err;
    }
}

// Function to get weather data
async function getWeatherData(lat, lon) {
    const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch weather data.');
        }

        const data = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}

// Function to get forecast data
async function getForecastData(lat, lon) {
    const url = `${FORECAST_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch forecast data.');
        }

        const data = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}

// Function to get AQI data from AQICN (more accurate for Indian cities)
async function getAQIDataFromAQICN(lat, lon) {
    const url = `${AQICN_API_URL}/geo:${lat};${lon}/?token=${AQICN_TOKEN}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch AQI data from AQICN.');
        }

        const data = await response.json();

        if (data.status === 'ok' && data.data) {
            const iaqi = data.data.iaqi || {};
            return {
                aqi: data.data.aqi,
                city: data.data.city,
                time: data.data.time?.iso ? data.data.time.iso : null,
                components: {
                    pm2_5: iaqi.pm25 ? iaqi.pm25.v : null,
                    pm10: iaqi.pm10 ? iaqi.pm10.v : null,
                    co: iaqi.co ? iaqi.co.v : null,
                    so2: iaqi.so2 ? iaqi.so2.v : null,
                    no2: iaqi.no2 ? iaqi.no2.v : null,
                    o3: iaqi.o3 ? iaqi.o3.v : null
                }
            };
        } else {
            throw new Error('Invalid AQICN data.');
        }
    } catch (err) {
        throw err;
    }
}

// Function to get AQI data from OpenWeatherMap (fallback)
async function getAQIData(lat, lon) {
    const url = `${AQI_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch AQI data.');
        }

        const data = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}

// Function to update last updated timestamp
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    lastUpdated.textContent = 'Last updated: ' + timeString;
    lastUpdated.style.display = 'block';
}

// Function to update sun position on the path
function updateSunPosition(sunriseTime, sunsetTime, currentTime) {
    const sunPath = document.getElementById('sunPath');
    const sunPosition = document.getElementById('sunPosition');
    const sunRays = document.getElementById('sunRays');

    if (!sunPath || !sunPosition || !sunRays) return;

    // Calculate position along the day (0 = sunrise, 1 = sunset)
    let progress = 0;

    if (currentTime < sunriseTime) {
        // Before sunrise - show at start
        progress = 0;
        sunRays.style.opacity = '0.2';
    } else if (currentTime > sunsetTime) {
        // After sunset - show at end
        progress = 1;
        sunRays.style.opacity = '0.2';
    } else {
        // During day - calculate position
        const dayLength = sunsetTime - sunriseTime;
        const elapsed = currentTime - sunriseTime;
        progress = elapsed / dayLength;
        sunRays.style.opacity = '0.5';
    }

    // Calculate position on the quadratic curve (arc)
    // Path: M 50 100 Q 200 20 350 100
    // Using quadratic bezier formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const t = progress;
    const x0 = 50, y0 = 100;  // Start point
    const x1 = 200, y1 = 20;  // Control point
    const x2 = 350, y2 = 100; // End point

    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;

    // Update sun position
    sunPosition.setAttribute('cx', x);
    sunPosition.setAttribute('cy', y);

    // Update sun rays position
    const rays = sunRays.querySelectorAll('line');
    rays.forEach(ray => {
        const x1_attr = parseFloat(ray.getAttribute('x1'));
        const y1_attr = parseFloat(ray.getAttribute('y1'));
        const x2_attr = parseFloat(ray.getAttribute('x2'));
        const y2_attr = parseFloat(ray.getAttribute('y2'));

        const dx = x2_attr - x1_attr;
        const dy = y2_attr - y1_attr;

        ray.setAttribute('x1', x);
        ray.setAttribute('y1', y);
        ray.setAttribute('x2', x + dx);
        ray.setAttribute('y2', y + dy);
    });
}

// Carousel functions
const carouselWrapper = document.getElementById('carouselWrapper');
const carouselDots = document.getElementById('carouselDots');

function updateCarouselCard(index) {
    if (!carouselWrapper || !carouselDots) return;

    const cards = carouselWrapper.querySelectorAll('.carousel-card');
    const dots = carouselDots.querySelectorAll('.dot');

    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    currentCarouselIndex = index;
}

function initCarousel() {
    if (!carouselWrapper || !carouselDots) return;

    const dots = carouselDots.querySelectorAll('.dot');

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateCarouselCard(index);
            resetCarouselAutoPlay();
        });
    });

    startCarouselAutoPlay();

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carouselWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextCarouselCard();
    }
    if (touchEndX > touchStartX + 50) {
        prevCarouselCard();
    }
}

function nextCarouselCard() {
    if (!carouselWrapper) return;
    const totalCards = carouselWrapper.querySelectorAll('.carousel-card').length;
    const nextIndex = (currentCarouselIndex + 1) % totalCards;
    updateCarouselCard(nextIndex);
    resetCarouselAutoPlay();
}

function prevCarouselCard() {
    if (!carouselWrapper) return;
    const totalCards = carouselWrapper.querySelectorAll('.carousel-card').length;
    const prevIndex = (currentCarouselIndex - 1 + totalCards) % totalCards;
    updateCarouselCard(prevIndex);
    resetCarouselAutoPlay();
}

function startCarouselAutoPlay() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        nextCarouselCard();
    }, 5000);
}

function resetCarouselAutoPlay() {
    if (carouselInterval) clearInterval(carouselInterval);
    startCarouselAutoPlay();
}

// Function to get weather icon emoji
function getWeatherIcon(weatherCode) {
    const icons = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return icons[weatherCode] || '🌤️';
}

// Function to calculate dew point
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
    return Math.round((b * alpha) / (a - alpha));
}

// Function to get wind direction description
function getWindDirection(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(deg / 22.5) % 16];
}

// Function to get wind description
function getWindDescription(speed) {
    if (speed < 5) return 'Calm';
    if (speed < 12) return 'Light breeze';
    if (speed < 20) return 'Gentle breeze';
    if (speed < 30) return 'Moderate breeze';
    if (speed < 40) return 'Fresh breeze';
    return 'Strong breeze';
}

// Function to get pressure description
function getPressureDescription(pressure) {
    if (pressure > 1020) return 'High pressure';
    if (pressure < 1000) return 'Low pressure';
    return 'Normal pressure';
}

// Function to get visibility description
function getVisibilityDescription(visibility) {
    if (visibility >= 10) return 'Excellent';
    if (visibility >= 5) return 'Good';
    if (visibility >= 2) return 'Moderate';
    return 'Poor';
}

// Function to get UV description
function getUVDescription(uv) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
}

// Function to update weather display
function updateWeatherDisplay(weatherData) {
    cityName.textContent = weatherData.name;
    temperature.textContent = Math.round(weatherData.main.temp);
    weatherDescription.textContent = weatherData.weather[0].description;
    feelsLike.textContent = Math.round(weatherData.main.feels_like) + '°C';
    humidity.textContent = weatherData.main.humidity + '%';

    const windSpeedKmh = (weatherData.wind.speed * 3.6).toFixed(1);
    windSpeed.textContent = windSpeedKmh + ' km/h';
    windSpeedDetail.textContent = windSpeedKmh + ' km/h';

    const windDir = weatherData.wind.deg || 0;
    windDesc.textContent = getWindDescription(parseFloat(windSpeedKmh));
    windArrow.style.transform = `translate(-50%, -100%) rotate(${windDir}deg)`;

    pressure.textContent = weatherData.main.pressure + ' hPa';
    pressureDetail.textContent = weatherData.main.pressure.toFixed(1) + ' mb';
    pressureDesc.textContent = getPressureDescription(weatherData.main.pressure);

    // Pressure gauge (normalized to 950-1050 range)
    const pressurePercent = ((weatherData.main.pressure - 950) / 100) * 100;
    pressureGauge.style.width = Math.max(0, Math.min(100, pressurePercent)) + '%';

    // Dew point
    const dewPointTemp = calculateDewPoint(weatherData.main.temp, weatherData.main.humidity);
    dewPoint.textContent = dewPointTemp + '°C';
    dewPointDesc.textContent = dewPointTemp > 16 ? 'Noticeable humidity' : 'Comfortable';

    // Visibility
    if (visibility && visibilityDesc) {
        const visibilityKm = (weatherData.visibility / 1000).toFixed(2);
        visibility.textContent = visibilityKm + ' km';
        visibilityDesc.textContent = getVisibilityDescription(parseFloat(visibilityKm));
    }

    // Sunrise/Sunset
    const sunriseTime = new Date(weatherData.sys.sunrise * 1000);
    const sunsetTime = new Date(weatherData.sys.sunset * 1000);
    const now = new Date();

    if (sunrise) {
        sunrise.textContent = sunriseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (sunset) {
        sunset.textContent = sunsetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // Calculate day length
    if (dayLength) {
        const dayLengthMs = sunsetTime - sunriseTime;
        const dayLengthHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
        const dayLengthMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));
        dayLength.textContent = `${dayLengthHours}h ${dayLengthMinutes}m`;
    }

    // Update sun position on path
    updateSunPosition(sunriseTime, sunsetTime, now);

    // High/Low (from main temp for now, will update with forecast)
    tempHigh.textContent = Math.round(weatherData.main.temp_max);
    tempLow.textContent = Math.round(weatherData.main.temp_min);

    // Update timestamp
    updateTimestamp();

    // Update video background based on temperature and weather
    updateWeatherVideo(weatherData.main.temp, weatherData.weather[0]);
}

// Function to update weather card video based on temperature and conditions
function updateWeatherVideo(temp, weather) {
    const video = document.getElementById('weatherBgVideo');
    const source = document.getElementById('weatherVideoSource');

    if (!video || !source) return;

    let videoSrc;

    if (temp >= 20) {
        // Warm/hot weather → summer
        videoSrc = 'videos/summer.mp4';
    } else {
        // Cold weather → winter with or without snow based on actual conditions
        const condition = (weather.main || '').toLowerCase();
        const description = (weather.description || '').toLowerCase();
        const hasSnow = condition === 'snow' || description.includes('snow');

        videoSrc = hasSnow ? 'videos/winter.mp4' : 'videos/winter_no_snow.mp4';
    }

    if (source.getAttribute('src') !== videoSrc) {
        source.src = videoSrc;
        video.load();
        video.play();
    }
}

// Function to update hourly forecast
function updateHourlyForecast(forecastData) {
    hourlyForecast.innerHTML = '';
    const hours = forecastData.list.slice(0, 12); // Next 12 hours

    hours.forEach(item => {
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';

        const date = new Date(item.dt * 1000);
        const hour = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const icon = getWeatherIcon(item.weather[0].icon);
        const temp = Math.round(item.main.temp);
        const pop = Math.round((item.pop || 0) * 100);

        hourItem.innerHTML = `
            <div class="hour">${hour}</div>
            <div class="hour-icon">${icon}</div>
            <div class="hour-temp">${temp}°</div>
            <div class="hour-precip">${pop}%</div>
        `;

        hourlyForecast.appendChild(hourItem);
    });
}

// Function to update daily forecast
function updateDailyForecast(forecastData) {
    dailyForecast.innerHTML = '';
    const days = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group forecasts by day
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();

        if (!days[dayKey]) {
            days[dayKey] = {
                date: date,
                temps: [],
                icons: [],
                pop: []
            };
        }

        days[dayKey].temps.push(item.main.temp);
        days[dayKey].icons.push(item.weather[0].icon);
        days[dayKey].pop.push(item.pop || 0);
    });

    // Get next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayKey = checkDate.toDateString();

        if (days[dayKey]) {
            const dayData = days[dayKey];
            const maxTemp = Math.round(Math.max(...dayData.temps));
            const minTemp = Math.round(Math.min(...dayData.temps));
            const maxPop = Math.round(Math.max(...dayData.pop) * 100);
            const dayIcon = dayData.icons[Math.floor(dayData.icons.length / 2)];

            const dayItem = document.createElement('div');
            dayItem.className = 'daily-item';

            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[checkDate.getDay()];

            dayItem.innerHTML = `
                <div class="daily-day">${dayName}</div>
                <div class="daily-icon">${getWeatherIcon(dayIcon)}</div>
                <div class="daily-temp">${maxTemp}° ${minTemp}°</div>
                <div class="daily-precip">${maxPop}%</div>
            `;

            dailyForecast.appendChild(dayItem);
        }
    }
}

// Carousel update functions
function updateSunriseCard(weatherData) {
    const sunriseText = document.getElementById('sunriseText');
    const sunriseTimeArc = document.getElementById('sunriseTimeArc');

    if (!sunriseText || !sunriseTimeArc) return;

    const sunriseTime = new Date(weatherData.sys.sunrise * 1000);
    const timeString = sunriseTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    sunriseText.textContent = `Sunrise will be at ${timeString}`;
    sunriseTimeArc.textContent = timeString;
}

function getRunningConditions(temp, humidity, aqi, windSpeed) {
    let score = 100;

    if (temp < 5 || temp > 30) score -= 30;
    else if (temp < 10 || temp > 25) score -= 15;

    if (humidity > 80) score -= 25;
    else if (humidity > 70) score -= 15;

    if (aqi > 200) score -= 40;
    else if (aqi > 150) score -= 25;
    else if (aqi > 100) score -= 15;

    if (windSpeed > 30) score -= 20;
    else if (windSpeed > 20) score -= 10;

    if (score < 50) {
        return { status: 'Poor', statusClass: 'status-poor', desc: 'Not ideal for running. Consider indoor exercise.' };
    } else if (score < 75) {
        return { status: 'Moderate', statusClass: 'status-moderate', desc: 'Fair conditions. Take it easy if you go out.' };
    } else {
        return { status: 'Good', statusClass: 'status-good', desc: 'Perfect weather for running!' };
    }
}

function updateRunningCard(weatherData, forecastData, aqiValue) {
    const runningStatus = document.getElementById('runningStatus');
    const runningDesc = document.getElementById('runningDesc');
    const runningForecast = document.getElementById('runningForecast');

    if (!runningStatus || !runningDesc || !runningForecast) {
        console.error('Running card elements not found');
        return;
    }

    if (!weatherData || !forecastData) {
        console.error('Missing weather or forecast data');
        return;
    }

    const current = getRunningConditions(
        weatherData.main.temp,
        weatherData.main.humidity,
        aqiValue || 100,
        weatherData.wind.speed * 3.6
    );

    runningStatus.textContent = current.status;
    runningStatus.className = `status-badge-large ${current.statusClass}`;
    runningDesc.textContent = current.desc;

    runningForecast.innerHTML = '';

    if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
        console.error('No forecast data available for running card');
        return;
    }

    const nextHours = forecastData.list.slice(0, 3);

    nextHours.forEach(item => {
        const hourDate = new Date(item.dt * 1000);
        const hourTime = hourDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const hourConditions = getRunningConditions(
            item.main.temp,
            item.main.humidity,
            aqiValue || 100,
            item.wind.speed * 3.6
        );

        const hourItem = document.createElement('div');
        hourItem.className = 'analytics-hour-item';
        hourItem.innerHTML = `
            <div class="analytics-hour-time">${hourTime}</div>
            <div class="analytics-hour-icon">${hourConditions.status === 'Good' ? '😊' : hourConditions.status === 'Moderate' ? '😐' : '😞'}</div>
            <div class="analytics-hour-status ${hourConditions.statusClass}">${hourConditions.status}</div>
        `;

        runningForecast.appendChild(hourItem);
    });
}

// Function to update AQI compact card
function updateAQICompactCard(aqiValue, aqiStatusText) {
    const aqiStatusCompact = document.getElementById('aqiStatusCompact');
    const aqiValueCompact = document.getElementById('aqiValueCompact');
    const aqiProgressBar = document.getElementById('aqiProgressBar');

    if (!aqiStatusCompact || !aqiValueCompact || !aqiProgressBar) {
        console.error('AQI compact card elements not found');
        return;
    }

    if (!aqiValue || isNaN(aqiValue)) {
        console.error('Invalid AQI value:', aqiValue);
        aqiValue = 100; // Default
    }

    if (!aqiStatusText) {
        aqiStatusText = 'Moderate';
    }

    aqiStatusCompact.textContent = aqiStatusText || '--';
    aqiValueCompact.textContent = `(${Math.round(aqiValue)})`;

    // Update progress bar (0-500 scale)
    const progressPercent = Math.min(100, (aqiValue / 500) * 100);
    aqiProgressBar.style.width = progressPercent + '%';

    // Update color based on AQI
    if (aqiValue <= 50) {
        aqiProgressBar.style.background = '#4CAF50';
    } else if (aqiValue <= 100) {
        aqiProgressBar.style.background = '#FFC107';
    } else if (aqiValue <= 150) {
        aqiProgressBar.style.background = '#FF9800';
    } else if (aqiValue <= 200) {
        aqiProgressBar.style.background = '#F44336';
    } else {
        aqiProgressBar.style.background = '#9C27B0';
    }
}

// Function to update Pollen card (estimated based on weather)
function updatePollenCard(weatherData) {
    const pollenTree = document.getElementById('pollenTree');
    const pollenGrass = document.getElementById('pollenGrass');
    const pollenRagweed = document.getElementById('pollenRagweed');

    if (!pollenTree || !pollenGrass || !pollenRagweed) return;

    // Simple estimation based on weather conditions
    // In a real app, this would come from a pollen API
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main;

    let level = 'Low';
    if (temp > 20 && (condition === 'Clear' || condition === 'Clouds')) {
        level = 'Moderate';
    } else if (temp > 25 && condition === 'Clear') {
        level = 'High';
    }

    pollenTree.textContent = level;
    pollenGrass.textContent = level;
    pollenRagweed.textContent = level;

    // Update color
    const pollenItems = [pollenTree, pollenGrass, pollenRagweed];
    pollenItems.forEach(item => {
        if (level === 'Low') {
            item.style.color = '#4CAF50';
            item.style.background = 'rgba(76, 175, 80, 0.2)';
        } else if (level === 'Moderate') {
            item.style.color = '#FFC107';
            item.style.background = 'rgba(255, 193, 7, 0.2)';
        } else {
            item.style.color = '#F44336';
            item.style.background = 'rgba(244, 67, 54, 0.2)';
        }
    });
}

// Function to update UV Index card
function updateUVCard(weatherData) {
    const uvStatusText = document.getElementById('uvStatusText');
    const uvProgressFill = document.getElementById('uvProgressFill');
    const uvIndicator = document.getElementById('uvIndicator');

    if (!uvStatusText || !uvProgressFill || !uvIndicator) return;

    // Estimate UV from weather conditions
    const condition = weatherData.weather[0].main;
    let uv = 0;
    let uvText = 'Low';

    if (condition === 'Clear') {
        uv = 7;
        uvText = 'High';
    } else if (condition === 'Clouds') {
        uv = 4;
        uvText = 'Moderate';
    } else {
        uv = 2;
        uvText = 'Low';
    }

    uvStatusText.textContent = `${uvText} rest of day`;
    uvIndicator.textContent = uv;

    // Update progress (0-11 scale)
    const progressPercent = (uv / 11) * 100;
    uvProgressFill.style.width = progressPercent + '%';

    // Update indicator position
    uvIndicator.style.left = progressPercent + '%';

    // Update indicator color
    if (uv <= 2) {
        uvIndicator.style.background = '#4CAF50';
    } else if (uv <= 5) {
        uvIndicator.style.background = '#FFC107';
    } else if (uv <= 7) {
        uvIndicator.style.background = '#FF9800';
    } else {
        uvIndicator.style.background = '#F44336';
    }
}

// Function to update Humidity card
function updateHumidityCard(weatherData) {
    const humidityStatusText = document.getElementById('humidityStatusText');
    const humidityValueLarge = document.getElementById('humidityValueLarge');
    const humidityProgressFill = document.getElementById('humidityProgressFill');

    if (!humidityStatusText || !humidityValueLarge || !humidityProgressFill) return;

    const humidity = weatherData.main.humidity;
    humidityValueLarge.textContent = humidity + '%';

    // Simple comparison (would need previous day data for real comparison)
    humidityStatusText.textContent = 'Current humidity level';

    // Update progress bar
    humidityProgressFill.style.width = humidity + '%';
}

function updateOutdoorCard(weatherData, aqiValue) {
    const outdoorStatus = document.getElementById('outdoorStatus');
    const outdoorDesc = document.getElementById('outdoorDesc');
    const outdoorTips = document.getElementById('outdoorTips');

    if (!outdoorStatus || !outdoorDesc || !outdoorTips) return;

    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main;
    const aqi = aqiValue || 100;

    let status = 'Good';
    let statusClass = 'status-good';
    let desc = 'Great weather for outdoor activities!';
    const tips = [];

    if (aqi > 200) {
        status = 'Poor';
        statusClass = 'status-poor';
        desc = 'Air quality is poor. Limit outdoor activities.';
        tips.push('Stay indoors if possible');
        tips.push('Wear a mask if going outside');
        tips.push('Avoid strenuous activities');
    } else if (aqi > 150) {
        status = 'Moderate';
        statusClass = 'status-moderate';
        desc = 'Air quality is moderate. Sensitive people should take care.';
        tips.push('Limit time outdoors');
        tips.push('Avoid heavy exercise');
    } else {
        if (condition === 'Clear' || condition === 'Clouds') {
            tips.push('Perfect for outdoor sports');
            tips.push('Great for picnics and walks');
            tips.push('Ideal for gardening');
        } else if (condition === 'Rain') {
            status = 'Moderate';
            statusClass = 'status-moderate';
            desc = 'Rainy conditions. Some activities may be limited.';
            tips.push('Indoor activities recommended');
            tips.push('Carry an umbrella if going out');
        }
    }

    outdoorStatus.textContent = status;
    outdoorStatus.className = `activity-status-badge ${statusClass}`;
    outdoorDesc.textContent = desc;

    outdoorTips.innerHTML = '';
    tips.forEach(tip => {
        const tipItem = document.createElement('div');
        tipItem.className = 'tip-item';
        tipItem.textContent = tip;
        outdoorTips.appendChild(tipItem);
    });
}

function updateAQITipsCard(aqiValue, aqiStatus) {
    const aqiTipText = document.getElementById('aqiTipText');
    const aqiTipDetails = document.getElementById('aqiTipDetails');

    if (!aqiTipText || !aqiTipDetails) return;

    const tips = [];

    if (aqiValue <= 50) {
        aqiTipText.textContent = 'Air quality is good. Enjoy the fresh air!';
        tips.push('Perfect for outdoor activities');
        tips.push('Windows can be kept open');
        tips.push('No special precautions needed');
    } else if (aqiValue <= 100) {
        aqiTipText.textContent = 'Air quality is acceptable for most people.';
        tips.push('Sensitive individuals may experience minor issues');
        tips.push('Generally safe for outdoor activities');
    } else if (aqiValue <= 150) {
        aqiTipText.textContent = 'Air quality is moderate. Sensitive groups should be cautious.';
        tips.push('Children and elderly should limit outdoor time');
        tips.push('People with respiratory issues should take care');
        tips.push('Reduce outdoor exercise');
    } else if (aqiValue <= 200) {
        aqiTipText.textContent = 'Air quality is unhealthy for sensitive groups.';
        tips.push('Everyone should limit outdoor activities');
        tips.push('Wear masks when outside');
        tips.push('Keep windows closed');
        tips.push('Use air purifiers if available');
    } else {
        aqiTipText.textContent = 'Air quality is unhealthy. Take precautions.';
        tips.push('Avoid outdoor activities');
        tips.push('Wear N95 masks if going outside');
        tips.push('Keep all windows and doors closed');
        tips.push('Use air purifiers');
        tips.push('Consider staying indoors');
    }

    aqiTipDetails.innerHTML = '';
    tips.forEach(tip => {
        const tipItem = document.createElement('div');
        tipItem.className = 'aqi-tip-item';
        tipItem.textContent = tip;
        aqiTipDetails.appendChild(tipItem);
    });
}

// Function to calculate AQI from pollutant concentration
function calculateAQI(concentration, breakpoints) {
    // Handle values at or below the first breakpoint
    if (concentration <= breakpoints[0].high) {
        const aqi = Math.round(((breakpoints[0].aqiHigh - breakpoints[0].aqiLow) / (breakpoints[0].high - breakpoints[0].low)) * (concentration - breakpoints[0].low) + breakpoints[0].aqiLow);
        return Math.max(0, aqi);
    }

    // Check middle ranges
    for (let i = 1; i < breakpoints.length; i++) {
        if (concentration >= breakpoints[i].low && concentration <= breakpoints[i].high) {
            const aqiLow = breakpoints[i].aqiLow;
            const aqiHigh = breakpoints[i].aqiHigh;
            const aqi = Math.round(((aqiHigh - aqiLow) / (breakpoints[i].high - breakpoints[i].low)) * (concentration - breakpoints[i].low) + aqiLow);
            return aqi;
        }
    }

    // Handle values above the highest breakpoint
    const lastBreakpoint = breakpoints[breakpoints.length - 1];
    if (concentration > lastBreakpoint.high) {
        return 500; // Hazardous
    }

    return 500;
}

// Function to calculate Indian NAQI (National Air Quality Index) from pollutant concentrations
// Indian AQI primarily uses PM2.5 as the main indicator for most cities
function calculateIndianAQI(components) {
    // Indian NAQI breakpoints for PM2.5 (μg/m³) - Official Indian AQI standards
    const pm25Breakpoints = [
        { low: 0, high: 30, aqiLow: 0, aqiHigh: 50 },
        { low: 31, high: 60, aqiLow: 51, aqiHigh: 100 },
        { low: 61, high: 90, aqiLow: 101, aqiHigh: 200 },
        { low: 91, high: 120, aqiLow: 201, aqiHigh: 300 },
        { low: 121, high: 250, aqiLow: 301, aqiHigh: 400 },
        { low: 251, high: 500, aqiLow: 401, aqiHigh: 500 }
    ];

    // Indian NAQI breakpoints for PM10 (μg/m³)
    const pm10Breakpoints = [
        { low: 0, high: 50, aqiLow: 0, aqiHigh: 50 },
        { low: 51, high: 100, aqiLow: 51, aqiHigh: 100 },
        { low: 101, high: 250, aqiLow: 101, aqiHigh: 200 },
        { low: 251, high: 350, aqiLow: 201, aqiHigh: 300 },
        { low: 351, high: 430, aqiLow: 301, aqiHigh: 400 },
        { low: 431, high: 600, aqiLow: 401, aqiHigh: 500 }
    ];

    // Calculate AQI for PM2.5 and PM10
    const pm25AQI = calculateAQI(components.pm2_5, pm25Breakpoints);
    const pm10AQI = calculateAQI(components.pm10, pm10Breakpoints);

    // For Indian cities, PM2.5 is the primary indicator
    // Most Indian weather apps use PM2.5 as the main AQI value
    // We'll use PM2.5 primarily, but also consider PM10 if it's significantly higher
    if (pm10AQI > pm25AQI * 1.2) {
        // If PM10 is 20% higher than PM2.5, use PM10
        return pm10AQI;
    }

    // Otherwise, use PM2.5 (most common for Indian cities)
    return pm25AQI;
}

// Function to calculate US AQI from pollutant concentrations
function calculateUSAQI(components) {
    // PM2.5 breakpoints (μg/m³)
    const pm25Breakpoints = [
        { low: 0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
        { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
        { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
        { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
        { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
        { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 }
    ];

    // PM10 breakpoints (μg/m³)
    const pm10Breakpoints = [
        { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
        { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
        { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
        { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
        { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
        { low: 425, high: 604, aqiLow: 301, aqiHigh: 500 }
    ];

    // NO2 breakpoints (μg/m³) - converted from ppb
    const no2Breakpoints = [
        { low: 0, high: 53, aqiLow: 0, aqiHigh: 50 },
        { low: 54, high: 100, aqiLow: 51, aqiHigh: 100 },
        { low: 101, high: 360, aqiLow: 101, aqiHigh: 150 },
        { low: 361, high: 649, aqiLow: 151, aqiHigh: 200 },
        { low: 650, high: 1249, aqiLow: 201, aqiHigh: 300 },
        { low: 1250, high: 2049, aqiLow: 301, aqiHigh: 500 }
    ];

    // O3 breakpoints (μg/m³) - 8-hour average
    const o3Breakpoints = [
        { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
        { low: 55, high: 70, aqiLow: 51, aqiHigh: 100 },
        { low: 71, high: 85, aqiLow: 101, aqiHigh: 150 },
        { low: 86, high: 105, aqiLow: 151, aqiHigh: 200 },
        { low: 106, high: 200, aqiLow: 201, aqiHigh: 300 },
        { low: 201, high: 400, aqiLow: 301, aqiHigh: 500 }
    ];

    // Calculate AQI for each pollutant
    const pm25AQI = calculateAQI(components.pm2_5, pm25Breakpoints);
    const pm10AQI = calculateAQI(components.pm10, pm10Breakpoints);
    const no2AQI = calculateAQI(components.no2, no2Breakpoints);
    const o3AQI = calculateAQI(components.o3, o3Breakpoints);

    // Return the maximum AQI (worst pollutant)
    return Math.max(pm25AQI, pm10AQI, no2AQI, o3AQI);
}

// Function to get AQI status text and class from actual AQI number
function getAQIStatusFromNumber(aqiNumber) {
    if (aqiNumber <= 50) {
        return { text: 'Good', class: 'good' };
    } else if (aqiNumber <= 100) {
        return { text: 'Fair', class: 'moderate' };
    } else if (aqiNumber <= 150) {
        return { text: 'Moderate', class: 'unhealthy-sensitive' };
    } else if (aqiNumber <= 200) {
        return { text: 'Unhealthy', class: 'unhealthy' };
    } else if (aqiNumber <= 300) {
        return { text: 'Very Unhealthy', class: 'very-unhealthy' };
    } else {
        return { text: 'Hazardous', class: 'hazardous' };
    }
}

// Function to update AQI display from AQICN data (more accurate)
function updateAQIDisplayFromAQICN(aqiData) {
    const aqiNote = document.getElementById('aqiNote');
    const actualAQI = aqiData.aqi;
    const components = aqiData.components;

    // AQICN provides AQI directly (US AQI scale)
    aqiValue.textContent = actualAQI;

    // Show which station the data is from
    var stationName = aqiData.city?.name || 'Unknown station';
    aqiNote.textContent = 'Station: ' + stationName;

    // Update last updated time
    const aqiLastUpdated = document.getElementById('aqiLastUpdated');
    if (aqiLastUpdated) {
        const now = new Date();
        aqiLastUpdated.textContent = 'Last Updated: ' + now.toLocaleString();
    }

    // Get status and update styling
    const status = getAQIStatusFromNumber(actualAQI);
    aqiStatus.textContent = status.text;
    aqiValue.className = 'aqi-number ' + status.class;
    aqiStatus.className = 'aqi-label ' + status.class;
    const displayEl = document.getElementById('aqiDisplayMain');
    if (displayEl) displayEl.className = 'aqi-display-main ' + status.class;

    // Update pollutant values (AQICN: PM in µg/m³, gases may be in µg/m³ or ppb)
    if (pm25) pm25.textContent = components.pm2_5 != null ? components.pm2_5.toFixed(1) + ' µg/m³' : '--';
    if (pm10) pm10.textContent = components.pm10 != null ? components.pm10.toFixed(1) + ' µg/m³' : '--';
    if (no2) no2.textContent = components.no2 != null ? components.no2.toFixed(1) + ' µg/m³' : '--';
    if (o3) o3.textContent = components.o3 != null ? components.o3.toFixed(1) + ' µg/m³' : '--';
    if (co) co.textContent = components.co != null ? Math.round(components.co) + ' ppb' : '--';
    if (so2) so2.textContent = components.so2 != null ? Math.round(components.so2) + ' ppb' : '--';

    // Update AQI scale indicator, cigarette equivalent, solutions, health risks
    const cityName = aqiData.city?.name || '';
    updateAQIDetailSections(actualAQI, components.pm2_5, cityName);
}

// Function to update AQI display from OpenWeatherMap (fallback)
function updateAQIDisplay(aqiData, countryCode) {
    const components = aqiData.list[0].components;
    const aqiNote = document.getElementById('aqiNote');

    let actualAQI;
    if (countryCode === 'IN') {
        actualAQI = calculateIndianAQI(components);
        aqiNote.textContent = 'Based on Indian NAQI (PM2.5 primary)';
    } else {
        actualAQI = calculateUSAQI(components);
        aqiNote.textContent = 'Based on US EPA AQI';
    }

    aqiValue.textContent = actualAQI;

    const aqiLastUpdated = document.getElementById('aqiLastUpdated');
    if (aqiLastUpdated) {
        aqiLastUpdated.textContent = 'Last Updated: ' + new Date().toLocaleString();
    }

    const status = getAQIStatusFromNumber(actualAQI);
    aqiStatus.textContent = status.text;
    aqiValue.className = 'aqi-number ' + status.class;
    aqiStatus.className = 'aqi-label ' + status.class;
    const displayEl = document.getElementById('aqiDisplayMain');
    if (displayEl) displayEl.className = 'aqi-display-main ' + status.class;

    if (pm25) pm25.textContent = components.pm2_5.toFixed(1) + ' µg/m³';
    if (pm10) pm10.textContent = components.pm10.toFixed(1) + ' µg/m³';
    if (no2) no2.textContent = components.no2.toFixed(1) + ' µg/m³';
    if (o3) o3.textContent = components.o3.toFixed(1) + ' µg/m³';
    // CO: OpenWeatherMap returns µg/m³; convert to ppb (1 µg/m³ ≈ 0.873 ppb)
    // CO, SO2: OpenWeatherMap returns µg/m³; convert to ppb
    if (co) co.textContent = components.co != null ? Math.round(components.co * 0.873) + ' ppb' : '--';
    if (so2) so2.textContent = components.so2 != null ? Math.round(components.so2 * 0.382) + ' ppb' : '--';

    const cityName = document.getElementById('cityName')?.textContent || '';
    updateAQIDetailSections(actualAQI, components.pm2_5, cityName);
}

// Cigarette equivalent: Berkeley Earth ~22 µg/m³ PM2.5 per day ≈ 1 cigarette
function getCigaretteEquivalent(pm25) {
    if (!pm25 || pm25 <= 0) return { daily: 0, weekly: 0, monthly: 0 };
    const daily = pm25 / 22;
    return {
        daily: Math.round(daily * 10) / 10,
        weekly: Math.round(daily * 7 * 10) / 10,
        monthly: Math.round(daily * 30 * 10) / 10
    };
}

// Solutions based on AQI (like AQI.in)
function getSolutionsForAQI(aqi) {
    const solutions = [
        { icon: 'Air Purifier', name: 'Air Purifier', action: '', level: '' },
        { icon: 'Car Filter', name: 'Car Filter', action: '', level: '' },
        { icon: 'N95 Mask', name: 'N95 Mask', action: '', level: '' },
        { icon: 'Stay Indoor', name: 'Stay Indoor', action: '', level: '' }
    ];
    if (aqi <= 50) {
        solutions[0].action = 'Optional'; solutions[0].level = 'optional';
        solutions[1].action = 'Optional'; solutions[1].level = 'optional';
        solutions[2].action = 'Not needed'; solutions[2].level = 'none';
        solutions[3].action = 'Optional'; solutions[3].level = 'optional';
    } else if (aqi <= 100) {
        solutions[0].action = 'Recommended'; solutions[0].level = 'recommended';
        solutions[1].action = 'Recommended'; solutions[1].level = 'recommended';
        solutions[2].action = 'Optional'; solutions[2].level = 'optional';
        solutions[3].action = 'Optional'; solutions[3].level = 'optional';
    } else if (aqi <= 150) {
        solutions[0].action = 'Turn On'; solutions[0].level = 'must';
        solutions[1].action = 'Recommended'; solutions[1].level = 'recommended';
        solutions[2].action = 'Recommended'; solutions[2].level = 'recommended';
        solutions[3].action = 'Sensitive groups'; solutions[3].level = 'moderate';
    } else if (aqi <= 200) {
        solutions[0].action = 'Turn On'; solutions[0].level = 'must';
        solutions[1].action = 'Must'; solutions[1].level = 'must';
        solutions[2].action = 'Must'; solutions[2].level = 'must';
        solutions[3].action = 'Must'; solutions[3].level = 'must';
    } else {
        solutions[0].action = 'Turn On'; solutions[0].level = 'must';
        solutions[1].action = 'Must'; solutions[1].level = 'must';
        solutions[2].action = 'Must'; solutions[2].level = 'must';
        solutions[3].action = 'Must'; solutions[3].level = 'must';
    }
    return solutions;
}

// AQI range labels for health risk display
function getAQIRangeLabel(aqi) {
    if (aqi <= 50) return 'Good (0-50)';
    if (aqi <= 100) return 'Moderate (51-100)';
    if (aqi <= 150) return 'Poor (101-150)';
    if (aqi <= 200) return 'Unhealthy (151-200)';
    if (aqi <= 300) return 'Severe (201-300)';
    return 'Hazardous (301+)';
}

// Health risks with full content for 6 conditions (AQI.in style)
function getHealthRisksForAQI(aqi) {
    const aqiRange = getAQIRangeLabel(aqi);
    const risks = {
        asthma: { name: 'Asthma', risk: '', badge: '', aqiRange, symptoms: '', dos: [], donts: [], icon: '💨' },
        heart: { name: 'Heart Issues', risk: '', badge: '', aqiRange, symptoms: '', dos: [], donts: [], icon: '❤️' },
        allergies: { name: 'Allergies', risk: '', badge: '', aqiRange, symptoms: '', dos: [], donts: [], icon: '🤧' },
        sinus: { name: 'Sinus', risk: '', badge: '', aqiRange, symptoms: '', dos: [], donts: [], icon: '👃' },
        coldflu: { name: 'Cold/Flu', risk: '', badge: '', aqiRange, symptoms: '', dos: [], donts: [], icon: '🤒' },
        copd: { name: 'Chronic (COPD)', risk: '', badge: '', aqiRange, symptoms: '', dos: [], donts: [], icon: '🫁' }
    };

    if (aqi <= 50) {
        Object.assign(risks.asthma, { risk: 'Low', badge: 'Low chances of Asthma', symptoms: 'Minimal symptoms. Air quality is satisfactory for most people.', dos: ['Maintain regular activities', 'Enjoy outdoor time'], donts: [] });
        Object.assign(risks.heart, { risk: 'Low', badge: 'Low chances of Heart Issues', symptoms: 'Cardiovascular stress from air pollution is minimal.', dos: ['Maintain regular activities'], donts: [] });
        Object.assign(risks.allergies, { risk: 'Low', badge: 'Low chances of Allergies', symptoms: 'Allergy triggers from air pollution are minimal.', dos: ['Normal precautions'], donts: [] });
        Object.assign(risks.sinus, { risk: 'Low', badge: 'Low chances of Sinus issues', symptoms: 'Sinus irritation from pollutants is minimal.', dos: ['Normal precautions'], donts: [] });
        Object.assign(risks.coldflu, { risk: 'Low', badge: 'Low chances of Cold/Flu aggravation', symptoms: 'Respiratory infection risk from pollution is low.', dos: ['Practice good hygiene'], donts: [] });
        Object.assign(risks.copd, { risk: 'Low', badge: 'Low chances of COPD symptoms', symptoms: 'Air quality is satisfactory for COPD patients.', dos: ['Continue prescribed medications'], donts: [] });
    } else if (aqi <= 100) {
        Object.assign(risks.asthma, { risk: 'Mild', badge: 'Mild chances of Asthma', symptoms: 'Minor symptoms including occasional wheezing or mild shortness of breath.', dos: ['Limit outdoor activities when AQI is moderate', 'Carry inhaler', 'Monitor symptoms'], donts: ['Avoid prolonged heavy exercise outdoors'] });
        Object.assign(risks.heart, { risk: 'Mild', badge: 'Mild chances of Heart Issues', symptoms: 'Slight increase in cardiovascular strain for sensitive individuals.', dos: ['Stay hydrated', 'Limit intense outdoor exercise'], donts: ['Avoid strenuous activity in high-pollution hours'] });
        Object.assign(risks.allergies, { risk: 'Mild', badge: 'Mild chances of Allergies', symptoms: 'Increased allergy symptoms including sneezing and itchy eyes.', dos: ['Take prescribed allergy medications', 'Rinse nasal passages'], donts: ['Avoid known outdoor triggers'] });
        Object.assign(risks.sinus, { risk: 'Mild', badge: 'Mild chances of Sinus issues', symptoms: 'Mild sinus congestion or pressure may occur.', dos: ['Use saline nasal rinse', 'Stay hydrated'], donts: ['Avoid dusty or smoky environments'] });
        Object.assign(risks.coldflu, { risk: 'Mild', badge: 'Mild chances of Cold/Flu aggravation', symptoms: 'Pollution may slightly aggravate respiratory infections.', dos: ['Rest adequately', 'Stay hydrated'], donts: ['Avoid exposure to smoke or fumes'] });
        Object.assign(risks.copd, { risk: 'Mild', badge: 'Mild chances of COPD symptoms', symptoms: 'Minor breathing difficulty possible for COPD patients.', dos: ['Take prescribed medications', 'Limit outdoor exertion'], donts: ['Avoid prolonged outdoor exposure'] });
    } else if (aqi <= 150) {
        Object.assign(risks.asthma, { risk: 'Moderate', badge: 'Moderate chances of Asthma', symptoms: 'Moderate symptoms including frequent wheezing, noticeable shortness of breath, chest tightness, and persistent cough.', dos: ['Limit outdoor activities when AQI is poor', 'Clean indoor air with an air purifier', 'Soothe respiratory tract with herbal teas or warm water'], donts: ['Exercise outdoors without a mask', 'Stay in smoky areas with strong fumes'] });
        Object.assign(risks.heart, { risk: 'Moderate', badge: 'Moderate chances of Heart Issues', symptoms: 'Increased cardiovascular stress. Chest discomfort or palpitations possible.', dos: ['Limit exertion', 'Rest when needed', 'Use air purifier indoors'], donts: ['Engage in strenuous outdoor activity', 'Expose yourself to heavy traffic areas'] });
        Object.assign(risks.allergies, { risk: 'Moderate', badge: 'Moderate chances of Allergies', symptoms: 'Worsened allergy symptoms. Runny nose, itchy throat, and congestion likely.', dos: ['Use air purifier', 'Take antihistamines as prescribed', 'Keep windows closed'], donts: ['Spend extended time outdoors', 'Ignore allergy symptoms'] });
        Object.assign(risks.sinus, { risk: 'Moderate', badge: 'Moderate chances of Sinus issues', symptoms: 'Sinus pressure, congestion, and headaches may increase.', dos: ['Use humidifier', 'Nasal irrigation', 'Stay indoors when possible'], donts: ['Expose to irritants', 'Ignore sinus pain'] });
        Object.assign(risks.coldflu, { risk: 'Moderate', badge: 'Moderate chances of Cold/Flu aggravation', symptoms: 'Pollution can worsen cold and flu symptoms, prolonging recovery.', dos: ['Rest indoors', 'Use air purifier', 'Stay hydrated'], donts: ['Go outside unnecessarily', 'Expose to secondhand smoke'] });
        Object.assign(risks.copd, { risk: 'Moderate', badge: 'Moderate chances of COPD symptoms', symptoms: 'Increased breathing difficulty, fatigue, and mucus production.', dos: ['Use air purifier indoors', 'Take medications as prescribed', 'Limit outdoor time'], donts: ['Exercise outdoors', 'Ignore worsening symptoms'] });
    } else if (aqi <= 200) {
        Object.assign(risks.asthma, { risk: 'High', badge: 'High chances of Asthma', symptoms: 'Severe symptoms including intense wheezing, severe shortness of breath, significant chest tightness, and persistent coughing that may disrupt daily activities.', dos: ['Avoid going outside, keep windows closed', 'Take prescribed medications', 'Use air purifiers in bedrooms and living areas'], donts: ['Smoke or expose to secondhand smoke', 'Engage in physical exertion outdoors'] });
        Object.assign(risks.heart, { risk: 'High', badge: 'High chances of Heart Issues', symptoms: 'Significant cardiovascular stress. Risk of angina, arrhythmia, or heart attack increases.', dos: ['Stay indoors', 'Rest', 'Use air purifier', 'Take prescribed heart medications'], donts: ['Exercise outdoors', 'Expose to pollution', 'Ignore chest pain'] });
        Object.assign(risks.allergies, { risk: 'High', badge: 'High chances of Allergies', symptoms: 'Severe allergy flare-ups. Respiratory and eye symptoms may be debilitating.', dos: ['Stay indoors', 'Use N95 mask if going out', 'Air purifier on high', 'Take prescribed meds'], donts: ['Spend time outdoors', 'Open windows', 'Ignore severe symptoms'] });
        Object.assign(risks.sinus, { risk: 'High', badge: 'High chances of Sinus issues', symptoms: 'Severe sinus pain, congestion, and possible sinusitis.', dos: ['Stay indoors', 'Use air purifier', 'Warm compress', 'Saline rinses'], donts: ['Go outside without mask', 'Expose to irritants'] });
        Object.assign(risks.coldflu, { risk: 'High', badge: 'High chances of Cold/Flu aggravation', symptoms: 'Pollution severely aggravates respiratory infections. Recovery delayed.', dos: ['Stay indoors', 'Rest completely', 'Use air purifier', 'Hydrate well'], donts: ['Go outside', 'Expose to smoke or fumes'] });
        Object.assign(risks.copd, { risk: 'High', badge: 'High chances of COPD symptoms', symptoms: 'Severe breathing difficulty. Risk of exacerbation is high.', dos: ['Stay indoors', 'Use supplemental oxygen if prescribed', 'Air purifier', 'Take rescue medications'], donts: ['Go outside', 'Exert yourself', 'Ignore severe breathlessness'] });
    } else {
        Object.assign(risks.asthma, { risk: 'Very High', badge: 'Very High chances of Asthma', symptoms: 'Emergency-level symptoms. Intense wheezing, severe breathlessness, and potential asthma attack.', dos: ['Stay indoors with windows closed', 'Use air purifier', 'Take rescue inhaler', 'Seek medical help if severe'], donts: ['Go outside', 'Exercise', 'Ignore severe symptoms'] });
        Object.assign(risks.heart, { risk: 'Very High', badge: 'Very High chances of Heart Issues', symptoms: 'Critical cardiovascular risk. Immediate medical attention may be needed for chest pain or severe symptoms.', dos: ['Stay indoors', 'Rest', 'Seek emergency care if chest pain', 'Use air purifier'], donts: ['Go outside', 'Exert yourself', 'Ignore chest pain or palpitations'] });
        Object.assign(risks.allergies, { risk: 'Very High', badge: 'Very High chances of Allergies', symptoms: 'Extreme allergy symptoms. Anaphylaxis risk in severe cases.', dos: ['Stay indoors', 'N95 mask if must go out', 'EpiPen ready if prescribed', 'Air purifier'], donts: ['Go outside', 'Ignore severe swelling or breathing difficulty'] });
        Object.assign(risks.sinus, { risk: 'Very High', badge: 'Very High chances of Sinus issues', symptoms: 'Severe sinusitis risk. Intense pain and infection possible.', dos: ['Stay indoors', 'See doctor if severe', 'Air purifier', 'Humidifier'], donts: ['Go outside', 'Ignore severe pain or fever'] });
        Object.assign(risks.coldflu, { risk: 'Very High', badge: 'Very High chances of Cold/Flu aggravation', symptoms: 'Pollution can cause severe complications with respiratory infections.', dos: ['Stay indoors', 'Rest', 'Seek medical care if severe', 'Air purifier'], donts: ['Go outside', 'Expose to any irritants'] });
        Object.assign(risks.copd, { risk: 'Very High', badge: 'Very High chances of COPD symptoms', symptoms: 'Life-threatening exacerbation risk. Severe breathlessness and potential respiratory failure.', dos: ['Stay indoors', 'Use oxygen', 'Have rescue medications ready', 'Call emergency if severe'], donts: ['Go outside', 'Exert yourself', 'Ignore severe breathlessness'] });
    }
    return risks;
}

// Fetch full station data from AQICN feed (real-time AQI, PM2.5, PM10, temp, humidity)
async function fetchStationFeed(uid) {
    const url = `https://api.waqi.info/feed/@${uid}/?token=${AQICN_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok' && data.data) return data.data;
    return null;
}

// Fetch monitoring stations and enrich with real-time per-station data
async function getCityLocations(lat, lon, cityName) {
    const radius = 0.2; // ~22km bounding box
    const minLat = lat - radius;
    const minLon = lon - radius;
    const maxLat = lat + radius;
    const maxLon = lon + radius;
    const latlng = `${minLat},${minLon},${maxLat},${maxLon}`;
    const MAX_STATIONS = 15; // Limit to avoid rate limits
    const MAX_FEED_FETCH = 12; // Parallel feed fetches

    try {
        let rawStations = [];

        // Try map bounds first
        const url = `${AQICN_MAP_BOUNDS_URL}?latlng=${latlng}&token=${AQICN_TOKEN}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'ok' && data.data && Array.isArray(data.data) && data.data.length > 0) {
            rawStations = data.data.slice(0, MAX_STATIONS);
        } else {
            // Fallback: search by city name
            const searchUrl = `${AQICN_SEARCH_URL}?keyword=${encodeURIComponent(cityName)}&token=${AQICN_TOKEN}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            if (searchData.status === 'ok' && searchData.data && Array.isArray(searchData.data)) {
                rawStations = searchData.data.slice(0, MAX_STATIONS);
            }
        }

        if (rawStations.length === 0) return [];

        // Fetch full feed for each station with uid to get real-time PM2.5, PM10, temp, humidity
        const uids = rawStations.filter(s => s.uid).map(s => s.uid).slice(0, MAX_FEED_FETCH);
        const feedPromises = uids.map(uid => fetchStationFeed(uid));
        const feeds = await Promise.allSettled(feedPromises);

        const feedByUid = {};
        feeds.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value) {
                feedByUid[uids[i]] = result.value;
            }
        });

        return rawStations.map(item => {
            const feed = feedByUid[item.uid] || null;
            const iaqi = feed?.iaqi || item.iaqi || {};

            const aqiVal = feed?.aqi ?? item.aqi;
            const aqiNum = (aqiVal === '-' || aqiVal === undefined || aqiVal === null) ? null : parseInt(String(aqiVal), 10);

            const stationName = (item.station && item.station.name) ? item.station.name : (item.name || feed?.city?.name || `Station ${item.uid || ''}`);

            const pm25Val = (iaqi.pm25 && iaqi.pm25.v) != null ? iaqi.pm25.v : (item.pm25 ?? null);
            const pm10Val = (iaqi.pm10 && iaqi.pm10.v) != null ? iaqi.pm10.v : (item.pm10 ?? null);
            const tempVal = (iaqi.t && iaqi.t.v) != null ? iaqi.t.v : null;
            const humiVal = (iaqi.h && iaqi.h.v) != null ? iaqi.h.v : null;

            return {
                location: stationName,
                aqi: isNaN(aqiNum) ? null : aqiNum,
                status: aqiNum != null && !isNaN(aqiNum) ? getAQIStatusFromNumber(aqiNum).text : '--',
                pm25: pm25Val,
                pm10: pm10Val,
                temp: tempVal,
                humidity: humiVal,
                lat: item.lat || (feed?.city?.geo?.[0]) || null,
                lon: item.lon || (feed?.city?.geo?.[1]) || null
            };
        });
    } catch (err) {
        console.warn('Could not fetch city locations:', err);
    }
    return [];
}

function updateLocationsTable(locations, cityName, weatherData) {
    const container = document.getElementById('locationsTableSection');
    const tableBody = document.getElementById('locationsTableBody');
    const locationsTitle = document.getElementById('locationsSectionTitle');

    if (!container || !tableBody) return;

    if (!locations || locations.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    if (locationsTitle) {
        const displayName = cityName || 'Area';
        locationsTitle.textContent = `${displayName}'s Locations`;
    }

    const defaultTemp = weatherData?.main?.temp != null ? Math.round(weatherData.main.temp) : null;
    const defaultHumidity = weatherData?.main?.humidity != null ? weatherData.main.humidity : null;

    let sortCol = 'location';
    let sortDir = 1;

    const renderTable = () => {
        const sorted = [...locations].sort((a, b) => {
            let va = a[sortCol], vb = b[sortCol];
            if (sortCol === 'location') {
                va = (va || '').toString().toLowerCase();
                vb = (vb || '').toString().toLowerCase();
                return sortDir * va.localeCompare(vb);
            }
            va = va == null ? -999 : (typeof va === 'number' ? va : parseInt(va, 10));
            vb = vb == null ? -999 : (typeof vb === 'number' ? vb : parseInt(vb, 10));
            return sortDir * (va - vb);
        });

        tableBody.innerHTML = sorted.map(loc => {
            const pm25Val = loc.pm25 != null ? Math.round(loc.pm25) : '--';
            const pm10Val = loc.pm10 != null ? Math.round(loc.pm10) : '--';
            const tempVal = loc.temp != null ? Math.round(loc.temp) : (defaultTemp != null ? defaultTemp : '--');
            const humiVal = loc.humidity != null ? Math.round(loc.humidity) : (defaultHumidity != null ? defaultHumidity : '--');
            const tempStr = typeof tempVal === 'number' ? `${tempVal}°C` : tempVal;
            const humiStr = typeof humiVal === 'number' ? `${humiVal}%` : humiVal;
            const statusClass = loc.aqi != null ? getAQIStatusFromNumber(loc.aqi).class : '';
            return `
                <tr>
                    <td class="loc-name">${escapeHtml(loc.location)}</td>
                    <td><span class="status-pill ${statusClass}">${escapeHtml(loc.status)}</span></td>
                    <td class="loc-aqi">${loc.aqi != null ? loc.aqi : '--'}</td>
                    <td>${pm25Val}</td>
                    <td>${pm10Val}</td>
                    <td>${tempStr}</td>
                    <td>${humiStr}</td>
                </tr>
            `;
        }).join('');
    };

    const handleSort = (col) => {
        if (sortCol === col) sortDir = -sortDir;
        else { sortCol = col; sortDir = 1; }
        renderTable();
    };

    renderTable();

    // Use event delegation for sort
    const table = container.querySelector('.locations-table');
    if (table) {
        table.onclick = (e) => {
            const th = e.target.closest('th[data-sort]');
            if (th) handleSort(th.dataset.sort);
        };
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Air Quality Calendar
let calendarState = { year: 2026, month: 1, aqiByDate: {}, cityName: '' };

async function getAQIForecast(lat, lon) {
    const url = `${AQI_FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Forecast fetch failed');
    return res.json();
}

async function getAQIHistory(lat, lon, start, end) {
    const url = `${AQI_HISTORY_URL}?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${WEATHER_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('History fetch failed');
    return res.json();
}

function buildAQIByDateFromOWM(list, countryCode) {
    const byDate = {};
    if (!list || !Array.isArray(list)) return byDate;
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const aqi = countryCode === 'IN' ? calculateIndianAQI(item.components) : calculateUSAQI(item.components);
        if (!byDate[key] || aqi > (byDate[key] || 0)) byDate[key] = aqi;
    });
    return byDate;
}

function getAQIClass(aqi) {
    if (aqi == null) return '';
    if (aqi <= 50) return 'aqi-good';
    if (aqi <= 100) return 'aqi-moderate';
    if (aqi <= 150) return 'aqi-poor';
    if (aqi <= 200) return 'aqi-unhealthy';
    if (aqi <= 300) return 'aqi-severe';
    return 'aqi-hazardous';
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function renderAQICalendar() {
    const grid = document.getElementById('aqiCalendarGrid');
    const yearEl = document.getElementById('aqiCalendarYear');
    const cityEl = document.getElementById('aqiCalendarCity');
    const monthLabel = document.getElementById('calMonthLabel');

    if (!grid) return;

    const { year, month, aqiByDate, cityName } = calendarState;
    if (yearEl) yearEl.textContent = year;
    if (cityEl) cityEl.textContent = cityName || '--';
    if (monthLabel) monthLabel.textContent = `${MONTH_NAMES[month - 1]} ${year}`;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDow = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    let html = '';
    WEEKDAYS.forEach(d => { html += `<div class="cal-weekday">${d}</div>`; });

    const leadingBlanks = startDow;
    for (let i = 0; i < leadingBlanks; i++) html += '<div class="cal-day empty"></div>';

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const aqi = aqiByDate[key];
        const aqiClass = getAQIClass(aqi);
        const dateStr = `${d} ${MONTH_NAMES[month - 1].slice(0, 3)}`;
        const aqiStr = aqi != null ? aqi : '-';
        html += `<div class="cal-day ${aqiClass}"><span class="cal-date">${dateStr}</span><span class="cal-aqi">${aqiStr}</span></div>`;
    }

    grid.innerHTML = html;
}

function initAQICalendar(aqiByDate, cityName, currentAqi) {
    const now = new Date();
    calendarState = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        aqiByDate: aqiByDate || {},
        cityName: cityName || ''
    };

    const todayKey = `${calendarState.year}-${String(calendarState.month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (currentAqi != null && !calendarState.aqiByDate[todayKey]) {
        calendarState.aqiByDate[todayKey] = currentAqi;
    }

    renderAQICalendar();

    const prevBtn = document.getElementById('calPrevMonth');
    const nextBtn = document.getElementById('calNextMonth');
    if (prevBtn) prevBtn.onclick = () => {
        if (calendarState.month === 1) { calendarState.year--; calendarState.month = 12; }
        else calendarState.month--;
        renderAQICalendar();
    };
    if (nextBtn) nextBtn.onclick = () => {
        if (calendarState.month === 12) { calendarState.year++; calendarState.month = 1; }
        else calendarState.month++;
        renderAQICalendar();
    };
}

async function fetchAndUpdateAQICalendar(lat, lon, cityName, countryCode, currentAqi) {
    const aqiByDate = {};
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
    const thisMonthEnd = Math.floor(Date.now() / 1000);

    try {
        const [forecastRes, historyRes] = await Promise.allSettled([
            getAQIForecast(lat, lon),
            getAQIHistory(lat, lon, thisMonthStart, thisMonthEnd)
        ]);

        if (forecastRes.status === 'fulfilled' && forecastRes.value?.list) {
            Object.assign(aqiByDate, buildAQIByDateFromOWM(forecastRes.value.list, countryCode));
        }
        if (historyRes.status === 'fulfilled' && historyRes.value?.list) {
            Object.assign(aqiByDate, buildAQIByDateFromOWM(historyRes.value.list, countryCode));
        }
    } catch (e) {
        console.warn('AQI calendar data fetch failed:', e);
    }

    initAQICalendar(aqiByDate, cityName, currentAqi);
}

function updateAQIDetailSections(aqi, pm25Value, cityName) {
    // AQI scale indicator position (0-500 maps to 0-100%)
    const indicator = document.getElementById('aqiScaleIndicator');
    if (indicator) {
        const percent = Math.min(100, (aqi / 500) * 100);
        indicator.style.left = percent + '%';
    }

    // Cigarette equivalent
    const cig = getCigaretteEquivalent(pm25Value);
    const cigEl = document.getElementById('cigaretteEquivalent');
    const cigWeekly = document.getElementById('cigWeekly');
    const cigMonthly = document.getElementById('cigMonthly');
    if (cigEl) cigEl.textContent = cig.daily.toFixed(1);
    if (cigWeekly) cigWeekly.textContent = cig.weekly + ' Cigarettes';
    if (cigMonthly) cigMonthly.textContent = cig.monthly + ' Cigarettes';

    // Solutions
    const solutionsGrid = document.getElementById('aqiSolutionsGrid');
    if (solutionsGrid) {
        const solutions = getSolutionsForAQI(aqi);
        solutionsGrid.innerHTML = solutions.map(s => `
            <div class="solution-item ${s.level}">
                <span class="solution-name">${s.name}</span>
                <span class="solution-action">${s.action}</span>
            </div>
        `).join('');
    }

    // Health risks (6 conditions with pills)
    updateHealthRisksPanel(aqi, cityName || null);
}

let currentHealthRisksData = null;

function updateHealthRisksPanel(aqi, cityName) {
    currentHealthRisksData = getHealthRisksForAQI(aqi);
    const cityEl = document.getElementById('healthRisksCity');
    if (cityEl && cityName) cityEl.textContent = cityName;

    const pills = document.querySelectorAll('.health-pill');
    pills.forEach(p => p.classList.remove('active'));
    const activePill = document.querySelector('.health-pill[data-condition="asthma"]');
    if (activePill) activePill.classList.add('active');

    renderHealthCondition('asthma');

    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(x => x.classList.remove('active'));
            pill.classList.add('active');
            pill.setAttribute('aria-pressed', 'true');
            pills.forEach(x => { if (x !== pill) x.setAttribute('aria-pressed', 'false'); });
            renderHealthCondition(pill.dataset.condition);
        };
    });
}

function renderHealthCondition(condition) {
    if (!currentHealthRisksData || !currentHealthRisksData[condition]) return;
    const r = currentHealthRisksData[condition];

    const illustEl = document.getElementById('healthIllustration');
    const badgeEl = document.getElementById('healthRiskBadge');
    const titleEl = document.getElementById('healthConditionTitle');
    const stmtEl = document.getElementById('healthRiskStatement');
    const symptomsEl = document.getElementById('healthSymptoms');
    const dosList = document.getElementById('healthDosList');
    const dontsList = document.getElementById('healthDontsList');

    if (illustEl) illustEl.textContent = r.icon;
    if (badgeEl) badgeEl.textContent = r.badge;
    if (titleEl) titleEl.textContent = r.name;
    if (stmtEl) stmtEl.innerHTML = `Risk of ${r.name} symptoms is <strong class="risk-highlight">${r.risk}</strong> when AQI is <strong class="risk-highlight">${r.aqiRange}</strong>`;
    if (symptomsEl) symptomsEl.textContent = r.symptoms;
    if (dosList) {
        dosList.innerHTML = r.dos.map(d => `<li><span class="do-icon">✓</span> ${escapeHtml(d)}</li>`).join('');
    }
    if (dontsList) {
        dontsList.innerHTML = r.donts.map(d => `<li><span class="dont-icon">✗</span> ${escapeHtml(d)}</li>`).join('');
    }
}

// Main function to fetch and display data
async function fetchData(city) {
    showLoading();

    try {
        // Get coordinates
        const coords = await getCoordinates(city);

        // For Indian cities, try AQICN first (more accurate), fallback to OpenWeatherMap
        // For other cities, use OpenWeatherMap
        let aqiData = null;
        let useAQICN = false;

        if (coords.countryCode === 'IN') {
            // Try AQICN first for Indian cities (more accurate)
            try {
                aqiData = await getAQIDataFromAQICN(coords.lat, coords.lon);
                useAQICN = true;
            } catch (aqicnErr) {
                // Fallback to OpenWeatherMap if AQICN fails
                console.log('AQICN failed, using OpenWeatherMap:', aqicnErr);
                aqiData = await getAQIData(coords.lat, coords.lon);
            }
        } else {
            // Use OpenWeatherMap for non-Indian cities
            aqiData = await getAQIData(coords.lat, coords.lon);
        }

        // Get weather and forecast data in parallel
        const [weatherData, forecastData] = await Promise.all([
            getWeatherData(coords.lat, coords.lon),
            getForecastData(coords.lat, coords.lon)
        ]);

        // Update displays
        updateWeatherDisplay(weatherData);
        updateHourlyForecast(forecastData);
        updateDailyForecast(forecastData);

        // Update high/low from forecast
        const todayForecasts = forecastData.list.filter(item => {
            const itemDate = new Date(item.dt * 1000);
            const today = new Date();
            return itemDate.toDateString() === today.toDateString();
        });

        if (todayForecasts.length > 0) {
            const temps = todayForecasts.map(item => item.main.temp);
            tempHigh.textContent = Math.round(Math.max(...temps));
            tempLow.textContent = Math.round(Math.min(...temps));
        }

        // Get AQI value for carousel
        let aqiValue = 100;

        // Fetch all city stations and compute average AQI
        var locations = [];
        try {
            locations = await getCityLocations(coords.lat, coords.lon, coords.cityName || city);
        } catch (locErr) {
            console.warn('Locations fetch failed:', locErr);
        }

        // Filter stations that have a valid AQI number
        var validStations = locations.filter(function (loc) {
            return loc.aqi != null && !isNaN(loc.aqi);
        });

        if (validStations.length > 0) {
            // Compute averages from all stations
            var totalAQI = 0;
            var totalPM25 = 0, pm25Count = 0;
            var totalPM10 = 0, pm10Count = 0;
            var totalCO = 0, coCount = 0;
            var totalSO2 = 0, so2Count = 0;
            var totalNO2 = 0, no2Count = 0;
            var totalO3 = 0, o3Count = 0;

            validStations.forEach(function (s) {
                totalAQI += s.aqi;
                if (s.pm25 != null) { totalPM25 += s.pm25; pm25Count++; }
                if (s.pm10 != null) { totalPM10 += s.pm10; pm10Count++; }
            });

            var avgAQI = Math.round(totalAQI / validStations.length);
            var avgPM25 = pm25Count > 0 ? (totalPM25 / pm25Count) : null;
            var avgPM10 = pm10Count > 0 ? (totalPM10 / pm10Count) : null;

            // Build averaged data object and display it
            var avgData = {
                aqi: avgAQI,
                city: { name: (coords.cityName || city) + ' (avg of ' + validStations.length + ' stations)' },
                components: {
                    pm2_5: avgPM25,
                    pm10: avgPM10,
                    co: null,
                    so2: null,
                    no2: null,
                    o3: null
                }
            };

            // If we have AQICN single-station data, use its gas values as fallback
            if (useAQICN && aqiData && aqiData.components) {
                avgData.components.co = aqiData.components.co;
                avgData.components.so2 = aqiData.components.so2;
                avgData.components.no2 = aqiData.components.no2;
                avgData.components.o3 = aqiData.components.o3;
            }

            aqiValue = avgAQI;
            updateAQIDisplayFromAQICN(avgData);

        } else {
            // Fallback: use single station data if no multi-station data
            try {
                if (useAQICN && aqiData && aqiData.aqi !== undefined) {
                    aqiValue = aqiData.aqi;
                    updateAQIDisplayFromAQICN(aqiData);
                } else if (aqiData && aqiData.list && aqiData.list[0]) {
                    if (coords.countryCode === 'IN') {
                        aqiValue = calculateIndianAQI(aqiData.list[0].components);
                    } else {
                        aqiValue = calculateUSAQI(aqiData.list[0].components);
                    }
                    updateAQIDisplay(aqiData, coords.countryCode);
                }
            } catch (aqiErr) {
                console.error('Error calculating AQI:', aqiErr);
                aqiValue = 100;
            }
        }

        // Update analytics cards with real data
        try {
            updateRunningCard(weatherData, forecastData, aqiValue);
            updateAQICompactCard(aqiValue, getAQIStatusFromNumber(aqiValue).text);
            updatePollenCard(weatherData);
            updateUVCard(weatherData);
            updateHumidityCard(weatherData);
        } catch (analyticsErr) {
            console.error('Error updating analytics cards:', analyticsErr);
        }

        // Update carousel cards with real data
        updateSunriseCard(weatherData);
        updateOutdoorCard(weatherData, aqiValue);
        updateAQITipsCard(aqiValue, getAQIStatusFromNumber(aqiValue).text);

        // Update locations table with already-fetched station data
        updateLocationsTable(locations, coords.cityName || city, weatherData);

        // Air Quality Calendar (historical + forecast from OpenWeatherMap)
        fetchAndUpdateAQICalendar(coords.lat, coords.lon, coords.cityName || city, coords.countryCode, aqiValue);

        // Store current city for auto-refresh
        currentCity = city;

        // Update AQI map position and station markers
        updateAQIMap(coords.lat, coords.lon, coords.cityName || city, locations);

        // Clear existing auto-refresh interval
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }

        // Set up auto-refresh every 5 minutes (300000 milliseconds)
        // This ensures data stays current without hitting API limits
        autoRefreshInterval = setInterval(function () {
            if (currentCity) {
                fetchData(currentCity);
            }
        }, 300000); // 5 minutes

        hideLoading();
    } catch (err) {
        showError(err.message);
    }
}

// Event listener for search button
searchBtn.addEventListener('click', function () {
    const city = cityInput.value.trim();

    if (city === '') {
        showError('Please enter a city name.');
        return;
    }

    fetchData(city);
});

// Event listener for Enter key in input
cityInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Load default city on page load (optional)
window.addEventListener('load', function () {
    // Initialize carousel
    initCarousel();

    // Initialize tab switching
    initTabSwitching();

    // Initialize navigation pills
    initSectionPills();

    // Initialize AQI map
    initAQIMap();

    // You can set a default city here, or leave it empty
    // fetchData('Mumbai');
});

// ===== Tab Switching =====
const WEATHER_PILLS = [
    { label: 'Weather', target: 'weatherCard' },
    { label: 'Hourly', target: 'hourlyForecast' },
    { label: 'Daily', target: 'dailyForecast' },
    { label: 'Analytics', target: 'analyticsSection' },
    { label: 'Sun Path', target: 'sunPathCard' }
];

const AQI_PILLS = [
    { label: 'AQI', target: 'aqiSection' },
    { label: 'PM2.5', target: 'sectionPM25' },
    { label: 'PM10', target: 'sectionPM10' },
    { label: 'CO', target: 'sectionCO' },
    { label: 'SO₂', target: 'sectionSO2' },
    { label: 'NO₂', target: 'sectionNO2' },
    { label: 'O₃', target: 'sectionO3' },
    { label: 'History', target: 'aqiCalendarSection' }
];

let currentTab = 'weather';

function initTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-switch-btn');

    tabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const target = btn.dataset.tabTarget;
            if (target === currentTab) return;

            currentTab = target;

            // Update active state on buttons
            tabBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // Show/hide sections based on data-tab
            const allSections = document.querySelectorAll('[data-tab]');
            allSections.forEach(function (section) {
                var tabAttr = section.getAttribute('data-tab');
                if (tabAttr === target) {
                    section.classList.remove('tab-hidden');
                } else {
                    section.classList.add('tab-hidden');
                }
            });

            // Update navigation pills
            updateSectionPills(target);
        });
    });

    // Initialize: hide AQI sections by default (Weather is active)
    var allSections = document.querySelectorAll('[data-tab]');
    allSections.forEach(function (section) {
        if (section.getAttribute('data-tab') === 'aqi') {
            section.classList.add('tab-hidden');
        }
    });
}

function updateSectionPills(tab) {
    var pillsContainer = document.getElementById('sectionPills');
    if (!pillsContainer) return;

    var pillsData = (tab === 'aqi') ? AQI_PILLS : WEATHER_PILLS;

    pillsContainer.innerHTML = pillsData.map(function (pill, index) {
        var activeClass = index === 0 ? ' active' : '';
        return '<button class="section-pill' + activeClass + '" data-scroll-to="' + pill.target + '">' + pill.label + '</button>';
    }).join('');

    // Re-bind click handlers
    initSectionPills();
}

function initSectionPills() {
    var pills = document.querySelectorAll('.section-pill');

    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            var targetId = pill.dataset.scrollTo;
            var targetEl = document.getElementById(targetId);

            // Update active state
            pills.forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');

            if (targetEl) {
                // Scroll to element with offset for sticky headers
                var offset = 140;
                var elementPosition = targetEl.getBoundingClientRect().top;
                var offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== AQI Map (Leaflet) =====
var aqiMap = null;
var aqiMapMarker = null;
var aqiStationMarkers = [];

function getAQIMarkerColor(aqi) {
    if (aqi == null || isNaN(aqi)) return { bg: '#6b7280', border: '#4b5563' }; // gray
    if (aqi <= 50) return { bg: '#22c55e', border: '#16a34a' };   // green
    if (aqi <= 100) return { bg: '#eab308', border: '#ca8a04' };  // amber
    if (aqi <= 150) return { bg: '#f97316', border: '#ea580c' };  // orange
    if (aqi <= 200) return { bg: '#ef4444', border: '#dc2626' };  // red
    if (aqi <= 300) return { bg: '#a855f7', border: '#9333ea' };  // purple
    return { bg: '#78716c', border: '#57534e' };                  // brown/hazardous
}

function initAQIMap() {
    var mapContainer = document.getElementById('aqiMapContainer');
    if (!mapContainer || typeof L === 'undefined') return;

    // Initialize Leaflet map centered on India by default
    aqiMap = L.map(mapContainer, {
        center: [19.076, 72.877], // Mumbai default
        zoom: 11,
        zoomControl: true,
        attributionControl: true
    });

    // Dark-themed base tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
    }).addTo(aqiMap);

    // Fix map rendering in hidden/resized containers
    setTimeout(function () {
        aqiMap.invalidateSize();
    }, 500);

    // Expand button toggle
    var expandBtn = document.getElementById('mapExpandBtn');
    if (expandBtn) {
        expandBtn.addEventListener('click', function () {
            var sidebar = document.getElementById('aqiMapSidebar');
            if (!sidebar) return;

            sidebar.classList.toggle('map-expanded');
            setTimeout(function () {
                aqiMap.invalidateSize();
            }, 300);
        });
    }
}

function clearStationMarkers() {
    aqiStationMarkers.forEach(function (marker) {
        aqiMap.removeLayer(marker);
    });
    aqiStationMarkers = [];
}

function addStationMarkers(stations) {
    if (!aqiMap || !stations || stations.length === 0) return;

    clearStationMarkers();

    stations.forEach(function (station) {
        if (station.lat == null || station.lon == null) return;
        if (station.aqi == null || isNaN(station.aqi)) return;

        var colors = getAQIMarkerColor(station.aqi);
        var aqiText = String(station.aqi);

        // Create a custom DivIcon with AQI number
        var icon = L.divIcon({
            className: 'aqi-map-marker',
            html: '<div class="aqi-marker-circle" style="background:' + colors.bg + '; border-color:' + colors.border + ';">' + aqiText + '</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        var marker = L.marker([station.lat, station.lon], { icon: icon });

        // Add tooltip with station name
        marker.bindTooltip(
            '<strong>' + (station.location || 'Station') + '</strong><br>AQI: ' + station.aqi +
            (station.pm25 != null ? '<br>PM2.5: ' + Math.round(station.pm25) + ' µg/m³' : '') +
            (station.pm10 != null ? '<br>PM10: ' + Math.round(station.pm10) + ' µg/m³' : ''),
            {
                direction: 'top',
                offset: [0, -20],
                className: 'aqi-marker-tooltip'
            }
        );

        marker.addTo(aqiMap);
        aqiStationMarkers.push(marker);
    });
}

function updateAQIMap(lat, lon, cityName, stations) {
    if (!aqiMap) return;

    aqiMap.setView([lat, lon], 11, { animate: true });

    // Update or create city center marker
    if (aqiMapMarker) {
        aqiMapMarker.setLatLng([lat, lon]);
    } else {
        aqiMapMarker = L.circleMarker([lat, lon], {
            radius: 6,
            color: '#6384ff',
            fillColor: '#6384ff',
            fillOpacity: 0.5,
            weight: 2
        }).addTo(aqiMap);
    }

    // Add station markers with AQI numbers
    if (stations && stations.length > 0) {
        addStationMarkers(stations);
    }

    // Update city name label
    var mapCityLabel = document.getElementById('mapCityName');
    if (mapCityLabel) {
        mapCityLabel.textContent = cityName || 'Unknown';
    }

    // Re-render map
    setTimeout(function () {
        aqiMap.invalidateSize();
    }, 200);
}
