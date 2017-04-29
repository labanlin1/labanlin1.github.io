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
var transcriptIcon = document.querySelector("#transcript-icon");
var currentModule = "";
var templates = [];
var body = document.querySelector("body");
var wrapper = document.querySelector("phone-wrapper");
var focusing = false;
loadAndParseJSON("https://api.myjson.com/bins/wqmi3");
getOrCreateLastField().focus();
initializeSuggestions();
document.onkeypress = function (e) {
    captureEnter(e);
};
// getLastField().addEventListener("focus", function(e){
//     e.preventDefault();
//     body.scrollTop = 0;
//     wrapper.scrollTop = 0;
//     window.scrollTo(0,0);
//     document.body.scrollTop = 0;
// });
//
// getLastField().addEventListener("blur", function(e){
//     e.preventDefault();
//     body.scrollTop = 0;
//     wrapper.scrollTop = 0;
//     window.scrollTo(0,0);
//     document.body.scrollTop = 0;
//
// });
transcriptIcon.addEventListener("click", toggleTranscript);
var Template = (function () {
    function Template(text, suggestedWords, el) {
        this.element = el;
        this.variationSelected = 0;
        this.text = text;
        this.suggestedWords = suggestedWords;
        var optionsFinder = /\|([A-Za-z,]+)\|/;
        this.variants = optionsFinder.exec(this.text)[1].split(",");
        this.variations = new Array(this.variants.length);
        for (var i = 0; i < this.variants.length; i++) {
            var variation = this.variants[i];
            this.variations[i] = this.text.replace(optionsFinder, variation);
        }
        this.updateDisplay();
    }
    Template.prototype.updateDisplay = function () {
        var variantString = "<span class = 'emphasis'>" + this.variants[this.variationSelected] + "</span>";
        var optionsFinder = /\|([A-Za-z,]+)\|/;
        this.element.innerHTML = this.text.replace(optionsFinder, variantString);
    };
    Template.prototype.showDisplay = function () {
        this.element.classList.remove("hidden");
    };
    Template.prototype.hideDisplay = function () {
        this.element.classList.add("hidden");
    };
    Template.prototype.filter = function (search) {
        //Change selected alternates as required
        search = search.trim().toLowerCase();
        if (search == "") {
            this.showDisplay();
            return;
        }
        var resultFound = false;
        for (var i = 0; i < this.variations.length; i++) {
            if (this.variations[i].toLowerCase().indexOf(search) >= 0) {
                this.variationSelected = i;
                this.updateDisplay();
                resultFound = true;
                break;
            }
        }
        if (resultFound) {
            this.showDisplay();
        }
        else {
            this.hideDisplay();
        }
    };
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
    var newTemplateInstance = document.createElement("div");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = template.element.innerHTML;
    console.log(template.element);
    phraseContainer.insertBefore(newTemplateInstance, getOrCreateLastField());
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
    getOrCreateLastField().focus(); //Webstorm says this doesn't work, but it totally does.
    //Update Suggested Tab
    updateProgrammableSugggestions(template);
}
function removeTemplateFromPhrase(e) {
    e.preventDefault();
    var target = e.target;
    while (!(target.classList.contains("template"))) {
        target = target.parentNode;
    }
    phraseContainer.removeChild(target);
    var lastField = getLastField();
    lastField.focus();
    //Join if required
    if (lastField.previousElementSibling.classList.contains("field")) {
        lastField.innerHTML = lastField.previousElementSibling.innerHTML + lastField.innerHTML;
        lastField.previousElementSibling.remove();
    }
}
function updateProgrammableSugggestions(template) {
    var programmableSuggestions = document.querySelectorAll(".programmed-options .option");
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
    //Create New Tab
    var newTab = document.createElement("div");
    newTab.classList.add("tab");
    newTab.appendChild(document.createTextNode(jsonObject.moduleName));
    tabsContainer.appendChild(newTab);
    console.log("New Tab: " + jsonObject.moduleName + " added successfully.");
    //Create New Objects
    var newContainer = document.createElement("div");
    newContainer.classList.add("constructors-container");
    var moduleContainer = new Array(jsonObject.templates.length);
    var _loop_1 = function(i) {
        var t = jsonObject.templates[i];
        var newOption = document.createElement("div");
        newOption.classList.add("option");
        newOption.setAttribute("module", jsonObject.moduleName);
        var option = new Template(t.text, t.suggestedWords, newOption);
        //Wrap Option in appropriate markup
        newOption.addEventListener("click", function () {
            addTemplateToPhrase(option);
        });
        newContainer.appendChild(newOption);
        // option.filter("have");
        moduleContainer[i] = option;
    };
    for (var i = 0; i < jsonObject.templates.length; i++) {
        _loop_1(i);
    }
    templates[jsonObject.moduleName] = moduleContainer;
    tabsObjectsContainer.appendChild(newContainer);
    newContainer.classList.add("active");
    currentModule = jsonObject.moduleName;
    setAsActiveTab(newTab);
    document.onkeyup = function (e) {
        captureBackspaceAndFilter(e);
    };
}
function setAsActiveTab(tab) {
    var activeTab = document.querySelector(".tab.active");
    activeTab.classList.remove("active");
    tab.classList.add("active");
}
//Helper Functions
function getOrCreateLastField() {
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
function getLastField() {
    var elements = document.querySelectorAll(".field");
    return elements[elements.length - 1];
}
function createField() {
    var element = document.createElement("span");
    element.setAttribute("contenteditable", "true");
    element.classList.add("field");
    element.addEventListener("focus", function (e) {
        e.preventDefault();
        body.scrollTop = 0;
        wrapper.scrollTop = 0;
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
    });
    element.addEventListener("blur", function (e) {
        e.preventDefault();
        body.scrollTop = 0;
        wrapper.scrollTop = 0;
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
    });
    return element;
}
function addSuggestionToPhrase(e) {
    var text = e.target.innerHTML;
    //Insert Template
    var newTemplateInstance = document.createElement("div");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = text;
    phraseContainer.insertBefore(newTemplateInstance, getOrCreateLastField());
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
    getOrCreateLastField().focus(); //Webstorm says this doesn't work, but it totally does.
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
function captureBackspaceAndFilter(e) {
    var keyID = e.keyCode;
    //8 => backspace, 46 => delete
    if (isInKeyCodeBounds(keyID)) {
        var activeElement = document.activeElement;
        if (activeElement.classList.contains("field")) {
            if (activeElement.textContent == "" && keyID == 8) {
                removeLastWord(activeElement.previousElementSibling);
            }
            var relevantTemplates = templates[currentModule];
            if (relevantTemplates) {
                for (var i = 0; i < relevantTemplates.length; i++) {
                    relevantTemplates[i].filter(document.activeElement.textContent);
                }
            }
        }
    }
}
function isInKeyCodeBounds(keyCode) {
    //48-90 is 0 - Z
    //96 - 105 is 0-9 Numpad
    //186- 191 is various punctuation
    return ((keyCode >= 48 && keyCode <= 90) || (keyCode >= 96 && keyCode <= 105) || (keyCode >= 186 && keyCode <= 191) || keyCode == 8);
}
function removeLastWord(element) {
    if (element && element.classList.contains("template")) {
        //Find last child node
        var el = element.childNodes[element.childNodes.length - 1];
        //Remove trailing spaces from text content if any
        var text = el.textContent;
        if (text.charAt(text.length - 1) == " ") {
            text = text.substring(0, text.length - 1);
        }
        var lastIndex = text.lastIndexOf(" ");
        if (lastIndex == -1) {
            text = "";
        }
        else {
            text = text.substring(0, lastIndex);
        }
        if (text == "" || text == " ") {
            element.removeChild(el);
            if (element.childNodes.length == 0) {
                phraseContainer.removeChild(element);
                var lastField = getLastField();
                if (lastField.previousElementSibling.classList.contains("field")) {
                    lastField.focus();
                    lastField.innerHTML = lastField.previousElementSibling.innerHTML + lastField.innerHTML;
                    lastField.previousElementSibling.remove();
                }
            }
        }
        else {
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
        transcriptIcon.className = "unordered list icon";
    }
    else {
        transcriptContainer.classList.add("visible");
        transcriptContainer.scrollTop = transcriptContainer.clientHeight;
        transcriptIcon.className = "remove icon";
    }
}
function scrollTop(e) {
    e.preventDefault();
    window.scrollTo(0);
}
//# sourceMappingURL=index.js.map