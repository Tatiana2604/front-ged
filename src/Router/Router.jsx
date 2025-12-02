import { createBrowserRouter } from "react-router-dom";
import Login from "../Composants/Login/Login";
import Sidebar from "../Composants/Sidebar/Sidebar";
import Enregistrer from "../Composants/Enregistrer/Enregistrer";
import Archivage from "../Composants/Archivage/Archivage";
import Main from "../Main";
import Accueil from "../Composants/Accueil/Accueil";
import Form from "../Composants/Enregistrer/Form/Form";
import Log from "../Composants/Trace/Log";
import New from "../Composants/New/New";
import Verification from "../Composants/Verification/verification";
import AccesDenied from "../Composants/AccesDenied/AccesDenied";
import FormProcedure from "../Composants/New/FormProcedure";

const router=createBrowserRouter([
    {
        path: '/',
        element: <Login />
    },

    {
        path:'accueil',
        element: <Accueil/>
    },

    {
        path: '/main',
        element:<Main/>,
        children:[
            // {
            //     path:'recherche',
            //     element: <Recherche />  
            // },

            {
                path: 'new',
                element: <New/>
            },

            {   
                path: 'form_procedure',
                element: <FormProcedure />
            },

            {
                path:'enregistrer',
                element: <Enregistrer />
            },

            {
                path: 'ajouter',
                element: <Form />
            },

            {
                path:'archivage',
                element: <Archivage />
            },

            {
                path:'accueil',
                element:<Accueil />

            },
            {
                path: 'journaux',
                element: <Log />
            },

            {
                path: 'verification',
                element: <Verification/>
            }

               
           
        ]
    },

    {
        path: 'teste',
        element: <AccesDenied />
    }


 
])

export default router;