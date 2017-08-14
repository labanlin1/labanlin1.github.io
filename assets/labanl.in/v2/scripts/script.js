/**
 * Created by Laban on 2016-10-16.
 */

//EXECUTABLE

/*
 Use JS to enable / disable the animations quickly; it's a much faster toggle than changing the CSS slowly
 */

var animate = false;
var logging = true;

if (animate){
    setTimeout(removeLoadingAnimations,2950); // current time is 2.9 seconds delay + 50ms pause -> check with CSS
}else{
    removeLoadingAnimations();
}



var items,mainSlide,currentSlide, landingSlide;
mainSlide = document.getElementById("main");
landingSlide = document.getElementById("panel");
currentSlide = mainSlide;

//Initialize all portfolio items and links
items = elements("portfolio-item");
initializeSlideEventListeners(items,false);
items = elements("slide-link");
initializeSlideEventListeners(items,false);
//Initialize close buttons
var homeButtons = elements("home");
initializeSlideEventListeners(homeButtons,true);

loadInitialPage();

// var testItem = elements("test-import-info");
// for (var i = 0; i<testItem.length; i++){
//     testItem[i].addEventListener("click", function(){
//         fetch("sampleInformation.html",{method: 'GET'}).then(function(response){
//           console.log(response);
//        });
//     });
// }

window.onhashchange = function(){
    animateHashChange();
};


//Helpers

function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return
}

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className=el.className.replace(reg, ' ')
    }
}

function elements(className){
    return document.getElementsByClassName(className);
}


//Logic

function initializeSlideEventListeners(items, returnHome){
    for (var i = 0; i<items.length; i++){
        var item = items[i];
        try{
            if (returnHome){
                item.addEventListener("click", function(){
                    swapSlides(returnHome);
                });
            }else{
                var slide = elements(item.getAttribute("data-id"))[0];
                if (slide){
                    item.addEventListener("click", function(){
                        swapSlides(returnHome);
                    });
                    if (logging){
                        console.log("The slide for '" + item.getAttribute("data-id") + "' was successfully registered.");
                    }

                }else{
                    if (logging){
                        console.log("No slide found for the reference " + item.getAttribute("data-id"));
                    }
                }
            }
        }
        catch(e){
            if (logging){
                console.log("Failed to attach slide #" + i + " with an appropriate event listener.");
            }
        }
    }
}

function swapSlides(returnHome){
    
    //Default interpretation assumes that we are not returning home; a suitable slide will be attempted first
    returnHome = returnHome || false;

    if (!returnHome){
        //Find the relevant slide name
        var node = event.target;
        var slideName = event.target.getAttribute("data-id");
        while (!slideName) {
            node = node.parentNode;
            if (node == null) {
                break;
            }
            slideName = node.getAttribute("data-id");
        }
    }
    
    //If a slide to show is identified, update the hash to that slide
    if (slideName){
        // window.location.hash = slideName;
        history.replaceState({},"",window.location.hostname + "#" + slideName);
        animateHashChange(false);
    //If no slide is identified, clear the hash and remove the # symbol
    }else{
        history.replaceState({},"","#");
        animateHashChange(false);
        //remove # if possible - does not trigger onpopstate
        // if (typeof window.history.replaceState == 'function'){
        //     var regex = /([^#]+)#/i;
        //     var newLocation = regex.exec(window.location)[1];
        //     if (logging){
        //         console.log(newLocation);
        //     }
        //
        //     history.replaceState({},"",newLocation);
        // }
    }
}

function animateHashChange(delayed){
    delayed = delayed || false;
    var newSlide;
    if (window.location.hash.length == 0){
        newSlide = mainSlide;
    }else{
        newSlide = elements("slide " + window.location.hash.substr(1))[0];
    }
    //Scale-out Effect
    // transitionScaleOutSlides(newSlide, delayed);

    //Fade in/out effect
    transitionFadeOutSlides(newSlide, delayed);

}

function loadInitialPage(){
    if (window.location.hash.length > 0){
        //there may be a relevant slide to show
        //if we can find the slide, then load into that instead
        animateHashChange(true);
    }
}


function transitionScaleOutSlides(newSlide, delayed){
    removeClass(newSlide, "scale-out-exit");
    removeClass(newSlide, "scale-out-exit-delayed");
    removeClass(newSlide, "scale-out-enter");
    removeClass(newSlide, "scale-out-enter-delayed");
    removeClass(newSlide, "hidden");
    removeClass(currentSlide,"scale-out-enter");
    removeClass(currentSlide,"scale-out-enter-delayed");
    removeClass(mainSlide,"scale-out-enter-delayed");
    addClass(currentSlide, "scale-out-exit");
    if (!(newSlide == mainSlide)){
        newSlide.scrollTop = 0;
    }
    if (delayed) {
        addClass(newSlide, "scale-out-enter-delayed");
    }else{
        addClass(newSlide, "scale-out-enter");
    }
    currentSlide = newSlide;
}

function transitionFadeOutSlides (newSlide, delayed){
    removeClass(mainSlide,"scale-out-enter-delayed");
    removeClass(newSlide, "scale-out-enter-delayed");
    removeClass(newSlide, "fade-out");
    removeClass(newSlide, "hidden");
    removeClass(currentSlide,"scale-out-enter-delayed");
    removeClass(currentSlide,"fade-out");
    removeClass(currentSlide,"fade-in");

    if (!(newSlide == mainSlide)){
        newSlide.scrollTop = 0;
    }

    if (delayed) {
        //Delayed enters as panel collapses, and we'll use this nicer animation for entrance emphasis
        addClass(currentSlide,"hidden");
        if (animate){
            addClass(newSlide, "scale-out-enter-delayed");
        }else{
            removeClass(newSlide,"hidden");
        }
    }else{
        //All other slide transitions should use the more subtle and faster fade in/out transition
        addClass(currentSlide,"fade-out");
        addClass(newSlide,"fade-in");
    }

    currentSlide = newSlide;
}

function removeLoadingAnimations(){
    /*
     This changes all .animate to .animated.
     This action is required because the animation required during loading changes based on media queries
     Thus any resizing will cause a new animation to occur, which is just too much of a pain
     Moving from .animate to .animated will hard-set the final values via media query
     */
    var animatedItems = elements("animate");
    while(animatedItems.length >0 ){
        //typically I wouldn't use a while loop, but nested .animate elements exist and require me to do so
        for (var i= 0; i<animatedItems.length; i++) {
            addClass(animatedItems[i], "animated");
            removeClass(animatedItems[i], "animate");
        }
        animatedItems = elements("animate");
    }

    var main = elements("scale-out-enter-delayed");
    removeClass(main[0],"scale-out-enter-delayed");
}

