/**
 * Created by Laban on 2016-10-16.
 */


//Functions

function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
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
    var elements = document.getElementsByClassName(className);
    return document.getElementsByClassName(className);
}

function swapSlides(returnHome){

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

    if (slideName){
        history.replaceState({},"",window.location.hostname + "#" + slideName);
        animateHashChange(false);
        // window.location.hash = slideName;
    }else{
        // window.location.hash = "";
        history.replaceState({},"","#");
        animateHashChange(false);
        //remove # if possible - does not trigger onpopstate
        if (typeof window.history.replaceState == 'function'){
            var regex = /([^#]+)#/i;
            var newLocation = regex.exec(window.location)[1];
            history.replaceState({},"",newLocation);
        }
    }
}

function pairItemwithSlide(items, swap){

    for (var i = 0; i<items.length; i++){
        var item = items[i];
        try{
            if (swap){
                item.addEventListener("click", function(){
                    swapSlides(swap);
                });
            }else{
                var slide = elements(item.getAttribute("data-id"))[0];

                if (slide){
                    item.addEventListener("click", function(){
                        swapSlides(swap);
                    });
                }else{
                    console.log("No slide found.");
                }
            }
        }
        catch(e){
            console.log("Failed to attach slide #" + i + " with an appropriate event listener.");
        }
    }
}

function loadInitialPage(){
    if (window.location.hash.length > 0){
        //there may be a relevant slide to show
        //if we can find the slide, then load into that instead
        animateHashChange(true);
    }
}

function animateHashChange(delayed){
    delayed = delayed || false;
    var newSlide;
    var regex = /(?:.+?)#([\s\S]*)/i;
    var hash = "";
    try{
        hash = regex.exec(window.location.href)[1];
    }
    catch(e){
        hash = "";
    }


    if (hash.length == 0){
        newSlide = mainSlide;
        console.log("xx");
    }else{
        newSlide = elements("slide " + window.location.hash.substr(1))[0];
    }
    if (newSlide){
        removeClass(newSlide, "scale-out-exit");
        removeClass(newSlide, "scale-out-exit-delayed");
        removeClass(newSlide, "scale-out-enter");
        removeClass(newSlide, "scale-out-enter-delayed");
        removeClass(newSlide, "hidden");

        removeClass(currentSlide,"scale-out-enter");
        removeClass(currentSlide,"scale-out-enter-delayed");
        removeClass(mainSlide,"scale-out-enter-delayed");

        addClass(currentSlide, "scale-out-exit");

        if (delayed) {
            addClass(newSlide, "scale-out-enter-delayed");
        }else{
            addClass(newSlide, "scale-out-enter");
        }
        currentSlide = newSlide;
    }
}

var items,mainSlide,currentSlide, landingSlide;

mainSlide = document.getElementById("main");
landingSlide = document.getElementById("landing");
currentSlide = mainSlide;

items = elements("portfolio-item");
pairItemwithSlide(items,false);

closeButtons = elements("close");
pairItemwithSlide(closeButtons,true);

loadInitialPage();

window.onhashchange = function(){
    animateHashChange();
};