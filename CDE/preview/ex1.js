// TODO, put in Utils
function fade(prog, i, minValue=0, maxValue=5) {
    maxValue -= minValue
    return i%2?minValue+maxValue*(1-prog):minValue+maxValue*prog
}
function getNearestDots(dot, shape) {
    let dots = shape.dots, d_ll = dots.length, dotX = dot.x, dotY = dot.y, res = []
    for (let i=0;i<d_ll;i++) {
        const atDot = dots[i]
        if (atDot.id != dot.id) res.push([atDot, CDEUtils.getDist(dotX, dotY, atDot.pos[0], atDot.pos[1])])
    }
    return res.toSorted((d1, d2)=>d1[1]-d2[1])
}
function getInputRegulationCB(callback, msDelay) {
    let timeout
    return ()=>{
        clearTimeout(timeout)
        timeout = setTimeout(()=>callback(), msDelay)
    }
}


// GRADIENT
function createBgGradient(colorStops, type, height=CVS_cdePreview.height) {
    type ??= Gradient.TYPES.LINEAR
    const backgroundGradient = new FilledShape((ctx, shape)=>new Gradient(ctx, shape, colorStops, type, 65+180), true, null, [
        new Dot([0,CVS_cdePreview.height-height]),
        new Dot([CVS_cdePreview.width,CVS_cdePreview.height-height]),
        new Dot([CVS_cdePreview.width, CVS_cdePreview.height]),
        new Dot([0, CVS_cdePreview.height]),
    ], 0)
    backgroundGradient.compositeOperation = Render.COMPOSITE_OPERATIONS.LIGHTER
    return backgroundGradient
}

let backgroundGradient1, backgroundGradient2, backgroundGradient3

function generateGradients() {
    backgroundGradient1 = createBgGradient([
        [.0, [2, 0, 36, 1]],
        [.4, [65, 9, 121, .5]],
        [1, [0, 178, 214, .25]]
    ]),
    backgroundGradient2 = createBgGradient([
        [0, [239, 213, 255, 1]],
        [1, [0,0,0,0]]
    ]),
    backgroundGradient3 = createBgGradient([
        [0, [2, 0, 36,   .15]],
        [.4, [65, 9, 121, .15]],
        [1, [0, 178, 214, .15]]
    ], Gradient.TYPES.RADIAL, 500)
    CVS_cdePreview.add(backgroundGradient1)
    CVS_cdePreview.add(backgroundGradient2)
    CVS_cdePreview.add(backgroundGradient3)
}



// STARS
function createStars(gapX=30, maxAlphaInit=1.15, maxRadiusInit=10, rotationTime=120000, dotAnimDurationRange=[4000, 7000], enableGlow=true, limit=100, lineOpacitySubstractor=0.08, rotationDir=1) {
    return new Shape([0,CVS_cdePreview.height/2],
        Shape.generate(null, [0,0], CVS_cdePreview.width, gapX, [-CVS_cdePreview.height/2, CVS_cdePreview.height/2], (dot)=>{
    
            let distance = CDEUtils.random(-38, 38), modifier = CDEUtils.random(0.1, 1, 2), duration = -CDEUtils.random(...dotAnimDurationRange), iy = dot.y, ay = 0
            setTimeout(()=>{
                dot.playAnim(new Anim((prog, i)=>{
                    const dy = ((i%2)||-1)*distance*prog-ay
                    dot.y += dy
                    ay += dy
        
                    const maxAlpha = maxAlphaInit*modifier, maxRadius = maxRadiusInit-((maxRadiusInit/2)*modifier)
                    dot.a = fade(prog, i, 0.15, maxAlpha)
                    dot.radius = fade(prog, i, 2, maxRadius)
                
                    if (prog == 1) {
                        iy = dot.y
                        ay = 0
                    }
                }, duration, Anim.easeInOutQuad))
            }, CDEUtils.random(0, 2000))
            dot.setupResults = CanvasUtils.getDraggableDotCB(true)
    
        }), 0, [225, 225, 255, 0], limit, (render, dot, ratio, setupRes, mouse, dist, shape)=>{
    
            const nearestDots = getNearestDots(dot, shape), nd_ll = nearestDots.length, threshold = 100
            for (let i=0;i<nd_ll;i++) {
                const dotInfo = nearestDots[i]
                if (dotInfo[1] > threshold) break
                CanvasUtils.drawLine(dotInfo[0], dot, [225,225,255,CDEUtils.mod(dot.a-lineOpacitySubstractor, dot.getRatio(dotInfo[1]))], 3)
                CanvasUtils.drawOuterRing(dot, CVS_cdePreview.render.profile1.update(Color.rgba(dot.r, dot.g, dot.b, CDEUtils.mod(maxAlphaInit*.25, ratio)), "none", null, null, 1), 3)
                if (enableGlow) CanvasUtils.drawOuterRing(dot, CVS_cdePreview.render.profile1.update(Color.rgba(dot.r, dot.g, dot.b, CDEUtils.mod(maxAlphaInit*.25, ratio)), "blur(2px)", null, null, 1), 3)// maybe laggy
            }
    
            // DRAG
            dot.setupResults(dot, mouse, dist, ratio)
    
            // BORDER POS RESET
            if ((!CVS_cdePreview.isWithin(dot.pos, dot.radius+5) && dot.x > CVS_cdePreview.width/2) || dot.x < -50) {
                dot.pos = [CDEUtils.random(-(20+dot.radius), CVS_cdePreview.width/2.15), CDEUtils.random(10, CVS_cdePreview.height*1.15)]
            }
    
        }, null, (obj)=>{
    
        const effectCenterPos = CVS_cdePreview.getResponsivePos([0.5, 1.2])
        obj.playAnim(new Anim((prog, i)=>{
            obj.rotateAt(prog*360*rotationDir, effectCenterPos)
            obj.scaleAt([fade(prog, i, 1, 2), fade(prog, i, 1, 2)], effectCenterPos)
        }, -rotationTime))
    
    })
}

