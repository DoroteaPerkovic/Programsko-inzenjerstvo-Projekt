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

function Predstavnik() {
  const { category } = useParams();
  const selectedCategory = categoryMap[category] || "Objavljeni";

  return (
    <>
      <Header userRole="Predstavnik suvlasnika" />
      <Sastanci category={selectedCategory} userRole="Predstavnik suvlasnika" />
    </>
  );
}

export default Predstavnik;
