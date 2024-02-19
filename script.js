let guessedCountries = new Set();
let totalAttempts = 0;
let map;
const resultElement = document.getElementById('result');
const counterElement = document.getElementById('counter');

document.addEventListener('DOMContentLoaded', async function() {
    map = L.map('world-map', {
        maxZoom: 2, // Setzt die maximale Zoomstufe, bei der Ländernamen nicht sichtbar sind
        minZoom: 0, // Setzt die minimale Zoomstufe
        zoomControl: true // Zeigt Zoom-Kontrollen an
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

    // Optional: Deaktiviere die Möglichkeit zu zoomen, falls erforderlich


    const countriesData = await fetch('countries.geojson').then(response => response.json());
    document.getElementById('submit').addEventListener('click', () => checkAnswer(countriesData));
    document.getElementById('answer').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('submit').click();
        }
    });
});

async function checkAnswer(countriesData) {
    const userAnswer = document.getElementById('answer').value.trim().toLowerCase();
    document.getElementById('answer').value = '';
    const countryFeature = countriesData.features.find(feature => feature.properties.name.toLowerCase() === userAnswer);

    if (countryFeature && !guessedCountries.has(countryFeature.properties.name)) {
        L.geoJSON(countryFeature, {
            style: () => ({
                color: "#00FF00",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            })
        }).addTo(map);
        resultElement.textContent = 'Correct!';
        guessedCountries.add(countryFeature.properties.name);
    } else {
        resultElement.textContent = 'Wrong. Try again!';
        markRandomCountryRed(countriesData);
    }
    totalAttempts++;
    updateCounter();
}

function updateCounter() {
    counterElement.innerHTML = `<div class="counter-box">Guessed Countries: ${guessedCountries.size} / Total Attempts: ${totalAttempts}</div>`;
}

function markRandomCountryRed(countriesData) {
    const randomIndex = Math.floor(Math.random() * countriesData.features.length);
    const randomCountry = countriesData.features[randomIndex];
    L.geoJSON(randomCountry, {
        style: () => ({
            color: "#ff0000",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        })
    }).addTo(map);
}
