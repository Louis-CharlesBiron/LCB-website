
// Scroll to top button
goToTop.onclick=()=>document.documentElement.scrollTo(0, 0)

// Display age
ageEl.textContent = getAge(2005)

// Start CDE preview
let cdePreviewStarted = false
startCDEPreview.onpointerup=()=>{
    if (!cdePreviewStarted) {
        cdePreviewStarted = true

        cdePreview.style.opacity = 1
        cdePreview_l2.style.opacity = 1
        startCDEPreview.style.opacity = 0

        angelToAdd1.style.borderBottom = "5px solid rgb(var(--c2), 0)"

        angelToAdd1.classList.add("angelicText")
        angelToAdd2.classList.add("angelicText")
        angelToAdd3.classList.add("angelicBox")

        toggleCDEPreviewAudio.title = "Toggle audio..."
        toggleCDEPreviewAudio.removeAttribute("disabled")
        toggleCDEPreviewAudio.style.opacity = 0.25
        toggleCDEPreviewAudio.style.cursor = "pointer"

        CDEPreviewSpeed.removeAttribute("disabled")
        CDEPreviewSpeed.style.cursor = "pointer"
        CDEPreviewSpeed.parentElement.removeAttribute("disabled")
        CDEPreviewSpeed.parentElement.style.opacity = 0.25
        CDEPreviewSpeed.parentElement.title = "Modify generation speed..."

        setTimeout(()=>startCDEPreview.remove(),1000)

        CDEUtils.noTimeoutInterval(()=>{
            CVS_cdePreview.fpsLimit = null
            CVS_cdePreview_fpsCounter.runRecommendedFPSEvaluation((results)=>{
                CVS_cdePreview.fpsLimit = Math.max(60, results.recommendedValue)
            }, 5000, 5, false)
        }, 20000)

        generateCDEPreview()
        CDEPreviewStart()
    }
}

// Img to text example's original image
textImg.onpointerup=(e)=>{
    e.preventDefault()
    if (e.ctrlKey) window.open("https://thumbs.dreamstime.com/b/bright-pixel-art-sunflower-vector-format-retro-bit-floral-illustration-digital-decor-summer-themes-vintage-design-320809663.jpg", "_blank")
}

// Set img to text example's cursor style
document.onkeydown=e=>{
    const k = e.key.toLowerCase()
    if (k=="control") textImg.style.cursor = "pointer"
}
document.onkeyup=e=>{
    const k = e.key.toLowerCase()
    if (k=="control") textImg.style.cursor = "text"
}

// Toggle CDE preview audio
toggleCDEPreviewAudio.onpointerup=()=>{
    if (backgroundAudioDisplay) {
        const hasAudioCurrently = !backgroundAudioDisplay.disableAudio
        toggleCDEPreviewAudio.src = hasAudioCurrently ? "img/volume_off.svg" : "img/volume_up.svg"
        backgroundAudioDisplay.disableAudio = hasAudioCurrently
    }
}

// CDE preview audio opacity effect
const CDEPreviewAudioHoverOpacity = 0.4
toggleCDEPreviewAudio.onmouseenter=()=>{
    if (backgroundAudioDisplay) {
        backgroundAudioDisplay.playAnim(new Anim((prog)=>{
            backgroundAudioDisplay.a = prog*CDEPreviewAudioHoverOpacity
        }, 750, Anim.easeOutBack))
    }
}
toggleCDEPreviewAudio.onmouseleave=()=>{
        if (backgroundAudioDisplay) {
        backgroundAudioDisplay.playAnim(new Anim((prog)=>{
            backgroundAudioDisplay.a = CDEUtils.clamp((1-prog)*CDEPreviewAudioHoverOpacity, audioDisplayAlpha)
        }, 750, Anim.easeInOutQuad, ()=>CDEPreviewAudioHoverOpacity.a=audioDisplayAlpha))
    }
}

// CDE preview generation speed
CDEPreviewSpeed.oninput=()=>{
    if (CVS_cdePreview) {
        CDEPreviewSpeedValueDisplay.textContent = `(${CVS_cdePreview.speedModifier = +CDEPreviewSpeed.value}x)`
    }
}

// In Stasis img carrousel
let ISImgCarrousel_i = 0, ISImgCarrousel_images = ["img/cool10.png", "img/cool7.png", "img/cool9.png", "img/cool8.png", "img/cool11.png", "img/cool18.png", "img/cool17.png", "img/cool12.png", "img/cool16.png", "img/cool13.png", "img/cool15.png", "img/cool14.png"],
    ISImgCarrousel_images_ll = ISImgCarrousel_images.length, carrouselLock = true, autoUpdateCarrouselRegulatedCB = CDEUtils.getRegulationCB(()=>carrouselLock=true, 2250)

function updateCarrousel(indexIncrement) {
    autoUpdateCarrouselRegulatedCB()
    inStasisImages.style.backgroundImage = `url(${ISImgCarrousel_images[ISImgCarrousel_i=(ISImgCarrousel_i+indexIncrement<0?ISImgCarrousel_images_ll-1:ISImgCarrousel_i+indexIncrement)%ISImgCarrousel_images_ll]})`
}

