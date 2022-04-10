/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from "@emotion/react"
import React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import {useHistory} from "react-router-dom"
import useMobile from "../hooks/useMobile"
import useViteConnect, { ViteConnectStateType } from "../hooks/useViteConnect"
import { closeLayer, pushLayer } from "../layers"
import Modal from "../layers/Modal"
import QRCode from "./QRCode"
import { Chip } from "@mui/material"
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VitePlaceHeader from "../assets/viteplace-header-cropped.png"

export default function Navbar(){
    const history = useHistory()
    const isMobile = useMobile()
    return <>
        <AppBar position="static" color="secondary">
            <Toolbar>
                <div css={{
                    flexGrow: 1,
                    display: "flex",
                    marginRight: 10
                }}>
                    <Button color="inherit" onClick={() => {
                        history.push("/")
                    }} css={{
                        marginRight: !isMobile ? 10 : 0
                    }}>
                        <img src={VitePlaceHeader} height={40}/>
                    </Button>
                </div>
                <div>
                    <ViteConnectInterface/>
                </div>
            </Toolbar>
        </AppBar>
    </>
}

export function openViteConnect(){
    pushLayer(<Modal key="layer-viteconnect" close={() => {
        closeLayer("layer-viteconnect")
    }}>
        <ViteConnectQRCode/>
    </Modal>)
}

function ViteConnectInterface(){
    const [wallet, walletState] = useViteConnect()
    if(walletState === ViteConnectStateType.CONNECT){
        // need to display the qrcode
        return <Button color="inherit" onClick={openViteConnect}>
            Login
        </Button>
    }else if(walletState === ViteConnectStateType.READY){
        return <Button color="inherit" onClick={() => {
            pushLayer(<Modal key="layer-viteconnect-close" close={() => {
                closeLayer("layer-viteconnect-close")
            }}>
                <ViteConnectClose/>
            </Modal>)
        }}>
            <Chip variant="outlined" label={wallet.accounts[0]} css={{
                fontFamily: "'Overpass Mono', monospace",
                textTransform: "lowercase"
            }} icon={<AccountCircleIcon></AccountCircleIcon>}/>
        </Button>
    }
    return null
}

function ViteConnectClose(){
    const [wallet, walletState] = useViteConnect()
    if(walletState !== ViteConnectStateType.READY){
        // means the user scanned it already
        setImmediate(() => {
            closeLayer("layer-viteconnect-close")
        })
        return null
    }

    return <div>
        <Typography variant="h6" css={{
            marginBottom: 20
        }}>
            Are you sure you want to logout ?
        </Typography>
        <Button css={{
            marginRight: 10
        }} variant="outlined" onClick={() => {
            wallet.vbInstance.killSession()
        }}>
            Yes
        </Button>
        <Button variant="outlined" onClick={() => {
            closeLayer("layer-viteconnect-close")
        }}>
            No
        </Button>
    </div>
}

function ViteConnectQRCode(){
    const [wallet, walletState] = useViteConnect()
    if(walletState !== ViteConnectStateType.CONNECT){
        // means the user scanned it already
        setImmediate(() => {
            closeLayer("layer-viteconnect")
        })
        return null
    }
    return <div>
        <Typography variant="h5" css={{
            marginBottom: 20
        }}>Connect with ViteConnect!</Typography>
        <QRCode text={wallet.vbInstance.uri} css={{
            width: 400,
            height: 400
        }}/>
    </div>
}