let backgroundStars1, backgroundStars2

function generateStars() {
    backgroundStars1 = createStars(),
    backgroundStars2 = createStars(40, 0.28, 5, 600000, [5000, 10000], false, 400, 0.1)

    CVS_cdePreview.add(backgroundStars1)
    CVS_cdePreview.add(backgroundStars2)
}



// GROUND
function createGround(heightPourcentile, groundColor, groundLineColor, dotSpacing=100) {
    return new FilledShape(groundColor, true, [0, CVS_cdePreview.pct(heightPourcentile, false)],
        [new Dot([0, CVS_cdePreview.height]), ...Shape.generate(Render.Y_FUNCTIONS.LINEAR(0), null, CVS_cdePreview.width+dotSpacing, dotSpacing, [-12.5, 12.5], (dot, lastDot)=>{
            dot.addConnection(lastDot)

        }), new Dot(CVS_cdePreview.size)],
        3, groundLineColor, 100, (render, dot, ratio)=>{
            CanvasUtils.drawDotConnections(dot, CVS_cdePreview_l2.render.profile1.update(groundLineColor, null, null, null, 3))
            dot.radius = CDEUtils.mod(dot.getInitRadius()*2, ratio, dot.getInitRadius()*2*0.8)
            dot.a = CDEUtils.mod(1, ratio, 0.8)
        }, null, null, null, null, true
    )
}

let ground1, ground2, ground3

function generateGround() {
    CVS_cdePreview_l2.add(ground1 = createGround(0.8, [14, 20, 53, 1], [84, 90, 133, 1]))
    CVS_cdePreview_l2.add(ground2 = createGround(0.88, [12, 10, 43, 1], [57, 63, 110, 1], 70))
    CVS_cdePreview_l2.add(ground3 = createGround(0.935, [4, 8, 35, 1], [44, 50, 93, 1], 157))
}



// TREES
const treeModifier = CDEUtils.random(0,1), treeSizeMin = 60, treeSizeMax = 80, treeModSize = 0.6, treeXMod = 0.91
function generateTrees() {
    ground1.dots.forEach((dot)=>{
        const treeModifier = CDEUtils.random(0,1),
                tree = new ImageDisplay("img/aTree.svg", [100,100], [CDEUtils.random(treeXMod*treeSizeMin*(treeModifier||treeModSize), treeXMod*treeSizeMax*(treeModifier||treeModSize))+"%", CDEUtils.random(treeSizeMin*(treeModifier||treeModSize), treeSizeMax*(treeModifier||treeModSize))+"%"], null, (obj)=>{
                    obj.pos = CDEUtils.addPos(dot.pos, [0, -obj.size[1]/2-8])
                    obj.scaleAt([0.8, 1.01])
                    setTimeout(()=>{
                        obj.playAnim(new Anim((prog, i)=>{
                            obj.scaleAt([fade(prog, i, 0.8, 1.1), fade(prog, i, 1, 1.25)])
                        }, -10000))
                    }, CDEUtils.random(0, 5000))

                })
        tree.opacity = treeModifier ? 0.65 : 0.3
        CVS_cdePreview_l2.add(tree)
    })
}


