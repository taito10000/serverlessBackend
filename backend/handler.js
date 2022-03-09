const serverless = require("serverless-http");

const express = require("express");
const MYSQL = require('serverless-mysql')();
const AWS = require('aws-sdk');
const keys = require('./K');
const app = express();
app.use(express.json());



app.use((req, res, next) => {
  console.log('APP USE !!!', req);
  
  const origin = req.origin;
  console.log("\n\n REQUEST: ", req);
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, X-Auth-Token, Origin');  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
            
            
  if (req.method === 'OPTIONS') {
    console.log("OPTIONS NÄHTY!!!")
    return res.status(204).end();
  };

  next();
});


MYSQL.config({

    host: keys.HOST,
    user: keys.USER,
    password: keys.PASSWORD,
    database: keys.DATABASE

  });




const sqlQuery = async (sql) => {

    const data =  await MYSQL.query(sql);
    console.log("DATA: ", data);
    await MYSQL.end();
  
    return data;
};





const prodKeys = ['id', 'category', 'sub_category','sub_category2', 'title', 'subtitle', 'description', 'brand', 'image_link', 'status', 'amount', 'price'];
const catKeys = ['id', 'category', 'type', 'image_link'];

// Data from MYSql comes without keynames. This function combines keys and values to an object it returns. 

const dataMaker = (keys, data) => {
  const rows = new Array(data);
  const vals = [];
  rows[0].forEach(row => {
    const tmp = {};
    keys.forEach( (key, j) => {
          tmp[key] = row[key];
          
    }) 
    
    vals.push(tmp);
  });

  return vals;
};






// ENDPOINT 1: resource root - GET ->  sql-request: get all (or some default) Products
// NO AUTHENTICATION 

app.get("/", async (req, res, next) => {
 
  //res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    
    const data = await sqlQuery(`SELECT * FROM Products;`);
    
    const prods = dataMaker(prodKeys, data);
    
    //res.setHeader('content-type', 'application/json');
    return res.status(200).json(
      prods
  );
});


// ENDPOINT 2: category listing. /cats -> all gategories
//  .../cats?var1=main   ->   main categories
//  .../cats?var1=sub    ->   sub-categories
// NO AUTHENTICATION

app.get("/cats", async (req,res) => {

  console.log("CATS !!!");

  const type = req.query.var1 || '';
  let sql = 'SELECT * FROM Categories;';
  if (type !== '') {sql = `SELECT * FROM Categories WHERE type = '` + type +`';`};
  console.log("CATS QUERY: ", sql);

  const data = await sqlQuery(sql);
  
  const cats = dataMaker(catKeys, data);
  return res.status(200).json(cats);

});




// ENDPOINT X: Get products filtered with category 
// (  f.e.   aws-prefix/category?var1=sticks&var2=wooden  )
// NO AUTHENTICATION

app.get("/category", async (req, res, next) => {
 
  const category1 = req.query.var1 || '';
  const category2 = req.query.var2 || '';

  let sql = '';
  if (category2 === '') {
    sql = `SELECT * FROM Products WHERE category = '${category1}';`
  } 
  else if (category1 === '') {

    sql = `SELECT * FROM Products WHERE sub_category = '${category2}' OR sub_category2 = '${category2}'`;
  }

  else {
    sql = `SELECT * FROM Products WHERE category = '${category1}' AND (sub_category = '${category2}' OR sub_category2 = '${category2}';`
 };
  
  const data = await sqlQuery(sql);


  if (data.records.length > 0) { 
    const prods = dataMaker(prodKeys, data);
    return res.status(200).json(JSON.stringify(prods));
  }
    
    else {
        const prods = [{message: "No products found"}];
        return res.status(200).json(JSON.stringify(prods));

    }; 
});



app.post("/admin/prod/:method", async (req, res, next) => {

  
  // PRODUCTS: Add
  if (req.url === '/admin/prod/add') {

    
    const data = req.body;
    
    const sql = `INSERT INTO Products (category, sub_category, sub_category2, title, subtitle, description, brand, image_link, status, amount, price) VALUES ('`
              + data.category +`', '`
              + data.sub_category +`','`
              + data.sub_category2 +`', '` 
              + data.title + `', '`
              + data.subtitle + `', '`
              + data.description + `', '` 
              + data.brand + `', '` 
              + data.image_link + `', '` 
              + data.status + `', `
              + parseInt(data.amount) + `, `
              + parseFloat(data.price) + `);`;
   
    
    console.log("\n CREATE SQL: ",sql);

    const sqldata = await sqlQuery(sql);
    
    console.log("PRODUCT ADD PROMISE TRY LOHKOSSA");
  
  //catch(err){ return res.status(500).json({message: "database error"})};
    return res.status(200)
              .json({message: "New Product Created and added to the database",});
                                 };


  // CATEGORIES : Add
  if (req.url === '/admin/prod/addcategory') {
    const data = req.body;
    console.log("\n DATA categories: ", data);
    const sql = `INSERT INTO Categories (category, type, image_link) VALUES ('`
                + data.category +`', '`
                + data.type + `','` 
                + data.image_link + `');`;
    try {
      const sqldata = await sqlQuery(sql);
  }
    catch(err){ return res.status(500).json({message: "database error"})};
    return res.status(200)
              .json({message: "New Category Created",});
    };

    
    // DELETE PRODUCT
    
    if (req.url === '/admin/prod/deleteproduct') {

        const data = req.body;
        const sql = `DELETE FROM Products WHERE ID = `+ req.body.id + `;`

        try {const sqldata = await sqlQuery(sql);
              return res.status(200).json({message: "deleted!"});
        
        }
        catch(err) {return res.status(500).json({message: "query error"})};

    };
  });




// ENDPOINT 2:   POST - Receives sql command from frontend. For sandboxing purposes
// NEEDS AUTHENTICATION ???


app.post("/", async (req, res, next) => {
  
  
  const bd = req.body.hello;
  const data = await sqlQuery(req.body.sql);
  
  const prods = dataMaker(prodKeys, data);
  
  return res.status(200).json(
    JSON.stringify(prods)
  );
});



// ENDPOINT X :  Admin - 
// AUTHENTICATION NEEDED

app.post("/admin/prod", async (req, res, next) => {
 
  
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization, Accept'); 
  
  const sqlRequest = req.body.sql;

  const data = await datab.executeStatement(
    {secretArn: db_secret,
    database: databasename,
    resourceArn: cluster_arn,
    sql: 'SELECT * FROM Products'
  }).promise();
  
  //const prods = dataMaker(prodKeys, data.records);
  
  return res.status(200).json(
    JSON.stringify({message: "heihei"})
 );
 
});



// ENDPOINT X : Admin - GET - Needed???
// AUTHENTICATION NEEDED.


app.get("/admin/prod/:method", (req, res, next) => {
 
  // res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST', 'OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Accept'); 
  if (req.method === 'OPTIONS') {console.log('OPTIONS löydetty Admin/Prod alta!!!')};
  
  return res.status(200).json(
    JSON.stringify({message: "CLOSED 2 - Shouldn't be visible without authenticating",
    method: req.params.method})
  );
 
});




module.exports.hellow = hellow;
module.exports.handler = serverless(app);


