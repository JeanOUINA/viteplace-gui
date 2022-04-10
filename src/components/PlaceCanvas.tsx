/* eslint-disable @typescript-eslint/ban-ts-comment */
/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from "@emotion/react"
import React, { useEffect, useRef, useState } from "react"
import usePrevious from "../hooks/usePrevious"
import usePixels from "../hooks/usePixels"
import { createUseGesture, dragAction, pinchAction } from "@use-gesture/react"
import { useSpring, animated } from "@react-spring/web"
import darkTheme from "../themes/dark"
import { Button } from "@mui/material"
import wallet from "../wallet"
import { openViteConnect } from "./Navbar"
import { showToast } from "../layers/Toasts"
import * as vite from "@vite/vitejs"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../vite"
import useMobile from "../hooks/useMobile"
import Sheet from "react-modal-sheet";

const useGesture = createUseGesture([dragAction, pinchAction])

export type CanvasEvents = {
    s: []
}

export const PixelSize = 64

export default function PlaceCanvas(props:{
    readonly: boolean,
    colors: string[],
    size: {
        x: number,
        y: number
    }
}){
    useEffect(() => {
        const handler = e => e.preventDefault()
        document.addEventListener("gesturestart", handler)
        document.addEventListener("gesturechange", handler)
        document.addEventListener("gestureend", handler)
        return () => {
            document.removeEventListener("gesturestart", handler)
            document.removeEventListener("gesturechange", handler)
            document.removeEventListener("gestureend", handler)
        }
    }, [])
    const ref = useRef<HTMLDivElement>()
    const [select, setSelect] = useState(null)
    const [style, api] = useSpring(() => {
        const pixelSizesScale = {
            x: props.size.x*PixelSize+100,
            y: props.size.y*PixelSize+200
        }

        let zoom = 1
        if(window.innerHeight-64 < pixelSizesScale.y){
            zoom = Math.floor((window.innerHeight-64) / pixelSizesScale.y * 100)/100
        }
        if(window.innerWidth < pixelSizesScale.x * zoom){
            zoom = Math.floor(window.innerWidth / pixelSizesScale.x * 100)/100
        }

        const pixelSizes = {
            x: props.size.x*PixelSize,
            y: props.size.y*PixelSize
        }
        return {
            x: Math.round((window.innerWidth-pixelSizes.x)/2),
            y: Math.round((window.innerHeight-64-pixelSizes.y)/2),
            scale: zoom,
            rotateZ: 0,
        }
    })
    useGesture(
        {
            // onHover: ({ active, event }) => console.log('hover', event, active),
            // onMove: ({ event }) => console.log('move', event),
            onDrag: ({ pinching, cancel, offset: [x, y] }) => {
                if (pinching) return cancel()
                api.start({ x, y })
            },
            onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s], memo }) => {
                if (first) {
                    const { width, height, x, y } = ref.current.getBoundingClientRect()
                    const tx = ox - (x + width / 2)
                    const ty = oy - (y + height / 2)
                    memo = [style.x.get(), style.y.get(), tx, ty]
                }
        
                const x = memo[0] - (ms - 1) * memo[2]
                const y = memo[1] - (ms - 1) * memo[3]
                api.start({ scale: s, rotateZ: 0, x, y })
                return memo
            },
        },
        {
            target: ref,
            drag: { from: () => [style.x.get(), style.y.get()] },
            pinch: { scaleBounds: { min: 0.5, max: 2 }, rubberband: true },
        }
    )
    // Camera
    return <div ref={ref} css={{
        display: "block",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
        width: "100%",
        userSelect: "none",
        touchAction: "manipulation"
    }} >
        {/** Transform the canvas position */}
        <animated.div ref={ref} style={style}>
            <PlaceCanvasInternal 
                {...props} 
                getZoom={() => style.scale.get()} 
                select={select} 
                setSelect={(pos) => {
                    // to put it in the middle
                    const left = Math.round(-pos[0]*PixelSize+window.innerWidth/2)
                    const top = Math.round(-pos[1]*PixelSize+window.innerHeight/2-128)
                    api.start({scale: 1, x: left, y: top})
                    setSelect(pos)
                }}
            />
        </animated.div>
        <div style={{
            display: !select || props.readonly ? "none" : "initial"
        }}>
            <ColorSelection select={select} colors={props.colors}/>
        </div>
    </div>
}
export function ColorSelection(props:{
    select: [number, number],
    colors: string[]
}){
    const isMobile = useMobile()
    const [isOpen, setOpen] = useState(false)
    const [colorIndex, setColorIndex] = useState(0)
    if(!props.select)return null
    const children = <div css={{
        display: "flex",
        flexDirection: "column",
        marginTop: 20,
        alignItems: "center",
        gap: 20,
        marginLeft: 20,
        marginRight: 20
    }}>
        <div css={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center"
        }}>
            {props.colors.map((color, i) => {
                return <div css={{
                    backgroundColor: color,
                    width: 50,
                    height: 50,
                    cursor: "pointer",
                    transition: "border-radius 0.2s"
                }} style={{
                    borderRadius: colorIndex === i ? "50%" : 8
                }} onClick={e => {
                    e.stopPropagation()
                    setColorIndex(i)
                }} />
            })}
        </div>
        <div>
            <Button variant="outlined" onClick={async () => {
                if(!wallet.ready){
                    openViteConnect()
                }else{
                    const block = vite.accountBlock.createAccountBlock("callContract", {
                        address: wallet.accounts[0],
                        abi: CONTRACT_ABI,
                        methodName: "placePixel",
                        tokenId: vite.constant.Vite_TokenId,
                        amount: "0",
                        toAddress: CONTRACT_ADDRESS,
                        params: [...props.select, colorIndex]
                    })

                    showToast("Please accept the transaction on your phone!", {
                        type: "info",
                        timeout: 3000,
                        icon: true
                    })
                    try{
                        await wallet.sendTransactionAsync({
                            block: block.accountBlock
                        })
                    }catch(err){
                        console.error(err)
                        showToast(`${err.name || err.error.code}: ${err.message || err.error.message}`, {
                            type: "error",
                            timeout: 5000,
                            icon: true
                        })
                    }
                    showToast("Pixel Placed!", {
                        type: "success",
                        timeout: 1000,
                        icon: true
                    })
                }
            }}>
                Place Pixel
            </Button>
        </div>
    </div>
    
    if(isMobile){
        return <div css={{
            position: "absolute",
            bottom: 0
        }}>
            {isOpen ? null : <div css={{
                backgroundColor: darkTheme.palette.secondary.main,
                paddingTop: 10,
                paddingBottom: 10,
                width: "100vw",
                display: "flex",
                justifyContent: "center"
            }}>
                <Button variant="outlined" onClick={() => {
                    setOpen(true)
                }}>
                    Place Pixel
                </Button>
            </div>}

            <Sheet isOpen={isOpen} onClose={() => setOpen(false)} css={{
                "& > .react-modal-sheet-container": {
                    backgroundColor: darkTheme.palette.secondary.main+"!important"
                },
                "& > .react-modal-sheet-backdrop": {
                    backgroundColor: "rgba(0, 0, 0, 0.3)!important"
                },
                "& > .react-modal-sheet-drag-indicator": {
                    backgroundColor: "#666!important"
                },

            }} snapPoints={[
                480,
                0
            ]}>
                {/** stupid shit module */}
                {/** @ts-ignore */}
                <Sheet.Container>
                    {/** @ts-ignore */}
                    <Sheet.Header/>
                    {/** @ts-ignore */}
                    <Sheet.Content>
                        <div css={{
                            backgroundColor: darkTheme.palette.secondary.main
                        }}>
                            {children}
                        </div>
                    </Sheet.Content>
                </Sheet.Container>

                {/** @ts-ignore */}
                <Sheet.Backdrop/>
            </Sheet>
        </div>
    }
    return <div css={{
        position: "absolute",
        top: window.innerHeight-200,
        height: 200,
        width: "100%",
        backgroundColor: darkTheme.palette.secondary.main
    }}>
        {children}
    </div>
}
export function PlaceCanvasInternal(props:{
    size: {
        x: number,
        y: number
    },
    colors: string[],
    getZoom: () => number,
    setSelect(e:[number, number]):any,
    select: [number, number]
}) {
    const [, setDragging] = useState(false)
    const [rel, setRel] = useState(null)
    const {
        loaded: pixelsLoaded,
        pixels
    } = usePixels()
    const oldPixels = usePrevious(pixels)
    const ref = useRef<HTMLCanvasElement>()
    useEffect(() => {
        const canvas = ref.current
        if(!canvas || !pixelsLoaded)return
        const ctx = canvas.getContext("2d")
        for(let x = 0; x < pixels.length; x++){
            const column = pixels[x]
            for(let y = 0; y < column.length; y++){
                const pixel = column[y]
                const oldPixel = oldPixels?.[x]?.[y] || null
                if(pixel != oldPixel){
                    ctx.fillStyle = props.colors[pixel] || props.colors[0]
                    //console.log(`Painting ${x}:${y} with color ${ctx.fillStyle}`)
                    ctx.fillRect(x*PixelSize, y*PixelSize, PixelSize, PixelSize)
                }
            }
        }
    }, [
        ref.current,
        pixels,
        pixelsLoaded
    ])
    return <>
        {props.select && <img
            css={{
                position: "absolute",
                opacity: 0.6
            }}
            style={{
                left: props.select[0]*PixelSize,
                top: props.select[1]*PixelSize
            }}
            src={require("../assets/crosshair.svg").default}
            width={PixelSize}
            height={PixelSize}
            draggable={false}
        />}
        <canvas
            ref={ref} 
            css={{
                width: props.size.x*PixelSize,
                height: props.size.y*PixelSize,
                cursor: "pointer"
            }} 
            width={props.size.x*PixelSize}
            height={props.size.y*PixelSize}
            onMouseDown={(e)=>{
                if(e.button !== 0)return
                setDragging(true)
                setRel({
                    x: e.pageX,
                    y: e.pageY
                })
            }}
            onMouseUp={(e)=>{
                if(e.button !== 0)return
                setDragging(false)
                const pixels = Math.abs(rel.x-e.pageX)+Math.abs(rel.y-e.pageY)
                if(pixels < 5){
                    // wasn"t a drag
                    // select the pixel
                    const target = e.target as HTMLCanvasElement
                    const rect = target.getBoundingClientRect()
                    const x = e.pageX-rect.left
                    const y = e.pageY-rect.top
                    const zoom = props.getZoom()
                    const posx = Math.floor(x/PixelSize/zoom)
                    const posy = Math.floor(y/PixelSize/zoom)
                    props.setSelect([posx, posy])
                }
            }}
        />
    </>
}