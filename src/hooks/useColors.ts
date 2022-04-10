import React from "react"
import websocket, { WebSocketStates } from "../websocket"
import useEvent from "./useEvent"
import useForceUpdate from "./useForceUpdate"
import useSubscription from "./useSubscription"

let cached_colors:string[] = null

export default function useColors():{
    loaded: boolean,
    colors: string[]
}{
    const forceUpdate = useForceUpdate()
    const wsState = useEvent("WS_STATE", websocket.state)
    React.useEffect(() => {
        if(wsState !== WebSocketStates.OPEN)cached_colors = null
    }, [wsState])
    useSubscription("colors", (colors) => {
        cached_colors = colors
        forceUpdate()
    }, () => {
        cached_colors = null
    })
    const loaded = !!cached_colors
    return {
        loaded,
        colors: cached_colors
    }
}