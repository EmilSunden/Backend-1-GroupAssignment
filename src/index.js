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

    console.log(cookieParser)

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
    let id = uuidv4();
    countries.push({ id, country, capital, language, population });
    console.log(countries);

    res.status(200).send(`Added ${country}! Congratulations, it works!`)
})

app.get('/countries', (req, res) => {
    res.status(202).send(countries)
})

app.get('/countries/:country', (req, res) => {
    const { country } = req.params
    
    let result = countries.find(item => item.country === country) // country => item => item.country && item.id = id
        
    res.status(200).send(`The result is ${result.capital}`)
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
    const countryIndex = countries.indexOf(countryToUpdate)

    Object.assign(countryToUpdate, req.body);

    countries[countryIndex] = countryToUpdate;

    console.log(countryToUpdate)
    res.status(200).send(countryToUpdate)
})

app.delete('/countries/:country', checkAdmin, (req, res) => {
    console.log("req params", req.params.country)
    const { country } = req.params;
    
    const itemIndex = countries.findIndex(item => item.country === country)

    console.log(itemIndex);
    if (itemIndex >= 0) {
        countries.splice(itemIndex, 1);
        console.log("Done Splice");
    } else {
        console.log("No Splice");
    }

    res.status(200).send(`Country Deleted ${itemIndex}`)
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
    console.log(adminToken);


    if (adminToken === SECRET) {
        next()
        return;
    } else {
        res.status(401).send('Not an Admin, Git Gud!');
    }
};  