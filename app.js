const express= require("express");  // require express
const path=require("path"); //require path
const mysql = require("mysql2");//require mysql2



const app=express(); 
var session = require('express-session');
const flash = require('connect-flash');

app.use(session({
  secret: 'Mysissioin',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    expires:Date.now()+7*24*60*60*100,
    maxAge:7+24*60*60*1000,

  },
}));
app.use(flash());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");

  next()
})


const ejsMate=require("ejs-mate");
app.set("view engine", "ejs");    //set view ingine
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs',ejsMate);

const methodoveride=require("method-override");
app.use(methodoveride("_method"));

// Database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kartik@12345",
  database: "Staff",
});
main().then(()=>{  //Call Main Method
  console.log("Connected to MySQL database");
})
.catch((err)=>{
  console.log(err);
});
async function main(){   //Connect DataBase
  connection.connect();
} 

// Run query  

app.get("/home",(req,res)=>{
  res.render("./listing/home.ejs")
})
//index rout
app.get("/user",(req,res)=>{
  let q='select * from user';
  try{
     connection.query(q,(err,result)=>{
      if(err){
        req.flash("error","Some Technical issue");
        res.render("/home");
      }else{
        res.render("./listing/index",{user:result});
      }
    })
  }catch(err){
    res.flash("error","some error in data dabase");
    req.redirect("/home");
  }
})

// show routs
app.get("/user/:id/show",(req, res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id = ${id}`;
    try{
       connection.query(q,(err,result)=>{
        if(err){
          req.flash("error","Some Technical issue");
          res.redirect("/user");
        }else{
          res.render("./listing/show",{result});
        }
      })
    }catch(err){
      res.flash("error","some error in database");
      req.redirect("/user");
    }
});


//New rout
app.get("/user/new",(req,res)=>{
    res.render("./listing/new");
});
app.post("/user",async (req,res)=>{
  let q="insert into user (name,age,id,department,mobilenumber,gender,position,image,email,passwords) values (?)";
  const users=req.body;
  console.log(users);
  const values = [users.name,users.age,users.id,users.department,
    users.mobilenumber,users.gender,users.position,
    users.image,users.email,users.password
  ];
  try{
   
     connection.query(q,[values],(err,result)=>{
      if(err){
        req.flash("error","This user aldery Exit! please add another");
        res.redirect("/user/new");
      }else{
        req.flash("success","New User Add Successfull");
        res.redirect("/user");

      }
    })
  }catch(err){
    res.flash("error","some error in database");
    req.redirect("/home");  }
 })


//edit route
app.get("/user/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`SELECT * FROM user WHERE id =(?)`;
  try{
     connection.query(q,[id],(err,result)=>{
      if(err){
        req.flash("error","please enter valid data");
        res.redirect(`/user/${id}/edit`);
      }else{
        req.flash("success","User Updated Successful");
        res.render("./listing/edit", {result});
      }
    });
  }catch(err){
    res.flash("error","some error in database");
    req.redirect("/user");;
  }
})
//update rout
app.put("/user/:id",(req,res)=>{
    let {id}=req.params;
    const users=req.body;
  
    if (!users || Object.keys(users).length === 0) {
      return res.status(400).json({ error: "No data provided for update" });
    }

  const setClause = Object.keys(users).map(col => `\`${col}\` = ?`).join(", ");
  const query = `UPDATE user SET ${setClause} WHERE id = ?`;
  const values = [...Object.values(users), id];

    try{
      connection.query(query,values,(err,result)=>{
        if(err){
          console.log(err);
        }else{
          req.flash("success","User Updeted Successfull!");
          res.redirect("/user");
        }
      })
    }catch(err){
      res.send(err);
    }
})
//DELETE rout
app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let q=`DELETE FROM user WHERE id = ?`;
    try{
      connection.query(q,id,(err,result)=>{
        if(err){
          console.log(err);
        }else{
          req.flash("success","User Deleted!");
          res.redirect("/user");
        }
      })
    }catch(err){
      console.log(err);
    }
})
app.get("/user/verify",(req,res)=>{
  res.render("./listing/verify");
})
app.post("/user/success/verify",(req,res)=>{
  let {id,name}=req.body;
  console.log(id,name);
  let q=`SELECT * FROM user WHERE id = ${id} AND name = '${name}';`;
  try{
     connection.query(q,(err,result)=>{
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (result.length > 0) {
        let userId = result[0].id;
        req.flash("success", "User Verify Successfully!");
        return res.redirect(`/user/${userId}/show`);
      } else {
        req.flash('error', 'User not found please add new user!')
        return res.redirect("/user/verify");
      }
    })
  }catch(err){
    console.log("error occure", err);
  }
})


app.listen(8080,()=>{
    console.log("server is listin to port 8080");
})