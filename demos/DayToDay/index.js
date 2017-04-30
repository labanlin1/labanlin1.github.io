/**
 * Created by Laban on 4/25/2017.
 */
//Default Variables
var tabsContainer = document.querySelector(".tabs");
var tabsObjectsContainer = document.querySelector(".tab-objects");
var phraseContainer = document.querySelector(".phrase");
var programmedOptionsContainer = document.querySelector("programmed-options");
var textMatchOptionsContainer = document.querySelector("text-match-options");
var transcript = document.querySelector("#transcripts");
var transcriptContainer = document.querySelector("#transcript-container");
var transcriptIcon = document.querySelector("#transcript-icon");
var currentModule = "";
var templates = [];
var field = document.querySelector(".field");
var body = document.querySelector("body");
var wrapper = document.querySelector("phone-wrapper");
var modulesLoaded = 0;
var totalModules = 0;
var prevFieldText = "";
loadAndParseJSON(["https://api.myjson.com/bins/85xtl", "https://api.myjson.com/bins/wqmi3"]);
initializeSuggestions();
document.onkeypress = function (e) {
    captureEnter(e);
};
initializeTranscript();
initializePhoneSize();
function initializePhoneSize() {
    var phoneSizes = document.querySelectorAll(".phone-size");
    for (var i = 0; i < phoneSizes.length; i++) {
        phoneSizes[i].addEventListener("click", setPhoneSize);
    }
}
function setPhoneSize(e) {
    var target = e.target;
    document.querySelector(".size-selection").classList.add("hidden");
    document.querySelector("body").className = target.dataset["size"];
    field.focus();
}
function initializeTranscript() {
    transcriptIcon.addEventListener("click", toggleTranscript);
    document.querySelector("#close").addEventListener("click", toggleTranscript);
}
var Template = (function () {
    function Template(text, suggestedWords, el) {
        this.element = el;
        this.variationSelected = 0;
        this.text = text;
        this.suggestedWords = suggestedWords;
        var optionsFinder = /\|([A-Za-z,\s']+)\|/;
        try {
            this.variants = optionsFinder.exec(this.text)[1].split(",");
            this.variations = new Array(this.variants.length);
            for (var i = 0; i < this.variants.length; i++) {
                var variation = this.variants[i];
                this.variations[i] = this.text.replace(optionsFinder, variation);
            }
        }
        catch (e) {
            //no variants
            this.variants = new Array(1);
            this.variants[0] = this.text;
            this.variations = new Array(1);
            this.variations[0] = this.text;
        }
        this.updateDisplay();
    }
    Template.prototype.updateDisplay = function () {
        console.log(this.variants[this.variationSelected]);
        var variantString = "<span class = 'emphasis'>" + this.variants[this.variationSelected] + "</span>";
        var optionsFinder = /\|([A-Za-z,\s']+)\|/;
        this.element.innerHTML = this.text.replace(optionsFinder, variantString);
    };
    Template.prototype.showDisplay = function () {
        this.element.classList.remove("hidden");
    };
    Template.prototype.hideDisplay = function () {
        this.element.classList.add("hidden");
    };
    Template.prototype.filter = function (search) {
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
    phraseContainer.insertBefore(newTemplateInstance, field);
    field.innerHTML = "";
    field.focus();
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
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
    for (var i = 0; i < Math.min(4, template.suggestedWords.length); i++) {
        programmableSuggestions[i].innerHTML = template.suggestedWords[i].word;
    }
}
//JSON Functions
function loadAndParseJSON(url) {
    totalModules = url.length;
    for (var i = 0; i < url.length; i++) {
        retrieveJson(url[i]);
    }
    document.onkeyup = function (e) {
        captureBackspaceAndFilter(e);
    };
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
    newTab.id = "tab-" + jsonObject.moduleName;
    newTab.appendChild(document.createTextNode(jsonObject.moduleName));
    tabsContainer.appendChild(newTab);
    newTab.addEventListener("click", function () {
        setAsActiveTab(jsonObject.moduleName);
    });
    console.log("New Tab: " + jsonObject.moduleName + " added successfully.");
    //Create New Objects
    var newContainer = document.createElement("div");
    newContainer.classList.add("constructors-container");
    newContainer.id = "container-" + jsonObject.moduleName;
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
    currentModule = jsonObject.moduleName;
    setAsActiveTab(currentModule);
    notifyModuleLoaded();
    console.log(field);
    field.focus();
}
function notifyModuleLoaded() {
    modulesLoaded++;
    if (modulesLoaded == totalModules) {
        field.focus();
        setAsActiveTab("General");
    }
}
function setAsActiveTab(tab) {
    currentModule = tab;
    filterList();
    var activeTab = document.querySelectorAll(".tab");
    if (activeTab.length > 0) {
        for (var i = 0; i < activeTab.length; i++) {
            activeTab[i].classList.remove("active");
        }
    }
    document.querySelector("#tab-" + tab).classList.add("active");
    var containers = document.querySelectorAll(".constructors-container");
    for (var i = 0; i < containers.length; i++) {
        containers[i].classList.remove("active");
    }
    document.querySelector("#" + "container-" + tab).classList.add("active");
    field.focus();
}
//Helper Functions
function getLastField() {
    var elements = document.querySelectorAll(".field");
    return elements[elements.length - 1];
}
function addSuggestionToPhrase(e) {
    var text = e.target.innerHTML;
    //Insert Template
    var newTemplateInstance = document.createElement("div");
    newTemplateInstance.classList.add("template");
    newTemplateInstance.innerHTML = text;
    phraseContainer.insertBefore(newTemplateInstance, field);
    newTemplateInstance.addEventListener("click", removeTemplateFromPhrase);
    field.focus();
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
        addToTranscript();
        phraseContainer.innerHTML = "";
        phraseContainer.appendChild(field);
        field.innerHTML = "";
        field.focus();
        filterList();
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
            filterList();
        }
    }
}
function filterList() {
    var relevantTemplates = templates[currentModule];
    if (relevantTemplates) {
        for (var i = 0; i < relevantTemplates.length; i++) {
            relevantTemplates[i].filter(field.textContent);
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
}
function addToTranscript() {
    var log = "";
    for (var i = 0; i < phraseContainer.children.length; i++) {
        log += "" + phraseContainer.children[i].innerHTML + " ";
    }
    var htmlMarkupRemover = /<(?:\/)?[A-Za-z ="']*>/ig;
    var newEntry = log.replace(htmlMarkupRemover, "");
    var newEntryP = document.createElement("p");
    newEntryP.textContent = newEntry;
    transcript.appendChild(newEntryP);
}
function toggleTranscript() {
    if (transcriptContainer.classList.contains("visible")) {
        transcriptContainer.classList.remove("visible");
        field.focus();
        field.textContent = prevFieldText;
    }
    else {
        transcriptContainer.classList.add("visible");
        transcript.scrollTop = transcript.clientHeight;
        prevFieldText = field.textContent;
    }
    field.focus();
}
//# sourceMappingURL=index.js.map