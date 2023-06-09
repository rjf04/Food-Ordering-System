var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('../db');
var verifyToken = require('../verifyToken');
var nodemailer = require('nodemailer');
var app = require('../app.js');
var bcrypt = require('bcryptjs');

var verifyToken = require('../verifyToken')
var pp = require('path');
var path= pp.resolve('./views');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    //Add the email ID as well as the app specific password of the nodemailer in the specified places below
    user: 'username@gmail.com',
    pass: 'password'
  }
});

var generator = require('generate-password');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


router.post('/login', function (req, res) {
  
  let username = db.NullCheckChar(req.body.username)
  //let password = db.NullCheckChar(bcrypt.hashSync(req.body.password, 8))
  
  let password = db.NullCheckChar(req.body.password)
  console.log("got post login " + req.body.username +" " +req.body.password); 
  let sql = "select * from user where username = " + username + " and hashedPwd = " + password + " and userStatusName = 'alive'";
  db.mycon.query(sql, function (err, result) {
    var json = JSON.stringify(result)
    console.log("Result: " + json);
    if(err){
      console.log(err);
      res.send(err);
    }else {
      
      res.send(result)
    }
      });
  });

router.post('/signup', function (req, res) {
  console.log("got post signup"); 
  
  let username = db.NullCheckChar(req.body.username)
  //let password = db.NullCheckChar(bcrypt.hashSync(req.body.password, 8)) 
  let password = db.NullCheckChar(req.body.password) 
  let userType = "'end_user'"
  let phoneNo = db.NullCheckChar(req.body.phoneNo)
  let email = db.NullCheckChar(req.body.email)
  let Fname = db.NullCheckChar(req.body.Fname)
  let Lname = db.NullCheckChar(req.body.Lname)  
  let date = db.NullCheckDate(req.body.day, req.body.month, req.body.year ) 
  let sql = "insert into user values( " + username + "," + userType+ "," +  phoneNo+ "," +
           email + "," + Fname + "," + Lname + "," + password + "," + date+ ", 'alive' )";
  db.mycon.query(sql, function (err, result) {
    console.log("Result: " + JSON.stringify(result));
    if(err){
      res.send(err.sqlMessage);
    }else {
       res.send(result);  
    }
      });
  });

router.post('/changeInfo', function (req, res) {
  console.log("got change info"); 
  
  let username = db.NullCheckChar(req.body.username)
  //let password = db.NullCheckChar(bcrypt.hashSync(req.body.password, 8)) 
  let password = db.NullCheckChar(req.body.password)
  let phoneNo = db.NullCheckChar(req.body.phoneNo)
  let email = db.NullCheckChar(req.body.email)
  let Fname = db.NullCheckChar(req.body.Fname)
  let Lname = db.NullCheckChar(req.body.Lname)  
  let date = db.NullCheckDate(req.body.day, req.body.month, req.body.year ) 
  let sql = "update user set  phoneNo=" +  phoneNo+ " , email=" +
           email + " , Fname=" + Fname + " , Lname=" + Lname + " , hashedPwd=" + password + " , Bdate=" + date +
           " where username =" + username;
  db.mycon.query(sql, function (err, result) {
    console.log("Result: " + JSON.stringify(result));
    if(err){
      res.send(err.sqlMessage);
    }else {
       res.send(result);  
    }
      });
  });


router.post('/forgotPassword', function (req, res) {
  console.log("got forgot pwd"); 
  let password = generator.generate({
    length: 10,
    numbers: true
  });
  console.log(password);
  var username = db.NullCheckChar(req.body.username)
  //var sql = "update User set hashedPwd = " + db.NullCheckChar(bcrypt.hashSync(password, 8)) + " where username = " +username;
  var sql = "update User set hashedPwd = " + db.NullCheckChar(password) + " where username = " +username;
  db.mycon.query(sql, function (err, result) {
    console.log(sql+"Result: " + JSON.stringify(result));
    if(err){
      res.send(err.sqlMessage);
    }else {
       var sql2 = "select email from User where username = " + username;
       db.mycon.query(sql2,  function (err, result) {
          console.log(sql2+"Result: " + JSON.stringify(result));
          if(err){
            res.send(err.sqlMessage);
          }else {
            let email = result[0].email
            const mailOptions = {
              from:'dalmak507@gmail.com',
              to: email,
              subject: 'Hope you are doing great',
              text: 'Dear '+req.body.username +",\nHere you go: " + password +"\nHappy Dining!!\n"+
              "\n Regards, \n Team RS\n"
            };
            
             transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
               }); 
            res.send({})
          }
            });
    }
      });
  });

  //FIGURE THIS
