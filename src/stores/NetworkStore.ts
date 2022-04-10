export enum Network {
    MAINNET = "MAINNET",
    TESTNET = "TESTNET",
    DEBUG = "DEBUG"
}

export default new class NetworkStore {
    getNetwork():Network{
        return Network.MAINNET
    }
}

export function displayNetworkName(network: Network){
    return ({
        [Network.MAINNET]: "Mainnet",
        [Network.TESTNET]: "Testnet",
        [Network.DEBUG]: "Debug"
    })[network] || "Unknown Network"
}

export function getNetworkNode(network: Network, type: "ws"|"http"){
    switch(type){
        case "ws":
            return ({
                [Network.MAINNET]: "wss://node-vite.thomiz.dev/ws",
                [Network.TESTNET]: "wss://buidl.vite.net/gvite/ws",
                [Network.DEBUG]: "ws://127.0.0.1:23457"
            })[network]
        case "http": {
            return ({
                [Network.MAINNET]: "https://node-vite.thomiz.dev/http",
                [Network.TESTNET]: "https://buidl.vite.net/gvite/http",
                [Network.DEBUG]: "http://127.0.0.1:23456"
            })[network]
        }
    }
}