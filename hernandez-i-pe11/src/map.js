let geojson = {
    type: 'FeatureCollection',
    features: []
};
let map;

const initMap = () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaWFoNzczMSIsImEiOiJjbTh5anNxYWYwMXVzMnJwdGk2MHl6ZWdiIn0.3VqzkOkNPBey87N1Y0tkug';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-77.67454147338866, 43.08484339838443],
        zoom: 15.5
    });
}

const loadMarkers = () => {
    const coffeeShops = [
        {
            latitude: 43.084156,
            longitude: -77.67514,
            title: "Artesano Bakery & Cafe"
        },

        {
            latitude: 43.083866,
            longitude: -77.66901,
            title: "Beanz"
        },

        {
            latitude: 43.082520,
            longitude: -77.67980,
            title: "Starbucks"
        },

        {
            latitude: 43.086678,
            longitude: -77.669014,
            title: "The College Grind"
        },

        {
            latitude: 43.082634,
            longitude: -77.68004,
            title: "The Cafe & Market at Crossroads"
        },

        {
            latitude: 43.08382,
            longitude: -77.674805,
            title: "RITZ Sports Zone"
        },

        {
            latitude: 43.086502,
            longitude: -77.66912,
            title: "The Commons"
        },

        {
            latitude: 43.08324,
            longitude: -77.68105,
            title: "The Market at Global Village"
        },

        {
            latitude: 43.08384,
            longitude: -77.67457,
            title: "Brick City Cafe"
        },

        {
            latitude: 43.084904,
            longitude: -77.6676,
            title: "Corner Store"
        },

        {
            latitude: 43.08464,
            longitude: -77.680145,
            title: "CTRL ALT DELi"
        },

        {
            latitude: 43.08359,
            longitude: -77.66921,
            title: "Gracie's"
        }
    ];

    // now convert this data to GeoJSON 
    for (let shop of coffeeShops)
    {
        const newFeature = {
            type:'Feature',
            geometry: {
                type:'Point',
                coordinates:[]
            },
            properties: {
                title: "",
                description: 'A place to get coffee!'
            }
        };

        newFeature.geometry.coordinates[0] = shop.longitude;
        newFeature.geometry.coordinates[1] = shop.latitude;
        newFeature.properties.title = shop.title;

        geojson.features.push(newFeature);
    }
}

const addMarkersToMap = () => {
    // add markers to map
    for (const feature of geojson.features) {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add it to the map
        new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(
                        `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
                    )
            )
            .addTo(map);
    }
}

const flyTo = (cebter = [0,0]) =>
{
    map.flyTo({center:center});
}

const setZoomLevel = (value=0) =>
{
    map.setZoom(value);
}

const setPitchAndBearing = (pitch=0,bearing=0) =>
{
    map.SetPitch(pitch);
    map.setBearing(bearing);
}

export {initMap,loadMarkers,addMarkersToMap,setZoomLevel,setPitchAndBearing,flyTo};