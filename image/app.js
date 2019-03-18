const express = require('express')
const request = require('request')
const app = express()
const port = 3000

const author = "Kieron"

app.get('/', (req, res) => {
  res.send(`Hello from ${author}!`);
})

app.get('/healthz', (req, res) => {
  res.send('Alive');
})

app.listen(port, () => {
  console.log(`App belonging to ${author} - listening on port ${port}!`)
})
