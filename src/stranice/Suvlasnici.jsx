import { useParams } from "react-router-dom";
import { useState } from "react";
import Header from "../komponente/Header";
import Sastanci from "../komponente/Sastanci";


const categoryMap = {
  planirani: "Planirani",
  objavljeni: "Objavljeni",
  obavljeni: "Obavljeni",
  arhivirani: "Arhivirani",
};

function Suvlasnici() {
  const { category } = useParams();

  const selectedCategory =
    categoryMap[category] || "Objavljeni";

  return (
    <>
      <Header userRole="Suvlasnik" />
      <Sastanci
        category={selectedCategory}
        userRole="Suvlasnik"
      />
    </>
  );
}

export default Suvlasnici;
