
import { useEffect, useState } from 'react';
import { Route, Routes, useHistory } from 'react-router-dom';
import SignIn from './SignIn';
import './Admin.css';
import CreateProduct from './CreateProduct';
import CreateCategory from './CreateCategory';
import AdminMenu from './AdminMenu';



const Admin = () => {

    
    const [token, setToken] = useState('');
    let history = useHistory();
    
    
    const checkToken = async (tkn) => {
       
        if (tkn !== '') {
            setToken(tkn);
            //console.log("Token Callback. Sgned In");
        } else {
           
            setToken('');   
        }
    };


    useEffect(() => {

        if (token.length > 50) {
            history.push("/admin/create");
        } else {

            history.push("/admin");
        }
    }, [token]);



return (


<div style={{textAlign: "center", marginTop: "0px"}}>

            <Route exact path="/admin">
                
                <SignIn checkToken={checkToken}/>

            </Route>
            <Route path="/admin/create">
                <div id="dimmer" className='hidden'></div>
                <AdminMenu />
                <CreateProduct token={token} />
            </Route>
            <Route path="/admin/categories">
                <div id="dimmer" className='hidden'></div>
                <AdminMenu />
                <CreateCategory token={token} />
            </Route>
            
</div>

)


};

export default Admin;