function getDate (Bdate){
  
  let dateTimeParts= JSON.stringify(Bdate).split(/[- :]/); 
  
  var day = dateTimeParts[2].substr(0,2)
  var month = dateTimeParts[1]
  var year = dateTimeParts[0].slice(1)
  console.log("bdate "+JSON.stringify(dateTimeParts))
  return [day, month, year]
}
router.get('/profile/:user',verifyToken.verifyToken, function (req, res) {
  console.log("got get user profile"); 
  if(req.cookies["user"]!=req.params["user"]) //not the best way to do this
  {
    res.redirect("/404");
  }
  let username = db.NullCheckChar(req.params["user"])
  let sql = "select * from user where username = " + username + " and userStatusName = 'alive'";
  db.mycon.query(sql, function (err, result) {
    console.log("Result: " + JSON.stringify(result));
    if(err){
      res.send(err.sqlMessage);
    }else { 
       if(result.length >0)
       {
        var day, year, month;
        [day, month, year] = getDate(result[0].Bdate) 
        res.render(path+"/profile.html",{user:req.params["user"], phoneNo:result[0].phoneNo, 
        Fname:result[0].Fname, Lname:result[0].Lname, email:result[0].email, pwd:result[0].hashedPwd,
          day:day, year:year, month:month})
       }
      else 
         res.redirect('/404')  
    }
      });
  });


function CheckField(key, value){
  if(value== null || value==undefined || value=="")
    return key;
  return db.NullCheckChar(value);
};

function CheckQuery(key, value){
  if(value== null || value==undefined)
    return key;
  return value;
};

router.post('/restaurants', function (req, res) {
  console.log("got get all restaurants"); 
  var cuisine = CheckField("cuisine", req.body.cuisine);
  var areaName = CheckField("areaName", req.body.areaName);
  var search = "'%" + CheckQuery("", req.body.search) + "%'";
  console.log("SEARCH "+search);
  var sql = "select * from restaurant where restaurantID IN ( select restaurantID from restaurantdeliveryarea where areaName ="+ areaName+
    " and restaurantID IN  (select restaurantID from restaurant where restaurantName like " + search +")) and cuisine = "+ cuisine
  db.mycon.query(sql, function (err, result) {
    console.log("Result: " + JSON.stringify(result));
    if(err){
      res.send(err);
    }else {
      res.send(result);
    }
      });
  });
router.get('/myOrders/:user', function (req, res) {
    var cur_user = req.params["user"]
    if(req.cookies["user"]!=req.params["user"]) //not the best way to do this
    {
      res.redirect("/404");
    }
    res.render(path+"/order.html", {user:cur_user});
});
router.post('/myOrders/:user', function (req, res) {
  var cur_user = req.params["user"]
  if(req.cookies["user"]!=req.params["user"]) //not the best way to do this
  {
    res.redirect("/404");
  }
  var sql = "Select * from cart where statusName not in ('Pending') and orderedByName = "+db.NullCheckChar(cur_user)+" order by CartId"
  db.mycon.query(sql, function (err, result) {
    console.log(sql, "Result: " + JSON.stringify(result));
    if(err){
      res.send(err);
    }else {
      res.send(result);
    }
      });
  });

  router.post('/getName', function (req, res) {
    var restaurantID = req.body.restaurantID  // GET THIS
    var sql = "Select restaurantName from restaurant where restaurantID = "+ restaurantID
    db.mycon.query(sql, function (err, result) {
      console.log(sql, "Result: " + JSON.stringify(result));
      if(err){
        res.send(err);
      }else {
        res.send(result);
      }
        });
    });

    

function CheckActive(value){
  if(value== null || value==undefined)
    return "starthour=starthour";
  return "startHour<=" + value + " and endhour>="+value;
};
function CheckZeros(value){
  val = value.toString();
  if(val.length==2)return value;
  else if(val.length==1)return "0"+value;
  else return "00";
};

router.get('/restaurantMenu/:name', verifyToken.verifyToken,function (req, res) {
      var today = new Date();
      var time;
      if(req.body.active=="True"){
        time= CheckZeros(today.getHours())+""+ CheckZeros(today.getMinutes())+""+ CheckZeros(today.getSeconds());
      }
      console.log(time);
      var active = CheckActive(time);
      var menuType = CheckField("menuType", req.body.menuType);
      var sql = "select * from restaurantMenu where restaurantID IN ( select restaurantID from restaurant where restaurantName ="+
      //db.NullCheckChar(req.params["name"]) +") and "+active+" and menuType = "+menuType;
      db.NullCheckChar(req.params["name"]) +") and menuType = "+menuType;
  db.mycon.query(sql, function (err, result) {
    console.log(sql, "Result: " + JSON.stringify(result));
    if(err){
      res.send(err);
    }else {
      var rest = req.params["name"].replace(/\s/g, '_')
      res.render(path+"/menu.html",{rest:rest})
    }
      });
  });

router.get('/areas', function (req, res) {
    var sql = "Select * from DeliveryArea;"
    db.mycon.query(sql, function (err, result) {
      console.log(sql, "Result: " + JSON.stringify(result));
      if(err){
        res.send(err);
      }else {
        res.send(result);
      }
        });
    });
router.get('/cuisines', function (req, res) {
  var sql = "select * from Cuisine;"
  db.mycon.query(sql, function (err, result) {
    console.log(sql, "Result: " + JSON.stringify(result));
    if(err){
      res.send(err);
    }else {
      res.send(result);
    }
      });
  });
  
//importing user controllers
var addressController = require('./user/addressController');
var restaurantController = require('./user/restaurantController');

//creating the route for the controllers
router.use('/address', addressController);
router.use('/restaurant', restaurantController);


module.exports = router;
