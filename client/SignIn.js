
import { signIn, signOut } from '../../functions/authenticate';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import './Admin.css';


const SignIn = (props) => {

    
    const [name, setName] = useState('');
    const [pwd, setPwd] = useState('');
    const [token, setToken] = useState('');
    const [btnTxt, setBtnTxt] = useState('LOG IN');
    
    
    const logIn = async (username, pw) => {
        
        try {
           
            await signIn(username, pw);
            const session = await Auth.currentSession();
            const tken = session.getAccessToken().getJwtToken();
            setBtnTxt('LOG OUT');
            props.checkToken(tken);
            setToken(tken);
        }
        catch(err){console.log(err)};

    };



    const inputChangeHandler = (e) => {

        switch (e.target.id) {

            case 'username': setName(e.target.value); break;
            case 'pwd': setPwd(e.target.value); break;
            default: break;
        };
    };


    const logInBtnClickHandler = async (e) => {
        e.preventDefault();
        let currentUser = null;
        
        if (token !== '') {
            try {currentUser = await Auth.currentUserInfo();}
            catch(err) {console.log(err)};
            await signOut();
            setToken('');
            setBtnTxt('LOG IN');
            setName('');
            setPwd('');
            props.checkToken('');

        } else {
            logIn(name, pwd);
            
        };
    };




    const userLogInInputs = () => {

        return (

            <div className='signInContainer'>
                <label>username</label>
                <input type="text" id="username" autoComplete='off' value={name} onChange={inputChangeHandler} className={'txtInput'}></input>
                <label>password</label>
                <input type="password" id="pwd" value={pwd} onChange={inputChangeHandler} className={'txtInput'}></input>
                
                <button id="signinBtn" onClick={logInBtnClickHandler} className={'signIn'}>{btnTxt}</button>
                
            
            </div>

        );

    };



    return (
        
        <div>
         <div style={{marginTop: "150px"}}>{userLogInInputs()}</div>
        </div>
    );
    
    
    
  


};

export default SignIn;