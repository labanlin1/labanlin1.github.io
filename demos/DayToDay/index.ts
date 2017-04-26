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


loadAndParseJSON("https://api.myjson.com/bins/yet63");
getLastField().focus();
initializeSuggestions();
document.onkeypress = function(e){
    captureEnter(e);
};

document.onkeyup = function(e){
    captureBackspace(e);
};

transcriptToggle.addEventListener("click", toggleTranscript);
class Template{
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
        this.display = text.replace(optionsFinder, "<span class = 'emphasis'>" + this.alternates[this.alternateSelected]) + "</span>";
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
    let newTemplateInstance = document.createElement("span");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = template.display;
    phraseContainer.insertBefore(newTemplateInstance,getLastField());
    newTemplateInstance.addEventListener("dblclick", removeTemplateFromPhrase);
    getLastField().focus(); //Webstorm says this doesn't work, but it totally does.

    //Update Suggested Tab
    updateProgrammableSugggestions(template);
}

function removeTemplateFromPhrase(e){
    let target = e.target;
    phraseContainer.removeChild(target);
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
    var jsonObject = JSON.parse(json);
    console.log(jsonObject);
    console.log(jsonObject.moduleName);

    //Create New Tab
    var newTab = document.createElement("div");
    newTab.classList.add("tab");
    newTab.appendChild(document.createTextNode(jsonObject.moduleName));
    tabsContainer.appendChild(newTab);

    console.log("New Tab: " + jsonObject.moduleName + " added successfully.");

    //Create New Objects
    let newContainer = document.createElement("div");
    newContainer.classList.add("constructors-container");

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
        newOption.addEventListener("touchend", function(){
            addTemplateToPhrase(option);
        });
        newContainer.appendChild(newOption);

    }
    tabsObjectsContainer.appendChild(newContainer);
    newContainer.classList.add("active");

    setAsActiveTab(newTab);
}

function setAsActiveTab(tab){
    let activeTab = document.querySelector(".tab.active");
    activeTab.classList.remove("active");
    tab.classList.add("active");
}

//Helper Functions

function getLastField(){
    const elements = document.querySelectorAll(".field");
    if(elements[elements.length-1].innerHTML == ""){
        return elements[elements.length-1];
    }else{
        let newField = createField();
        phraseContainer.appendChild(newField);
        return newField;
    }
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
    let newTemplateInstance = document.createElement("span");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = text;
    phraseContainer.insertBefore(newTemplateInstance,getLastField());
    newTemplateInstance.addEventListener("dblclick", removeTemplateFromPhrase);
    getLastField().focus(); //Webstorm says this doesn't work, but it totally does.

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

function captureBackspace(e){
    let keyID = e.keyCode;
    //8 => backspace, 46 => delete
    if (keyID == 46){
        const activeElement = document.activeElement;
        if (activeElement.classList.contains("field")){
            if (activeElement.textContent == ""){
                removeLastWord(activeElement.previousElementSibling);
            }
        }
    }
}

function removeLastWord(element){
    if (element) {
        let text = element.innerHTML;
        let lastIndex = text.lastIndexOf(" ");
        text = text.substring(0, lastIndex);
        element.innerHTML = text;
        if (text == "" || text == " ") {
            element.parentNode.removeChild(element);
        }
    }
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
    }else{
        transcriptContainer.classList.add("visible");
        transcriptContainer.scrollTop = transcriptContainer.clientHeight;
    }
}