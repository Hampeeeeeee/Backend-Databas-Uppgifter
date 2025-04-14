// Övningsuppgift 1 - Node JS och Express JS
const express = require('express');
require('dotenv').config();
const dayjs = require('dayjs');
const weekday = require('dayjs/plugin/weekday');
const localeData = require('dayjs/plugin/localeData');

dayjs.extend(weekday);
dayjs.extend(localeData);

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

// Övning 3: Din första Express-server
app.get('/hello', (req, res) => {
    res.json({ message: 'Hej världen!' })
});

// app.get('/time', (req, res) => {
//     const formattedTime = dayjs().format('YYYY-MM-DD HH:mm');
//     res.json({ time: formattedTime });
// });

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

// Övning 4: Utöka ToDo API:et
let todos = [                           // Initialize our "in memory database"
    { id: 1, task: "Learn Node.js", completed: false },
    { id: 2, task: "Learn Express", completed: false },
    { id: 3, task: "Build a REST API", completed: false }
];

app.get('/todos', (req, res) => {
    res.json(todos);                    // Send the list of todos to the client as JSON
});

app.get('/todos/search', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is needed' });
    }

    const lowerQuery = query.toLowerCase();
    const results = todos.filter(todo =>
        todo.task.toLowerCase().includes(lowerQuery)
    );

    res.json(results);
});

app.get('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id); // Parse and Store the URL-parameter
    const todo = todos.find((rad) => {      // Find the correct row in the in memory database
        return rad.id === todoId;
    });

    if (todo) {                               // If we found it, return the row
        res.json(todo);
    } else {
        res.status(404).json({              // If not, return an error message to the client
            message: "Todo not found"
        });
    }

});

app.post('/todos', (req, res) => {

    // Validate that the task exists
    if (!req.body.task || typeof req.body.task !== 'string' || req.body.task.trim() === '') {
        return res.status(400).json({ error: 'Task is required and must be a non-empty string' });
    }

    // Put completed to false if it doesn't exist or if it's not a boolean
    let completedValue = false;
    if (typeof req.body.completed === 'boolean') {
        completedValue = req.body.completed;
    }

    // Find the biggest ID and add one to it, use it as the next available id
    const nextId = todos.reduce((maxId, rad) => {
        return Math.max(maxId, rad.id);
    }, 0) + 1;

    // Create a new object
    const newTodo = {
        id: nextId,
        task: req.body.task,
        completed: completedValue
    };

    // Store the object to our "in memory database"
    todos.push(newTodo);
    res.status(200).json(newTodo);      // Return the newly created todo to the client 

});

app.delete('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    todos = todos.filter((rad) => {     // Filter the result -- e.g. keep all rows that doesn't match the id
        return rad.id !== todoId
    });
    res.status(204).send();             // Return a status to the client
});

app.put('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    const { task, completed } = req.body;

    const todo = todos.find(t => t.id === todoId);
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    if (task !== undefined) todo.task = task;
    if (completed !== undefined) todo.completed = completed;

    res.json(todo);
});

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

// Övning 5: Enkla rutter för en bokhandel
let books = [
    { title: 'Djungelboken', author: 'Rudyard Kipling', isbn: '9789177792598' },
    { title: '1984', author: 'George Orwell', isbn: '9780141036144' },
    { title: 'Sagan om ringen', author: 'J.R.R. Tolkien', isbn: '9789172632189' }
]

app.get('/books', (req, res) => {
    res.json(books)
});

app.get('/books/:isbn', (req, res) => {
    const bookIsbn = req.params.isbn; // Parse and Store the URL-parameter
    const book = books.find((rad) => {      // Find the correct row in the in memory database
        return rad.isbn === bookIsbn;
    });

    if (book) {                               // If we found it, return the row
        res.json(book);
    } else {
        res.status(404).json({              // If not, return an error message to the client
            message: "Book not found"
        });
    }
});

app.post('/books', (req, res) => {
    const { title, author, isbn } = req.body; // Extract data from request and send to body

    if ( 
        !title || typeof title !== 'string' || title.trim() === '' ||
        !author || typeof author !== 'string' || author.trim() === '' || // Validate the mandatory fields
        !isbn || typeof isbn !== 'string' || isbn.trim() === ''
    ) {
        return res.status(400).json({ error: 'All fields (title, author, isbn) are mandatory and must be strings.' });
    }

    const existingBook = books.find(book => book.isbn === isbn); // Check if ISBN already exists
    if (existingBook) {
        return res.status(409).json({ error: 'A book with this ISBN already exists!' });
    }

    const newBook = { title, author, isbn }; // Create a new book object and add it to the array of books.
    books.push(newBook);

    res.status(201).json(newBook); // Respond with a 201 answer (resource has been created)
})

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

// Övning 6: Temperaturomvandlare som API
app.get('/convert', (req, res) => {
    const celsius = parseFloat(req.query.celsius); // Getting the value of the query (celsius) from the URL.
                                                   // parseFloat returns a float number to numerically convert.

    const fahrenheit = (celsius * 9 / 5) + 32; // Calculates fahrenheit

    // Returns a json to the client
    // celsius: Original value
    // fahrenheit: Converted value
    res.json({
        celsius: celsius,
        fahrenheit: fahrenheit  
    });
});

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

// Övning 7: En enkel kalkylator-API
app.post('/calculate', (req, res) => {
    const { a, b, op } = req.body;

    let result;

    switch (op) {
        case '+':
            result = a + b;
            break;
        case '-':
            result = a - b;
            break;
        case '*':
            result = a * b;
            break;
        case '/':
            if (a === 0 || b === 0) {
                return res.status(400).json({ error: 'Division by zero is not possible' });
            }
            result = a / b;
            break;
        default: 
            return res.status(400).json({ error: 'Invalid operation. Use +, -, *, or /' });
    }

    res.json({ result });
});

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

// Övning 8: API som visar datum och tid
app.get('/dayjsDate', (req, res) => {
    const today = dayjs();                  // using the daysjs extention
    res.json({
        date: today.format('YYYY-MM-DD'),
        weekday: today.format('dddd')
    })
});

app.get('/dayjsTime', (req, res) => {
    const now = dayjs();
    res.json({
        time: now.format('HH:mm:ss'),
        weekday: now.format('dddd')
    });
});

app.get('/date', (req, res) => {
    const now = new Date();

    // Get date in format: YYYY-MM-DD                          // using vanilla JS
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const date = `${year}-${month}-${day}`;

    // Get weekdays
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[now.getDay()]; // 0 = Sunday, 6 = Saturday

    res.json({ date, weekday });
});

app.get('/time', (req, res) => {
    const now = new Date();

    // Get time in format: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const time = `${hours}:${minutes}:${seconds}`;

    res.json({ time });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});