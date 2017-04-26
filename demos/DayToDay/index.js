/**
 * Created by Laban on 4/25/2017.
 */
//Default Variables
var tabsContainer = document.querySelector(".tabs");
var tabsObjectsContainer = document.querySelector(".tab-objects");
var phraseContainer = document.querySelector(".phrase");
var programmedOptionsContainer = document.querySelector("programmed-options");
var textMatchOptionsContainer = document.querySelector("text-match-options");
var transcriptContainer = document.querySelector("#transcript-container");
var transcriptToggle = document.querySelector(".transcript");
loadAndParseJSON("https://api.myjson.com/bins/yet63");
getLastField().focus();
initializeSuggestions();
document.onkeypress = function (e) {
    captureEnter(e);
};
document.onkeyup = function (e) {
    captureBackspace(e);
};
transcriptToggle.addEventListener("click", toggleTranscript);
var Template = (function () {
    function Template(text, suggestedWords) {
        this.alternateSelected = 0;
        this.text = text;
        this.suggestedWords = suggestedWords;
        var optionsFinder = /\|([A-Za-z,]+)\|/;
        this.alternates = optionsFinder.exec(this.text)[1].split(",");
        this.display = text.replace(optionsFinder, "<span class = 'emphasis'>" + this.alternates[this.alternateSelected]) + "</span>";
    }
    return Template;
}());
var Word = (function () {
    function Word(word) {
        this.word = word;
    }
    return Word;
}());
//Template Functionality
function addTemplateToPhrase(template) {
    //Insert Template
    var newTemplateInstance = document.createElement("span");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = template.display;
    phraseContainer.insertBefore(newTemplateInstance, getLastField());
    newTemplateInstance.addEventListener("dblclick", removeTemplateFromPhrase);
    getLastField().focus(); //Webstorm says this doesn't work, but it totally does.
    //Update Suggested Tab
    updateProgrammableSugggestions(template);
}
function removeTemplateFromPhrase(e) {
    var target = e.target;
    phraseContainer.removeChild(target);
}
function updateProgrammableSugggestions(template) {
    var programmableSuggestions = document.querySelectorAll(".programmed-options .option");
    console.log(programmableSuggestions);
    for (var i = 0; i < Math.min(3, template.suggestedWords.length); i++) {
        programmableSuggestions[i].innerHTML = template.suggestedWords[i].word;
    }
}
//JSON Functions
function loadAndParseJSON(url) {
    retrieveJson(url);
}
function retrieveJson(url) {
    //http://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
    var json = new XMLHttpRequest();
    json.overrideMimeType("application/json");
    json.open("GET", url, true);
    json.send();
    json.onreadystatechange = function () {
        if (json.readyState == 4 && json.status == 200) {
            parseJSONIntoTemplates(json.responseText);
        }
    };
}
function parseJSONIntoTemplates(json) {
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
    var newContainer = document.createElement("div");
    newContainer.classList.add("constructors-container");
    var _loop_1 = function(i) {
        var t = jsonObject.templates[i];
        var option = new Template(t.text, t.suggestedWords);
        //Wrap Option in appropriate markup
        var newOption = document.createElement("div");
        newOption.classList.add("option");
        newOption.setAttribute("module", jsonObject.moduleName);
        newOption.innerHTML = option.display;
        newOption.addEventListener("click", function () {
            addTemplateToPhrase(option);
        });
        newOption.addEventListener("touchend", function () {
            addTemplateToPhrase(option);
        });
        newContainer.appendChild(newOption);
    };
    for (var i = 0; i < jsonObject.templates.length; i++) {
        _loop_1(i);
    }
    tabsObjectsContainer.appendChild(newContainer);
    newContainer.classList.add("active");
    setAsActiveTab(newTab);
}
function setAsActiveTab(tab) {
    var activeTab = document.querySelector(".tab.active");
    activeTab.classList.remove("active");
    tab.classList.add("active");
}
//Helper Functions
function getLastField() {
    var elements = document.querySelectorAll(".field");
    if (elements[elements.length - 1].innerHTML == "") {
        return elements[elements.length - 1];
    }
    else {
        var newField = createField();
        phraseContainer.appendChild(newField);
        return newField;
    }
}
function createField() {
    var element = document.createElement("span");
    element.setAttribute("contenteditable", "true");
    element.classList.add("field");
    return element;
}
function addSuggestionToPhrase(e) {
    var text = e.target.innerHTML;
    //Insert Template
    var newTemplateInstance = document.createElement("span");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = text;
    phraseContainer.insertBefore(newTemplateInstance, getLastField());
    newTemplateInstance.addEventListener("dblclick", removeTemplateFromPhrase);
    getLastField().focus(); //Webstorm says this doesn't work, but it totally does.
    //Update Suggested Tab
}
function initializeSuggestions() {
    var suggestions = document.querySelectorAll(".programmed-options .option");
    for (var i = 0; i < suggestions.length; i++) {
        suggestions[i].addEventListener("click", addSuggestionToPhrase);
    }
}
function captureEnter(e) {
    var keyID = e.keyCode;
    if (keyID == 13) {
        e.preventDefault();
        addToTranscript(phraseContainer.innerHTML);
        phraseContainer.innerHTML = "";
        var newField = createField();
        phraseContainer.appendChild(newField);
        newField.focus();
    }
}
function captureBackspace(e) {
    var keyID = e.keyCode;
    //8 => backspace, 46 => delete
    if (keyID == 46) {
        var activeElement = document.activeElement;
        if (activeElement.classList.contains("field")) {
            if (activeElement.textContent == "") {
                removeLastWord(activeElement.previousElementSibling);
            }
        }
    }
}
function removeLastWord(element) {
    if (element) {
        var text = element.innerHTML;
        var lastIndex = text.lastIndexOf(" ");
        text = text.substring(0, lastIndex);
        element.innerHTML = text;
        if (text == "" || text == " ") {
            element.parentNode.removeChild(element);
        }
    }
}
function addToTranscript(log) {
    var htmlMarkupRemover = /<(?:\/)?[A-Za-z ="']*>/ig;
    var newEntry = log.replace(htmlMarkupRemover, "");
    var newEntryP = document.createElement("p");
    newEntryP.textContent = newEntry;
    transcriptContainer.appendChild(newEntryP);
}
function toggleTranscript() {
    if (transcriptContainer.classList.contains("visible")) {
        transcriptContainer.classList.remove("visible");
    }
    else {
        transcriptContainer.classList.add("visible");
        transcriptContainer.scrollTop = transcriptContainer.clientHeight;
    }
}
//# sourceMappingURL=index.js.map