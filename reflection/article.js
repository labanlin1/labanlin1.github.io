/**
 * Created by Laban on 2017-04-13.
 */

var fps = 60;

//Back Button
//Back button should fade out after .7 seconds of mouse x and y inactivity
document.onmousemove = fadeInBackButton;
var mousePos = null;
element("back-button").addEventListener("click", function(){
    if (!(element("back-button").classList.contains("disabled"))){
        //enabled
        var prev = document.referrer;
        if (prev.match(/[A-Z.a-z/+]labanl\.in/)){
            window.history.back();
        }else{
            window.location.href = "../index.html";
        }
    }
});
var lastTimeOut;
function fadeOutBackButton(e){
    var el = element("back-button");
    el.classList.remove("hidden");
    el.classList.add("fadeOut");
    setTimeout(
        function(){
            disableBackButton(e);
        }, 300);

}
function disableBackButton(e){
    var el = element("back-button");
    el.classList.remove("enabled");
    el.classList.remove("fadeOut");
    mousePos = [e.clientX, e.clientY];
}
function fadeInBackButton(e){
    if (mousePos == null){
        mousePos = [e.clientX, e.clientY];
        return;
    }
    if (Math.max(Math.abs(e.clientX - mousePos[0]), Math.abs(e.clientY - mousePos[1])) > 10){
        var el = element("back-button");
        if (el.classList.contains("enabled")){
            clearTimeout(lastTimeOut);
            lastTimeOut = setTimeout(
                function(){
                    fadeOutBackButton(e)
                }, 700);
        }else{
            el.classList.remove("fadeOut");
            el.classList.add("enabled");
        }
    }
}

//Landing Image
//Landing Image should fade out on scroll
var landingImage = document.querySelector("section.landing-image img");
document.addEventListener("scroll", landingImageOpacity);
function landingImageOpacity(){
    if (landingImage){
        var position = window.pageYOffset || document.documentElement.scrollTop;
        var imageHeight = landingImage.height;
        if (position <= imageHeight) {
            landingImage.style.opacity = 1 - easeOut(((position >= imageHeight ? imageHeight : position) / (1 * imageHeight)));
        }
    }
}

//Images
//Images should expand as req and collapse on scroll
var imageExpanded = null;
var imageAnimationInProcess = false;
var scrollAnchor = null;
var transition = "all .2s ease-out";
var scrollLeeway = 40; //px
var mustFadeOut = false;
var imageCollection = null;
var imageCollectionPos = null;
var originalImagePos = null;
document.addEventListener("scroll", collapseImageListener);

