const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const app = express();
const port = 6789;
const mysql = require('mysql2');


app.use(express.static('public'));
//app.use('/js', express.static('js'));

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
    con.query("SELECT * FROM produse;", function (err, result, fields) {
        if (err) throw err;
        const produse = result;

        if (req.cookies.tipUtilizator === "administrator") {
            // Afișați conținut specific pentru administrator
            res.render('index_admin', { produse: produse });
        } else {
            // Afișați conținut specific pentru utilizator normal
            res.render('index_normal', { produse: produse });
        }
    });
});



app.post('/save-selected-date', (req, res) => {
    const selectedDate = req.body.selectedDate;
    console.log("Received selectedDate:", selectedDate);

    // Here you can process the selectedDate and send a response back to the client

    const sql = `INSERT INTO user_date (dataa) VALUES (?);`;
    con.query(sql, selectedDate, (err, result) => {
        if (err) {
            console.error("Error inserting into user_date table:", err);
            res.status(500).send("Error inserting into user_date table");
        } else {
            console.log("selected date added to user_date:", selectedDate);

            // Send the success response as a JSON object
            res.json({ message: 'Date received and added to user_date successfully' });
        }
    });
});



app.get('/adaugare_masa', (req, res) => {
    con.query("SELECT * FROM produse", function (err, produseResult, fields) {
        if (err) throw err;
        const produse = produseResult;

        con.query("SELECT * FROM user_date", function (err, userDataResult, fields) {
            if (err) throw err;
            const userData = userDataResult;
            
            res.render('adaugare_masa', { produse: produse, userData: userData });
        });
    });
});

app.post('/save-selected-date-2', (req, res) => {
    const selectedDate = req.body.selectedDate;
    console.log("Received selectedDate:", selectedDate);

    // Here you can process the selectedDate and send a response back to the client

});

app.get('/istoric', (req, res) => {
    const selectedDate = req.query.selectedDate; // Get the selected date from the query string
    console.log("selectedDate:", selectedDate);
    // Fetch the data from the user_date table based on the selected date
    const fetchDataSql = 'SELECT masa1, calorii_masa1, masa2, calorii_masa2, masa3, calorii_masa3 FROM user_date WHERE dataa = ?;';
    con.query(fetchDataSql, [selectedDate], (fetchErr, fetchResult) => {
        if (fetchErr) {
            console.error("Error fetching data from user_date table:", fetchErr);
            res.status(500).send("Error fetching data from user_date table");
        } else {
            const userData = fetchResult[0];

            // Render the 'istoric.ejs' template with the fetched data and selectedDate
            res.render('istoric', { userData: userData, selectedDate: selectedDate });
        }
    });
});




app.post('/add-event-text', (req, res) => {
    const eventText = req.body.eventText;
    console.log("Received eventText:", eventText);
    res.json({ message: 'Event text received successfully' });
});

app.post("/add-to-masa1", (req, res) => {
    const selectedProductId = req.body.id;
    const selectedDate = req.body.date;
    let cantitate = parseFloat(req.body.cantitate);

    console.log("cantitate:", cantitate);
    // Fetch the current value of the masa1 field for the selected date
    const fetchSql = `SELECT masa1 FROM user_date WHERE dataa = ?;`;
    con.query(fetchSql, [selectedDate], (fetchErr, fetchResult) => {
        if (fetchErr) {
            console.error("Error fetching masa1 value:", fetchErr);
            res.status(500).send("Error fetching masa1 value");
        } else {
            const currentMasa1 = fetchResult[0].masa1;
            let updatedMasa1 = currentMasa1;

            // Check if the currentMasa1 is not empty
            if (currentMasa1) {
                updatedMasa1 += `,${selectedProductId}`;
            } else {
                updatedMasa1 = selectedProductId.toString();
            }

            // Update the user_date table with the updatedMasa1 value
            // Define the SQL query to update the masa1 column
            const updateSql = `UPDATE user_date SET masa1 = ? WHERE dataa = ?;`;

            // Execute the update query
            con.query(updateSql, [updatedMasa1, selectedDate], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Error updating user_date table:", updateErr);
                    res.status(500).send("Error updating user_date table");
                } else {
                    console.log("Product id added to masa1 field:", selectedProductId);

                    // Fetch the 'pret' values from produse based on updatedMasa1
                    const fetchPretSql = `SELECT pret FROM produse WHERE id IN (${selectedProductId});`;
                    con.query(fetchPretSql, (fetchPretErr, fetchPretResult) => {
                        if (fetchPretErr) {
                            console.error("Error fetching pret values:", fetchPretErr);
                            res.status(500).send("Error fetching pret values");
                        } else {
                            let totalCaloriiForId = 0;
                            // Calculate the total based on fetched 'pret' values and cantitate
                            for (const row of fetchPretResult) {
                                totalCaloriiForId += (row.pret * cantitate) / 100.0;
                                console.log("row.pret:",row.pret);
                                console.log("cantitate:",cantitate);
                            }
                            console.log("totalCaloriiForId:", totalCaloriiForId);
                            // Fetch the current value of calorii_masa1 from user_date
                            const fetchCaloriiMasa1Sql = `SELECT calorii_masa1 FROM user_date WHERE dataa = ?;`;
                            con.query(fetchCaloriiMasa1Sql, [selectedDate], (fetchCaloriiErr, fetchCaloriiResult) => {
                                if (fetchCaloriiErr) {
                                    console.error("Error fetching calorii_masa1 value:", fetchCaloriiErr);
                                    res.status(500).send("Error fetching calorii_masa1 value");
                                } else {
                                    let calorii_masa1 = fetchCaloriiResult[0].calorii_masa1;

                                    console.log("calorii_masa1:", calorii_masa1);
                                    // Update calorii_masa1 with the new value
                                    calorii_masa1 += totalCaloriiForId;

                                    // Update the user_date table with the updated calorii_masa1 value
                                    const updateCaloriiMasa1Sql = `UPDATE user_date SET calorii_masa1 = ? WHERE dataa = ?;`;
                                    con.query(updateCaloriiMasa1Sql, [calorii_masa1, selectedDate], (updateCaloriiErr, updateCaloriiResult) => {
                                        if (updateCaloriiErr) {
                                            console.error("Error updating calorii_masa1:", updateCaloriiErr);
                                            res.status(500).send("Error updating calorii_masa1");
                                        } else {
                                            console.log("calorii_masa1 updated:", calorii_masa1);
                                            res.status(200).json({ message: "Data received and processed successfully." });
                                        }
                                    });
                                }
                            });
                        }
        });
    }
});

        }
    });
});

