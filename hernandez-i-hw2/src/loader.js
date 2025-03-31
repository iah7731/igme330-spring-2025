import * as main from "./main.js";
window.onload = () => {
    console.log("window.onload called");
    fetch('../data/av-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(jsonData => {
            main.jsonDataFill(jsonData);
            main.init(); 
        })
        .catch(error => console.error("Error loading JSON:", error));
};

