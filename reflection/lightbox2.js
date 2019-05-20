var lightbox2 = document.getElementById("lightbox2")
var lightbox2Image = document.getElementById("lightbox2-image")
var animationInProgress = false
var selectedFigure = null

document.getElementById("close-album").addEventListener("click", hideLightbox)
document.getElementById("next-album").addEventListener("click", () => { changeImage(true) })
document.getElementById("prev-album").addEventListener("click", () => { changeImage(false) })
document.addEventListener("keyup", escapeHandler);

//Add event listeners for all albums
var albumImages = document.querySelectorAll(".album img")
for (let i = 0; i < albumImages.length; i++) {
    albumImages[i].addEventListener("click", expandAlbumImage)
}

async function expandAlbumImage(e) {
    e.target.style.opacity = 0
    selectedFigure = e.target.parentElement.parentElement
    lightbox2.classList.add("album")
    updateAncillaryLightboxElements(selectedFigure)
    var naturalImagePositions = {
        TLx: 0,
        TLy: 0,
        height: 0,
        width: 0,
        clipPath: "inset(0% 0% 0% 0%)"
    }

    var maskBoundingRect = e.target.getBoundingClientRect()
    var clips = {
        x: 0,
        y: 0
    }
    // If the thumbnails are squares, we have to do a lot more work
    if (e.target.parentElement.parentElement.parentElement.classList.contains("square")) {
        // Get Natural Aspect Ratio of Image
        let img = new Image()
        img.src = e.target.src
        if (img.naturalWidth > img.naturalHeight) {
            // Case 1
            let renderedWidth = img.naturalWidth / img.naturalHeight * maskBoundingRect.height
            let clipPortion = (renderedWidth - maskBoundingRect.width) / 2 / renderedWidth * 100
            naturalImagePositions = {
                TLx: maskBoundingRect.left - ((renderedWidth - maskBoundingRect.width) / 2),
                TLy: maskBoundingRect.top,
                height: maskBoundingRect.height,
                width: renderedWidth,
                clipPath: `inset(0% ${clipPortion}%)`,
            }
            clips = {
                x: clipPortion,
                y: 0
            }
        } else {
            // Case 2
            let renderedHeight = img.naturalHeight / img.naturalWidth * maskBoundingRect.width
            let clipPortion = (renderedHeight - maskBoundingRect.height) / 2 / renderedHeight * 100
            naturalImagePositions = {
                TLx: maskBoundingRect.left,
                TLy: maskBoundingRect.top - ((renderedHeight - maskBoundingRect.height) / 2),
                height: renderedHeight,
                width: maskBoundingRect.width,
                clipPath: `inset(${clipPortion}% 0%)`
            }
            clips = {
                x: 0,
                y: clipPortion
            }
        }

    } else {
        naturalImagePositions = {
            TLx: maskBoundingRect.left,
            TLy: maskBoundingRect.top,
            height: maskBoundingRect.height,
            width: maskBoundingRect.width,
            clipPath: `inset(0% 0%)`,
        }
        clips = {
            x: 0,
            y: 0
        }
    }

    lightbox2Image.style.backgroundImage = `url("${e.target.src}"`
    lightbox2Image.style.top = `${naturalImagePositions.TLy}px`
    lightbox2Image.style.left = `${naturalImagePositions.TLx}px`
    lightbox2Image.style.width = `${naturalImagePositions.width}px`
    lightbox2Image.style.height = `${naturalImagePositions.height}px`
    lightbox2Image.style.clipPath = naturalImagePositions.clipPath

    await nextFrame()

    animate(naturalImagePositions,
        {
            left: 0,
            top: 0,
            height: document.documentElement.clientHeight,
            width: document.documentElement.clientWidth
        },
        clips,
        { x: 0, y: 0 },
        500
    )
}

