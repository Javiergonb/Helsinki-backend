const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const Person = require("./models/person")

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("info", (request) => request.info);
app.use(morgan(":method :url :response-time ms :info"));

const getBody = (request, response, next) => {
    request.info = JSON.stringify(request.body);
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

app.get("/api/info", (request, response) => {
    const numberOfPeople = persons.length;
    const time = new Date();
    response.send(
        `<p>Phonebook has info for ${numberOfPeople} people</p>\n<p>${time}</p>`
    );
});

app.get("/api/persons", (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
});

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        console.log(error)
        next(error)
    })
});

app.delete("/api/persons/:id", (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            console.log(error)
            response.status(500).end()
        })
});


app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
  
    Person.findByIdAndUpdate(
        request.params.id, 
        {name,number}, 
        { new: true , runValidators: true, context: query})
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.post("/api/persons", (request, response,next) => {
    const body = request.body;

    if (!body.name) {
        return response.status(400).json({ error: "name missing" });
    }
    if (!body.number) {
        return response.status(400).json({ error: "number missing" });
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
});

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError'){
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
