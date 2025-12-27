// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Theme } from "@swc-react/theme";
import React from "react";
import { DocumentSandboxApi } from "../../models/DocumentSandboxApi";
import { CaptionsPanel } from "./CaptionsPanel";
import { NarrationPanel } from "./NarrationPanel";
import { AvatarPanel } from "./AvatarPanel";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const App = ({ addOnUISdk, sandboxProxy }: { addOnUISdk: AddOnSDKAPI; sandboxProxy: DocumentSandboxApi }) => {
    return (
        // Please note that the below "<Theme>" component does not react to theme changes in Express.
        // You may use "addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        <Theme system="express" scale="medium" color="light">
            <div className="container">
                <div className="app-header">
                    <h1 className="app-title">EqualMedia</h1>
                    <p className="app-subtitle">Making content accessible for everyone</p>
                </div>

                <div className="panels-container">
                    <section className="panel-section">
                        <CaptionsPanel sandboxProxy={sandboxProxy} />
                    </section>

                    <section className="panel-section">
                        <NarrationPanel sandboxProxy={sandboxProxy} />
                    </section>

                    <section className="panel-section">
                        <AvatarPanel sandboxProxy={sandboxProxy} />
                    </section>
                </div>
            </div>
        </Theme>
    );
};

export default App;
