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
        let templateName = 'index';

        if (req.cookies.tipUtilizator === "administrator") {
            templateName = 'index_admin';
        }
        else if (req.cookies.tipUtilizator === "normal") {
            templateName = 'index_normal';
        }

        res.render(templateName);
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

app.get('/logout', (req, res) => {
    res.clearCookie('utilizator');
    res.clearCookie('tipUtilizator');
    // Redirect the user to the desired page after logging out
    res.redirect('/');
});

app.post('/save-selected-date', (req, res) => {
    const selectedDate = req.body.selectedDate;
    console.log("Received selectedDate:", selectedDate);

    // Here you can process the selectedDate and send a response back to the client

    const sql = `INSERT INTO user_date (dataa) VALUES (?);`;
    con.query(sql, selectedDate, (err, result) => {
        if (err) {
            console.log('data selectata');
        } else {
            console.log("selected date added to user_date:", selectedDate);

            // Send the success response as a JSON object
            res.json({ message: 'Date received and added to user_date successfully' });
        }
    });
});



app.get('/adaugare_masa', (req, res) => {
    con.query("SELECT * FROM produse;", function (err, produseResult, fields) {
        if (err) {
            res.render('mentenanta');
            console.log('Site-ul este in mentenanta');
        }
        else{
        const produse = produseResult;
        
        con.query("SELECT * FROM user_date;", function (err, userDataResult, fields) {
            if (err) throw err;
            const userData = userDataResult;
            res.render('adaugare_masa', { produse: produse, userData: userData });
        });
    }
    });
});




