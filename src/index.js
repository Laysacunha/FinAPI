const express = require("express");
const { json } = require("express/lib/response");
const { v4: uuidv4 } = require ("uuid")

const app = express();

const customers = [];

/* cpf - String
name -string
id - uuid - universe unique identifier
statement [] */ 

app.use(express.json());

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
        );
    
    if (customerAlreadyExists) {
        return response.status(400).json({error: "Customer already exists!"});
    }

    customers.push({
        cpf,
        name,
        id:  uuidv4(), 
        statement: []
    });

    return response.status(201).send();
});

app.get("/statement/:cpf", (request, response) => {
    const { cpf } = request.params;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({error: "Customer doens't exists!"});
    }

    return response.json(customer.statement);
});

app.post("/deposit/:cpf/:value", (request, response) => {
    const { cpf, value } = request.params;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer){
        return response.status(400).json({error: "Customer doens't exists!"});
    }

    const position = customers.indexOf(customer);

    customers[position].statement.push(value); 

    return response.status(201).send();

});

app.get("/", (request, response) => {
    return response.send("Server ir running!");
});

app.listen(3333);