const mongoose = require('mongoose');
let express = require('express');
let router = express.Router();
let BookSchema = require('../models/BookSchema');
let AuthorSchema = require('../models/AuthorSchema');

function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error": message});
}

router.post('/', (request, response, next) => {
    let bookJSON = request.body;
    if(!bookJSON.title || !bookJSON.year || !bookJSON.price){
        HandleError(response, 'Missing Info', 'Form Data Missing', 500);
    }
    else {
        BookSchema.find({'title': bookJSON.title, 'year': bookJSON.year})
            .exec(async (error, book) => {
                if (error) {
                    console.log(error);
                    response.send({'error': error});
                } else {
                    if (book.length === 0) {
                        let newBook = new BookSchema({
                            title: bookJSON.title,
                            description: bookJSON.description || 0,
                            year: bookJSON.year,
                            authors: [],
                            hardCover: bookJSON.hardCover || false,
                            price: bookJSON.price
                        });

                        let i = 0;
                        while (bookJSON["authors[" + i + "]['name']"]) {
                            console.log(bookJSON["authors[" + i + "]['name']"]);
                            let author = await PostAuthor(
                                bookJSON["authors[" + i + "]['name']"],
                                bookJSON["authors[" + i + "]['nationality']"],
                                response
                            );
                            if(author[0])
                                newBook.authors.push(author[0]['_id']);
                            else
                                newBook.authors.push(author);
                            i++;
                        }

                        newBook.save((error) => {
                            if (error) {
                                console.log(error);
                                response.send({'error': error});
                            } else {
                                response.send({'id': newBook.id, 'authors': newBook.authors});
                            }
                        });
                    } else {
                        response.send(JSON.stringify(book) + " already exists");
                    }
                }
            });
    }
});

async function PostAuthor(authorName, authorNat, response){
    let authorSchema = null;
    if(authorName){
        try {
            await AuthorSchema.find({'name': authorName})
                .then((author) => {
                    if (author[0]) {
                        authorSchema = author;
                    } else {
                        authorSchema = new AuthorSchema({
                            name: authorName,
                            nationality: authorNat || 'unknown'
                        });
                        authorSchema.save((error) => {
                            if (error) {
                                console.log(error);
                                response.send({'error': error});
                                authorSchema = null;
                            } else {
                                console.log("author: " + JSON.stringify(authorSchema));
                            }
                        });
                    }
                });
        }
        catch (error){
            console.log(error);
            response.send({'error': error});
            authorSchema = null;
        }
    }
    else{
        try{
            await AuthorSchema.find({'name': 'unknown'})
                .then((author) =>{
                        if(author[0])
                            authorSchema = author;
                        else{
                            authorSchema = new AuthorSchema({
                                name: 'unknown',
                                nationality: 'unknown'
                            });
                            authorSchema.save((error) => {
                                if (error) {
                                    console.log(error);
                                    response.send({'error': error});
                                    authorSchema = null;
                                } else {
                                    console.log("author: " + JSON.stringify(authorSchema));
                                }
                            });
                        }
                });
        }
        catch (error){
            console.log(error);
            response.send({'error': error});
            authorSchema = null;
        }
    }
    return authorSchema;
}

router.get('/', (request, response, next) => {
    let title = request.query['title'];
    if(title){
        BookSchema.find({'title': title})
            .exec((error, books) =>{
                if(error){
                    response.send({'error': error});
                }
                else{
                    response.send(books);
                }
            });
    }
    else{
        BookSchema.find()
            .exec((error, books) => {
                if (error) {
                    response.send({'error': error});
                } else {
                    response.send(books);
                }
            });
    }
});

router.get('/:id', (request, response, next) => {
    if(request.params.id){
        BookSchema.findById({'_id': request.params.id }, (error, book) => {
                if(error){
                    response.send({'error': error});
                }
                else if(book){
                    SendGetResponse(book, response);
                }
                else{
                    response.status(404).send({"id": request.params.id, "error": "Not Found"});
                }
            });
    }

    function SendGetResponse(books, response){
        AuthorSchema.find()
            .exec((error, author) => {
                if (error) {
                    response.send({'error': error});
                } else {
                    response.send(JSON.stringify(books) + JSON.stringify(author));
                }
            });
    }
});

router.patch('/:id', (request, response, next) => {
    BookSchema.findById({'_id': request.params.id }, (error, book) => {
        if(error){
            response.send({'error': error});
        }
        else if(book){
            if(request.body._id){
                delete request.body._id;
            }
            for(let field in request.body){
                book[field] = request.body[field];
            }
            book.save((error, book) => {
                if(error){
                    response.status(500).send(error);
                }
                else {
                    response.send(book);
                }
            });
        }
        else{
            response.status(404).send({"id": request.params.id, "error": "Not Found"});
        }
    });
});

router.delete('/:id', (request, response, next) => {
    BookSchema.findById({'_id': request.params.id }, (error, book) => {
        if(error){
            response.send({'error': error});
        }
        else if(book){
            book.remove((error) => {
                if(error){
                    response.status(500).send(error);
                }
                else {
                    response.send({"deletedId": request.params.id} );
                }
            });
        }
        else{
            response.status(404).send({"id": request.params.id, "error": "Not Found"});
        }
    });
});

module.exports = router;