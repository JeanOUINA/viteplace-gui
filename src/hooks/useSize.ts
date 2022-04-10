import React from "react"
import websocket, { WebSocketStates } from "../websocket"
import useEvent from "./useEvent"
import useForceUpdate from "./useForceUpdate"
import useSubscription from "./useSubscription"

let cached_size:{
    x: number,
    y: number
} = null

export default function useSize():{
    loaded: boolean,
    size: typeof cached_size
}{
    const forceUpdate = useForceUpdate()
    const wsState = useEvent("WS_STATE", websocket.state)
    React.useEffect(() => {
        if(wsState !== WebSocketStates.OPEN)cached_size = null
    }, [wsState])
    useSubscription("size", (size) => {
        cached_size = size
        forceUpdate()
    }, () => {
        cached_size = null
    })
    const loaded = !!cached_size
    return {
        loaded,
        size: cached_size
    }
}