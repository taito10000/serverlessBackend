const serverless = require("serverless-http");
const express = require("express");
const res = require("express/lib/response");
const AWS = require('aws-sdk');
const keys = require('./K');

const app = express();




const datab = new AWS.RDSDataService({region: '<aws-region>'});
const databasename = keys.dbname;
const cluster_arn = keys.cluster_arn;
const db_secret = keys.db_secret;
const prodKeys = ['unique_id', 'product_id', 'category', 'sub_category','sub_category2', 'title', 'metatitle', 'description', 'manufacturer', 'image_link', 'status', 'price'];
const catKeys = ['id', 'category', 'type', 'image_link'];


// Data from RDS-Aurora comes without keynames. This function combines keys and values to an object it returns. 

const dataMaker = (keys, data) => {

  const out = [];
  const vals = [];
  data.forEach(item => {
    const tmp = [];
    item.forEach(obj => {
        tmp.push(Object.values(obj)[0]);
        
    })
    vals.push(tmp);
  });

  vals.forEach((item, i) => {
    const tmp = {};
    keys.forEach((key, j) => { tmp[key] = item[j] });
    out.push([tmp]);
    
  });
  
  return out;
};



// The required headers - CORS and Authorization needs some headers to be configured.

app.use(express.json());


app.use((req, res, next) => {
  console.log('APP USE !!!', req);
  
  const origin = req.origin;
  
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST', 'OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization'); 
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    // console.log("OPTIONS NÄHTY!!!")
    return res.status(204);
  };
  
  next();

});


// ENDPOINT 1: resource root - GET ->  sql-request: get all (or some default) Products
// NO AUTHENTICATION 

app.get("/", async (req, res, next) => {
 
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    const data = await datab.executeStatement(
      {secretArn: db_secret,
      database: databasename,
      resourceArn: cluster_arn,
      sql: 'SELECT * FROM Products'
    }).promise();
    
    const prods = dataMaker(prodKeys, data.records);
    
    return res.status(200).json(
      JSON.stringify(prods)
  );
});

app.get("/cats", async (req,res) => {

  const type = req.query.var1 || '';
  let sql = 'SELECT * FROM Categories';
  if (type !== '') {sql = `SELECT * FROM Categories WHERE type = '${type}'`};
  const data = await datab.executeStatement(
    {secretArn: db_secret,
      database: databasename,
      resourceArn: cluster_arn,
      sql: sql,
    }
  ).promise();
  const cats = dataMaker(catKeys, data.records);
  return res.status(200).json(JSON.stringify(cats));

});

// ENDPOINT X:   resource with parameter/parametres -> To be used f.e. with filtering by categories.
// 
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
  
  const data = await datab.executeStatement(
    {
      secretArn: db_secret,
      database: databasename,
      resourceArn: cluster_arn,
      sql: sql
    }).promise();
  
  if (data.records.length > 0) { 
    const prods = dataMaker(prodKeys, data.records);
    return res.status(200).json(JSON.stringify(prods));
  }
    
    else {
        const prods = [{message: "No products found"}];
        return res.status(200).json(JSON.stringify(prods));

    }; 
});








// TODO:
// ENDPOINT 2:   POST - Receives sql command from frontend. For sandboxing purposes
// NEEDS AUTHENTICATION ???


app.post("/", async (req, res, next) => {
  
  
  const bd = req.body.hello;
  const data = await datab.executeStatement(
    {secretArn: db_secret,
    database: databasename,
    resourceArn: cluster_arn,
    sql: req.body.sql
  }).promise();
  
  const prods = dataMaker(prodKeys, data.records);
  
  return res.status(200).json(
    JSON.stringify(prods)
  );
});


// TODO
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



// TODO
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


// TODO
// ENDPOINT 3 : ADMIN POST with resource variable. add f.e. is for creating + adding product to database. 
// AUTHENTICATION NEEDED

app.post("/admin/prod/:method", async (req, res, next) => {

  
  /*res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'OPTIONS', 'DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization'); 
  res.header('Access-Control-Allow-Credentials', 'true');
*/

  if (req.url === '/admin/prod/add') {

    const data = req.body;
    const mysql = `INSERT INTO Products (product_id, category, sub_category, title, meta_title, description, manufacturer, image_link, status, price) VALUES (${data.productId}, '${data.category}', '${data.subCategory}', '${data.title}', '${data.metaTitle}', '${data.description}', '${data.manufacturer}', '${data.linkToPic}', '${data.status}', ${data.price});`;
    
    const sqldata = await datab.executeStatement(
      {secretArn: db_secret,
      database: databasename,
      resourceArn: cluster_arn,
      sql: mysql
    }).promise();

    return res.status(200)
              .json({message: "New Product Created and added to the database",});
                                 };


  });



module.exports.hellow = hellow;

module.exports.handler = serverless(app);


