require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const moviesdata = require('./movies-data.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if(!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(401).json({ error: 'Bad credentials'})
    }

    next();
})

app.get('/films', handleGetFilms)

function handleGetFilms(req, res){

    let convertedNumber = (Number(req.query.avgvote))

    if(Number.isNaN(convertedNumber) || Number(req.query.avgvote) > 10 || Number(req.query.avgvote < 0)){
        res.send(400, 'Invalid average vote input.')
    }

    let results = moviesdata;

    if(req.query.genre){
        results = results.filter(film => 
            film.genre.toLowerCase().includes(req.query.genre.toLowerCase()))
    }

    if(req.query.country){
        results = results.filter(film => 
            film.country.toLowerCase().includes(req.query.country.toLowerCase()))
    }

    if(req.query.avgvote){
        results = results.filter(film => 
            film.avg_vote >= Number(req.query.avgvote))
    }

    if (results.length === 0){results = (400, "No films to return.")}
    res.send(results)

}

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })
  

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