addImageEventListeners();
function addImageEventListeners(){
    var images = document.querySelectorAll(".article img:not(.no-zoom)");
    for (var i = 0 ; i<images.length; i++){
        if (!images[i].classList.contains("lightbox-image")){
            images[i].addEventListener("click", expandImageIntoLightbox);
        }
    }
    var navArrows = document.querySelectorAll(".lightbox .icon");
    for (var i = 0; i < navArrows.length; i++){
        navArrows[i].addEventListener("click", function(e){
            e.stopPropagation();
            var target = e.target;
            var forward = target.classList.contains("right");
            nextImage(forward);
        })
    }
}
function expandImageIntoLightbox(e) {

    if (imageExpanded == null && scrollAnchor == null){

        //Set LightBox Image to source Image
        var imageTarget = e.target;
        imageExpanded = imageTarget;
        imageTarget.style.opacity = 0;
        var image = document.querySelector(".lightbox");
        image.style.backgroundImage = "url(" + imageTarget.src + ")";
        image.style.backgroundColor = "white";

        //Show LightBox
        image.style.transition = null;
        image.classList.add("visible");

        //Set LightBox Position and Dimensions
        //I wanted to use translate because it's apparently more efficient, but the actual animation was too choppy
        image.style.top = imageTarget.getBoundingClientRect().top + "px";
        image.style.left = imageTarget.getBoundingClientRect().left + "px";
        image.style.height = imageTarget.clientHeight + "px";
        image.style.width = imageTarget.clientWidth + "px";
        scrollAnchor = window.pageYOffset || document.body.scrollTop;

        //Due to cover vs contain, scaling down is problematic; fade out instead if cover
        if (imageTarget.parentNode.classList.contains("thumbnail")){
            var parent = imageTarget.parentNode.parentNode;
            if (parent.classList.contains("square")){
                mustFadeOut = true;
            }
        }


        //Identify collection if available
        var thumbnailsWrapper = imageTarget.parentNode.parentNode;
        if (thumbnailsWrapper.classList.contains("nav-arrows")){
            image.classList.add("nav-arrows");
            var thumbs = thumbnailsWrapper.children;
            imageCollection = Array();
            for (var i = 0; i<thumbs.length; i++){
                var thumbDiv = thumbs[i];
                if (thumbDiv && thumbDiv.classList.contains("thumbnail")){
                    imageCollection.push(thumbDiv.children[0].src);
                    if (thumbDiv.children[0].src == imageTarget.src){
                        originalImagePos = i;
                        imageCollectionPos = i;
                    }
                }
            }
        }

        setTimeout(function(){
            image.style.transition = transition;
            image.style.top = "0px";
            image.style.left = "0px";
            image.style.height = "100vh";
            image.style.width = "100vw";
            document.body.style.cursor = "zoom-out";
            image.addEventListener("click", function(){
                collapseImage(mustFadeOut);
            });

        }, 0);
    }

}
function collapseImage(simpleFade){

    //Reverse Animation
    document.body.style.cursor = "auto";
    var image = document.querySelector(".lightbox");
    if (simpleFade){
        if (imageAnimationInProcess == false){
            image.style.transition = null;
            imageExpanded.style.opacity = 1;
            fadeOutImage(image, 0,1.5);
        }
    }else {
        if (imageCollectionPos) {
            image.style.backgroundImage = "url(" + imageCollection[originalImagePos] + ")";
        }
        image.style.transition = transition;
        image.style.top = imageExpanded.getBoundingClientRect().top + "px";
        image.style.left = imageExpanded.getBoundingClientRect().left + "px";
        image.style.height = imageExpanded.clientHeight + "px";
        image.style.width = imageExpanded.clientWidth + "px";
        image.style.backgroundColor = "transparent";

        // setTimeout(resetImageAnimation,300); //same timeout as the transition length

    }
    setTimeout(resetImageAnimation,300);
    image.classList.remove("nav-arrows");
}
function collapseImageListener(){
    if (imageExpanded != null && scrollAnchor != null){
        var scrollDelta = Math.abs(scrollAnchor - document.body.scrollTop);
        if (scrollDelta >= scrollLeeway){
            collapseImage(true);
        }
    }
}
function fadeOutImage(image, frame, duration){
    imageAnimationInProcess = true;
    var totalFrames = duration * fps;
    frame++;
    if (frame <= totalFrames){
        var progress = frame / totalFrames;
        image.style.opacity = 1 - easeOut(progress);
        setTimeout(function(){
            fadeOutImage(image, frame, duration)
        }, 1/fps);
    }else{
        resetImageAnimation();
    }
}
function resetImageAnimation(){
    var image = document.querySelector(".lightbox");
    // image.style.backgroundImage = "";
    image.style.transition = null;
    image.classList.remove("visible");
    image.style.top = null;
    image.style.left = null;
    image.style.width = null;
    image.style.height = null;
    image.style.opacity = null;
    if (imageExpanded){
        imageExpanded.style.opacity = 1;
    }
    imageExpanded = null;
    scrollAnchor = null;
    imageAnimationInProcess = false;
    mustFadeOut = false;
    imageCollection = null;
    imageCollectionPos = null
    originalImagePos = null;
}
function nextImage(forward){
    if (forward) {
        imageCollectionPos += 1;
        if (imageCollectionPos >= imageCollection.length) imageCollectionPos = 0;
    }else {
        imageCollectionPos -=1 ;
        if (imageCollectionPos < 0) imageCollectionPos = imageCollection.length - 1;
    }

    var image = document.querySelector(".lightbox");
    image.transition = transition;
    image.style.backgroundImage = "url(" + imageCollection[imageCollectionPos] + ")";

}

