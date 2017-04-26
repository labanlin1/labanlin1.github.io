/**
 * Created by Laban on 4/25/2017.
 */

//Default Variables

let tabsContainer = document.querySelector(".tabs");
let tabsObjectsContainer = document.querySelector(".tab-objects");
let phraseContainer = document.querySelector(".phrase");
let programmedOptionsContainer = document.querySelector("programmed-options");
let textMatchOptionsContainer = document.querySelector("text-match-options");
let transcriptContainer = document.querySelector("#transcript-container");
let transcriptToggle = document.querySelector(".transcript");
let transcriptIcon = document.querySelector("#transcript-icon");
let currentModule = "";
let templates=[];

loadAndParseJSON("https://api.myjson.com/bins/wqmi3");
getOrCreateLastField().focus();
initializeSuggestions();

document.onkeypress = function(e){
    captureEnter(e);
};

// document.onkeyup = function(e){
//     captureBackspaceAndFilter(e);
// };

transcriptToggle.addEventListener("click", toggleTranscript);

class Template{
    element;
    text:string;
    display:string;
    alternates:string[];
    alternateSelected: number;
    suggestedWords:Word[];
    constructor(text:string, suggestedWords:Word[]){
        this.alternateSelected=0;
        this.text = text;
        this.suggestedWords = suggestedWords;
        const optionsFinder = /\|([A-Za-z,]+)\|/;
        this.alternates = optionsFinder.exec(this.text)[1].split(",");
        this.createDisplay();
    }

    createDisplay(){
        console.log(this.alternateSelected);
        console.log(this.alternates);
        const optionsFinder = /\|([A-Za-z,]+)\|/;
        this.display = this.text.replace(optionsFinder, "<span class = 'emphasis'>" + this.alternates[this.alternateSelected]) + "</span>";
    };

    updateDisplay(){
        this.element.innerHTML = this.display;
    }

    filter(search:string){
        if (this.text.search(search)>=0){
            //Exists
            this.alternateSelected = 0;
            this.element.classList.remove("hidden");

            //Change selected alternates as required
            for(let i = 0; i<this.alternates.length; i++){
                if (this.alternates[i].indexOf(search)>=0){
                    this.alternateSelected = i;
                    break;
                }
            }
            this.createDisplay();
            this.updateDisplay();
        }else{
            this.element.classList.add("hidden");
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
    newTemplateInstance.innerHTML = template.display;
    phraseContainer.insertBefore(newTemplateInstance,getOrCreateLastField());
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
    getOrCreateLastField().focus(); //Webstorm says this doesn't work, but it totally does.

    //Update Suggested Tab
    updateProgrammableSugggestions(template);
}

function removeTemplateFromPhrase(e){
    e.preventDefault();
    let target = e.target;
    console.log(target);
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
    console.log(programmableSuggestions);
    for (let i = 0; i<Math.min(3,template.suggestedWords.length); i++){
        programmableSuggestions[i].innerHTML = template.suggestedWords[i].word;
    }
}

//JSON Functions

function loadAndParseJSON(url:string){
    retrieveJson(url);
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
    console.log(jsonObject);
    console.log(jsonObject.moduleName);

    //Create New Tab
    let newTab = document.createElement("div");
    newTab.classList.add("tab");
    newTab.appendChild(document.createTextNode(jsonObject.moduleName));
    tabsContainer.appendChild(newTab);

    console.log("New Tab: " + jsonObject.moduleName + " added successfully.");

    //Create New Objects
    let newContainer = document.createElement("div");
    newContainer.classList.add("constructors-container");

    let moduleContainer = new Array(jsonObject.templates.length);

    for (let i = 0; i<jsonObject.templates.length; i++){
        const t = jsonObject.templates[i];
        let option = new Template(t.text, t.suggestedWords);
        //Wrap Option in appropriate markup
        let newOption = document.createElement("div");
        newOption.classList.add("option");
        newOption.setAttribute("module", jsonObject.moduleName);
        newOption.innerHTML = option.display;
        newOption.addEventListener("click", function(){
            addTemplateToPhrase(option);
        });
        option.element = newOption;
        newContainer.appendChild(newOption);
        // option.filter("have");

        moduleContainer[i] = option;
    }

    templates[jsonObject.moduleName] = moduleContainer;
    tabsObjectsContainer.appendChild(newContainer);
    newContainer.classList.add("active");
    currentModule = jsonObject.moduleName;
    setAsActiveTab(newTab);

    document.onkeyup = function(e){
        captureBackspaceAndFilter(e);
    };

}

function setAsActiveTab(tab){
    let activeTab = document.querySelector(".tab.active");
    activeTab.classList.remove("active");
    tab.classList.add("active");
}

//Helper Functions

function getOrCreateLastField(){
    const elements = document.querySelectorAll(".field");
    if(elements[elements.length-1].innerHTML == ""){
        return elements[elements.length-1];
    }else{
        let newField = createField();
        phraseContainer.appendChild(newField);
        return newField;
    }
}

function getLastField(){
    const elements = document.querySelectorAll(".field");
    return elements[elements.length-1];
}

function createField(){
    let element = document.createElement("span");
    element.setAttribute("contenteditable", "true");
    element.classList.add("field");
    return element;
}

function addSuggestionToPhrase(e){
    const text = e.target.innerHTML;
    //Insert Template
    let newTemplateInstance = document.createElement("div");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = text;
    phraseContainer.insertBefore(newTemplateInstance,getOrCreateLastField());
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
    getOrCreateLastField().focus(); //Webstorm says this doesn't work, but it totally does.

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
        addToTranscript(phraseContainer.innerHTML);
        phraseContainer.innerHTML="";
        let newField = createField();
        phraseContainer.appendChild(newField);
        newField.focus();
    }
}

function captureBackspaceAndFilter(e){
    let keyID = e.keyCode;
    //8 => backspace, 46 => delete
    if (keyID == 8){
        const activeElement = document.activeElement;
        if (activeElement.classList.contains("field")){
            if (activeElement.textContent == ""){
                removeLastWord(activeElement.previousElementSibling);
            }
        }
    }else{
        //Filter
        console.log(templates["Restaurant"]);
        if (document.activeElement.classList.contains("field")) {
            const relevantTemplates = templates[currentModule];
            if (relevantTemplates){
                for (let i = 0; i < relevantTemplates.length; i++) {
                    console.log(relevantTemplates[i]);
                    relevantTemplates[i].filter(document.activeElement.textContent);
                }
            }
        }
    }
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
            element.textContent = text;
        }
    }
    // else if (element && element.classList.contains("field")){
    //     //Join fields
    //     console.log("x");
    //     document.activeElement.innerHTML = element.innerHTML + document.activeElement.innerHTML;
    //     element.parentNode.removeChild(element);
    // }
}

function addToTranscript(log:string){
    const htmlMarkupRemover = /<(?:\/)?[A-Za-z ="']*>/ig;
    let newEntry = log.replace(htmlMarkupRemover,"");
    let newEntryP = document.createElement("p");
    newEntryP.textContent = newEntry;
    transcriptContainer.appendChild(newEntryP);
}

function toggleTranscript(){
    if (transcriptContainer.classList.contains("visible")){
        transcriptContainer.classList.remove("visible");
        transcriptIcon.className = "unordered list icon";
    }else{
        transcriptContainer.classList.add("visible");
        transcriptContainer.scrollTop = transcriptContainer.clientHeight;
        transcriptIcon.className = "remove icon";
    }
}

