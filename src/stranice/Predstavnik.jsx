
import { useState } from 'react';
import Sastanci from '../komponente/Sastanci.jsx'
import Header from '../komponente/Header.jsx';

function App(){
  const [selectedCategory, setselectedCategory] = useState("Objavljeni");
  return(
    <>
    <Header userRole="predstavnik" onSelectcategory={setselectedCategory}/>
    <Sastanci category = {selectedCategory}/>
    </>
  );

}

export default App