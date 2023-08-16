const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const app = express();
const port = 6789;
const mysql = require('mysql2');

// Database connection
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "marian",
    database: "licenta"
  });
  
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to database");
  });


app.use(cookieParser());
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.use('/css', express.static('css'));
//app.use(express.static('public'));

app.get('/', (req, res) => {
    con.query("SELECT * FROM produse", function (err, result, fields) {
        if (err) throw err;
        const products = result;

        if (req.cookies.tipUtilizator === "administrator") {
            // Afișați conținut specific pentru administrator
            res.render('index_admin', { products: products });
        } else {
            // Afișați conținut specific pentru utilizator normal
            res.render('index_normal', { products: products });
        }
    });
});

app.get('/istoric', (req, res) => {
    res.render('istoric');
});

var mesaj="";
app.get('/', (req, res) => {
    if(req.cookies != null && req.cookies.utilizator != null){
        nume = req.cookies.utilizator;
        res.clearCookie('utilizator');
    }
    res.render('index',{mesaj:mesaj});
});
// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată

const fs = require('fs');
let _intrebari;

//laborator10
fs.readFile('intrebari.json', (err, data) => {
  if (err) throw err;
  _intrebari = JSON.parse(data);

  app.get('/chestionar', (req, res) => {
    res.render('chestionar.ejs', { intrebari: _intrebari });
  });
});

app.post('/rezultat-chestionar', (req, res) => {
	var ok = 0;
	for (var x = 0; x< _intrebari.length ; x++)
	{
		if (req.body.intrebari[x] == _intrebari[x].corect)
			ok++;
	}
	res.render('rezultat-chestionar.ejs',{ok})
});

//laborator11
let _utilizatori; 
fs.readFile('utilizatori.json',(err,data) => {
 	if(err) throw err; 
 	_utilizatori = JSON.parse(data); 
 });

app.get('/home',(req,res) => {
    res.redirect("http://localhost:6789");
});

app.get('/autentificare', (req, res) => {
    eroare="";
    mesaj="";
    res.clearCookie("utilizator");
    if(req.cookies.mesajEroare){
        eroare = req.cookies.mesajEroare;
        res.clearCookie("mesajEroare");
    }

    res.render('autentificare.ejs',{mesajEroare:eroare});
});

app.post('/verificare-autentificare', (req, res) => {
    console.log(req.body);

    var ok = 0;
    var name = "";

    for(var i =0; i < _utilizatori.length; i++){
        if(req.body.user == _utilizatori[i].utilizator && req.body.pass == _utilizatori[i].pass){
            ok = 1;
            name = _utilizatori[i].utilizator;
            break;
        }
        else{
            ok = 0;
        }
    }

    if(ok==1){
        res.cookie('utilizator', name);
        res.cookie('tipUtilizator', _utilizatori[i].tip); // Adăugați acest rând
        console.log(_utilizatori[i].tip);
        res.redirect("http://localhost:6789");
    }
    else{
        res.cookie('mesajEroare','Date invalide!');
        res.redirect("http://localhost:6789/autentificare");
    }
});

//laborator 12

app.get('/creare-BD', (req,res) => {
    con.connect(function(err) {
        if(err) throw err;
        console.log("Connected");
        con.query("CREATE DATABASE IF NOT EXISTS licenta;", function (err,result) {
            if(err) throw err;
            console.log("Baza de date a fost creata");
            con.query("USE licenta");
                if(err) throw err;
                console.log("Use licenta");
                con.query("CREATE TABLE if not exists produse(id INT(3), name VARCHAR(50),pret INT(15));", function (err, result) {
                    if (err) throw err;
                    console.log("Tabela produse a fost creata");
                });
            });
    });
    res.redirect("http://localhost:6789/")
});


app.get('/inserare-BD',(req,res) => { 
	 con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		var sql = "INSERT INTO produse (id,name, pret) VALUES ?";
		var values = [
            [1, 'Mere', 52],
            [2, 'Banane', 96],
            [3, 'Cartofi', 77],
            [4, 'Ouă', 68],
            [5, 'Pui fiert', 165],
            [6, 'Brânză cheddar', 113],
            [7, 'Orez brun', 215],
            [8, 'Spanac', 7],
            [9, 'Carne de vită', 250],
            [10, 'Pâine integrală', 79]
        ];
		con.query(sql, [values],function (err, result) {
		  if (err) throw err;
		  console.log("Number of records inserted: "+ result.affectedRows);
		});
	  });

	 res.redirect("http://localhost:6789/");


}); 

app.listen(port, () => console.log('Serverul rulează la adresa http://localhost:'));