app.post("/add-to-masa2", (req, res) => {
    const selectedProductId = req.body.id;
    const selectedDate = req.body.date;
    let cantitate = parseFloat(req.body.cantitate);

    console.log("cantitate:", cantitate);
    // Fetch the current value of the masa2 field for the selected date
    const fetchSql = `SELECT masa2 FROM user_date WHERE dataa = ?;`;
    con.query(fetchSql, [selectedDate], (fetchErr, fetchResult) => {
        if (fetchErr) {
            console.error("Error fetching masa2 value:", fetchErr);
            res.status(500).send("Error fetching masa2 value");
        } else {
            const currentMasa2 = fetchResult[0].masa2;
            let updatedMasa2 = currentMasa2;

            // Check if the currentMasa1 is not empty
            if (currentMasa2) {
                updatedMasa2 += `,${selectedProductId}`;
            } else {
                updatedMasa2 = selectedProductId.toString();
            }

            // Update the user_date table with the updatedMasa1 value
            // Define the SQL query to update the masa1 column
            const updateSql = `UPDATE user_date SET masa2 = ? WHERE dataa = ?;`;

            // Execute the update query
            con.query(updateSql, [updatedMasa2, selectedDate], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Error updating user_date table:", updateErr);
                    res.status(500).send("Error updating user_date table");
                } else {
                    console.log("Product id added to masa2 field:", selectedProductId);

                    // Fetch the 'pret' values from produse based on updatedMasa1
                    const fetchPretSql = `SELECT pret FROM produse WHERE id IN (${selectedProductId});`;
                    con.query(fetchPretSql, (fetchPretErr, fetchPretResult) => {
                        if (fetchPretErr) {
                            console.error("Error fetching pret values:", fetchPretErr);
                            res.status(500).send("Error fetching pret values");
                        } else {
                            let totalCaloriiForId = 0;
                            // Calculate the total based on fetched 'pret' values and cantitate
                            for (const row of fetchPretResult) {
                                totalCaloriiForId += (row.pret * cantitate) / 100.0;
                                console.log("row.pret:",row.pret);
                                console.log("cantitate:",cantitate);
                            }
                            console.log("totalCaloriiForId:", totalCaloriiForId);
                            // Fetch the current value of calorii_masa1 from user_date
                            const fetchCaloriiMasa2Sql = `SELECT calorii_masa2 FROM user_date WHERE dataa = ?;`;
                            con.query(fetchCaloriiMasa2Sql, [selectedDate], (fetchCaloriiErr, fetchCaloriiResult) => {
                                if (fetchCaloriiErr) {
                                    console.error("Error fetching calorii_masa2 value:", fetchCaloriiErr);
                                    res.status(500).send("Error fetching calorii_masa2 value");
                                } else {
                                    let calorii_masa2 = fetchCaloriiResult[0].calorii_masa2;

                                    console.log("calorii_masa2:", calorii_masa2);
                                    // Update calorii_masa1 with the new value
                                    calorii_masa2 += totalCaloriiForId;

                                    // Update the user_date table with the updated calorii_masa1 value
                                    const updateCaloriiMasa2Sql = `UPDATE user_date SET calorii_masa2 = ? WHERE dataa = ?;`;
                                    con.query(updateCaloriiMasa2Sql, [calorii_masa2, selectedDate], (updateCaloriiErr, updateCaloriiResult) => {
                                        if (updateCaloriiErr) {
                                            console.error("Error updating calorii_masa2:", updateCaloriiErr);
                                            res.status(500).send("Error updating calorii_masa2");
                                        } else {
                                            console.log("calorii_masa2 updated:", calorii_masa2);
                                            res.status(200).json({ message: "Data received and processed successfully." });
                                        }
                                    });
                                }
                            });
                        }
        });
    }
});

        }
    });
});

