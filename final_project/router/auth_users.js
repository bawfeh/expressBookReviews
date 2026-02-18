const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if username and password match the one we have in records.
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.query.username;
    const password = req.query.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 * 2 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send(`User successfully logged in as ${req.session.authorization['username']}\n`);
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password: " + "(" + username + ", " + password + ")" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization["username"];
    const keys = Object.keys(books);
    if (keys.includes(isbn) & review) { // valid isbn and some review
        books[isbn]["reviews"][username] = String(review);
        return res.status(200).send(`Review for book ${isbn} successfully added/updated by ${username}!\n`);
    } else {
        return res.status(208).json({ message: `Book with ISBN ${isbn} does NOT exists!` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization["username"];
    const keys = Object.keys(books);
    if (keys.includes(isbn)) { // valid isbn
        delete books[isbn]["reviews"][username];
        return res.status(200).send(`${username} successfully deleted their review for book ${isbn}!\n`);
    } else {
        return res.status(208).json({ message: `Book with ISBN ${isbn} does NOT exists!` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
// module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
