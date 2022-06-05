import express from "express";
import { engine } from 'express-handlebars';
import exphbs from "express-handlebars";
import path from "path";
import session from "express-session";
import alert from "alert"
// import {alert} from "node-popup"
import pg from 'pg';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);         // καλυτερη διαχειριση φακελων
const __dirname = path.dirname(__filename);


//Για να ανεβαίνουν οι καινούριες φωτογραφίες που βάζει ο αντμιν 
//στο φάκελο images
import multer from "multer";
//const upload=multer({dest:'public/images/'});
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/')
    },
    //το όνομα αρχείου να μην αλλάξει στον προορισμό
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
let upload = multer({ storage: storage })

import * as model from './model/model_sqlite.js';
import { runInNewContext } from "vm";

// setup της express και hbs

const app = express()

app.engine('hbs', exphbs.engine({ extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts' }));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Προσθήκη του express-session middleware
app.use(session({
    name: process.env.SESS_NAME,
    secret: process.env.SESSION_SECRET || "PynOjAuHetAuWawtinAytVunar", // κλειδί για κρυπτογράφηση του cookie
    resave: false, // δεν χρειάζεται να αποθηκεύεται αν δεν αλλάξει
    saveUninitialized: false, // όχι αποθήκευση αν δεν έχει αρχικοποιηθεί
    cookie: {
        maxAge: 2 * 60 * 60 * 1000, //TWO_HOURS χρόνος ζωής του cookie σε ms
        sameSite: true
    }
}));

const redirectHome = (req, res, next) => {     //redirect τον χρηστη/admin σε καποια σελιδα που θελουμε
    console.log('redirect...', req.session)
    if (!req.session.userID) {
        res.redirect('/admin_login');
    } else {
        next();
    }
};

console.log('env port: ' + process.env.PORT)
// Εκκίνηση του εξυπηρετητή
const PORT = process.env.PORT || 8081
const ADMIN = "admin"
app.listen(PORT, () => {
    console.log(`Συνδεθείτε στη σελίδα: http://localhost:${PORT}`);
});


// const PORT = 8081
// app.listen(PORT, () => console.log('Η εφαρμογή τρέχει στο http://localhost:8081'))


/////////////////////////////// γενικα routes
app.get('/tickets', (req, res) => {
    res.render('main', { layout: "tickets" })
})

app.get('/contact', (req, res) => {
    res.render('main', { layout: "contact" })
})

app.get('/activities', (req, res) => {
    res.render('main', { layout: "activities" })
})

app.get('/admin_login', (req, res) => {
    res.render('main', { layout: "admin_login" })
})

//////////////////////// συνδεση διαχειριστη

// GET
app.get("/admin_login", (req, res) => {
    console.log("GET / session=", req.session);
    const userID = req.session.userID
    console.log("/get/", userID)
    if (userID) {
        model.findUser(userID, null, (err, row) => {
            if (err) {
                console.error(err.message);
            } else
                console.log(row)
            res.render('main', { layout: "index", user: row[0].userName });
            // res.render("index", { user: row[0].userName });
        });
    } else
        res.render('main', { layout: "admin_login" });
    // res.render("index");
});

// POST
app.post("/admin_login", (req, res) => {
    console.log("POST / session=", req.session);
    console.log("/admin_login", req.body.userName);
    if (req.body.userName == ADMIN) {
        let userID = null;
        let userName = req.body.userName
        model.findUser(userID, userName, (err, row) => {
            console.log('POST / returned row....', row)
            if (err) {
                console.log(err.message);
            } else {
                req.session.userID = row[0].userID;
                req.session.userName = row[0].userName;
                console.log("new session", req.session)
            }
            res.redirect("/admin_login/admin_anns")
        });
    }
    else {
        alert('Λάθος όνομα διαχειριστή!');
        res.redirect("/");
    }

});

/////////////////////// routes ανακοινωσεων
let defaultImg = "aquarium2.jpg"          //default φωτογραφία ανακοίνωσης αν δεν βάλει ο admin

// GET anns
app.get("/admin_login/admin_anns", redirectHome, (req, res) => {
    console.log("GET /anns session=", req.session);
    const userID = req.session.userID;
    const userName = req.session.userName;
    model.getMyAnns(userID, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        // rows.sort((a, b) => parseFloat(a.annID) - parseFloat(b.annID));
        // rows.reverse();

        // console.log("Announcements: ", rows)
        res.render('main', { layout: "admin_anns", user: userName, data: rows });
    });
});


// GET /create ann
app.get("/admin_login/create", (req, res) => {
    console.log("GET /create, session=", req.session)
    res.render('main', { layout: "create", data: {} });

});

// POST /create ann
app.post("/admin_login/create", upload.single('img'), (req, res) => {
    const userID = req.session.userID;
    console.log(userID);
    let currentDate = new Date();

    //αν δε βάλει εικόνα ο αντμιν, να μπει η default
    let x=(typeof req.file==='undefined');
    let newAnn={};
    if(x===true){
        newAnn = {
            "title": req.body.title, "img": defaultImg, "comment": req.body.comment, "user": req.session.userID,
            "dateOfAnn": currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " +
                currentDate.getHours() + ":" + currentDate.getMinutes()
        } 
    }
    else{
        newAnn = {
        "title": req.body.title, "img": req.file.filename, "comment": req.body.comment, "user": req.session.userID,
        "dateOfAnn": currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " +
            currentDate.getHours() + ":" + currentDate.getMinutes()
    } }
    // else{
    //     const newAnn = {
    //         "title": req.body.title, "img": req.file.filename, "comment": req.body.comment, "user": req.session.userID,
    //         "dateOfAnn": currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " +
    //             currentDate.getHours() + ":" + currentDate.getMinutes()
    //     } 
    // }
    model.newAnn(newAnn,
        (err, data) => {
            if (err)
                return console.error(err.message);
            else
                res.redirect("/admin_login/admin_anns");
        });
});


// GET /edit/:annID
app.get("/admin_login/edit/:annID", (req, res) => {
    const id = req.params.annID;
    if (id) {
        console.log('edit', id)
        model.findAnn(id, (err, row) => {
            if (err) {
                res.send(err);
            } else {
                res.render('main', { layout: "edit", data: row[0] });
            }
        });
    }
});

// POST /edit/:annID
app.post("/admin_login/edit/:id", upload.single('img'), (req, res) => {
    const id = req.params.id;
    let currentDate = new Date();
    let x=(typeof req.file==='undefined');
    let announcement={};
    if(x===true){
        announcement = {
            "title": req.body.title, "img": defaultImg, "comment": req.body.comment, "annID": id, "user": req.session.userID,
            "dateOfAnn": currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " +
                currentDate.getHours() + ":" + currentDate.getMinutes()
        } 
    }
    else{
        announcement = {
            "title": req.body.title, "img": req.file.filename, "comment": req.body.comment, "annID": id, "user": req.session.userID,
        "dateOfAnn": currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " +
            currentDate.getHours() + ":" + currentDate.getMinutes()
    } }
    model.updateAnn(announcement, (err, data) => {
        console.log('in POST', err, data)
        if (err) {
            return console.error(err.message);
        }
        else {
            res.redirect("/admin_login/admin_anns");
        }
    });
});

// GET /delete/:annID
app.get("/admin_login/delete/:annID", redirectHome, (req, res) => {
    const id = req.params.annID;
    console.log("GET /delete/:id", id);
    model.findAnn(id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render('main', { layout: "delete", data: row[0] });
        // res.render("delete", { data: row[0] });
    });
    console.log('END of GET /delete/:id')
});

// POST /delete/:annID
app.post("/admin_login/delete/:annID", (req, res) => {
    const id = req.params.annID;
    model.deleteAnn(id, (err, res) => {
        if (err) {
            return console.error(err.message);
        }
    })
    res.redirect("/admin_login/admin_anns");
});

/////////////// Δυναμικες ανακοινωσεις στην σελιδα

///  ολες οι ανακοινωσεις στην announcements.hbs ///
app.get("/announcements", (req, res) => {
    const userID = "1";
    const userName = ADMIN;
    model.getMyAnns(userID, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        // rows.sort((a, b) => parseFloat(a.annID) - parseFloat(b.annID));
        // rows.reverse();
        console.log("announcements: ", rows)
        res.render('main', { layout: "announcements", user: userName, data: rows });
    });
});

