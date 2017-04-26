/**
 * Created by Laban on 4/25/2017.
 */
//Default Variables
var tabsContainer = document.querySelector("tabs");
loadAndParseJSON("/modules/restaurant.json");
var Template = (function () {
    function Template(text, suggestedWords) {
        this.text = text;
        this.suggestedWords = suggestedWords;
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
}
function removeTemplateFromPhrase() {
}
function removeLastWord() {
}
function loadAndParseJSON(url) {
    retrieveJson(url);
}
function retrieveJson(url) {
    //http://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
    console.log("retrieving JSON");
    var json = new XMLHttpRequest();
    console.log("retrieving JSON");
    json.overrideMimeType("application/json");
    json.open("GET", url, true);
    console.log("retrieving JSON");
    json.onreadystatechange = function () {
        console.log("retrieving JSON");
        console.log(json.readyState);
        console.log(json.status);
        if (json.readyState == 4 && json.status == 200) {
            parseJSONIntoTemplates(json.responseText);
        }
    };
}
function parseJSONIntoTemplates(json) {
    console.log(json);
}
//# sourceMappingURL=index.js.map