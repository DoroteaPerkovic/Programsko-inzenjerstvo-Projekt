
import UserAdd from '../komponente/UserAdd.jsx'
import Header from '../komponente/Header.jsx';

function Admin(){

  return(
    <>
    <Header userRole={"admin"}/>
    <UserAdd/>
    </>
  );

}

export default Admin;