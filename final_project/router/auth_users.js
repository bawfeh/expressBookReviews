const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Utility function for printing string formatted json outputs
const beautify = (json_output) => {
    return JSON.stringify(json_output, null, 4) + '\n';
}

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
        return res.status(200).json({message:`User successfully logged in as ${req.session.authorization['username']}!`});
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password! " });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = String(req.params.isbn);
    const review = String(req.query.review);
    const username = req.session.authorization["username"];

    if (Object.keys(books).includes(isbn)) { // valid isbn

        if (review.length>0) { // some review provided
            books[isbn]["reviews"][username] = review;
            return res.status(200).json({message:`Review for ISBN ${isbn} successfully added/updated!`});
        }      
        
    } else {
        return res.status(404).json({ message: `No book with ISBN ${isbn} in our collection!` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = String(req.params.isbn);
    const username = req.session.authorization["username"];

    if (Object.keys(books).includes(isbn)) { // valid isbn

        delete books[isbn]["reviews"][username];
        return res.status(200).json({message:`Review for ISBN ${isbn} deleted!\n`});

    } else {
        return res.status(404).json({ message: `No book with ISBN ${isbn} in our collection!` });
    }
});

// Test session authentication
regd_users.get('/protected', (req, res) => {
    if (!req.session.authorization) {
        return res.status(401).json({message: `User not logged in! Session ID: ${req.sessionID}`});
    }
    res.json({ currentUser: req.session.authorization['username'] });
});

// Retrieve all users
regd_users.get('/users', (req, res) => {
    if (users.length>0) {
        return res.send(JSON.stringify(users, null, 2));
    } else {
        return res.status(208).json({message: `Users list is EMPTY: ${users}!`});
    }
});

// Reset users list
regd_users.put('/clear', (req, res) => {
    if (users.length>0) {
        users.length = 0; 
        return res.status(200).json({message: "Users list emptied!"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;