/// 3 πιο προσφατες ανακοινωσεις στην αρχικη ///
app.get("/", (req, res) => {
    const userID = "1";
    const userName = ADMIN;
    model.getMyAnns(userID, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        // rows.sort((a, b) => parseFloat(a.annID) - parseFloat(b.annID));
        // rows.reverse();
        console.log("announcements: ", rows)
        res.render('main', { layout: "arxikh", user: userName, data: rows });
    });
});

/////////////////////////////////////////////// routes ζωων

// GET /animals
app.get("/admin_login/admin_animals", redirectHome, (req, res) => {
    console.log("GET /animals session=", req.session);
    const userID = req.session.userID;
    const userName = req.session.userName;
    model.getMyAnimals(userID, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        // rows.sort((a, b) => parseFloat(a.annID) - parseFloat(b.annID));
        // rows.reverse();

        // console.log("Animals: ", rows)
        res.render('main', { layout: "admin_animals", animalUser: userName, data: rows });
    });
});


// GET /create animal
app.get("/admin_login/createAnimal", (req, res) => {
    console.log("GET /createAnimal, session=", req.session)
    res.render('main', { layout: "createAnimal", data: {} });
});

// POST /create animal
app.post("/admin_login/createAnimal", upload.single('animalImg'), (req, res) => {
    const userID = req.session.userID;
    console.log(userID);
    let currentDate = new Date();
    const newAnimal = {
        "animalName": req.body.animalName, "animalImg": req.file.filename, "animalText": req.body.animalText, "animalUser": req.session.userID,
        "animalDate": currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " +
            currentDate.getHours() + ":" + currentDate.getMinutes(), "animalType": req.body.animalType
    }
    model.newAnimal(newAnimal,
        (err, data) => {
            if (err)
                return console.error(err.message);
            else
                res.redirect("/admin_login/admin_animals");
        });
});


