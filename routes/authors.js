const mongoose = require('mongoose');
let express = require('express');
let router = express.Router();
let AuthorSchema = require('../models/AuthorSchema');

function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error": message});
}

router.post('/', (request, response, next) => {
    let authorJSON = request.body;
    if(!authorJSON.name){
        HandleError(response, 'Missing Info', 'Form Data Missing', 500);
    }
    else {
        AuthorSchema.find({'name': authorJSON.name, 'nationality': authorJSON.nationality || "unknown"})
            .exec(async (error, author) => {
                if (error) {
                    console.log(error);
                    response.send({'error': error});
                } else {
                    if (author.length === 0) {
                        let newAuthor = new AuthorSchema({
                            name: authorJSON.name,
                            nationality: authorJSON.nationality || "unknown"
                        });

                        newAuthor.save((error) => {
                            if (error) {
                                console.log(error);
                                response.send({'error': error});
                            } else {
                                response.send({'id': newAuthor.id, 'authors': newAuthor.authors});
                            }
                        });
                    } else {
                        response.send(JSON.stringify(author) + " already exists");
                    }
                }
            });
    }
});

router.get('/', (request, response, next) => {
    let name = request.query['name'];
    if(name){
        AuthorSchema.find({'name': name})
            .exec((error, authors) =>{
                if(error){
                    response.send({'error': error});
                }
                else{
                    response.send(authors);
                }
            });
    }
    else{
        AuthorSchema.find()
            .exec((error, authors) => {
                if (error) {
                    response.send({'error': error});
                } else {
                    response.send(authors);
                }
            });
    }
});

router.get('/:id', (request, response, next) => {
    if(request.params.id){
        AuthorSchema.findById({'_id': request.params.id }, (error, author) => {
            if(error){
                response.send({'error': error});
            }
            else if(author){
                response.send(author);
            }
            else{
                response.status(404).send({"id": request.params.id, "error": "Not Found"});
            }
        });
    }
});

router.patch('/:id', (request, response, next) => {
    AuthorSchema.findById({'_id': request.params.id }, (error, author) => {
        if(error){
            response.send({'error': error});
        }
        else if(author){
            if(request.body._id){
                delete request.body._id;
            }
            for(let field in request.body){
                if(author[field])
                    author[field] = request.body[field];
            }
            author.save((error, author) => {
                if(error){
                    response.status(500).send(error);
                }
                else {
                    response.send(author);
                }
            });
        }
        else{
            response.status(404).send({"id": request.params.id, "error": "Not Found"});
        }
    });
});

router.delete('/:id', (request, response, next) => {
    AuthorSchema.findById({'_id': request.params.id }, (error, author) => {
        if(error){
            response.send({'error': error});
        }
        else if(author){
            author.remove((error) => {
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