const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const Person = require("./models/person")

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("info", (req) => req.info);
app.use(morgan(":method :url :response-time ms :info"));

const getBody = (req, res, next) => {
    req.info = JSON.stringify(req.body);
    next();
};
app.use(getBody);

let persons = [
];

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })

app.get("/api/info", (req, res) => {
    const numberOfPeople = persons.length;
    const time = new Date();
    res.send(
        `<p>Phonebook has info for ${numberOfPeople} people</p>\n<p>${time}</p>`
    );
});

app.get("/api/persons", (req, res) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
});

app.get("/api/persons/:id", (req, res) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
});

app.delete("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter((person) => person.id !== id);
    res.status(204).end();
});

const generateId = (max = 1e12) => String(Math.floor(Math.random() * max));

app.post("/api/persons", (req, res) => {
    const body = req.body;

    if (!body.name) {
        return res.status(400).json({ error: "name missing" });
    }
    if (!body.number) {
        return res.status(400).json({ error: "number missing" });
    }

    const personExists = persons.some(
        (person) => person.name === body.name
    );
    if (personExists) {
        return res.status(400).json({ error: "name must be unique" });
    }

    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number,
    };

    persons = persons.concat(newPerson);
    res.json(newPerson);
});

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
