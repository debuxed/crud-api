 
 // Express is a framework for node js
 const express = require('express');

 // Monk is used for accessing the mongo db
 // We can even use mongoose in that case.
 const monk = require('monk');

 // Joi is a schema validator
 const joi=  require('@hapi/joi');
const { reporters } = require('mocha');

 // Connect to the DB
 const db = monk(process.env.MONGO_URI);

 // Connect to the collection under the DB
 const faqs = db.get('faqs');

 // creating an object of 'joi' which is a schema validator
 // we'll be adding the features of the schema depending
 // on our requirements
 const schema = joi.object({
     question: joi.string().trim().required(),
     answer: joi.string().trim().required(),
     video_url: joi.string().uri(),
 })

 // Created a router instance which will help us connect the 
 // routes.
 const router = express.Router();

 //READ ALL
 router.get('/', async (req, res, next) => {
    try {
        // Fetch all data from the mongo.
        const items = await faqs.find({});

        // Format it in a json format.
        res.json(items);

    } catch (error) {
        next(error);
    }
 });

 //READ ONE
 router.get('/:id', async (req, res, next) => {
    try {

        // Find the id from the params
        const id = req.params.id;

        // Find th e item from DB
        const item = await faqs.findOne({
            _id: id,
        });

        // If the item doesn't exist 
        // throw exception
        if(!item) return next();

        // Else return the value
        return res.json(item);
    } catch (error) {
        next(error);
    }
 });

 //CREATE ONE
 router.post('/', async (req, res, next) => {
    try {
        console.log(req.body);

        // the data is passed to the api in json format
        // the schema validator is used to validate the data
        // if the data is just fine, it'll move ahead
        // else we will be catching an exception
        const value = await schema.validateAsync(req.body);
        
        // Insert the value in DB
        const inserted = await faqs.insert(value);

        // Respond the same json value
        res.json(inserted);
    } catch (error) {
        next(error);
    }
 });


 //UPDATE ONE
 router.put('/:id', async (req, res, next) => {
    try {
        // Find the id from the params
        const id = req.params.id;

        const value = await schema.validateAsync(req.body);

        // Find th e item from DB
        const item = await faqs.findOne({
            _id: id,
        });

        // If the item doesn't exist 
        // throw exception
        if(!item) return next();

        // Insert the value in DB
        const updated = await faqs.update({
            _id: id,
        }, {
            $set: value,
        });

        // Respond the same json value
        res.json(value);
        
    } 
    catch (error) {
        next(error);
    }   
 });

 //DELETE ONE
 router.delete('/:id', async (req, res, next) => {
     try {
         const {id} = req.params;
         await faqs.remove({
             _id: id,
         });
         res.json({
             message: 'Success',
         });
     } catch (error) {
         next(error);
     }
 });

 module.exports = router;