import React from "react";
import { useState, useEffect } from 'react';
import './DeleteProduct.css';
import { getData, postData } from "../../functions/getData";
import { URLPREFIX } from "../../constants";
import { readSession } from "../../functions/authenticate";

const DeleteProduct = () => {


    const [products, setProducts] = useState([]);


    const dataLoader = async () => {

        const products = await getData(URLPREFIX);
        setProducts(products);

    };
    
    useEffect(dataLoader, []);


    const deleteClickHandler = async (e) => {

        console.log(e.target);
        const url = URLPREFIX + 'admin/prod/deleteproduct';
        const idd = e.target.name;
        const params = {
            method: 'POST',
            headers: {'content-type': 'application/json', 'Authorization': readSession('access')},
            body: JSON.stringify({id: idd})
        };
        const request = await postData(url, params);
        if (request.message === 'deleted!') {
            dataLoader();
        };
        return request;

    };

    const Card = (title, subtitle, link, price, key) => {

        return (
            <div className="card" key={key}>
                <h1>{title}</h1>
                <h2>{subtitle}</h2>
                <img src={link} />
                <p className="price">
                    <button name={key} className="deletebtn" onClick={deleteClickHandler}>delete</button>
                    {price}€</p>
            </div>
        );

    };

    const createCards = () => {
        const out = [];
        products.forEach((prod, i) => {
            const title = prod.title;
            const subtitle = prod.subtitle;
            const link = prod.image_link;
            const price = prod.price;
            const id = prod.id
            const el = Card(title, subtitle, link, price, id);
            out.push(el);

        });

        return out;
    

    };


    






    return (
        <div className="deleteProduct">
            {createCards()}
        </div>
    );

};



export default DeleteProduct;