/**
 * Created by Laban on 4/25/2017.
 */

//Default Variables

const tabsContainer = document.querySelector("tabs");

loadAndParseJSON("/Users/Laban/WebstormProjects/DaytoDay/modules/restaurant.json");

class Template{
    text:string;
    suggestedWords:Word[];
    constructor(text:string, suggestedWords:Word[]){
        this.text = text;
        this.suggestedWords = suggestedWords;
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

}

function removeTemplateFromPhrase(){

}

function removeLastWord(){

}

function loadAndParseJSON(url:string){
    retrieveJson(url);
}

function retrieveJson(url:string){
    //http://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
    console.log("retrieving JSON");
    let json = new XMLHttpRequest();
    console.log("retrieving JSON");
    json.overrideMimeType("application/json");
    json.open("GET", url, true);
    console.log("retrieving JSON");
    json.onreadystatechange = function(){
        console.log("retrieving JSON");
        console.log(json.readyState);
        console.log(json.status);
      if (json.readyState == 4 && json.status == 200){
          parseJSONIntoTemplates(json.responseText);
      }
    };

}
function parseJSONIntoTemplates(json){
    console.log(json);
}