// GET /edit/:animalID
app.get("/admin_login/editAnimal/:animalID", (req, res) => {
    const id = req.params.animalID;
    if (id) {
        console.log('edit', id)
        model.findAnimal(id, (err, row) => {
            if (err) {
                res.send(err);
            } else {
                res.render('main', { layout: "editAnimal", data: row[0] });
            }
        });
    }
});

// POST /edit/:animalID
app.post("/admin_login/editAnimal/:animalID", upload.single('animalImg'), (req, res) => {
    const id = req.params.animalID;
    let currentDate = new Date();
    const animal = {
        "animalName": req.body.animalName, "animalImg": req.file.filename, "animalText": req.body.animalText, "animalID": id, "animalUser": req.session.userID,
        "animalDate": currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " +
            currentDate.getHours() + ":" + currentDate.getMinutes(), "animalType": req.body.animalType
    }
    model.updateAnimal(animal, (err, data) => {
        console.log('in POST', err, data)
        if (err) {
            return console.error(err.message);
        }
        else {
            res.redirect("/admin_login/admin_animals");
        }
    });
});

// GET /delete/:animalID
app.get("/admin_login/deleteAnimal/:animalID", redirectHome, (req, res) => {
    const id = req.params.animalID;
    model.findAnimal(id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render('main', { layout: "deleteAnimal", data: row[0] });

    });
});

// POST /delete/:animalID
app.post("/admin_login/deleteAnimal/:id", (req, res) => {
    const id = req.params.id;
    model.deleteAnimal(id, (err, res) => {
        if (err) {
            return console.error(err.message);
        }
    })
    res.redirect("/admin_login/admin_animals");
});

