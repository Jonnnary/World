document.addEventListener('DOMContentLoaded', function() {
    initMap();
    document.getElementById('regionSelect').addEventListener('change', function(e) {
        loadGeoJsonForRegion(e.target.value);
    });
});

let map, currentCountry, geoJsonLayer;
let guessedCountries = 0;
let totalCountries = 0;

// Initialisierung der Karte und des Mousemove-Listeners
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Mousemove-Event-Listener, um das Tooltip mit der Maus zu bewegen
    map.on('mousemove', function(e) {
        var tooltip = document.getElementById('countryLabel');
        if (tooltip.style.visibility === 'visible') {
            tooltip.style.left = e.originalEvent.pageX + 10 + 'px';
            tooltip.style.top = e.originalEvent.pageY + 10 + 'px';
        }
    });
}

function loadGeoJsonForRegion(region) {
    if (region === 'all') {
        alert('Bitte wählen Sie eine spezifische Region.');
        return;
    }
    const geoJsonPath = `${region}.geojson`;
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }
    fetch(geoJsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok.');
            }
            return response.json();
        })
        .then(data => {
            totalCountries = data.features.length;
            updateCounter();
            geoJsonLayer = L.geoJSON(data, {
                onEachFeature: onEachFeature,
                style: {
                    fillColor: 'blue',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                }
            }).addTo(map);
            map.fitBounds(geoJsonLayer.getBounds());
            selectRandomCountry(data.features);
        })
        .catch(error => {
            console.error('Fehler beim Laden der GeoJSON-Daten:', error);
            alert('Fehler beim Laden der GeoJSON-Daten. Sind die Dateinamen korrekt?');
        });
}

function selectRandomCountry(features) {
    if (features.length === 0) {
        alert('Keine Länder in dieser Region gefunden.');
        return;
    }
    const index = Math.floor(Math.random() * features.length);
    currentCountry = features[index];
    updateTooltip(currentCountry.properties.name);
}

function onEachFeature(feature, layer) {
    layer.on({
        click: function(e) {
            guessCountry(feature, layer);
        }
    });
}

function guessCountry(feature, layer) {
    if (currentCountry && feature.properties.name === currentCountry.properties.name) {
        layer.setStyle({ fillColor: 'green', color: 'green' });
        guessedCountries++;
        updateTooltip('Correct! ' + feature.properties.name);
    } else {
        layer.setStyle({ fillColor: 'red', color: 'red' });
        updateTooltip('Incorrect. Try again.');
    }
    updateCounter();
    // Warte einen Moment, dann wähle ein neues Land
    setTimeout(() => selectRandomCountry(geoJsonLayer.toGeoJSON().features), 600);
}

function updateCounter() {
    document.getElementById('guessedCount').textContent = `${guessedCountries}/${totalCountries}`;
}

function updateTooltip(countryName) {
    // Verwenden Sie die getCountryCode Funktion, um den Ländercode zu erhalten
    getCountryCode(countryName).then(countryCode => {
      // Pfad zum Flaggenbild basierend auf dem Ländercode
      const flagImageUrl = `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`;
  
      // Tooltip-Inhalt mit Flagge und Landesname
      const tooltip = document.getElementById('countryLabel');
      tooltip.innerHTML = `<img src="${flagImageUrl}" alt="Flag"> ${countryName}`;
      tooltip.style.visibility = 'visible';
    }).catch(error => {
      console.error('Error fetching country code:', error);
    });
  }
  
  // getCountryCode muss nun eine Promise zurückgeben
  function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok (${response.status})`);
        return response.json();
      })
      .then(data => {
        // Achten Sie darauf, dass Sie die richtige Antwortstruktur erhalten
        const countryCode = data[0].cca2;
        return countryCode; // Rückgabe des Ländercodes
      });
  }
