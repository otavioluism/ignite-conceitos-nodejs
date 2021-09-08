const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) { 
    return response.status(400).json({error: "Dont exists username!"});
  }

  const user = users.find(item => { 
    return item.username == username;
  })

  if(!user) { 
    return response.status(404).json({error: "Dont found any user!"});
  }

  request.user = user;

  next();
}


app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => { 
    return user.username === username;
  })

  if(userAlreadyExists)  {
    return response.status(400).json({error: "This user already exists"});
  }

  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const {title, deadline} = request.body;

  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {title, deadline} = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todo => { 
    return todo.id === id
  })

  if(!todo) { 
    return response.status(404).json({error: "This todo dont found!"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);


  return response.json(todo)
});


app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => { 
    return todo.id === id
  })

  if(!todo) { 
    return response.status(404).json({error: "This todo dont found!"});
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  // retorna o index do array
  const todoIndex = user.todos.findIndex(item => { 
    return item.id === id;
  })

  if(todoIndex === -1) { 
    return response.status(404).json({error: "This not found"});
  }

  // splice - passamos a posição e quantos elementos apartir do elemento queremos excluir
  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;