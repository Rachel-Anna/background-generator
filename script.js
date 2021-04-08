//Global selections and variables

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
let initialColors;
const popupContainer = document.querySelector(".copy-container");
const popup = document.querySelector(".copy-popup");
const adjustButton = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const lockButton = document.querySelectorAll(".lock");


//EVENT LISTENERS

generateBtn.addEventListener("click", randomColors);

sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
})

colorDivs.forEach((div, index) => {
    div.addEventListener("change", ()=>{
        updateTextUI(index);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener("click", ()=> {
        copyToClipboard(hex);
    });
});
 
popup.addEventListener("transitionend", ()=> {
    popupContainer.classList.remove("active");
    popup.classList.remove("active");
});


adjustButton.forEach((button, index) => {
    button.addEventListener("click", () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button, index) => {
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    });
});

lockButton.forEach((button, index) => {
    button.addEventListener("click", () => {
      addLockClass(button, index);
    });
  });

//Functions

//Color Generator
function generateHex() {
    const hexColor = chroma.random(); //from cdn - link is in html 
    return hexColor;

}

function randomColors(){
    initialColors = []; // this has to go here because
    
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        //add the generated hex to the array
        if (div.classList.contains("locked")) {
            initialColors.push(hexText.innerText);
            return;
        } else {
        initialColors.push(chroma(randomColor).hex());
        }

        //add the color to the background
        div.style.backgroundColor = randomColor;
        currentHexes[index].innerText = randomColor;
        //check for contrast
        checkTextContrast(randomColor, hexText);
        //Initial Colorize Sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
        //check for button contrast
        const colorPanelButtons = div.querySelectorAll(".controls button");
        colorPanelButtons.forEach((button) => {
            checkTextContrast(randomColor, button); 
        })
    });

    resetInputs(); 
    
}    

function checkTextContrast(color, text) {
    const luminance = chroma(color). luminance();
        if(luminance > 0.5){
            text.style.color = "black";
    } else {
            text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    //scale saturation
    const noSat = color.set("hsl.s", 0); //using method from chroma
    const fullSat = color.set("hsl.s",1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    //scale brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]); //here we are creating the actual scale


    //update input colors

    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`; //we are grabbing the elements from the scale. e.g. scaleBright(0.5) refers to the midddle of the scale we already created
    hue.style.backgroundImage = `linear-gradient(to right, rgb(255, 0, 0), rgb(255,255 ,0),rgb(0, 255, 0),rgb(0, 255, 255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0))`;

}

function hslControls (e) {
    const index = 
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
 
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColorText = initialColors[index];
    let color = chroma(bgColorText)
        .set("hsl.h",hue.value)
        .set("hsl.s",saturation.value)
        .set("hsl.l", brightness.value);

    colorDivs[index].style.backgroundColor = color;

    //Colorize inputs/sliders
    colorizeSliders(color, hue, brightness, saturation);

}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();

    //check contrast
    checkTextContrast(color, textHex);
    for(icon of icons) {
        checkTextContrast(color, icon);
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll(".sliders input")
    sliders.forEach(slider => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);    
        }
        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100)/100; 
        }   
        if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100)/100; 
        }  
    });
}

function copyToClipboard(hex) {
    const el = document.createElement("textarea"); //workaround you need to creat a text area to be abe to copy inner text
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    //pop up animation
    popupContainer.classList.add("active");
    popup.classList.add("active");
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove("active");
}

function addLockClass(button, index) {
    colorDivs[index].classList.toggle("locked");
    lockButton[index].firstChild.classList.toggle("fa-lock-open");
    lockButton[index].firstChild.classList.toggle("fa-lock");
  } 
  


//implement save to palette and local staorage stuff
//this is for local storage
let savedPalettes = []; 
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");
const clearBtn = document.querySelector(".clear-btn");


//EVENT LISTENERS

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);
clearBtn.addEventListener("click", clearLibrary);

//FUNCTIONS

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active");
    popup.classList.add("active");
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.add("active");
}

function savePalette(e) {
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    //Generate Object
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    if(paletteObjects) {
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;
    }
    
    const paletteObj = {name, colors, nr: paletteNr};
    savedPalettes.push(paletteObj);
    //save to localStorage
    savetoLocal(paletteObj);
    saveInput.value = "";
    //generate the palette for the library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";
    
    //Attach event to the button
    paletteBtn.addEventListener("click", e =>{
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) =>{
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
        resetInputs();
    });

    
    //Append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

}

function savetoLocal(paletteObj){
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}

function getLocal() {
    if(localStorage.getItem("palettes") === null) {
        localPalettes =[];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
            //generate the palette for the library
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObj.name;
            const preview = document.createElement("div");
            preview.classList.add("small-preview");
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement("div");
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";
        
            //Attach event to the button
            paletteBtn.addEventListener("click", e =>{
                closeLibrary(); 
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) =>{
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUI(index);
                });
                resetInputs();
            });

    
            //Append to library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);

        });
    }
}

function clearLibrary(){
    localStorage.clear();
    savedPalettes = [];  
    const paletteContainers = document.querySelectorAll(".custom-palette");
    paletteContainers.forEach(container => {
        libraryContainer.children[0].removeChild(container);
    });
}


getLocal();
randomColors(); 

