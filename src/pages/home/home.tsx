/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from "@emotion/react"
import Loading from "../../components/Loading";
import PlaceCanvas from "../../components/PlaceCanvas";
import useSize from "../../hooks/useSize";
import useColors from "../../hooks/useColors";

export default function Home(){
    const {
        loaded: colorsLoaded,
        colors: colors
    } = useColors()
    const {
        loaded: sizeLoaded,
        size
    } = useSize()
    if(!sizeLoaded || !colorsLoaded)return <Loading/>
    // need to render the canvas
    return <PlaceCanvas readonly={false} colors={colors} size={size}/>
}