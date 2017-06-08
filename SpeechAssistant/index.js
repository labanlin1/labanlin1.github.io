/**
 * Created by Laban on 4/24/2017.
 */

var synth =  window.speechSynthesis;
var voices = [];
var voicesSelect = document.querySelector("#voices");
var phrase = document.querySelector("#current-phrase");
var transcriptCollection = document.querySelector(".transcript");
var spoken = true;

phrase.focus();

document.querySelector(".volume").addEventListener('click', toggleSound);

document.querySelector("#current-phrase").addEventListener('keypress', function(e){
    var keyPressed = e.which || e.keyCode;
    if (keyPressed == 13){
        e.preventDefault();
        var newLine = document.createElement("p");
        newLine.appendChild(document.createTextNode(phrase.textContent));
        transcriptCollection.appendChild(newLine);
        transcriptCollection.scrollTop = transcriptCollection.scrollHeight;
        if (spoken) {
            speakText(phrase.textContent);
        }
        phrase.textContent = "";
    }
});

window.onbeforeunload = function(e){
    synth.cancel();
};
function speakText(text){
    var speaker = new SpeechSynthesisUtterance(text);
    var selectedOption = voicesSelect.selectedOptions[0].getAttribute('data-name');
    for(i = 0; i < voices.length ; i++) {
        if(voices[i].name === selectedOption) {
            speaker.voice = voices[i];
        }
    }
    speaker.pitch = 1;
    speaker.rate = 1;
    synth.speak(speaker);
}


populateVoiceList();

//Chrome workaround because it loads the voices after the page is loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function populateVoiceList() {
    voices = synth.getVoices();
    for(var i = 0; i < voices.length ; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
        if(voices[i].default) {
            option.textContent += ' -- DEFAULT';
        }
        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voicesSelect.appendChild(option);
    }

    try{
        //Attempt to set the default language to Google US English Voice
        for (i = 0; i<voices.length; i++){
            if (voices[i].name == "Google US English"){
                voicesSelect.selectedIndex = i;
                break;
            }
        }
    }
    catch (e){
        console.log("US English voice not found");
    }
}


function toggleSound(e){
    var el = e.target;
    while (!el.classList.contains("volume")){
        el=el.parent;
    }
    if (spoken == true){
        el.classList.remove("up");
        el.classList.add("off");
        spoken = false;
    }else{
        el.classList.remove("off");
        el.classList.add("up");
        spoken = true;
    }
}
