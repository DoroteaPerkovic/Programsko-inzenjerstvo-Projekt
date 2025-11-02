
import UserAdd from '../komponente/UserAdd.jsx'
import Header from '../komponente/Header.jsx';

function App(){

  return(
    <>
    <Header userRole={"admin"}/>
    <UserAdd/>
    </>
  );

}

export default App