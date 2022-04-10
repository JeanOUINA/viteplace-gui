/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from "@emotion/react"
import { ReactNode } from "react"
import useMobile from "../hooks/useMobile"
import darkTheme from "../themes/dark"
import useWindowSize from "../hooks/useWindowSize"
import CloseIcon from "@mui/icons-material/Close";
import { Icon } from "@mui/material"

export default function Modal(props:{children: ReactNode, close: ()=>void, className?: string}):JSX.Element{
    const isMobile = useMobile()
    const windowSize = useWindowSize()

    return <div css={{
        width: windowSize[0],
        height: windowSize[1],
        background: "rgba(0, 0, 0, 0.4)",
        position: "absolute",
        top: document.documentElement.scrollTop,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483646
    }}>
        <div css={{
            textAlign: "center",
            ...(isMobile ? {
                width: "100%",
                backgroundColor: darkTheme.palette.secondary.main,
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            } : {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%"
            })
        }} onClick={() => {
            if(isMobile)return
            props?.close()
        }}>
            {
                !isMobile ? <div css={{
                    borderRadius: "8px",
                    backgroundColor: darkTheme.palette.secondary.main,
                    padding: "20px"
                }} onClick={ev => {
                    ev.stopPropagation()
                }}>
                    {props.children}
                </div> : <div>
                    <div css={{
                        position: "absolute",
                        right: 10,
                        top: 10
                    }}>
                        <Icon component={CloseIcon} onClick={() => {
                            props?.close()
                        }}></Icon>
                    </div>
                    {props.children}
                </div>
            }
        </div>
    </div>
}