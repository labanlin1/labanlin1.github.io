/**
 * Created by Laban on 2017-04-11.
 */

element("show-hide-intro").addEventListener("click", toggleIntro4);
var introTimeOut;

function elements(classes){
    return document.getElementsByClassName(classes);
}

function element(id){
    return document.getElementById(id);
}

function toggleIntro() {
    var introEl = element("intro");
    if (introEl.classList.contains("collapsed")){
        introEl.classList.remove("collapsed");
        introEl.classList.add("expanded");
        element("show-hide-intro").innerHTML = "show less";

    }else{
        introEl.classList.remove("expanded");
        introEl.classList.add("collapsed");
        element("show-hide-intro").innerHTML = "read more";
    }

}

function toggleIntro2() {
    var introEl = element("intro");
    var prevHeight = introEl.offsetHeight;
    var maxHeight =  introEl.style.maxHeight;
    if (maxHeight == null || maxHeight == 0){
        //Expand
        maxHeight = 0;
        var expandAnimation = setInterval(function(){
            console.log("expand running");
            introEl.style.maxHeight = ((maxHeight += 50) + "px");
            var sizeCheck = setTimeout(function(){
                console.log("timeout running");
                if (prevHeight == introEl.offsetHeight){
                    clearInterval(expandAnimation);
                    clearInterval (sizeCheck);
                }else{
                    prevHeight = introEl.offsetHeight;
                }
            }, 1000/60/2);

        }, 1000/60);
    }else{
        //Collapse
    }
    console.log(introEl.style.maxHeight);
    var expandAnimation = setInterval(function(){
        console.log(introEl.style.maxHeight);
        if (!(prevHeight == introEl.offsetHeight)){
            prevHeight = introEl.offsetHeight;
        }else{
            clearInterval(expandAnimation);
        }
    },1000/60);
}

function toggleIntro3(){
    var introEl = element("intro");
    //Expand
    console.log(introEl.style.getPropertyValue('transition-duration'));
    introEl.style.transition = "none";
    introEl.style.maxHeight = "none";
    var fullHeight = introEl.offsetHeight;
    introEl.style.height = "0";
    introEl.style.transition = "all .3s ease-in-out";
    introEl.style.height = fullHeight.toString() + "px";

}

function toggleIntro4(){

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
        element("profile-picture").classList.add("shrink");
    }else{
        adjustHeight(0,duration*fps + 1, parseInt(introEl.offsetHeight), introEl, fps, duration , false);
        element("show-hide-intro").innerHTML = "read more";
        element("profile-picture").classList.remove("shrink");
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
