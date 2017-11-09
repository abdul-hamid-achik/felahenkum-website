const express = require('express')
const nunjucks = require('nunjucks')
const app = express()

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use(express.static('public'))

app.get('/', (req, res) => res.render('index.html'))
app.get('/about', (req, res) => res.render('about.html'))
app.get('/discography', (req, res) => res.render('discography.html'))
app.get('/gear', (req, res) => res.render('gear.html'))
app.get('/road', (req, res) => res.render('road.html'))
app.get('/blog', (req, res) => res.render('blog.html'))
app.get('/media', (req, res) => res.render('media.html'))
app.get('/contact', (req, res) => res.render('contact.html'))


app.listen(process.env.MODE == "production" ? 80 : 8000, () => console.log('Running server'))