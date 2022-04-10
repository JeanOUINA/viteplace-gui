export default new class WalletStore {
    cache:string
    clear(){
        sessionStorage.removeItem("VITECONNECT_KEY")
    }
    getSession(){
        if(this.cache)return this.cache
        let value = sessionStorage.getItem("VITECONNECT_KEY")
        if(!value)return null
        try{
            value = JSON.parse(value)
        }catch{
            return null
        }
        this.cache = value
        return value
    }
    setSession(key:string){
        this.cache = key
        sessionStorage.setItem("VITECONNECT_KEY", JSON.stringify(key))
    }
}