//IFrame Functions
//iframes should be loaded if the screen is large enough or resized to be large enough; else it should load the alternate images
var controls = ["desktop", "tablet", "mobile"];
initializeInteractiveWebsitesAsRequired();
function initializeInteractiveWebsitesAsRequired(){
    //use screen width of 1000px as cutoff point
    if (Math.max(window.innerWidth, document.documentElement.clientWidth) <= 1000){
        //Don't load iframes

        loadIframeAlternatePhotos();

        window.addEventListener("resize", function(){
           if (Math.max(window.innerWidth, document.documentElement.clientWidth)>1000){
               loadiframes();
           }
        });

    }else {

       loadiframes();

        window.addEventListener("resize", function(){
            if (Math.max(window.innerWidth, document.documentElement.clientWidth)<=1000){
                loadIframeAlternatePhotos();
            }
        });

    }
}
function loadiframes(){
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0; i<iframes.length; i++){
        var ifr = iframes[i];
        ifr.src = ifr.dataset.src;
    }
    initializeInteractiveWebsites();
}
function loadIframeAlternatePhotos(){
    var iframeAlternateWrappers = elements("iframe-alternate-photos");
    for (var i = 0; i<iframeAlternateWrappers.length; i++){
        var images = iframeAlternateWrappers[i].getElementsByTagName("img");
        for (var j = 0 ; j<images.length; j++){
            images[j].src = images[j].dataset.src;
        }
    }


}
function initializeInteractiveWebsites(){

    var interactiveWebsites = elements("interactive-website");
    for (var i = 0; i < interactiveWebsites.length; i++){
        var el = interactiveWebsites[i];
        var elIframe;
        if (elIframe = findIframe(el))
        {
            var controlWrapper = findFirstChild(el, "controls");
            for (var j = 0; j < controls.length; j++) {

                var child = findFirstChild(controlWrapper, "desktop");
                if (child)
                {
                    child.addEventListener("click", adjustRelevantIframeSize);
                }

                child = findFirstChild(controlWrapper, "tablet");
                if (child)
                {
                    child.addEventListener("click", adjustRelevantIframeSize);
                }

                child = findFirstChild(controlWrapper, "mobile");
                if (child)
                {
                    child.addEventListener("click", adjustRelevantIframeSize);
                }
            }
        }
    }
}
function adjustRelevantIframeSize(event){
    var newClass = event.target.classList[0];
    var iframeParent = event.target.parentElement;
    while (!iframeParent.classList.contains("interactive-website")){
        iframeParent = iframeParent.parentElement;
    }
    for (var i = 0; i < controls.length; i++) {
        iframeParent.classList.remove(controls[i]);
    }
    iframeParent.classList.add(newClass);
}
function findIframe(element){
    return element.getElementsByTagName("iframe")[0] ? element.getElementsByTagName("iframe")[0] : false;
}


//Scroll Functionality
window.onbeforeunload = function(){
    document.body.scrollTop = 0;
};
var anchors = document.querySelectorAll("[data-href]");
for (var i = 0; i<anchors.length; i++){
    anchors[i].addEventListener("click", changeHash);
}
function changeHash(e){
    window.location.hash = e.target.dataset.href || "";
    hashScroll(false);
}
function hashScroll(delay){
    var hash = window.location.hash;
    if (hash.length > 1){
        hash = hash.substr(1);
        var scrollTo = document.querySelector("[data-anchor='" + hash + "']");
        if (scrollTo != null){
            if (delay){
                setTimeout(function(){
                    smoothScroll(0,.7 * fps, scrollTo.getBoundingClientRect().top,(window.pageYOffset || document.documentElement.scrollTop));
                }, 700);
            }else{
                smoothScroll(0,.7 * fps, scrollTo.getBoundingClientRect().top,(window.pageYOffset || document.documentElement.scrollTop));
            }
        }
    }
}

hashScroll(true);

function smoothScroll(framesComplete, totalFrames, verticalDistance, origin){
    framesComplete++;
    var percentage = easeInOut(framesComplete/totalFrames) * verticalDistance;
    document.body.scrollTop = origin + percentage;
    if (framesComplete < totalFrames){
        setTimeout(function(){
            smoothScroll(framesComplete, totalFrames, verticalDistance, origin);
        }, 1/fps * 1000);
    }
}


//Animation Functions
function easeOut(t) { return t*(2-t) }
function easeInOut (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }

//Global Helper Functions
function elements(classes){
    return document.getElementsByClassName(classes);
}
function element(id){
    return document.getElementById(id);
}
function findFirstChild(element, childName){
    var childNodes = element.children;
    for ( var i = 0; i < childNodes.length; i++){
        var childNode = childNodes[i];
        if (childNode.classList.contains(childName)){
            return childNode;
        }
    }
    return false;
}
