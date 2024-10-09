const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
//to check if the username is valid
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//to check if username and password match the one we have in records.
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
  
  if (authenticatedUser(username, password)) {

    let accessToken = jwt.sign({ data: username }, "access", {expiresIn: "1h"});
    req.session.authorization = {accessToken};
    

    return res.status(200).json({ message: "Successfully logged in", token: accessToken });
  }
  else {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
  const isbn = req.params.isbn;
  const {review} = req.body;
  const username = users[0].username;


  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "Review successfully added/modified!"});
  
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data;
  
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    }
    else {
        return res.status(400);
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