// MOON
let moon1, moon2
function generateMoon() {
    moon1 = new ImageDisplay("img/CDEBG.svg", null, null, null, (obj)=>{
        obj.pos = CDEUtils.addPos(CVS_cdePreview.getCenter(), [-obj.size[0]/2, -CVS_cdePreview.height/2])
        
        obj.playAnim(new Anim((prog, i)=>{
            obj.scaleAt([fade(prog, i, 0.86, 1.3), fade(prog, i, 0.86, 1.3)])
            obj.rotateAt(-90+prog*360)
            obj.opacity = fade(prog, i, 0.0325, 0.05)
        }, -75000))
    })

    moon2 = new ImageDisplay("img/CDEBG.svg", null, null, null, (obj)=>{
        obj.pos = CDEUtils.addPos(CVS_cdePreview.getCenter(), [-obj.size[0]/2, -CVS_cdePreview.height/2])
        
        obj.playAnim(new Anim((prog, i)=>{
            obj.scaleAt([fade(prog, i, 1.2, 1.8), fade(prog, i, 1.2, 1.8)])
            obj.rotateAt(prog*360)
            obj.opacity = fade(prog, i, 0.015, 0.0365)
        }, -75000))
    })
    
    moon1.opacity = moon2.opacity = 0
    CVS_cdePreview.add(moon1)
    CVS_cdePreview.add(moon2)
}


// TEXT
TextStyles.loadCustomFont("fonts/BitcountPropSingle/BitcountPropSingle.ttf", "bitcountPropSingle")

function createFancyLetter(text, pos, color=[225, 225, 255, 0]) {
    return new TextDisplay(text, pos, color, CVS_cdePreview.render.textProfile1.update(TextStyles.getFontStyleDeclaration("bitcountPropSingle", "46px")), null, null, (obj)=>{

        // Slow wobble effect
        let distance = CDEUtils.random(-12, 14), duration = -CDEUtils.random(2000, 7000), iy = obj.y, ay = 0
        setTimeout(()=>{
            obj.playAnim(new Anim((prog, i)=>{
                const dy = ((i%2)||-1)*distance*prog-ay
                obj.y += dy
                ay += dy

                if (prog == 1) {
                    iy = obj.y
                    ay = 0
                }
            }, duration, Anim.easeInOutQuad))
        }, CDEUtils.random(0, 2000))

        obj.playAnim(new Anim((prog)=>{
            obj.opacity = 1-prog
        }, 14500, Anim.easeInSine, ()=>obj.remove()))

    }, (obj)=>{
        // Opacity effect
        obj.a = CDEUtils.mod(1, CDEUtils.clamp(CDEUtils.getDist(obj.x, obj.y, CVS_cdePreview.mouse.x, CVS_cdePreview.mouse.y)/200, 0, 1), 0.85)
    })
}

function generateText() {
    const text = "You can drag the stars!", letterWidth = createFancyLetter("O").getSize()[0], textWidth = 775, textStartPos = [(CVS_cdePreview.width-textWidth)/2, 200]
    for (let i=0;i<text.length;i++) {
        CVS_cdePreview.add(createFancyLetter(text[i], CDEUtils.addPos(textStartPos, [letterWidth*i, 0])))
    }
}


// BACKGROUND DETAILS
let backgroundAudioDisplay, audioDisplayAlpha = 0.04

function generateAudioDisplay() {
    const barWidth = 20, barSpacing = 25, barCount = ((CVS_cdePreview.width/(barWidth+(barSpacing-barWidth)))|0)*1.5
    backgroundAudioDisplay = new AudioDisplay("./medias/You_re_Here_For_Albuca_Spiralis.mp3", [5, ground1.secondDot.y+15], [225,225,255,audioDisplayAlpha], AudioDisplay.BARS(-CVS_cdePreview.height/2, 3, barSpacing, barWidth), barCount, true)
    CVS_cdePreview.add(backgroundAudioDisplay)
}

function generateCDEPreview() {
    generateGradients()
    generateStars()
    generateGround()
    generateTrees()
    generateText()
    generateAudioDisplay()
    generateMoon()
}


// RESIZE ADJUSTMENTS
CVS_cdePreview.onResizeCB=()=>{
    const newWidth = CVS_cdePreview.width

    backgroundGradient1.dots[1].x = newWidth
    backgroundGradient1.dots[2].x = newWidth
    backgroundGradient2.dots[1].x = newWidth
    backgroundGradient2.dots[2].x = newWidth
    backgroundGradient3.dots[1].x = newWidth
    backgroundGradient3.dots[2].x = newWidth
    
    ground1.lastDot.x = newWidth
    CDEUtils.getLast(ground1.dots, 1).x = newWidth
    ground2.lastDot.x = newWidth
    CDEUtils.getLast(ground2.dots, 1).x = newWidth
    ground3.lastDot.x = newWidth
    CDEUtils.getLast(ground3.dots, 1).x = newWidth
}