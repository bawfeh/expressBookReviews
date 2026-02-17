const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Utility function for printing string formatted json outputs
const beautify = (json_output) => {
    return JSON.stringify(json_output, null, 4) + '\n';
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "Invalid credentials | User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});
 // return res.status(300).json({message: "Yet to be implemented"});
//});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Send JSON response with formatted list of books
  return res.send(beautify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve books's details for the requested the ISBN parameter
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(beautify(books[isbn]));
  } else {
    res.send(`No book with ISBN ${isbn}!\n`);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.trim().toLowerCase();
    let booksAuthoredBy = {}  // list of books by this author
    const keys = Object.keys(books); // all keys of the 'books' object
    // Filter keys matching the requested author
    // then iterate these keys to retrieve corresponding book details
    keys.filter((isbn) => {
        return books[isbn]["author"].trim().toLowerCase() === author;
    }).forEach((key) => {
        booksAuthoredBy[key] = books[key];
    })
    res.send(beautify(booksAuthoredBy))
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.trim().toLowerCase();
    let booksWithTitle = {}  // list of books by this title
    const keys = Object.keys(books); // all keys of the 'books' object
    // Filter keys matching the requested title
    // then iterate these keys to retrieve corresponding book details
    keys.filter((isbn) => {
        return books[isbn]["title"].trim().toLowerCase() === title;
    }).forEach((key) => {
        booksWithTitle[key] = books[key];
    })
    res.send(beautify(booksWithTitle))
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(beautify(books[isbn]["reviews"]));
    } else {
        res.send(`No book with ISBN ${isbn}!\n`);
    }
});

module.exports.general = public_users;