async function animate(initialPosition, endPosition, initialClip, endClip, duration) {
    animationInProgress = true
    lightbox2.classList.add("fullSize")
    await nextFrame()
    lightbox2.classList.add("transition", "active")

    let deltaPosition = {
        x: endPosition.left - initialPosition.TLx,
        y: endPosition.top - initialPosition.TLy
    }

    let deltaClip = {
        x: endClip.x - initialClip.x,
        y: endClip.y - initialClip.y
    }

    let deltaSize = {
        x: endPosition.width - initialPosition.width,
        y: endPosition.height - initialPosition.height
    }

    lightbox2Image.style.clipPath = `inset(${initialClip.y}% ${initialClip.x}%)`

    let progress = 0
    let startTime = await nextFrame()
    let currentTime = startTime
    
    while(progress < .99){
        progress = easeOut((currentTime - startTime)/ duration) //Add a function to turn this from linear to ease-in or ease-out, for example
        let height = (initialPosition.height + deltaSize.y * progress)
        let width = (initialPosition.width + deltaSize.x * progress)
        lightbox2Image.style.width = `${width}px`
        lightbox2Image.style.height = `${height}px`
        lightbox2Image.style.left = `${initialPosition.TLx + deltaPosition.x * progress}px`
        lightbox2Image.style.top = `${initialPosition.TLy + deltaPosition.y * progress}px`
        lightbox2Image.style.clipPath = `inset(${initialClip.y + deltaClip.y * progress}% ${initialClip.x + deltaClip.x * progress}%)`
        currentTime = await nextFrame()
    }

    // For some reason, this refuses to reach 1, so we'll just set it to 1 when it gets close enough
    progress = 1

    let height = (initialPosition.height + deltaSize.y * progress)
    let width = (initialPosition.width + deltaSize.x * progress)
    lightbox2Image.style.width = `${width}px`
    lightbox2Image.style.height = `${height}px`
    lightbox2Image.style.left = `${initialPosition.TLx + deltaPosition.x * progress}px`
    lightbox2Image.style.top = `${initialPosition.TLy + deltaPosition.y * progress}px`
    lightbox2Image.style.clipPath = `inset(${initialClip.y + deltaClip.y * progress}% ${initialClip.x + deltaClip.x * progress}%)`

    // If lightbox is fullscreen, then add event listeners to remove the lightbox
    if (endPosition.width > initialPosition.width) {
        document.addEventListener("scroll", hideLightbox)
    }

    animationInProgress = false
}

function nextFrame(){
    return new Promise(resolve => {
        window.requestAnimationFrame((timestamp) =>{
            resolve(timestamp)
        })
    })
}

function hideLightbox() {
    if (animationInProgress) return
    animationInProgress = true
    document.removeEventListener("scroll", hideLightbox)
    lightbox2.classList.add("fadeout")
    try{
        selectedFigure.querySelector("img").style.opacity = null
    }catch(e){}
    try{
        selectedFigure.style.opacity = null
    }catch(e){}
    
    window.setTimeout(() => {
        lightbox2Image.style.backgroundImage = ""
        lightbox2.classList.remove("active", "fadeout", "transition", "fullSize", "album")
        lightbox2Image.style.width = "0px"
        lightbox2Image.style.height = "0px"
        selectedFigure = null
        animationInProgress = false
    }, 310)
}

function updateAncillaryLightboxElements(e) {
    if (e.previousElementSibling === null) {
        document.getElementById("prev-album").classList.add('hide')
    } else {
        document.getElementById("prev-album").classList.remove('hide')
    }
    if (e.nextElementSibling === null) {
        document.getElementById("next-album").classList.add('hide')
    } else {
        document.getElementById("next-album").classList.remove('hide')
    }
    if (e !== null) {
        // Copy caption into lightbox
        let caption = ""
        try {
            caption = e.querySelector(".caption").textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
        } catch (e) {

        }
        lightbox2.querySelector(".caption").textContent = caption
    }
}

function easeOut(t) { return t * (2 - t) }

function changeImage(forward) {
    selectedFigure.querySelector("img").style.opacity = null
    var newFigure = null
    if (forward) {
        newFigure = selectedFigure.nextElementSibling
        if (newFigure !== null) selectedFigure = newFigure
    } else {
        newFigure = selectedFigure.previousElementSibling
        if (newFigure !== null) selectedFigure = newFigure
    }
    if (newFigure) {
        lightbox2Image.style.backgroundImage = `url(${newFigure.firstElementChild.firstElementChild.src}`
        updateAncillaryLightboxElements(newFigure)
    }
}

function escapeHandler(event) {
    //Escape Pressed and image is expanded
    if (event.keyCode == 27 && selectedFigure !== null) hideLightbox()
}


var singleImages = document.querySelectorAll(".article .single-image:not(.no-zoom) img")
for (let i = 0; i < singleImages.length; i++) {
    singleImages[i].addEventListener("click", expandSingleImage)
}

async function expandSingleImage(e){
    selectedFigure = e.target
    e.target.style.opacity = 0
    lightbox2Image.style.backgroundImage = `url("${e.target.src}"`
    let naturalImagePositions = e.target.getBoundingClientRect()
    naturalImagePositions.TLx = naturalImagePositions.left
    naturalImagePositions.TLy = naturalImagePositions.top
    lightbox2Image.style.top = `${naturalImagePositions.top}px`
    lightbox2Image.style.left = `${naturalImagePositions.left}px`
    lightbox2Image.style.width = `${naturalImagePositions.width}px`
    lightbox2Image.style.height = `${naturalImagePositions.height}px`


    let caption = ""
    try {
        if (e.target.nextElementSibling.classList.contains("caption")){
            caption = e.target.nextElementSibling.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
        }
        
    } catch (e) {

    }
    lightbox2.querySelector(".caption").textContent = caption
    await nextFrame()
    animate(naturalImagePositions,
        {
            left: 0,
            top: 0,
            height: document.documentElement.clientHeight,
            width: document.documentElement.clientWidth
        },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        500
    )
    
}