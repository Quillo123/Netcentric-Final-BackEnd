const mongoose = require('mongoose');
let express = require('express');
let router = express.Router();
let BookSchema = require('../models/BookSchema');
let AuthorSchema = require('../models/AuthorSchema');

function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error": message});
}

router.get('/', (request, response) => {
        BookSchema.find()
            .exec(async (error, books) => {
                if (error) {
                    response.send({'error': error});
                } else {
                    let res = [];
                    for(let book of books){
                        let nBook = {
                            _id: book['_id'],
                            title: book['title'],
                            description: book['description'] || 0,
                            year: book['year'],
                            authors: [],
                            hardcover: book['hardcover'] || false,
                            price: book['price']
                        }
                        for(let author of book['authors']){
                            try{
                                await AuthorSchema.findById({'_id': author })
                                    .then((newAuthor) => {
                                        if(newAuthor){
                                            console.log(newAuthor);
                                            nBook['authors'].push(newAuthor);
                                        }
                                    });
                            }
                            catch (error){
                                response.send({'error': error});
                            }
                        }

                        res.push(nBook);
                    }
                    console.log(res);
                    response.send(JSON.stringify(res));

                }
            });
});

module.exports = router;