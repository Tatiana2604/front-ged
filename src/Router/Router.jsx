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
import SendEmail from "../Composants/SendEmail/SendEmail";
import PrivateRoute from "../Composants/PrivateRoute/PrivateRoute";

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
                path: 'procedure',
                element: <New/>
            },

            {
                element: <PrivateRoute />,
                children: [
                    {   
                        path: 'form_procedure',
                        element: <FormProcedure />
                    },
                    {
                        path: 'ajouter_document',
                        element: <Form />
                    },
                ]
            },

            {
                path:'liste_documents',
                element: <Enregistrer />
            },

            {
                path:'archivage',
                element: <Archivage />
            },

            {
                path:'envoyer_documents',
                element: <SendEmail />
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
        path: 'acces_denied',
        element: <AccesDenied />
    }


 
])

export default router;