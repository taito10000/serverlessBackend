
import { useHistory } from "react-router-dom";
import { getData, postData } from "../../functions/getData";
import { URLPREFIX } from '../../constants';
import './CreateProduct.css';
import { useEffect, useState } from "react";
import { readSession } from "../../functions/authenticate";


const CreateProduct = (props) => {

    const history = useHistory();
    const [mains, setMains] = useState([]);
    const [subs, setSubs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Select');
    const [subCategory, setSubCategory] = useState('Select ');
    const [subCategory2, setSubCategory2] = useState('Select ');

    const [info, setInfo] = useState({

        title: '',
        subtitle: '',
        description: '',
        brand: '',
        image_link: '',
        status: '',
        amount: 0.0,
        price: ''
    });


    //category, sub_category, sub_category2, title, subtitle, description, brand, image_link, status, amount, price
    const dataloader = async () => {
       
        const mainCategories = await getData(URLPREFIX+'cats?var1=main');
        const subCategories = await getData(URLPREFIX+'cats?var1=sub');
        if (mainCategories) {setMains(mainCategories);
                            setSubs(subCategories);
        return [mainCategories, subCategories];
        } 
    };
    
    useEffect(dataloader, []);
    


    if (readSession('access') !== null && readSession('access').length > 100) {
    
        console.log();
        
    } else {history.push('/admin')};



     const listSelectHandler = (e, type) => {

        if (e.target.id == -1) {
            console.log("CREATE NEW CATEGORY!");
        }
        else {
            switch (type) {
                case 'main': setSelectedCategory(e.target.outerText);
                break;
                case 'sub': setSubCategory(e.target.outerText);
                break;
                case 'sub2': setSubCategory2(e.target.outerText);
                break;
                default: break;

            }
        }
        mouseLeaveHandler();
     };


     const inputChangeHandler = (e) => {
        
        if (e.target.id === 'price') {
            const tmp = e.target.value.replace(/\,/g, '.');
            e.target.value = tmp;
        };

        setInfo({...info, [e.target.id]: e.target.value});
        console.log(info.price);
     }; 



     const mouseClickHandler = (e) => {
        e.stopPropagation();
        
        if (!new Array(e.target.classList[0]).includes('listitem')) {
        
        e.target.classList.add('.listvisible');
        e.target.children[0].classList.add('listvisible');
        }

     };
     const mouseLeaveHandler = (e) => {

        const dd = document.querySelectorAll('.dropdown');
        const ddc = document.querySelectorAll('.dropdown-content');

        dd.forEach(el => {
            el.classList.remove('listvisible');
        });
        ddc.forEach(el => {
            el.classList.remove('listvisible');
        });
        
     };



     const submitBtnHandler = async (e) => {

        if (e.target.id === 'reset') {
            
            setInfo({title: '',
            subtitle: '',
            description: '',
            brand: '',
            image_link: '',
            status: '',
            amount: 0,
            price: ''});
        };
        if (e.target.id === 'create') {
               
            const prodInfo = info;
            prodInfo.category = selectedCategory;
            prodInfo.sub_category = (subCategory !== 'Select') ? subCategory : '';
            prodInfo.sub_category2 = (subCategory2 !== 'Select') ? subCategory2 : '';
            const url = URLPREFIX+'admin/prod/add';
            const token = props.token;
            const params = {
                method: 'POST',
                headers: {'content-type': 'application/json', 'Authorization': readSession('access')},
                body: JSON.stringify(prodInfo)
            }
            try {
                console.log(params);
                const response = await postData(url, params);
                alert('Product added to store.');
                setInfo({title: '',
                subtitle: '',
                description: '',
                brand: '',
                image_link: '',
                status: '',
                amount: 0,
                price: ''});
                
            }
            
            
            catch(err){console.log(err)}

        }; 

     };

     const dropContent = (type) => {

        const out = [];
        if (type === 'main') {
            out.push(<li key={-1} className="listitem listnew" onClick={(e) => listSelectHandler(e, 'main')}>create new...</li>);
            out.push(<hr key={-4}/>);
            mains.forEach((item, i) => {
                out.push(<li key={i} className="listitem" onClick={(e) => listSelectHandler(e, 'main')}>{item.category}</li>);
            })
            out.push(<li key={-11} className="listitem listnew" onClick={(e) => listSelectHandler(e, 'main')}> . . </li>);
        };
        if (type === 'sub') {
            out.push(<li key={-2} className="listitem listnew" onClick={(e) => listSelectHandler(e, 'sub')}>create new...</li>);
            out.push(<hr key={-5}/>);
            subs.forEach((item, i) => {
                out.push(<li key={i} className="listitem" onClick={(e) => listSelectHandler(e, 'sub')}>{item.category}</li>);
            });
            out.push(<li key={-12} className="listitem listnew" onClick={(e) => listSelectHandler(e, 'sub')}> . . </li>);
        }
        if (type === 'sub2') {
            out.push(<li key={-3} className="listitem listnew" onClick={(e) => listSelectHandler(e, 'sub2')}>create new...</li>);
            out.push(<hr key={-6}/>);
            subs.forEach((item, i) => {
                out.push(<li key={i} className="listitem" onClick={(e) => listSelectHandler(e, 'sub2')}>{item.category}</li>);
            });
            out.push(<li key={-13} className="listitem listnew" onClick={(e) => listSelectHandler(e, 'sub2')}> . . </li>);
        }
        
        return out;
     };


return (

    <div className="newproductcontainer">
        
      <p>
        <label>title</label></p>
      <input id="title" style={{width: "55%"}} onChange={inputChangeHandler} value={info.title}></input>
      <p>
        <label>subtitle</label></p>
      <input id="subtitle" style={{width: "55%"}} onChange={inputChangeHandler} value={info.subtitle}></input>
      <p><label>category</label></p>
      <div className="dropdown" onClick={mouseClickHandler} onMouseLeave={mouseLeaveHandler}>{selectedCategory}
        <div className="dropdown-content"> 
            <ul className="droplist">{dropContent('main')}</ul>
        </div>
      </div>
      <p><label>subcategory</label></p>
      <div className="dropdown" onClick={mouseClickHandler} onMouseLeave={mouseLeaveHandler}>{subCategory}
        <div className="dropdown-content"> 
            <ul className="droplist">{dropContent('sub')}</ul>
        </div>
      </div>
      <p><label>subcategory 2</label></p>
      <div className="dropdown" onClick={mouseClickHandler} onMouseLeave={mouseLeaveHandler}>{subCategory2}
        <div className="dropdown-content"> 
            <ul className="droplist">{dropContent('sub2')}</ul>
        </div>
      </div>
      <p><label>brand</label></p>
      <input id="brand" style={{width: "55%"}} onChange={inputChangeHandler} value={info.brand}></input>
      <p><label>description</label></p>
      <textarea id="description" style={{width: "55%"}} onChange={inputChangeHandler} value={info.description}></textarea>
      <p><label>amount</label></p>
      <input type="number" id="amount" onChange={inputChangeHandler} autoComplete="off" value={info.amount}></input>
      <p><label>price</label></p>
      <input id="price" onChange={inputChangeHandler} autoComplete="off" value={info.price}></input>
      <p><label>image-link</label></p>
      <input id="image_link" style={{width: "55%"}} onChange={inputChangeHandler} autoComplete="off" value={info.image_link}></input>
        <div className="buttons">
      <hr />
      <button className="submitBtns" id="reset" onClick={submitBtnHandler}>Reset</button><button className="submitBtns" id="create" onClick={submitBtnHandler}>Create</button></div>
    </div>

);

};



export default CreateProduct;