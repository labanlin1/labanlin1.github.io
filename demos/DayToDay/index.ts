/**
 * Created by Laban on 4/25/2017.
 */

//Default Variables

let tabsContainer = document.querySelector(".tabs");
let tabsObjectsContainer = document.querySelector(".tab-objects");
let phraseContainer = document.querySelector(".phrase");
let transcript = document.querySelector("#transcripts");
let transcriptContainer = document.querySelector("#transcript-container");
let transcriptIcon = document.querySelector("#transcript-icon");
let currentModule = "";
let templates=[];
let field = document.querySelector(".field");
let body = document.querySelector("body");
let modulesLoaded = 0;
let totalModules = 0;
let prevFieldText:string = "";

loadAndParseJSON(["https://api.myjson.com/bins/1hauqh","https://api.myjson.com/bins/11aak9"]);
initializeSuggestions();
initializeTranscript();
initializePhoneSize();

document.onkeypress = function(e){
    captureEnter(e);
};

function initializePhoneSize(){
    const phoneSizes = document.querySelectorAll(".phone-size");
    for (let i = 0; i<phoneSizes.length; i++){
        phoneSizes[i].addEventListener("click",setPhoneSize);
    }
}

function setPhoneSize(e){
    let target = e.target;
    document.querySelector(".size-selection").classList.add("hidden");
    document.querySelector("body").className = target.dataset["size"];
    field.focus();
}

function initializeTranscript(){
    transcriptIcon.addEventListener("click", toggleTranscript);
    document.querySelector("#close").addEventListener("click", toggleTranscript);
}

