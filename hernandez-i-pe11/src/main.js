import * as map from "./map.js";

function setupUI() {
    // it's easy to get [longitude,latitude] coordinates with this tool: http://geojson.io/
    const lnglatRIT = [-77.67454147338866, 43.08484339838443];
    const lnglatIGM = [-77.67990589141846, 43.08447511795301];

}

const init = () => {
    map.initMap();
    map.loadMarkers();
    map.addMarkersToMap();
    setupUI();
}
export { init };

