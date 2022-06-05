CREATE TABLE IF NOT EXISTS Announcements (
    annID INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    img VARCHAR(100) NOT NULL,
    comment TEXT,
    user INTEGER, 
    dateOfAnn TEXT
    );

CREATE TABLE IF NOT EXISTS Animals (
    animalID INTEGER PRIMARY KEY AUTOINCREMENT,
    animalName VARCHAR(100) NOT NULL,
    animalImg VARCHAR(100) NOT NULL,
    animalText TEXT,
    animalUser INTEGER, 
    animalDate TEXT,
    animalType INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS Tickets (
	ticketID	INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT,
	typeOfTicket	INTEGER NOT NULL,
	ownerMail	TEXT,
	ownerName	TEXT,
	ownerSurname	TEXT,
	dateOfVisit	TEXT
);

CREATE TABLE IF NOT EXISTS Users (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT NOT NULL
    );

INSERT INTO Users(userName) VALUES 
("admin");

INSERT INTO Announcements (title, img, comment, user, dateOfAnn) VALUES
  ('Οι χελώνες έφτασαν στο ζωολογικό μας κήπο', 'turtle.jpg', '', 1, '','');

INSERT INTO Animals (animalName, animalImg, animalText, animalUser, animalDate, animalType) VALUES
  ('Χελωνα', 'turtle.jpg', '', 1, '','','2');

INSERT INTO Tickets (typeOfTicket, ownerMail, ownerName, ownerSurname, dateOfVisit) VALUES
  ('2','test2@test.com','test2','test2,''');
