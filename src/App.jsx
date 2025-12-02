import react from "react";
import { RouterProvider } from "react-router-dom";
import Login from "./Composants/Login/Login";

import Sidebar from "./Composants/Sidebar/Sidebar";
import router from "./Router/Router";
import './assets/fontawesome/css/all.min.css';
import Enregistrer from './Composants/Enregistrer/Enregistrer';
import Archivage from './Composants/Archivage/Archivage';
import Trace from './Composants/Trace/Log';
import New from './Composants/New/New';
import Verification from './Composants/Verification/verification';
import './assets/bulma/bulma.min.css';
import './assets/css/output.css';

function App(){
    return(
        <div className="App">
            <RouterProvider router={router}/>
        </div>
        
    );

}
export default App;







