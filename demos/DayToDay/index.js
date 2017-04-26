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
loadAndParseJSON("https://api.myjson.com/bins/wqmi3");
getOrCreateLastField().focus();
initializeSuggestions();
document.onkeypress = function (e) {
    captureEnter(e);
};
// document.onkeyup = function(e){
//     captureBackspaceAndFilter(e);
// };
transcriptToggle.addEventListener("click", toggleTranscript);
var Template = (function () {
    function Template(text, suggestedWords) {
        this.alternateSelected = 0;
        this.text = text;
        this.suggestedWords = suggestedWords;
        var optionsFinder = /\|([A-Za-z,]+)\|/;
        this.alternates = optionsFinder.exec(this.text)[1].split(",");
        this.createDisplay();
    }
    Template.prototype.createDisplay = function () {
        console.log(this.alternateSelected);
        console.log(this.alternates);
        var optionsFinder = /\|([A-Za-z,]+)\|/;
        this.display = this.text.replace(optionsFinder, "<span class = 'emphasis'>" + this.alternates[this.alternateSelected]) + "</span>";
    };
    ;
    Template.prototype.updateDisplay = function () {
        this.element.innerHTML = this.display;
    };
    Template.prototype.filter = function (search) {
        if (this.text.search(search) >= 0) {
            //Exists
            this.alternateSelected = 0;
            this.element.classList.remove("hidden");
            //Change selected alternates as required
            for (var i = 0; i < this.alternates.length; i++) {
                if (this.alternates[i].indexOf(search) >= 0) {
                    this.alternateSelected = i;
                    break;
                }
            }
            this.createDisplay();
            this.updateDisplay();
        }
        else {
            this.element.classList.add("hidden");
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
    newTemplateInstance.innerHTML = template.display;
    phraseContainer.insertBefore(newTemplateInstance, getOrCreateLastField());
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
    getOrCreateLastField().focus(); //Webstorm says this doesn't work, but it totally does.
    //Update Suggested Tab
    updateProgrammableSugggestions(template);
}
function removeTemplateFromPhrase(e) {
    e.preventDefault();
    var target = e.target;
    console.log(target);
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
    var moduleContainer = new Array(jsonObject.templates.length);
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
        option.element = newOption;
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
    if (keyID == 8) {
        var activeElement = document.activeElement;
        if (activeElement.classList.contains("field")) {
            if (activeElement.textContent == "") {
                removeLastWord(activeElement.previousElementSibling);
            }
        }
    }
    else {
        //Filter
        console.log(templates["Restaurant"]);
        if (document.activeElement.classList.contains("field")) {
            var relevantTemplates = templates[currentModule];
            if (relevantTemplates) {
                for (var i = 0; i < relevantTemplates.length; i++) {
                    console.log(relevantTemplates[i]);
                    relevantTemplates[i].filter(document.activeElement.textContent);
                }
            }
        }
    }
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
//# sourceMappingURL=index.js.map