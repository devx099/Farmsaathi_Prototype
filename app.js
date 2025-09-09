// Global state
const state = {
    currentScreen: 'home',
    farmerName: 'Bidyut Panda', // This would typically come from a backend
    weatherData: null,
    marketPrices: null,
    schemes: null,
    currentLanguage: localStorage.getItem('language') || 'en'
};

// Navigation
function navigateTo(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    // Show selected screen
    document.getElementById(`${screenId}-screen`)?.classList.remove('hidden');

    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.nav-btn[onclick="navigateTo('${screenId}')"]`)?.classList.add('active');

    // Update state
    state.currentScreen = screenId;

    // Load screen-specific data
    switch(screenId) {
        case 'weather':
            loadWeatherData();
            break;
        case 'market':
            loadMarketPrices();
            break;
        case 'schemes':
            loadGovernmentSchemes();
            break;
    }
}

// Theme configuration
const themeConfig = {
    isVibrant: localStorage.getItem('vibrantMode') !== 'false'
};

// Theme management
function toggleVibrantMode(enabled) {
    themeConfig.isVibrant = enabled;
    document.documentElement.setAttribute('data-vibrant', enabled ? 'true' : 'false');
    localStorage.setItem('vibrantMode', enabled);
    updateVibrantColors();
}

// Language management
function updateLanguage(lang) {
    state.currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.dir = ['ar', 'ur'].includes(lang) ? 'rtl' : 'ltr';
    translatePage();
    
    // Update dynamic content
    if (state.weatherData) {
        updateWeatherDisplay(state.weatherData);
    }
    if (state.marketPrices) {
        updateMarketPricesTable(state.marketPrices);
    }
    updateNavigationTitles();
}

function translatePage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[state.currentLanguage]?.[key]) {
            if (element.tagName === 'INPUT' && element.getAttribute('type') === 'text') {
                element.placeholder = translations[state.currentLanguage][key];
            } else {
                element.textContent = translations[state.currentLanguage][key];
            }
        }
    });

    // Update specific elements that need special handling
    updateWeatherData();
    updateMarketPrices();
    updateSchemes();
}

function toggleDarkMode(enabled) {
    document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
    themeConfig.isDark = enabled;
    localStorage.setItem('darkMode', enabled);
}

function toggleLargeText(enabled) {
    document.documentElement.style.fontSize = enabled ? '18px' : '16px';
    themeConfig.isLargeText = enabled;
    localStorage.setItem('largeText', enabled);
}

function toggleVibrantMode(enabled) {
    document.documentElement.setAttribute('data-vibrant', enabled ? 'true' : 'false');
    themeConfig.isVibrant = enabled;
    localStorage.setItem('vibrantMode', enabled);
    updateVibrantColors();
}

function updateNavigationTitles() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        const label = btn.querySelector('.nav-label');
        if (label) {
            const key = label.getAttribute('data-translate');
            btn.title = translations[state.currentLanguage][key] || key;
        }
    });
}

function updateVibrantColors() {
    const vibrantColors = themeConfig.isVibrant ? {
        '--primary-color': '#4CAF50',
        '--primary-light': '#81C784',
        '--primary-dark': '#388E3C',
        '--secondary-color': '#FF9800',
        '--secondary-light': '#FFB74D',
        '--secondary-dark': '#F57C00',
        '--accent-color': '#FF4081',
        '--success-color': '#00C853',
        '--warning-color': '#FFD600',
        '--error-color': '#F44336',
        '--info-color': '#2196F3'
    } : {
        '--primary-color': '#388E3C',
        '--primary-light': '#66BB6A',
        '--primary-dark': '#1B5E20',
        '--secondary-color': '#F57C00',
        '--secondary-light': '#FFB74D',
        '--secondary-dark': '#E65100',
        '--accent-color': '#D81B60',
        '--success-color': '#2E7D32',
        '--warning-color': '#FFC107',
        '--error-color': '#D32F2F',
        '--info-color': '#1976D2'
    };

    Object.entries(vibrantColors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
}

// Settings initialization and event handlers
function initializeSettings() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const largeTextToggle = document.getElementById('largeTextToggle');
    const vibrantModeToggle = document.getElementById('vibrantModeToggle');
    const languageSelect = document.getElementById('language-select');

    // Initialize theme settings
    if (darkModeToggle) {
        darkModeToggle.checked = themeConfig.isDark;
        darkModeToggle.addEventListener('change', (e) => toggleDarkMode(e.target.checked));
    }



    if (vibrantModeToggle) {
        vibrantModeToggle.checked = themeConfig.isVibrant;
        vibrantModeToggle.addEventListener('change', (e) => toggleVibrantMode(e.target.checked));
    }

    // Initialize language selection
    if (languageSelect) {
        languageSelect.value = state.currentLanguage;
        languageSelect.addEventListener('change', (e) => updateLanguage(e.target.value));
    }
}

// Initialize the app
function initApp() {
    // Set initial theme states
    toggleDarkMode(themeConfig.isDark);
    toggleLargeText(themeConfig.isLargeText);
    toggleVibrantMode(themeConfig.isVibrant);
    
    // Set farmer's name
    document.getElementById('farmer-name').textContent = state.farmerName;

    // Setup water availability slider
    const waterSlider = document.getElementById('water-availability');
    const waterValue = document.getElementById('water-value');
    
    if (waterSlider && waterValue) {
        waterSlider.addEventListener('input', (e) => {
            waterValue.textContent = `${e.target.value}%`;
        });
    }

    // Setup crop search
    const cropSearch = document.getElementById('crop-search');
    if (cropSearch) {
        cropSearch.addEventListener('input', filterMarketPrices);
    }

    // Initialize settings and their event listeners
    initializeSettings();
}

// Crop Recommendation
function getCropRecommendation() {
    const soilType = document.getElementById('soil-type').value;
    const waterAvailability = document.getElementById('water-availability').value;

    if (!soilType) {
        alert('Please select a soil type');
        return;
    }

    // This would typically come from a backend API
    const recommendations = {
        clay: {
            high: ['Rice', 'Wheat', 'Cotton'],
            medium: ['Soybean', 'Corn'],
            low: ['Millet', 'Chickpea']
        },
        sandy: {
            high: ['Watermelon', 'Groundnut', 'Potato'],
            medium: ['Carrot', 'Bean'],
            low: ['Pearl Millet', 'Cluster Bean']
        },
        loamy: {
            high: ['Vegetables', 'Fruits', 'Wheat'],
            medium: ['Maize', 'Sunflower'],
            low: ['Sorghum', 'Pulses']
        },
        silt: {
            high: ['Rice', 'Sugarcane', 'Jute'],
            medium: ['Wheat', 'Vegetables'],
            low: ['Barley', 'Oats']
        }
    };

    const waterLevel = waterAvailability > 66 ? 'high' : waterAvailability > 33 ? 'medium' : 'low';
    const crops = recommendations[soilType][waterLevel];

    const resultDiv = document.getElementById('recommendation-result');
    resultDiv.innerHTML = `
        <h3>Recommended Crops:</h3>
        <ul>
            ${crops.map(crop => `<li>${crop}</li>`).join('')}
        </ul>
    `;
    resultDiv.classList.remove('hidden');
}

// Weather Data
function loadWeatherData() {
    // This would typically fetch from a weather API
    const mockWeatherData = {
        current: {
            temp: 28,
            condition: 'Partly Cloudy'
        },
        alerts: [
            { type: 'warning', message: 'Heavy Rain Expected Tomorrow' },
            { type: 'info', message: 'Good conditions for wheat sowing' }
        ],
        forecast: [
            { day: 'Today', temp: 28, condition: 'Partly Cloudy' },
            { day: 'Tomorrow', temp: 27, condition: 'Rain' },
            { day: 'Wednesday', temp: 29, condition: 'Sunny' }
        ]
    };

    document.getElementById('temperature').textContent = `${mockWeatherData.current.temp}°C`;
    document.getElementById('condition').textContent = mockWeatherData.current.condition;

    const alertsContainer = document.getElementById('weather-alerts');
    alertsContainer.innerHTML = mockWeatherData.alerts
        .map(alert => `
            <div class="alert-card">
                <strong>${alert.type.toUpperCase()}:</strong> ${alert.message}
            </div>
        `).join('');

    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = mockWeatherData.forecast
        .map(day => `
            <div class="forecast-day">
                <strong>${day.day}:</strong> ${day.temp}°C, ${day.condition}
            </div>
        `).join('');
}

// Market Prices
function loadMarketPrices() {
    // This would typically fetch from an API
    state.marketPrices = [
        { crop: 'Wheat', mandi: 'Azadpur Mandi', price: 2100 },
        { crop: 'Rice', mandi: 'Ghazipur Mandi', price: 2400 },
        { crop: 'Potato', mandi: 'Okhla Mandi', price: 1200 },
        { crop: 'Tomato', mandi: 'Azadpur Mandi', price: 1800 }
    ];
    
    updateMarketPricesTable(state.marketPrices);
}

function filterMarketPrices() {
    const searchTerm = document.getElementById('crop-search').value.toLowerCase();
    const filteredPrices = state.marketPrices.filter(item => 
        item.crop.toLowerCase().includes(searchTerm)
    );
    updateMarketPricesTable(filteredPrices);
}

function updateMarketPricesTable(prices) {
    const tableBody = document.getElementById('price-table-body');
    const maxPrice = Math.max(...prices.map(p => p.price));
    
    tableBody.innerHTML = prices
        .map(item => `
            <tr>
                <td>${item.crop}</td>
                <td>${item.mandi}</td>
                <td class="${item.price === maxPrice ? 'highlight-price' : ''}">
                    ₹${item.price}
                </td>
            </tr>
        `).join('');
}

// Government Schemes
function loadGovernmentSchemes() {
    // This would typically fetch from an API
    const schemes = [
        {
            title: 'PM-KISAN',
            description: 'Direct income support of ₹6000 per year to farmers',
            details: 'Eligible farmers receive ₹2000 every four months...'
        },
        {
            title: 'Soil Health Card Scheme',
            description: 'Free soil testing and recommendations',
            details: 'Farmers can get their soil tested and receive detailed reports...'
        }
    ];

    const schemesContainer = document.getElementById('schemes-container');
    schemesContainer.innerHTML = schemes
        .map(scheme => `
            <div class="scheme-card">
                <h3>${scheme.title}</h3>
                <p>${scheme.description}</p>
                <button class="read-more-btn" onclick="toggleSchemeDetails(this)">
                    Read More
                </button>
                <div class="scheme-details hidden">
                    ${scheme.details}
                </div>
            </div>
        `).join('');
}

function toggleSchemeDetails(button) {
    const detailsDiv = button.nextElementSibling;
    detailsDiv.classList.toggle('hidden');
    button.textContent = detailsDiv.classList.contains('hidden') ? 'Read More' : 'Show Less';
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);
