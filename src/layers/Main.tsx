import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import * as React from "react"
import Navbar from "../components/Navbar";
import { PageFetcher } from "../app";

export default function Main(){
    return <Router>
        <div>
            <Navbar />
            <Switch>
                {/** HOME SECTION */}
                <Route path="/" exact>
                    <PageFetcher page="home/home"/>
                </Route>
                <Route path="/dist/index.html" exact>
                    <PageFetcher page="home/home"/>
                </Route>
                {/** 404 */}
                <Route path="/">
                    <PageFetcher page="errors/404"/>
                </Route>
            </Switch>
        </div>
    </Router>
}