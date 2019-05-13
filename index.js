/**
 * Created by Laban on 2017-04-11.
 */

element("show-hide-intro").addEventListener("click", toggleIntro);
var introTimeOut;

function element(id){
    return document.getElementById(id);
}

function toggleIntro(){

    //Variables
    var introEl = element("intro");
    var fps = 60;
    var duration = .5; //seconds

    if (introEl.offsetHeight == 0 || introEl.offsetHeight == null){
        //capture height
        introEl.style.height = "auto";
        var fullHeight = introEl.offsetHeight;
        introEl.style.height = "0";

        //adjust heights
        adjustHeight(0,duration*fps + 1, fullHeight, introEl, fps, duration , true);
        element("show-hide-intro").innerHTML = "less";
    }else{
        adjustHeight(0,duration*fps + 1, parseInt(introEl.offsetHeight), introEl, fps, duration , false);
        element("show-hide-intro").innerHTML = "more";
    }
}


function adjustHeight(currentIteration, limit, fullHeight, el, fps, duration, forwards) {

    currentIteration++;
    if (currentIteration < limit){
        var percentageComplete =  currentIteration / (duration * fps);
        var easingAdjustedPercentageComplete = easeInOut(percentageComplete);
        if (forwards){
            el.style.height = (easingAdjustedPercentageComplete * fullHeight).toString() + "px";
        }else{
            el.style.height = (fullHeight - (easingAdjustedPercentageComplete * fullHeight)).toString() + "px";
        }
        introTimeOut = setTimeout(function(){
            adjustHeight(currentIteration, limit, fullHeight, el, fps, duration, forwards);
        }, 1000/fps);

    }else{
        clearTimeout(introTimeOut);
        if (forwards){
            el.style.height = "auto";
        }
    }


}

function easeInOut(t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }

//Preload Images
function preload(images){
    var imagesArray = new Array(images.length)
    for (var i = 0; i < images.length; i++){
        imagesArray[i] = new Image()
        imagesArray[i].src = `https://labanl.in/images/${images[i]}`
    }
}

// dir /b > filenames.txt in Windows to copy all file names in /images
let imageNames = [
    "DayToDay-thumb.png",
    "DayToDay.png",
    "labanl.in-thumb.png",
    "labanlin.png",
    "nhacks.io-thumb.png",
    "nhacks.io.png",
    "nhacks.png",
    "nhacks2.png ",
    "transit-alarm.png",
    "TransitAlarm-thumb.png",
    "TransitAlarm.png",
    "voice-thumb.png",
    "voice.png",
]

preload(imageNames)