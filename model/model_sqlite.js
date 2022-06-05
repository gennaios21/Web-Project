import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from 'url';

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
// console.log(process.env.PORT)

const __filename = fileURLToPath(import.meta.url);     // καλυτερη διαχειριση φακελων
const __dirname = path.dirname(__filename);             

const db_name = path.join(__dirname, "../data", "zoo.db");     //προσβαση στην βαση δεδομενων
//////////////////////////////////////// τελος configuration

////// announcements, συναρτησεις ανακοινωσεων

const getMyAnns = (userID, callback) => {
    // ανάκτηση όλων των βιβλίων του χρήστη από τη βάση δεδομένων
    const sql = "SELECT * FROM Announcements WHERE user = ? ORDER BY annID DESC";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [userID], (err, rows) => {
        if (err) {
            db.close();
            callback(err, null);
        }
        db.close();
        callback(null, rows); // επιστρέφει array
    });
}

const newAnn = (announcement, callback) => {

    const sql = `INSERT INTO Announcements (title, img, comment, user, dateOfAnn) 
        VALUES (?, ?, ?, ?, ?)`;
    const db = new sqlite3.Database(db_name);
    db.run(sql, [announcement.title, announcement.img, announcement.comment, announcement.user, announcement.dateOfAnn], (err, result) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else callback(null, result)
    });
}

const findAnn = (annID, callback) => {

    const sql = "SELECT * FROM Announcements WHERE annID = ?";
    const db = new sqlite3.Database(db_name);
    db.get(sql, [annID], (err, row) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else {

            callback(null, [row])
        }
    });
}

const updateAnn = (announcement, callback) => {
    const sql = `UPDATE Announcements 
        SET title = ?, img = ?, comment = ?, dateOfAnn = ?
        WHERE (annID = ?)`;
    let db = new sqlite3.Database(db_name, (err) => {
        if (err) {
            callback(err, null)
        }
        console.log("Σύνδεση στη βάση δεδομένων 'zoo.db'");
        db.run(sql, [announcement.title, announcement.img, announcement.comment, announcement.dateOfAnn, announcement.annID], (err) => {
            db.close();
            if (err) {
                callback(err, null)
            }
            console.log(`Row(s) updated`);
            callback(null, 1)
        });
    });
}

const deleteAnn = (annID, callback) => {
    const sql = `DELETE FROM Announcements
        WHERE annID = ?`;
    let db = new sqlite3.Database(db_name, (err) => {
        if (err) {
            callback(err, null)
        }
        console.log("Σύνδεση στη βάση δεδομένων ανακοινώσεων 'zoo.db'");
        db.run(sql, [annID], (err) => {
            db.close();
            if (err) {
                callback(err)
            }
        });
    });
}

////////////////////////////////////// συναρτησεις χρηστων

const insertUser = (userName, callback) => {
    // εισαγωγή νέου χρήστη, και επιστροφή στο callback της νέας εγγραφής
    const sql = "INSERT INTO Users(userName) VALUES (?)"
    const db = new sqlite3.Database(db_name);
    db.run(sql, [userName], function (err, row) {
        if (err) {
            db.close();
            callback(err, null)
        }
        db.close();
        callback(null, [{ "userID": this.lastID, "userName": userName }]);
    });
}

const findUser = (userID = null, userName = null, callback) => {
    // εύρεση χρήστη με βάση τον κωδικό ή το όνομά του.
    // χωρίς μυστικό κωδικό για λόγους απλότητας
    const sql = (userID) ? "SELECT * FROM Users WHERE UserID = ?" :
        "SELECT * FROM Users WHERE UserName = ?";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [userID || userName], (err, row) => {
        console.log("findUser")
        if (err || row.length === 0) {
            // ο χρήστης δεν υπάρχει, πρέπει να δημιουργηθεί
            db.close();
            insertUser(userName, (err, newUser) => {
                if (err) {
                    callback(err, null);
                } else
                    findUser(userID, userName, callback);
            });
        }
        else {
            db.close();
            callback(null, row)
        }
    });
}

const query = (text, params, callback) => {
    const db = new sqlite3.Database(db_name);
    return db.query(text, params, callback)
}


//////////////////// animals, συναρτησεις ζωων

