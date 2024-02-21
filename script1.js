// Globale Variablen
let map, geoJsonLayer;
let currentCountry;
let highlightedLayer;
let guessedCountries = new Set(); // Set für bereits erratene Länder
let wrongGuessedCountries = new Set(); // Set für falsch erratene Länder

// Initialisieren der Karte
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 27,
        attribution: '© OpenStreetMap contributors, © CARTO'
    }).addTo(map);
}


// Funktion zum Laden der GeoJSON-Daten für eine bestimmte Region
function loadGeoJsonForRegion(region) {
    // Generiert den Pfad basierend auf der ausgewählten Region
    const geoJsonPath = `${region}.geojson`; // Annahme: Die Dateien liegen im selben Verzeichnis

    fetch(geoJsonPath)
        .then(response => response.json())
        .then(data => {
            if (geoJsonLayer) {
                map.removeLayer(geoJsonLayer);
            }
            geoJsonLayer = L.geoJSON(data, {
                style: function () {
                    return { weight: 1, color: '#666', fillOpacity: 0.5 };
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function () {
                        checkUserAnswer(feature.properties.name);
                    });
                }
            }).addTo(map);
            highlightRandomCountry(data);
        })
        .catch(error => console.error('Fehler beim Laden der GeoJSON-Daten:', error));
}

// Funktion, um ein zufälliges Land aus der GeoJSON-Daten hervorzuheben
function highlightRandomCountry(geojsonData) {
    const countries = geojsonData.features.filter(feature =>
        !guessedCountries.has(feature.properties.name) &&
        !wrongGuessedCountries.has(feature.properties.name)
    );

    if (countries.length === 0) {
        alert("Alle Länder wurden erraten oder falsch geraten!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * countries.length);
    currentCountry = countries[randomIndex];
    geoJsonLayer.eachLayer(function (layer) {
        if (layer.feature.properties.name === currentCountry.properties.name) {
            highlightedLayer = layer;
            layer.setStyle({
                fillColor: 'blue',
                fillOpacity: 0.75,
                weight: 2,
                color: 'blue'
            });

            // Anpassen des Zoom-Verhaltens mit maxZoom und padding Optionen
            map.fitBounds(layer.getBounds(), {
                padding: [50, 50], // Fügt einen Abstand von 50px um die Grenzen hinzu
                maxZoom: 6 // Verhindert, dass stärker als Zoomstufe 6 hineingezoomt wird
            });
        }
    });
}


// Funktion, die überprüft, ob die Benutzereingabe mit dem aktuellen Land übereinstimmt
function checkUserAnswer(countryName) {
    const userInput = document.getElementById('countryInput').value.toLowerCase().trim();
    const button = document.getElementById('checkAnswer');

    button.classList.remove('correct', 'wrong');

    if (userInput === countryName.toLowerCase()) {
        guessedCountries.add(countryName); // Füge das korrekt erratene Land hinzu
        highlightedLayer.setStyle({ fillColor: 'green', color: 'green' });
        button.classList.add('correct');
    } else {
        wrongGuessedCountries.add(countryName); // Füge das falsch erratene Land hinzu
        highlightedLayer.setStyle({ fillColor: 'red', color: 'red' });
        button.classList.add('wrong');
    }

    document.getElementById('countryInput').value = '';
    document.getElementById('countryInput').focus();

    setTimeout(function() {
        button.classList.remove('correct', 'wrong');
        highlightRandomCountry(geoJsonLayer.toGeoJSON());
    }, 200);
}

// Event-Listener für die Regionsauswahl
document.getElementById('regionSelect').addEventListener('change', function(e) {
    guessedCountries.clear(); // Zurücksetzen der erratenen Länder für die neue Region
    wrongGuessedCountries.clear(); // Zurücksetzen der falsch erratenen Länder für die neue Region
    loadGeoJsonForRegion(e.target.value);
});

// Event-Listener für den "Check"-Button
document.getElementById('checkAnswer').addEventListener('click', function() {
    checkUserAnswer(currentCountry.properties.name);
});

// Event-Listener für das Drücken der Enter-Taste im Eingabefeld
document.getElementById('countryInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Verhindern, dass das Formular abgeschickt wird
        checkUserAnswer(currentCountry.properties.name);
    }
});

// Die initMap-Funktion beim Laden der Seite aufrufen
window.onload = initMap;
