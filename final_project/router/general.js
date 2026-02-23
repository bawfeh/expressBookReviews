const express = require('express');
const axios = require('axios').default;
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Utility function for printing string formatted json outputs
const beautify = (json_output) => {
    return JSON.stringify(json_output, null, 4) + '\n';
}

// Utility function for search books by a given key and parameter
const bookSearch = (key, param) => {
    let searchResult = []  // list of books matching parameter
    // Extract all keys of the 'books' object
    // Filter keys matching the requested parameter
    // then iterate these keys to retrieve corresponding book details
    Object.keys(books)
    .filter((isbn) => {
        return (books[isbn][key].trim().toLowerCase() === param);
    })
    .forEach((isbn) => {
        searchResult.push(books[isbn]);
    })
    // return result as dictionary
    return Object.fromEntries(searchResult.map((item, index) => [index, item]));
}

// Using promise callbacks to retrieve data from a given route
function getDataPromise(raw_data, res, errorMsg='') {
    Promise.resolve(raw_data)
    .then(resolved =>{
        if (!resolved || Object.keys(resolved).length==0) {
            throw errorMsg;
        }
        res.status(200).send(beautify(resolved));
    })
    .catch(error => {
        res.status(404).send(error + '\n');
    });
}

// Using axios to extract data from an external URL
function getDataAxios(url) {
    // generate a Promise and resolve it
    axios.get(url).then(response => {
        return response.data;
    }).catch(error => {
        return error.toString();
    });
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

/* ====== Endpoints using Express Router ======== */

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Asynchronous retrieval using promise callbacks
    getDataPromise(books, res, `No books available!`)

})

/*
public_users.get('/', async function (req, res) {
    // Assynchronous retrieval using async-await with Axios
    try {
        // Simulate Axios get with await
        const response = await getDataAxios('http://localhost:5000/');
        return res.status(200).send(beautify(response));
    } catch (error) {
        return res.status(500).send("Error retrieving books\n"+error);
    }
});
*/

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    // Asynchronous retrieval using promise callbacks
    getDataPromise(books[isbn], res, `No book with ISBN ${isbn}!`)

});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

    const author = req.params.author.trim().toLowerCase();

    booksAuthoredBy = bookSearch(key='author', param=author);

    // Asynchronous retrieval using promise callbacks
    getDataPromise(booksAuthoredBy, res, `No book authored by ${author} in stock!`)
    
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

    const title = req.params.title.trim().toLowerCase();

    booksWithTitle = bookSearch(key='title', param=title);

    // Asynchronous retrieval using promise callbacks
    getDataPromise(booksWithTitle, res, `No books with title ${title} in stock!`)
    
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (Object.keys(books).includes(isbn)) { // valid isbn

        const reviews = books[isbn]["reviews"];
        if (Object.keys(reviews).length>0) { // some content available
            return res.status(200).send(beautify(reviews));
        } else {
            return res.status(404).send(beautify({"message":"No reviews found for this book."}));
        }
        
    } else {
        return res.status(404).json({ message: `No book with ISBN ${isbn} in our collection!` });
    }
});

module.exports.general = public_users;