app.get('/istoric', (req, res) => {
    const selectedDate = req.query.selectedDate; // Get the selected date from the query string
    console.log("selectedDate:", selectedDate);

    if(selectedDate){
    const fetchDataSql = 'SELECT masa1, calorii_masa1, masa2, calorii_masa2, masa3, calorii_masa3 FROM user_date WHERE dataa = ?;';
    con.query(fetchDataSql, [selectedDate], (fetchErr, fetchResult) => {
        if (fetchErr) {
            res.render('mentenanta');
            console.log('Site-ul este in mentenanta');
        } else {
            const userData = fetchResult[0];

            if (userData) {
                // Extract IDs from 'masa1', 'masa2', and 'masa3' fields
                const masa1Ids = userData.masa1 ? userData.masa1.split(',') : [];
                const masa2Ids = userData.masa2 ? userData.masa2.split(',') : [];
                const masa3Ids = userData.masa3 ? userData.masa3.split(',') : [];

                // Filter out empty values
                const nonEmptyMasa1Ids = masa1Ids.filter(id => id !== "");
                const nonEmptyMasa2Ids = masa2Ids.filter(id => id !== "");
                const nonEmptyMasa3Ids = masa3Ids.filter(id => id !== "");

                // Fetch products based on the non-empty IDs from 'masa1', 'masa2', and 'masa3'
                const fetchProductsSql = 'SELECT id, name FROM produse WHERE id IN (?);';

                // Fetch products for masa1 (conditionally)
                if (nonEmptyMasa1Ids.length > 0) {
                    con.query(fetchProductsSql, [nonEmptyMasa1Ids], (fetchMasa1Err, masa1Products) => {
                        if (fetchMasa1Err) {
                            console.error("Error fetching products for masa1:", fetchMasa1Err);
                            res.status(500).send("Error fetching products for masa1");
                        } else {
                            // Fetch products for masa2 (conditionally)
                            if (nonEmptyMasa2Ids.length > 0) {
                                con.query(fetchProductsSql, [nonEmptyMasa2Ids], (fetchMasa2Err, masa2Products) => {
                                    if (fetchMasa2Err) {
                                        console.error("Error fetching products for masa2:", fetchMasa2Err);
                                        res.status(500).send("Error fetching products for masa2");
                                    } else {
                                        // Fetch products for masa3 (conditionally)
                                        if (nonEmptyMasa3Ids.length > 0) {
                                            con.query(fetchProductsSql, [nonEmptyMasa3Ids], (fetchMasa3Err, masa3Products) => {
                                                if (fetchMasa3Err) {
                                                    console.error("Error fetching products for masa3:", fetchMasa3Err);
                                                    res.status(500).send("Error fetching products for masa3");
                                                } else {
                                                    // Render the 'istoric.ejs' template with the fetched data
                                                    res.render('istoric', {
                                                        userData: userData,
                                                        selectedDate: selectedDate,
                                                        masa1Products: masa1Products,
                                                        masa2Products: masa2Products,
                                                        masa3Products: masa3Products
                                                    });
                                                }
                                            });
                                        } else {
                                            // Render the 'istoric.ejs' template with the fetched data (without masa3)
                                            res.render('istoric', {
                                                userData: userData,
                                                selectedDate: selectedDate,
                                                masa1Products: masa1Products,
                                                masa2Products: masa2Products,
                                                masa3Products: []
                                            });
                                        }
                                    }
                                });
                            } else {
                                // Fetch products for masa3 (conditionally)
                                if (nonEmptyMasa3Ids.length > 0) {
                                    con.query(fetchProductsSql, [nonEmptyMasa3Ids], (fetchMasa3Err, masa3Products) => {
                                        if (fetchMasa3Err) {
                                            console.error("Error fetching products for masa3:", fetchMasa3Err);
                                            res.status(500).send("Error fetching products for masa3");
                                        } else {
                                            // Render the 'istoric.ejs' template with the fetched data (without masa2)
                                            res.render('istoric', {
                                                userData: userData,
                                                selectedDate: selectedDate,
                                                masa1Products: masa1Products,
                                                masa2Products: [],
                                                masa3Products: masa3Products
                                            });
                                        }
                                    });
                                } else {
                                    // Render the 'istoric.ejs' template with the fetched data (without masa2 and masa3)
                                    res.render('istoric', {
                                        userData: userData,
                                        selectedDate: selectedDate,
                                        masa1Products: masa1Products,
                                        masa2Products: [],
                                        masa3Products: []
                                    });
                                }
                            }
                        }
                    });
                } else {
                    // Fetch products for masa2 (conditionally)
                    if (nonEmptyMasa2Ids.length > 0) {
                        con.query(fetchProductsSql, [nonEmptyMasa2Ids], (fetchMasa2Err, masa2Products) => {
                            if (fetchMasa2Err) {
                                console.error("Error fetching products for masa2:", fetchMasa2Err);
                                res.status(500).send("Error fetching products for masa2");
                            } else {
                                // Fetch products for masa3 (conditionally)
                                if (nonEmptyMasa3Ids.length > 0) {
                                    con.query(fetchProductsSql, [nonEmptyMasa3Ids], (fetchMasa3Err, masa3Products) => {
                                        if (fetchMasa3Err) {
                                            console.error("Error fetching products for masa3:", fetchMasa3Err);
                                            res.status(500).send("Error fetching products for masa3");
                                        } else {
                                            // Render the 'istoric.ejs' template with the fetched data (without masa1)
                                            res.render('istoric', {
                                                userData: userData,
                                                selectedDate: selectedDate,
                                                masa1Products: [],
                                                masa2Products: masa2Products,
                                                masa3Products: masa3Products
                                            });
                                        }
                                    });
                                } else {
                                    // Render the 'istoric.ejs' template with the fetched data (without masa1 and masa3)
                                    res.render('istoric', {
                                        userData: userData,
                                        selectedDate: selectedDate,
                                        masa1Products: [],
                                        masa2Products: masa2Products,
                                        masa3Products: []
                                    });
                                }
                            }
                        });
                    } else {
                        // Fetch products for masa3 (conditionally)
                        if (nonEmptyMasa3Ids.length > 0) {
                            con.query(fetchProductsSql, [nonEmptyMasa3Ids], (fetchMasa3Err, masa3Products) => {
                                if (fetchMasa3Err) {
                                    console.error("Error fetching products for masa3:", fetchMasa3Err);
                                    res.status(500).send("Error fetching products for masa3");
                                } else {
                                    // Render the 'istoric.ejs' template with the fetched data (without masa1 and masa2)
                                    res.render('istoric', {
                                        userData: userData,
                                        selectedDate: selectedDate,
                                        masa1Products: [],
                                        masa2Products: [],
                                        masa3Products: masa3Products
                                    });
                                }
                            });
                        } else {
                            // Render the 'istoric.ejs' template with the fetched data (without masa1, masa2, and masa3)
                            res.render('istoric', {
                                userData: userData,
                                selectedDate: selectedDate,
                                masa1Products: [],
                                masa2Products: [],
                                masa3Products: []
                            });
                        }
                    }
                }
            } else {
                res.render('istoric', { userData: null, selectedDate: selectedDate });
            }
        }
    });
}else {
    res.render('istoric', { userData: null, selectedDate: selectedDate });
}
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

app.get('/calculator_calorii', (req, res) => {
    res.render('calculator_calorii.ejs');
});


var mesaj="";
app.get('/', (req, res) => {
    if(req.cookies != null && req.cookies.utilizator != null){
        nume = req.cookies.utilizator;
        res.clearCookie('utilizator');
    }
    res.render('index',{mesaj:mesaj});
});

const fs = require('fs');

let _utilizatori; 
fs.readFile('utilizatori.json',(err,data) => {
 	if(err) throw err; 
 	_utilizatori = JSON.parse(data); 
 });

app.get('/home',(req,res) => {
    res.redirect("http://localhost:6789");
});



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
                con.query("CREATE TABLE if not exists produse (id INT(3) AUTO_INCREMENT PRIMARY KEY,name VARCHAR(50),pret INT(15));", function (err, result) {
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
    res.render('inserare-BD.ejs');
});

app.get('/inserare-prestabilite', (req, res) => {
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO produse (name, pret) VALUES ?";
        var values = [
            ['Fish and Chips', 650],
            ['Chocolate Milkshake', 450],
            ['Muffin cu ciocolată', 370],
            ['Chips de tortilla', 140],
            ['Big Mac', 563],
            ['Oreo Milkshake', 690],
            ['Onion Rings cu sos de ranch', 480],
            ['Cheese Quesadilla', 440],
            ['Biscuiți de unt cu ciocolată', 160],
            ['Nachos cu chili și brânză', 410],
            ['Sarmale', 300],
            ['Mici', 250],
            ['Ciorbă de burtă', 150],
            ['Ciorbă de fasole', 180],
            ['Mămăligă cu brânză și smântână', 350],
            ['Tochitură moldovenească', 400],
            ['Mucenici', 200],
            ['Ciorbă de perișoare', 220],
            ['Varză călită', 180],
            ['Mămăligă cu sarmale', 400],
            ['Ciorbă de legume', 100],
            ['Mămăligă cu mămăliguță', 280],
            ['Papanași', 300],
            ['Ciorbă de pește', 220],
            ['Mămăligă cu mujdei și brânză', 320],
            ['Caltaboș', 280],
            ['Mămăligă cu slănină și ceapă', 380],
            ['Ciorbă rădăuțeană', 190],
            ['Tocană', 280],
            ['Mămăligă cu brânză și ou', 330],
            ['Ciorbă de perișoare de pește', 250],
            ['Mititei', 280],
            ['Ciorbă de fasole cu afumătură', 240],
            ['Cârnați de Plescoi', 300],
            ['Ciorbă de pui cu taitei', 180],
            ['Fasole bătută', 220],
            ['Ciorbă de lobodă', 150],
            ['Plăcintă cu brânză', 250],
            ['Mămăligă cu tocană de ciuperci', 300],
            ['Borcanele cu dulceață', 100],
            ['Mămăligă cu brânză și smochine', 350],
            ['Cozonac', 280],
            ['Mămăligă cu mujdei și scrumbie', 320],
            ['Balmos', 260],
            ['Ciorbă de bame', 120],
            ['Prajitură cu mere', 200],
            ['Ciorbă de fasole cu ciolan', 280],
            ['Pastramă', 300],
            ['Ciorbă de legume cu bors', 150],
            ['Morcovi', 41],
            ['Broccoli', 55],
            ['Castraveți', 16],
            ['Salată verde', 5],
            ['Castravete de mare', 13],
            ['Căpșuni', 29],
            ['Mere', 52],
            ['Banane', 96],
            ['Pere', 57],
            ['Portocale', 43],
            ['Cireșe', 50],
            ['Căpșuni', 29],
            ['Kiwi', 41],
            ['Lămâi', 29],
            ['Mango', 60],
            ['Pepene galben', 30],
            ['Pepene roșu', 30],
            ['Afine', 57],
            ['Morcovi', 41],
            ['Broccoli', 55],
            ['Castraveți', 16],
            ['Salată verde', 5],
            ['Castravete de mare', 13],
            ['Burger cu carne de vită', 250],
            ['Cartofi prăjiți', 365],
            ['Pizza pepperoni', 285],
            ['Nuggets de pui', 220],
            ['Hot dog', 150],
            ['Sandwich cu șuncă și brânză', 320],
            ['Clătită cu sirop de arțar', 350],
            ['Cheeseburger', 300],
            ['Cipsuri', 150],
            ['Shaorma', 600],
            ['Taco', 170],
            ['Frigărui de pui', 180],
            ['McFlurry cu ciocolată', 340],
            ['Wrap cu pui', 250],
            ['Coca-Cola (500ml)', 210],
            ['Prăjitură cu ciocolată', 400],
            ['Sos de maioneză (2 lingurițe)', 100],
            ['Sos de ketchup (2 lingurițe)', 40],
            ['Sos de ranch (2 lingurițe)', 110],
            ['Pui crocant', 290],
            ['Baton de ciocolată', 220],
            ['Salată Cesar cu pui', 390],
            ['Milkshake de ciocolată', 420],
            ['Bacon Cheese Fries', 420],
            ['Burrito', 350],
            ['Chicken Fingers', 320],
            ['Onion Rings', 400],
            ['Donut cu ciocolată', 280],
            ['Soda (500ml)', 180],
            ['Cheese Fries', 450],
            ['Nachos cu brânză', 390],
            ['Chili Cheese Dog', 320],
            ['Chicken Quesadilla', 450],
            ['Sundae cu ciocolată', 280],
            ['Pretzel cu sare', 340],
            ['Pui Buffalo Wings', 290],
            ['Cheese Curds', 370],
            ['Milkshake de vanilie', 380],
            ['Sandwich cu pește prăjit', 380],
            ['Onion Strings', 380]
        ];
        con.query(sql, [values],function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: "+ result.affectedRows);

            // Send the response after the insertion is complete
            res.redirect("http://localhost:6789/");
        });
    });
});

app.get('/inserare-nou', (req, res) => {
    res.render('add-new-product.ejs');

    const productName = req.query.productName;
    const productPrice = req.query.productPrice;

    // Validate and process the form data
    // You can perform additional validation and database insertion here

    console.log('Product Name:', productName);
    console.log('Product Price:', productPrice);


    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO produse (name, pret) VALUES (?,?);";
        if (productName && productPrice && productName.trim() !== '' && productPrice.trim() !== '')
        con.query(sql, [productName, productPrice], (err,result) =>{
            if(err){
                console.error('Error inserting product:', err);
            }
            else{
                console.log("produse inserate:", productName, productPrice)
            }
        });
    });
});


app.listen(port, () => console.log('Serverul rulează la adresa http://localhost:'));