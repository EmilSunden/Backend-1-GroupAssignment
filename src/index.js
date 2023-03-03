// Gruppmedlemmar - Alex, Emil, Noel
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const dotenv = require('dotenv')
const joi = require('joi');
const cookieParser = require('cookie-parser')

dotenv.config()
const { SECRET } = process.env
const app = express();


app.use(express.json())
app.use(cors())
app.use(cookieParser())

const { countries } = require('./database/database');


app.post('/countries', checkAdmin, (req, res) => {
    const { country, capital, language, population } = req.body;

    const schema = joi.object({
        country: joi.string().min(4).max(25).required(),
        capital: joi.string().min(4).max(25).required(),
        language: joi.string().min(5).max(25).required(),
        population: joi.string().min(1).max(999999).pattern(/[1-9][0-9]*/).required(), 
    })

    const validation = schema.validate(req.body)
    if (validation.error) {
        return res.status(400).json(validation.error.details[0].message);
    }
    
    // we want to assign a random generated id for each country added
    const id = uuidv4();
    countries.push({ id, country, capital, language, population });

    res.status(201).send(`Added ${country}! Congratulations, it works!`)
})

app.get('/countries', (req, res) => {
    res.status(200).send(countries)
})

app.get('/countries/:country', (req, res) => {
    const { country } = req.params
     
    const result = countries.find(item => item.country === country);

    if (!result) {
        res.status(404).send('There is no such country!')
    } else {
        res.status(200).send(`The result is ${result.capital}`)
    }   
})

app.patch('/countries/:country', checkAdmin, (req, res) => {
    const { country } = req.params; 

    const schema = joi.object({
        country: joi.string().min(4).max(25).required(),
        capital: joi.string().min(4).max(25).required(),
        language: joi.string().min(5).max(25).required(),
        population: joi.string().min(1).max(999999).pattern(/[1-9][0-9]*/).required(), 
    })

    const validation = schema.validate(req.body)

    if (validation.error) {
        return res.status(400).json(validation.error.details[0].message);
    }
        
    let countryToUpdate = countries.find(item => item.country === country) 
    
    if (!countryToUpdate) {
        res.status(404).send('No such country exists!')
    } else {
        Object.assign(countryToUpdate, req.body);
        res.status(200).send(countryToUpdate)
    }
})

app.delete('/countries/:country', checkAdmin, (req, res) => {
    const { country } = req.params;
    
    const itemIndex = countries.findIndex(item => item.country === country)

    if (itemIndex >= 0) {
        countries.splice(itemIndex, 1);
        res.status(200).send(`Successfully deleted!`);
    } else {
        res.status(400).send('No such country exists!');
    }
})


app.get('/admin', (req, res) => {
    res.cookie('adminToken', SECRET, {
        maxAge: 360000,
        sameSite: 'none',
        httpOnly: true
    });       
    res.status(200).send('Token Generated');
    return;
})


app.listen(5000, () => {
    console.table('Server running on http://localhost:5000');
})


function checkAdmin(req, res, next){
    const adminToken = req.cookies.adminToken;

    if (adminToken === SECRET) {
        next()
        return;
    } else {
        res.status(401).send('Not an Admin, Git Gud!');
    }
};  