class Template{
    element;
    text:string;
    variations:string[];
    variationSelected: number;
    variants:string[];//Probably a better naming scheme req'd, but variants contains the key words while variations contain the entire strings, allowing the HTML to be generated on the fly but search to be instantaneous
    suggestedWords:Word[];
    constructor(text:string, suggestedWords:Word[], el){
        this.element = el;
        this.variationSelected=0;
        this.text = text;
        this.suggestedWords = suggestedWords;
        const optionsFinder = /\|([A-Za-z,\s'!?\.]+)\|/;

        try {
            this.variants = optionsFinder.exec(this.text)[1].split(",");

            this.variations = new Array(this.variants.length);
            for (let i = 0; i < this.variants.length; i++) {
                const variation = this.variants[i];
                this.variations[i] = this.text.replace(optionsFinder, variation);
            }
        }
        catch(e){
            //no variants
            this.variants = new Array(1);
            this.variants[0] = this.text;
            this.variations = new Array(1);
            this.variations[0] = this.text;
        }

        this.updateDisplay();
    }

    updateDisplay(){
        const variantString = "<span class = 'emphasis'>" + this.variants[this.variationSelected] + "</span>";
        const optionsFinder = /\|([A-Za-z,\s'!?\.]+)\|/;
        this.element.innerHTML = this.text.replace(optionsFinder, variantString);
    }

    showDisplay(){
        this.element.classList.remove("hidden");
    }

    hideDisplay(){
        this.element.classList.add("hidden");
    }

    filter(search:string){
        search = search.trim().toLowerCase();

        if (search == ""){
            this.showDisplay();
            return;
        }

        let resultFound = false;

        for(let i = 0; i<this.variations.length; i++){
            if (this.variations[i].toLowerCase().indexOf(search)>=0){
                this.variationSelected = i;
                this.updateDisplay();
                resultFound = true;
                break;
            }
        }

        if (resultFound){
            this.showDisplay();
        }else{
            this.hideDisplay();
        }
    }
}

class Word{
    word:string;
    constructor(word:string){
        this.word = word;
    }
}
//Template Functionality

function addTemplateToPhrase(template:Template){
    //Insert Template
    let newTemplateInstance = document.createElement("div");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = template.element.innerHTML;
    phraseContainer.insertBefore(newTemplateInstance, field);
    field.innerHTML = "";
    field.focus();
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);

    //Update Suggested Tab
    updateProgrammableSugggestions(template);
}

function removeTemplateFromPhrase(e){
    e.preventDefault();
    let target = e.target;
    while(!(target.classList.contains("template"))){
        target = target.parentNode;
    }
    phraseContainer.removeChild(target);
    let lastField = getLastField();
    lastField.focus();

    //Join if required
    if (lastField.previousElementSibling.classList.contains("field")){
        lastField.innerHTML = lastField.previousElementSibling.innerHTML + lastField.innerHTML;
        lastField.previousElementSibling.remove();
    }
}

function updateProgrammableSugggestions(template:Template){
    let programmableSuggestions = document.querySelectorAll(".programmed-options .option");
    for (let i = 0; i<Math.min(4,template.suggestedWords.length); i++){
        programmableSuggestions[i].innerHTML = template.suggestedWords[i].word;
    }
}

//JSON Functions

function loadAndParseJSON(url:string[]){

    totalModules = url.length;

    for (let i = 0; i<url.length; i++){
        retrieveJson(url[i]);
    }

    document.onkeyup = function(e){
        captureBackspaceAndFilter(e);
    };
}

function retrieveJson(url:string){
    //http://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
    let json = new XMLHttpRequest();
    json.overrideMimeType("application/json");
    json.open("GET", url, true);
    json.send();
    json.onreadystatechange = function(){
      if (json.readyState == 4 && json.status == 200){
          parseJSONIntoTemplates(json.responseText);
      }
    };

}

function parseJSONIntoTemplates(json){
    let jsonObject = JSON.parse(json);

    //Create New Tab
    let newTab = document.createElement("div");
    newTab.classList.add("tab");
    newTab.id = "tab-" + jsonObject.moduleName;
    newTab.appendChild(document.createTextNode(jsonObject.moduleName));
    tabsContainer.appendChild(newTab);

    newTab.addEventListener("click", function(){
        setAsActiveTab(jsonObject.moduleName);
    });

    console.log("New Tab: " + jsonObject.moduleName + " added successfully.");

    //Create New Objects
    let newContainer = document.createElement("div");
    newContainer.classList.add("constructors-container");
    newContainer.id = "container-" + jsonObject.moduleName;

    let moduleContainer = new Array(jsonObject.templates.length);

    for (let i = 0; i<jsonObject.templates.length; i++){
        const t = jsonObject.templates[i];

        let newOption = document.createElement("div");
        newOption.classList.add("option");
        newOption.setAttribute("module", jsonObject.moduleName);

        let option = new Template(t.text, t.suggestedWords, newOption);

        newOption.addEventListener("click", function(){
            addTemplateToPhrase(option);
        });

        newContainer.appendChild(newOption);

        moduleContainer[i] = option;
    }

    templates[jsonObject.moduleName] = moduleContainer;
    tabsObjectsContainer.appendChild(newContainer);
    currentModule = jsonObject.moduleName;
    setAsActiveTab(currentModule);
    notifyModuleLoaded();
    field.focus();
}

function notifyModuleLoaded(){
    modulesLoaded++;
    if (modulesLoaded == totalModules){
        field.focus();
        setAsActiveTab("General");
    }
}

function setAsActiveTab(tab){

    currentModule = tab;
    filterList();
    let activeTab = document.querySelectorAll(".tab");
    if (activeTab.length > 0){
        for (let i = 0; i<activeTab.length; i++){
            activeTab[i].classList.remove("active");
        }
    }

    document.querySelector("#tab-"+tab).classList.add("active");

    let containers = document.querySelectorAll(".constructors-container");
    for (let i = 0; i<containers.length; i++){
        containers[i].classList.remove("active");
    }
    document.querySelector("#" + "container-" + tab).classList.add("active");

    field.focus();

}

//Helper Functions

function getLastField(){
    const elements = document.querySelectorAll(".field");
    return elements[elements.length-1];
}

function addSuggestionToPhrase(e){
    const text = e.target.innerHTML;
    //Insert Template
    let newTemplateInstance = document.createElement("div");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = text;
    phraseContainer.insertBefore(newTemplateInstance,field);
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
    field.focus();

    //Update Suggested Tab
}

function initializeSuggestions(){
    const suggestions = document.querySelectorAll(".programmed-options .option");
    for (let i = 0; i<suggestions.length; i++){
        suggestions[i].addEventListener("click", addSuggestionToPhrase);
    }
}

function captureEnter(e){
    let keyID = e.keyCode;
    if (keyID == 13){
        e.preventDefault();
        addToTranscript();
        phraseContainer.innerHTML="";
        phraseContainer.appendChild(field);
        field.innerHTML = "";
        field.focus();
        filterList();
    }
}

function captureBackspaceAndFilter(e){
    let keyID = e.keyCode;
    //8 => backspace, 46 => delete


    if (isInKeyCodeBounds(keyID)){
        const activeElement = document.activeElement;
        if (activeElement.classList.contains("field")){
            if (activeElement.textContent == "" && keyID == 8){
                removeLastWord(activeElement.previousElementSibling);
            }
           filterList();
        }

    }
}

function filterList(){
    const relevantTemplates = templates[currentModule];
    if (relevantTemplates){
        for (let i = 0; i < relevantTemplates.length; i++) {
            relevantTemplates[i].filter(field.textContent);
        }
    }
}

function isInKeyCodeBounds(keyCode){
    //48-90 is 0 - Z
    //96 - 105 is 0-9 Numpad
    //186- 191 is various punctuation

    return ((keyCode >= 48 && keyCode <= 90) || (keyCode >= 96 && keyCode <= 105) || (keyCode >= 186 && keyCode <= 191) || keyCode == 8);

}

function removeLastWord(element){

    if (element && element.classList.contains("template")) {
        //Find last child node

        let el = element.childNodes[element.childNodes.length-1];

        //Remove trailing spaces from text content if any

        let text = el.textContent;

        if (text.charAt(text.length-1) == " "){
            text = text.substring(0, text.length-1);
        }

        let lastIndex = text.lastIndexOf(" ");
        if (lastIndex == -1){
            text = "";
        }else{
            text = text.substring(0,lastIndex);
        }

        if (text == "" || text == " "){
            element.removeChild(el);
            if (element.childNodes.length == 0){
                phraseContainer.removeChild(element);
                let lastField = getLastField();

                if (lastField.previousElementSibling.classList.contains("field")){
                    lastField.focus();
                    lastField.innerHTML = lastField.previousElementSibling.innerHTML + lastField.innerHTML;
                    lastField.previousElementSibling.remove();

                }
            }
        }else{
            el.textContent = text;
        }
    }
}

function addToTranscript(){
    let log = "";
    for (let i = 0; i<phraseContainer.children.length; i++){
        log += "" + phraseContainer.children[i].innerHTML + " ";
    }
    const htmlMarkupRemover = /<(?:\/)?[A-Za-z ="']*>/ig;
    let newEntry = log.replace(htmlMarkupRemover,"");
    let newEntryP = document.createElement("p");
    newEntryP.innerHTML = newEntry;
    transcript.appendChild(newEntryP);

}

function toggleTranscript(){
    if (transcriptContainer.classList.contains("visible")){
        transcriptContainer.classList.remove("visible");
        field.focus();

        field.textContent = prevFieldText;
    }else{
        transcriptContainer.classList.add("visible");
        transcript.scrollTop = transcript.clientHeight;
        prevFieldText = field.textContent;
    }
    field.focus();
}

