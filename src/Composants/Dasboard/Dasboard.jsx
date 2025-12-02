import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { useFetch } from "../../hooks/useFetch";
import { API_URL } from "../../Config/Config";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {

    const { data: liste_documents } = useFetch(
        `${API_URL}/data/document/liste`,
        "post",
        { action: "lister" },
        true
    );

    const totalDocs = liste_documents ? liste_documents.length : 0;

    const documentsParMois = liste_documents
        ? liste_documents.reduce((acc, item) => {
            const mois = item.mois || "NC";
            acc[mois] = (acc[mois] || 0) + 1;
            return acc;
        }, {})
        : {};

    const dataChart = {
        labels: Object.keys(documentsParMois),
        datasets: [
            {
                label: "Documents par mois",
                data: Object.values(documentsParMois),
                backgroundColor: "#38bdf8",
            },
        ],
    };

    return (
        <div className="section container">
            <h1 className="title has-text-centered">Tableau de bord GED 📊</h1>

            {/* Statistiques */}
            <div className="columns is-multiline has-text-centered mt-4">

                <div className="column is-4">
                    <div className="box">
                        <h2 className="title is-3">{totalDocs}</h2>
                        <p className="subtitle is-6">Documents enregistrés</p>
                    </div>
                </div>

                <div className="column is-8">
                    <div className="box">
                        <Bar 
                            data={dataChart} 
                            options={{ responsive: true, maintainAspectRatio: false }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