////////////////////// Δυναμικα ζωα στην σελιδα



//animalType = 1 : Θηλαστικά ξηράς
//animalType = 2 : Πτηνά
//animalType = 3 : Ερπετά
//animalType = 4 : Θαλάσσια

///  ολα τα ζωα στο animals.hbs ///

app.get("/animals", (req, res) => {
    const userID = "1";
    const userName = ADMIN;
    model.getMyAnimals(userID, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        // rows.sort((a, b) => parseFloat(a.annID) - parseFloat(b.annID));
        // rows.reverse();

        // console.log("animals: ", rows)
        res.render('main', { layout: "animals", animalUser: userName, data: rows });
    });
});


// handlebar helper για τις κατηγοριες ζωων

exphbs.create({}).handlebars.registerHelper('ifEquals', function (a, b, options) {
    if (a == b) {
        return options.fn(this);
    }

    return options.inverse(this);
});


/////////////////////////////////////////////// routes εισιτηριων

// GET tickets
app.get("/admin_login/admin_tickets", redirectHome, (req, res) => {
    console.log("GET /tickets session=", req.session);
    // const userID = req.session.userID;
    // const userName = req.session.userName;
    model.getTickets((err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        // rows.sort((a, b) => parseFloat(a.annID) - parseFloat(b.annID));
        // rows.reverse();

        // console.log("Tickets: ", rows)
        res.render('main', { layout: "admin_tickets", data: rows });
    });
});

//////////////////// cancel/delete Ticket

// GET /delete/:ticketID
app.get("/admin_login/cancelTicket/:ticketID", redirectHome, (req, res) => {
    const id = req.params.ticketID;
    model.findTicket(id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render('main', { layout: "cancelTicket", data: row[0] });

    });
});

// POST /cancel/:ticketID
app.post("/admin_login/cancelTicket/:ticketID", (req, res) => {
    const id = req.params.ticketID;
    model.deleteTicket(id, (err, res) => {
        if (err) {
            return console.error(err.message);
        }
    })
    res.redirect("/admin_login/admin_tickets");
});


// POST /buy ticket

app.post('/tickets_buy', (req, res) => {
    let ownerName = req.body.firstName;
    let ownerSurname = req.body.lastName;
    let ownerMail = req.body.email;
    let dateOfVisit = req.body.calendar
    const amountOfTickets = [req.body.adults, req.body.children,
    req.body.students, req.body.manychildren, req.body.amea]

    for (let i = 0; i < amountOfTickets.length; i++) {
        if (amountOfTickets[i] > 0) {
            for (let j = 1; j <= amountOfTickets[i]; j++) {
                console.log(i + 1)   // first index ????
                const newTicket = {
                    "typeOfTicket": i + 1,
                    "ownerName": ownerName, "ownerSurname": ownerSurname, "ownerMail": ownerMail,
                    "dateOfVisit": dateOfVisit
                }
                model.newTicket(newTicket,
                    (err, data) => {
                        if (err)
                            return console.error(err.message);
                    });
            }
        }
    }
    res.redirect("/tickets")

    // ελεγχος αν ο χρηστης επελεξε εστω 1 εισιτηριο 
    let amount = 0
    console.log(amountOfTickets)
    for (let i = 0; i < amountOfTickets.length; i++) {
        if (amountOfTickets[i] != '0') {
            amount++
        }
    }
    if (amount > 0) {
        console.log('amount= ', amount)
        alert(`Η αγορα εισιτηρίων ήταν επιτυχής!

        • Ονοματεπώνυμο: ${ownerName} ${ownerSurname},
        • Email: ${ownerMail},
        • Ημερομηνία Επίσκεψης: ${dateOfVisit}`)
    }
    else {
        alert('Δεν επιλέξατε εισιτήριο! Η αγορά εισιτηρίου ήταν αποτυχημένη.')
    }
})
