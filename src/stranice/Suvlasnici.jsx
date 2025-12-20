import { useState } from "react";
import Sastanci from "../komponente/Sastanci.jsx";
import Header from "../komponente/Header.jsx";
import { useParams } from "react-router-dom";

const categoryMap = {
  planirani: "Planirani",
  objavljeni: "Objavljeni",
  obavljeni: "Obavljeni",
  arhivirani: "Arhivirani",
};

function App() {
  const {category} = useParams();
  const selectedCategory= categoryMap[category] || "Objavljeni";
  return (
    <>
      <Header userRole="suvlasnik" onSelectcategory={setselectedCategory} />
      <Sastanci category={selectedCategory} userRole="suvlasnik" />
    </>
  );
}

export default App;
