import React from "react"
import websocket, { WebSocketStates } from "../websocket"
import useEvent from "./useEvent"
import useForceUpdate from "./useForceUpdate"
import useSubscription from "./useSubscription"

let cached_pixels = null

export default function usePixels():{
    loaded: boolean,
    pixels: number[][]
}{
    const forceUpdate = useForceUpdate()
    const wsState = useEvent("WS_STATE", websocket.state)
    React.useEffect(() => {
        if(wsState !== WebSocketStates.OPEN)cached_pixels = null
    }, [wsState])
    useSubscription("pixels", (pixels) => {
        cached_pixels = pixels
        forceUpdate()
    }, () => {
        cached_pixels = null
    })
    const loaded = !!cached_pixels
    return {
        loaded,
        pixels: cached_pixels
    }
}