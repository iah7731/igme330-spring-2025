import { randomElement } from "./utils.js";

let words1 = [];
let words2 = [];
let words3 = [];

const loadBabble = () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "data/babble-data.json", true);
    xhr.onload = () => {
        if (xhr.status === 200) {
            babbleLoaded(xhr.responseText);
        } else {
            console.error("JSON loading failed - ", xhr.status);
        }
    };
    xhr.send();
}

const babbleLoaded = (jsonResponse) => {

    let data = JSON.parse(jsonResponse);

    words1 = data.words1[0].wordArray;
    words2 = data.words2[0].wordArray;
    words3 = data.words3[0].wordArray;

    buttonGen1.addEventListener("click", () => generateTechno(1));
    buttonGen5.addEventListener("click", () => generateTechno(5));

    generateTechno(1);
}

let generateTechno = (num) => {
    const technoBabble = [];

    for (let i = 0; i < num; i++) {
        technoBabble.push(`${words1[randomElement(words1)]} ${words2[randomElement(words2)]} ${words3[randomElement(words3)]}!`);
    }

    outputP.textContent = technoBabble.join("\n");
}

const outputP = document.querySelector("#output");
const buttonGen1 = document.querySelector("#btn-gen-1");
const buttonGen5 = document.querySelector("#btn-gen-5");

window.addEventListener('load', () => 
{
    loadBabble();
});