inStasisImagesGoLeft.onclick=()=>{
    carrouselLock = false
    updateCarrousel(-1)
}
inStasisImagesGoRight.onclick=()=>{
    carrouselLock = false
    updateCarrousel(1)
}

setInterval(()=>{
    if (carrouselLock) updateCarrousel(1)
}, 7000)

// Toggle In Stasis images
let ISImg_shown = true
toggleInStasisImages.onclick=()=>{
    if (ISImg_shown = !ISImg_shown) {
        toggleInStasisImages.src = "img/X.svg"
        inStasisImages.style.opacity = 1
        textUnderlayToggle1.classList.add("textUnderlay")
        textUnderlayToggle2.classList.add("textUnderlay")
        inStasisImagesGoSomewhere.style.display = "flex"
    } else {
        toggleInStasisImages.src = "img/play.svg"
        inStasisImages.style.opacity = 0
        textUnderlayToggle1.classList.remove("textUnderlay")
        textUnderlayToggle2.classList.remove("textUnderlay")
        inStasisImagesGoSomewhere.style.display = "none"
    }
}

// Position image descriptions
function positionImageDescriptions(preventRecall) {
    document.querySelectorAll(".imageDescription").forEach(el=>{
        const parentImg = el.previousElementSibling, parentImgBCR = parentImg.getBoundingClientRect(), elBCR = el.getBoundingClientRect()
        el.style.width = parentImgBCR.width-14+"px"
        el.style.left = parentImgBCR.x+(parentImgBCR.width/2)-((parentImgBCR.width-14)/2)+"px"
        el.style.bottom = -10-elBCR.height+"px"
        if (!preventRecall) setTimeout(()=>positionImageDescriptions(true),700)
    })
}positionImageDescriptions()

const imageDescPositionDelay = CDEUtils.getRegulationCB(()=>positionImageDescriptions(), 250)
window.addEventListener("resize",imageDescPositionDelay)


// images borders
const borderCVS = [], imgBordersParentMapping = new Map()

function positionFloatingBorder(borderEl, img, offset=7, padding=30) {
    const imgBCR = img.getBoundingClientRect()
    borderEl.style.left = (imgBCR.x-offset-padding-3)+"px"
    borderEl.style.top =  (12-padding)+"px"
    borderEl.style.width =  (imgBCR.width+padding*2)+"px"
    borderEl.style.height = (imgBCR.height+offset+padding*2)+"px"
}

function drawBorders(reposition) {
    const b_ll = borderCVS.length
    for (let i=0;i<b_ll;i++) {
        const CVS = borderCVS[i], profile = CVS.render.profile1.update(Color.rgba(...Color.random(null, false, [180, 230], [180, 230], [180, 230]).slice(0,3), .75), null, null, null, 2), lineType = Render.LINE_TYPES.CUBIC_BEZIER
              minX = 10, minY=14, padding = 23, maxX = CVS.width-minX, maxY = CVS.height-minY, getVar=(variation=5)=>CDEUtils.random(-variation, variation)
    
        CVS.clear()
        CVS.render.stroke(lineType([minX+getVar()-padding,minY+getVar()], [maxX+getVar()+padding, minY+getVar()]), profile) // top
        CVS.render.stroke(lineType([minX+getVar(),minY+getVar()-padding], [minX+getVar(), maxY+getVar()+padding]), profile) // left
        CVS.render.stroke(lineType([maxX+getVar()+padding, maxY+getVar()], [minX+getVar()-padding, maxY+getVar()]), profile) // bottom
        CVS.render.stroke(lineType([maxX+getVar(), maxY+getVar()+padding], [maxX+getVar(), minY+getVar()-padding]), profile) // right



        if (reposition) positionFloatingBorder(CVS.cvs.parentElement, imgBordersParentMapping.get(CVS.cvs.parentElement))
    }
}

;[...document.querySelectorAll(".ci_medium.highlightable, .cover.highlightable")].forEach(el=>{
    const borderEl = document.createElement("div"), innerCvs = document.createElement("canvas")
    borderEl.className = "floatingBorder"

    el.parentElement.appendChild(borderEl)
    imgBordersParentMapping.set(borderEl, el)
    positionFloatingBorder(borderEl, el)
    borderEl.appendChild(innerCvs)

    const innerCVS = new Canvas(innerCvs, null, null, el)
    innerCVS.initializeStatic()
    borderCVS.push(innerCVS)

    el.onmouseenter=()=>borderEl.style.opacity = 1
    el.onmouseleave=()=>borderEl.style.opacity = 0
})

CDEUtils.noTimeoutInterval(()=>drawBorders(true), 225)

const imageBordersPositionDelay = CDEUtils.getRegulationCB(()=>drawBorders(true), 500)
window.addEventListener("resize",imageBordersPositionDelay)