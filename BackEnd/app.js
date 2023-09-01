const express = require('express');
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5. Establecer el motor de plantilla 
app.set('view engine', 'ejs');

// //6. Invocamos el bcrypt.js
const bcryptjs = require('bcryptjs');

// //7.Sesion variables
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized:true
}))
//8.Invocamos el modulo de conexion bd
const connection = require('./database/db');

app.get('/login',(req, res)=>{
    res.render('login');
})

app.get('/register',(req, res)=>{
    res.render('register');
})
//Registration
app.post('/register', async(req, res) =>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHassh = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', {user:user, name:name, rol:rol, pass:passwordHassh}, async(error, result)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{
                alert:true,
                alertTitle:"Registration",
                alertMessage: "!Sucessfull Registration",
                alertIcon:'sucess', 
                showConfirmButton:false,
                timer:1500,
                ruta:''
            })
        }
    })
})


//11-Autenticacion
app.post('/auth',async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHassh = await bcryptjs.hash(pass, 8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=>{
            if(results.lengt== 0||!(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert:true,
                    alertTitle:"Error",
                    alertMessage:"Usuario y/o password incorrectas",
                    alertIcon:"error",
                    showConfirmButton:true,
                    timer:false,
                    ruta:'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].name
                res.render('login',{
                    alert:true,
                    alertTitle:"Conexion Exitosa",
                    alertMessage:"!LOGIN CORRECTO!",
                    alertIcon:"sucess",
                    showConfirmButton:false,
                    timer:1500,
                    ruta:''
                });
            }
        })
    }else{
        res.render('login',{
            alert:true,
            alertTitle:"Advertencvia",
            alertMessage:"!porfavor ingrese usuario y password!",
            alertIcon:"warning",
            showConfirmButton:true,
            timer:false,
            ruta:'login'
        });
    }
})

//12 - auth Pages
app.get('/',(req, res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login:true,
            name:req.session.name
        });
    }else{
        res.render('index',{
            login:false,
            name:'Debe iniciar Session'
        })
    }
})

//13- logout
app.get('/logout',(req, res) =>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
})