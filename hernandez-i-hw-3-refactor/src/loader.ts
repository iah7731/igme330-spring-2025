import * as main from "./main";
window.onload = () : void => {
    console.log("window.onload called");
    fetch('../data/av-data.json')
        .then((response : Response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((jsonData : any) => {
            main.jsonDataFill(jsonData);
            main.init(); 
        })
        .catch((error : Error) => console.error("Error loading JSON:", error));
};

