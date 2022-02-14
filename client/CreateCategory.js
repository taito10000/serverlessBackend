import {useState, useEffect } from 'react';
import { getData } from '../../functions/getData';
import { URLPREFIX } from '../../constants';
import './CreateCategory.css';

const CreateCategory = () => {


    const [mains, setMains] = useState([]);
    const [subs, setSubs] = useState([]);
    const [imgLink, setImgLink] = useState('');
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('select');

    const dataloader = async () => {
       
       try {
        const mainCategories = await getData(URLPREFIX+'cats?var1=main');
        const subCategories = await getData(URLPREFIX+'cats?var1=sub');
        setMains(mainCategories);
        setSubs(subCategories);
        
       } catch(err) {console.log(err)};
    };
    
    useEffect(dataloader, []);
    
    const logger = () => {

            console.log(mains);
            console.log(subs);

        };

    useEffect(logger, [mains]);



   
    const onChangeHandler = (e, type) => {

        if (type === 'name') {
            setName(e.target.value);
        };
        
        if (type === 'link') {
            setImgLink(e.target.value);
        }; 
    };
    
    
    
    const listClickHandler = (e) => {

        const list = document.querySelector('.dropdown-content');
        const cl = Object.values(list.classList);
        e.stopPropagation();
        if (!cl.includes('listvisible')) {
            list.classList.add('listvisible');
        } else {list.classList.remove('listvisible')}
    };

    
    const selectCategory = (e) => {

        const list = document.querySelectorAll('.dropdown-content');
        console.log(list);
       // list.forEach(item => {item.classList.remove('listvisible')});
        setSelectedCategory(e.target.outerText);
        console.log(list);
    };

    
    const listMouseLeaveHandler = (e) => {
        
        const list = document.querySelector('.dropdown-content');
        const cl = Object.values(list.classList);
        e.stopPropagation();
        if (cl.includes('listvisible')) {
            list.classList.remove('listvisible');
        }
        
    }

    const droplist = () => {



        return (
            <div>
            <span className='droplist'>
                <li className='listitem' onClick={selectCategory}>main</li>
                <li className='listitem' onClick={selectCategory}>sub</li>
            </span>
            </div>


        )
    };








    

    return (

        <div>
            <div id='container'>
               <p> <label>category name</label>
                <input type='text' value={name} onChange={(e) => onChangeHandler(e, 'name')} ></input>
                <label>category type</label>
                <div className='dropdown' onClick={listClickHandler} onMouseLeave={listMouseLeaveHandler}> {selectedCategory}
                    <div className='dropdown-content'>{droplist()}</div>
                </div></p>
               <p><label>image link</label>
                <input type='text' style={{width: '63%', marginLeft: "38px"}} value={imgLink} onChange={(e) => onChangeHandler(e, 'link')}></input></p>
               <div className="btnContainer"> 
                <button className='createCatButton'>Reset</button>
                <button className='createCatButton'>Create</button>
                </div>
            </div>
        </div>

    )

};


export default CreateCategory;