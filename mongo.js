const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const [, , password, name, number] = process.argv

const url =
    `mongodb+srv://javiergonb3:${password}@cluster0.wnq0t.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name && number) {
    const person = new Person({ name, number })

    person.save()
        .then(() => {
            console.log(`Added ${name} number ${number} to phonebook`)
            mongoose.connection.close()
        })
} else {
    Person.find({})
        .then(result => {
            console.log('Phonebook:')
            result.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
            mongoose.connection.close()
        })
}