app.post("/add-to-masa3", (req, res) => {
    const selectedProductId = req.body.id;
    const selectedDate = req.body.date;
    let cantitate = parseFloat(req.body.cantitate);

    console.log("cantitate:", cantitate);
    // Fetch the current value of the masa3 field for the selected date
    const fetchSql = `SELECT masa3 FROM user_date WHERE dataa = ?;`;
    con.query(fetchSql, [selectedDate], (fetchErr, fetchResult) => {
        if (fetchErr) {
            console.error("Error fetching masa3 value:", fetchErr);
            res.status(500).send("Error fetching masa3 value");
        } else {
            const currentmasa3 = fetchResult[0].masa3;
            let updatedmasa3 = currentmasa3;

            // Check if the currentmasa3 is not empty
            if (currentmasa3) {
                updatedmasa3 += `,${selectedProductId}`;
            } else {
                updatedmasa3 = selectedProductId.toString();
            }

            // Update the user_date table with the updatedmasa3 value
            // Define the SQL query to update the masa3 column
            const updateSql = `UPDATE user_date SET masa3 = ? WHERE dataa = ?;`;

            // Execute the update query
            con.query(updateSql, [updatedmasa3, selectedDate], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Error updating user_date table:", updateErr);
                    res.status(500).send("Error updating user_date table");
                } else {
                    console.log("Product id added to masa3 field:", selectedProductId);

                    // Fetch the 'pret' values from produse based on updatedmasa3
                    const fetchPretSql = `SELECT pret FROM produse WHERE id IN (${selectedProductId});`;
                    con.query(fetchPretSql, (fetchPretErr, fetchPretResult) => {
                        if (fetchPretErr) {
                            console.error("Error fetching pret values:", fetchPretErr);
                            res.status(500).send("Error fetching pret values");
                        } else {
                            let totalCaloriiForId = 0;
                            // Calculate the total based on fetched 'pret' values and cantitate
                            for (const row of fetchPretResult) {
                                totalCaloriiForId += (row.pret * cantitate) / 100.0;
                                console.log("row.pret:",row.pret);
                                console.log("cantitate:",cantitate);
                            }
                            console.log("totalCaloriiForId:", totalCaloriiForId);
                            // Fetch the current value of calorii_masa3 from user_date
                            const fetchCaloriimasa3Sql = `SELECT calorii_masa3 FROM user_date WHERE dataa = ?;`;
                            con.query(fetchCaloriimasa3Sql, [selectedDate], (fetchCaloriiErr, fetchCaloriiResult) => {
                                if (fetchCaloriiErr) {
                                    console.error("Error fetching calorii_masa3 value:", fetchCaloriiErr);
                                    res.status(500).send("Error fetching calorii_masa3 value");
                                } else {
                                    let calorii_masa3 = fetchCaloriiResult[0].calorii_masa3;

                                    console.log("calorii_masa3:", calorii_masa3);
                                    // Update calorii_masa3 with the new value
                                    calorii_masa3 += totalCaloriiForId;

                                    // Update the user_date table with the updated calorii_masa3 value
                                    const updateCaloriimasa3Sql = `UPDATE user_date SET calorii_masa3 = ? WHERE dataa = ?;`;
                                    con.query(updateCaloriimasa3Sql, [calorii_masa3, selectedDate], (updateCaloriiErr, updateCaloriiResult) => {
                                        if (updateCaloriiErr) {
                                            console.error("Error updating calorii_masa3:", updateCaloriiErr);
                                            res.status(500).send("Error updating calorii_masa3");
                                        } else {
                                            console.log("calorii_masa3 updated:", calorii_masa3);
                                            res.status(200).json({ message: "Data received and processed successfully." });
                                        }
                                    });
                                }
                            });
                        }
        });
    }
});

        }
    });
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
            con.query("USE licenta", function(err, result) {
                if(err) throw err;
                console.log("Use licenta");
                con.query("CREATE TABLE if not exists produse (id INT(3), name VARCHAR(50), pret INT(15));", function (err, result) {
                    if (err) throw err;
                    console.log("Tabela produse a fost creata");
                });

                con.query("CREATE TABLE if not exists user_date (dataa DATE UNIQUE, masa1 TEXT, calorii_masa1 INT, masa2 TEXT, calorii_masa2 INT, masa3 TEXT, calorii_masa3 INT);", function (err, result) {
                    if (err) throw err;
                    console.log("Tabela user_date a fost creata");
                });
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

            // Send the response after the insertion is complete
            res.redirect("http://localhost:6789/");
        });
    });
});

app.listen(port, () => console.log('Serverul rulează la adresa http://localhost:'));