const getMyAnimals = (userID, callback) => {
    const sql = "SELECT * FROM Animals WHERE animalUser = ? ORDER BY animalName ASC";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [userID], (err, rows) => {
        if (err) {
            db.close();
            callback(err, null);
        }
        db.close();
        callback(null, rows); // επιστρέφει array
    });
}

const newAnimal = (animal, callback) => {

    const sql = `INSERT INTO Animals (animalName, animalImg, animalText, animalUser, animalDate, animalType) 
        VALUES (?, ?, ?, ?, ?, ?)`;
    const db = new sqlite3.Database(db_name);
    db.run(sql, [animal.animalName, animal.animalImg, animal.animalText, animal.animalUser, animal.animalDate, animal.animalType], (err, result) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else callback(null, result)
    });
}

const findAnimal = (animalID, callback) => {

    const sql = "SELECT * FROM Animals WHERE animalID = ?";
    const db = new sqlite3.Database(db_name);
    db.get(sql, [animalID], (err, row) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else {

            callback(null, [row])
        }
    });
}

const updateAnimal = (animal, callback) => {
    const sql = `UPDATE Animals 
        SET animalName = ?, animalImg = ?, animalText = ?, animalDate = ?, animalType = ?
        WHERE (animalID = ?)`;
    let db = new sqlite3.Database(db_name, (err) => {
        if (err) {
            callback(err, null)
        }
        console.log("Σύνδεση στη βάση δεδομένων zoo.db");
        db.run(sql, [animal.animalName, animal.animalImg, animal.animalText, animal.animalDate, animal.animalType, animal.animalID], (err) => {
            db.close();
            if (err) {
                callback(err, null)
            }
            console.log(`Row(s) updated`);
            callback(null, 1)
        });
    });
}

const deleteAnimal = (animalID, callback) => {
    const sql = `DELETE FROM Animals
        WHERE animalID = ?`;
    let db = new sqlite3.Database(db_name, (err) => {
        if (err) {
            callback(err, null)
        }
        db.run(sql, [animalID], (err) => {
            db.close();
            if (err) {
                callback(err)
            }
        });
    });
}

////////// συναρτησεις εισιτηριων

const newTicket = (ticket, callback) => {

    const sql = `INSERT INTO Tickets (typeOfTicket, ownerMail, ownerName, ownerSurname, dateOfVisit) 
        VALUES (?, ?, ?, ?, ?)`;
    const db = new sqlite3.Database(db_name);
    db.run(sql, [ticket.typeOfTicket, ticket.ownerMail, ticket.ownerName, ticket.ownerSurname, ticket.dateOfVisit],
        (err, result) => {
            db.close();
            if (err) {
                callback(err, null)
            }
            else callback(null, result)
        });
}

const getTickets = ( callback) => {
    // ανάκτηση όλων των εισιτηρίων από τη βάση δεδομένων
    const sql = "SELECT * FROM Tickets ORDER BY ticketID DESC";
    const db = new sqlite3.Database(db_name);
    //db.all(sql, [userID], (err, rows) => {
    db.all(sql, (err, rows) => {
        if (err) {
            db.close();
            callback(err, null);
        }
        db.close();
        callback(null, rows); // επιστρέφει array
    });
}

const deleteTicket = (ticketID, callback) => {
    const sql = `DELETE FROM Tickets
        WHERE ticketID = ?`;
    let db = new sqlite3.Database(db_name, (err) => {
        if (err) {
            callback(err, null)
        }
        db.run(sql, [ticketID], (err) => {
            db.close();
            if (err) {
                callback(err)
            }
        });
    });
}

const findTicket = (ticketID, callback) => {

    const sql = "SELECT * FROM Tickets WHERE ticketID = ?";
    const db = new sqlite3.Database(db_name);
    db.get(sql, [ticketID], (err, row) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else {

            callback(null, [row])
        }
    });
}

/// export ολων των συναρτησεων
export {
    getMyAnns, newAnn, findAnn, updateAnn, deleteAnn,
    getMyAnimals, newAnimal, findAnimal, updateAnimal, deleteAnimal,
    insertUser, findUser, newTicket, getTickets, deleteTicket, findTicket
};

