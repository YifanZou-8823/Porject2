// global variable 
let riddles;
window.addEventListener('load', () => {
    console.log('page is loaded');
    //load the json file
    fetch('riddles.json')
        .then(response => response.json())
        .then(data => {
            riddles = data.riddles; // make sure to fetch the riddles in the json
            console.log('Riddles loaded:', riddles);
        })
        .catch(err => console.error(err));
});

//Initialize  the map
mapboxgl.accessToken = 'pk.eyJ1IjoiamluZ3lpMTAxMyIsImEiOiJjbWhpbHJreDAwZTh5MmlvZHZhNm90anc2In0.YO3YGnq8Tl7NGO_XHC6s4w';
const map = new mapboxgl.Map({
    container: 'map',
    center: [-98, 38.88],
    zoom: 1,
    style: 'mapbox://styles/mapbox/standard',
    config: {
        'basemap': {
            'colorPlaceLabelHighlight': 'blue',
            'colorPlaceLabelSelect': 'red'
        }
    }
});

let selectedPlace;
let hoveredPlace;

const card = document.getElementById('properties');

//only show ten cities' points
map.on('load', () => {
    const cities = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { name: 'New York' },
                geometry: { type: 'Point', coordinates: [-74.006, 40.7128] }
            },
            {
                type: 'Feature',
                properties: { name: 'Berlin' },
                geometry: { type: 'Point', coordinates: [13.405, 52.52] }
            },
            {
                type: 'Feature',
                properties: { name: '香港 - Hong Kong' },
                geometry: { type: 'Point', coordinates: [114.1694, 22.3193] }
            },
            {
                type: 'Feature',
                properties: { name: 'Paris' },
                geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }
            },
            {
                type: 'Feature',
                properties: { name: 'Tokyo' },
                geometry: { type: 'Point', coordinates: [139.6917, 35.6895] }
            },
            {
                type: 'Feature',
                properties: { name: 'London' },
                geometry: { type: 'Point', coordinates: [-0.1276, 51.5072] }
            },
            {
                type: 'Feature',
                properties: { name: 'Roma' },
                geometry: { type: 'Point', coordinates: [12.4964, 41.9028] }
            },
            {
                type: 'Feature',
                properties: { name: 'Los Angeles' },
                geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] }
            },
            {
                type: 'Feature',
                properties: { name: 'Mumbai' },
                geometry: { type: 'Point', coordinates: [72.8777, 19.0760] }
            },
            {
                type: 'Feature',
                properties: { name: 'Cairo' },
                geometry: { type: 'Point', coordinates: [31.2357, 30.0444] }
            }
        ]
    };

    // add layer
    map.addSource('cities', { type: 'geojson', data: cities });
    map.addLayer({
        id: 'city-points',
        type: 'circle',
        source: 'cities',
        paint: {
            'circle-radius': 6,
            'circle-color': 'rgba(26, 100, 237, 1)',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
});

// show the button after clicking the cities
const showCard = (feature) => {
    let cityName;
    if (feature.properties.name) {
        cityName = feature.properties.name;
    } else {
        cityName = 'Unknown City';
    }
    card.innerHTML = `
        <div class="map-overlay-inner">
            <h3>${cityName}</h3>
            <button id="chatBtn">Enter Global Chatroom</button>
            <button id="infoBtn">!!??!!</button>
        </div>
    `;

    card.style.display = 'block';

//click the buttons
    const chatBtn = document.getElementById("chatBtn");
    const infoBtn = document.getElementById("infoBtn");
    chatBtn.onclick = () => {
        alert(`Entering chatroom`);
        window.open("http://localhost:3000", '_blank');

    infoBtn.addEventListener("click", function () {
        openRiddleDialog(cityName);
    });
}
}
    // open the riddle button
    function openRiddleDialog(cityName) {
        const dialog = document.getElementById('riddle-dialog');
        const title = document.getElementById('riddle-title');
        const text = document.getElementById('riddle-text');
        const form = document.getElementById('riddle-form');
        const input = document.getElementById('riddle-answer');
        const cancelBtn = document.getElementById('riddle-cancel');

        let riddle;
        if (riddles[cityName]) {
            riddle = riddles[cityName];
        } else {
            riddle = {
                question: "No riddle available for this city yet!",
                answer: "none"
            };
        }


        // show the riddle
        title.textContent = `Riddle for ${cityName}`;
        text.textContent = riddle.question;
        input.value = "";

        // open the dialog
        dialog.showModal();

        // cancle button
        cancelBtn.onclick = () => dialog.close();

        // submit the answer
        form.onsubmit = (e) => {
            e.preventDefault();
            const userAnswer = input.value.trim();

            if (userAnswer.toLowerCase() === riddle.answer.toLowerCase()) {
                alert("Correct! 🎉 Redirecting...");
                dialog.close();
                window.open("http://localhost:3000/private/", '_blank'); // ✅ 跳转页面
            } else {
                alert("Incorrect! Try again.");
            }
        };
    }

    // Interaction
    //click the button
    map.addInteraction('place-click', {
        type: 'click',
        target: { featuresetId: 'place-labels', importId: 'basemap' },
        handler: ({ feature }) => {
            if (selectedPlace) {
                map.setFeatureState(selectedPlace, { select: false });
            }
            selectedPlace = feature;
            map.setFeatureState(feature, { select: true });
            showCard(feature);
        }
    });

    // hightlight when hovering the mouse
    map.addInteraction('place-mouseenter', {
        type: 'mouseenter',
        target: { featuresetId: 'place-labels', importId: 'basemap' },
        handler: ({ feature }) => {
            if (hoveredPlace && hoveredPlace.id === feature.id) return;
            if (hoveredPlace) map.setFeatureState(hoveredPlace, { highlight: false });
            hoveredPlace = feature;
            map.setFeatureState(feature, { highlight: true });
            map.getCanvas().style.cursor = 'pointer';
        }
    });

    // remove the lightlight
    map.addInteraction('place-mouseleave', {
        type: 'mouseleave',
        target: { featuresetId: 'place-labels', importId: 'basemap' },
        handler: () => {
            if (hoveredPlace) {
                map.setFeatureState(hoveredPlace, { highlight: false });
                hoveredPlace = null;
            }
            map.getCanvas().style.cursor = '';
            return false;
        }
    });

    // card diappear if click other places
    map.addInteraction('map-click', {
        type: 'click',
        handler: () => {
            if (selectedPlace) {
                map.setFeatureState(selectedPlace, { select: false });
                selectedPlace = null;
            }
            card.style.display = 'none';
            return false;
        }
    })