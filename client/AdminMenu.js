import { signOut } from '../../functions/authenticate';
import { useHistory } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Hamburger from '../../components/Hamburger';
import './Admin.css';


const AdminMenu = () => {

let history = useHistory();

const btnClickHandler = async () => {

   
    await signOut();
    history.go(0);
    history.push("/admin");
   
};

const togglemenu = (e) => {
    
    
    const menu = document.getElementById('adminmenu');
    const clist = Object.values(menu.classList);
    const dim = document.getElementById('dimmer');
    
    if (clist.includes('hiddenmenu')) {
        console.log("Contains!");
        menu.classList.add('adminMenu');
        menu.classList.remove('hiddenmenu');
        dim.classList.remove('hidden')
        dim.classList.add('visible')

    } else {
        menu.classList.add('hiddenmenu');
        menu.classList.remove('adminMenu');
        dim.classList.remove('visible')
        dim.classList.add('hidden');
    }
    



};


const menu = () => {

    return (

        <nav>

        <ul>
            <p className="adminMenuLabels">EDIT PRODUCTS</p>
            <li><NavLink to="/admin/create">Create</NavLink></li>
            <li><NavLink to="">Edit </NavLink></li>
            <li><NavLink to="">Remove </NavLink></li>
            <p className="adminMenuLabels">EDIT CATEGORIES</p>
            <li><NavLink to="/admin/categories">create</NavLink></li>
            <li><NavLink to="/admin/categories">edit</NavLink></li>
            <li><NavLink to="/admin/categories">remove</NavLink></li>
        </ul>


    </nav>
   )
};




return (

    <div>

         <button className='signOut' onClick={btnClickHandler}>LOG OUT</button>
         
         <div id="adminmenu" className="hiddenmenu">
             <div className="hamburgerplace">
                <Hamburger  size={30} 
                            togglemenu={togglemenu}/> 
                           
            </div>
        
             {menu()}
             
             </div>
    </div>
)


};



export default AdminMenu;