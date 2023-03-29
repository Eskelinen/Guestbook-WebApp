var express = require("express");
var fs = require("fs");
var app = express();

//Määritellään sovelluksen kuuntelema portti.
const port = process.env.PORT || 8081;

//Käytetään ejs:ää sivujen tekemiseen.
app.set("view engine", "ejs");
app.locals.pretty = true;

//Käytetään public hakemistoa.
app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
 extended: true
}));

// "/" reitti vie etusivulle.
app.get("/", function(req, res) {
  res.render("pages/index");
});

// "/guestbook" reitti vie vieraskirjaan. Tätä varten tarvitaan data sample.json-tiedostosta.
app.get("/guestbook", function(req, res) {
    var data = require("./sample.json");
    res.render("pages/guestbook", {"poytadata": data});
});

// "/newmessage" polku vie käyttäjän sivulle, josta voi lähettää uuden viestin.
app.get("/newmessage", function(req, res) {
  res.render("pages/newmessage");
});

//Uuden viestin lähettämiseen vaadittava koodi.
app.post('/newmessage', function(req, res) {
    var data = require('./sample.json');

    //Nämä tiedot otetaan sivun lomakkeesta.
    var username = req.body.name;
    var country = req.body.country;
    var message = req.body.message;

    //Päivämäärä selvitetään Date()-funktion avulla.
    var date = new Date();
    var dateTime = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " " + date.getHours() + ":" + ((date.getMinutes() < 10)?"0":"") + date.getMinutes();

    //Validaatio tyhjien lomakkeen kenttien varalta. Jos kenttä lähetetään tyhjänä, sivu ladataan uudestaan.
   if (username === "" || country === "" || message === "" ) {
    res.render("pages/newmessage");
   } else {
    //Luodaan uusi JSON-objekti.
    data.push({
     "id": data.length+1,
     "username": username,
     "country": country,
     "date": dateTime,
     "message": message,
     
    });
   
    //Stringifioidaan JSON-objekti ja tallennetaan sample.json tiedostoon.
    var jsonStr = JSON.stringify(data);
   
    fs.writeFile("sample.json", jsonStr, (err) => {
     if (err) throw err;
    });
    };
    //Lähetetään valmis pöytä sivulle.
    res.render("pages/guestbook.ejs", {"poytadata": data});
});

//Ajax viestin lähettämiseen tarkoitettu sivu.
app.get("/ajaxmessage", function(req, res) {
    res.render("pages/ajaxmessage.ejs");
});

app.post("/ajax", function(req, res) {
    var data = require("./sample.json");
    var user = req.body.user;
    var country = req.body.country;
    var message = req.body.message;

    //Ajax-viesti toimii hieman eri tavalla. Pöytä luodaan alusta alkaen täällä backendissä.
    var results = '<table class="table" id="ajax"> ';
   
    //Pyöritetään sample.jsonin data for loopin kautta pöydäksi.
    for (var i = 0; i < data.length; i++) {
     results +=
      '<tr>' +
      '<td>' + data[i].id + '</td>' +
      '<td>' + data[i].username + '</td>' +
      '<td>' + data[i].country + '</td>' +
      '<td>' + data[i].date + '</td>' +
      '<td>' + data[i].message + '</td>' +
      '</tr>';
    }
    var date = new Date();
    var dateTime = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " " + date.getHours() + ":" + ((date.getMinutes() < 10)?"0":"") + date.getMinutes();
    
    //Lisätään mukaan käyttäjän antama uusi data.
    results = results + 
    '<tr>' +
    '<td>' + (data.length+1) + '</td>' +
    '<td>' + user + '</td>' +
    '<td>' + country + '</td>' +
    '<td>' + dateTime + '</td>' +
    '<td>' + message + '</td>' +
    '</tr>';

    data.push({
      "id": data.length+1,
      "username": user,
      "country": country,
      "date": dateTime,
      "message": message,
      
     });
     //Datan tallennus.
    var jsonStr = JSON.stringify(data);
   
    fs.writeFile("sample.json", jsonStr, (err) => {
     if (err) throw err;
    });

    //Pöytä lähtee sellaisenaan takaisin frontendiin.
    res.send(results);
       
  });
//Jos käyttäjä antaa tuntemattoman polun, heidät ohjataan tänne.
app.get("*", function(req, res) {
  res.send("404: Sivua ei löydy.", 404);
});

app.listen(port, function() {
  console.log("Sivu käynnistyy.");
});
