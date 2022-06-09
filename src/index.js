const { request } = require("express");
const express = require("express");
const { json } = require("express/lib/response");
const nodemon = require("nodemon");
const { v4: uuidv4 } = require ("uuid")

const app = express();

const customers = [];

function verifyIfExistsAccountCPF(request, response, next){

    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({error: "Customer doens't exists!"});
    }

    request.customer = customer;
    
    next();

}

function getBalance (statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

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

app.get("/statement/", verifyIfExistsAccountCPF, (request, response) => {
  
    const { customer } = request;

    return response.json(customer.statement);
});

app.post("/deposit/", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }
    if (amount < 0) {
        return response.status(400).json({error: "Value can't be negative!"});
    } 
    customer.statement.push(statementOperation);

    return response.status(201).send();

});

app.post("/withdraw/", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;

    const { customer } = request;

    const balance =getBalance(customer.statement);

    if (amount < 0) {
        return response.status(400).json({error: "Value can't be negative!"});
    }

    if (balance < amount) {
        return response.status(400).json({error: "Insuficient balance!"});
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation); 

    return response.status(201).send();
});

app.get("/statementByDate/", verifyIfExistsAccountCPF, (request, response) =>{
    const { date } = request.body;

    const { customer } = request;

    const statementInterval = customer.statement.filter((statement) => statement.created_at.getTime() >= Date.parse(date));

    return response.json(statementInterval);
        
});

app.get("/statementByInterval/", verifyIfExistsAccountCPF, (request, response) => {
    const { initialDate, finalDate } = request.body;

    const { customer } = request;

    const statementInterval = customer.statement.filter(
        (statement) => statement.created_at.getTime() >= Date.parse(initialDate) && statement.created_at.getTime() <= Date.parse(finalDate));

    return response.json(statementInterval);
});

app.put("/account/", verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;

    const { customer } = request;

    customer.name = name;

    return response.status(201).send();

});

app.get("/account/", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    customers.splice(customer, 1);

    return response.status(200).json(customers);
});

app.get("/balance/", verifyIfExistsAccountCPF, (request, response) =>{
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
});

app.get("/", (request, response) => {
    return response.send("Server ir running!");
});

app.listen(3333);