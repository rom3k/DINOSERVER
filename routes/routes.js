// Załadowanie modułów
const express = require('express');
const routes = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const randomString = require('crypto-random-string');

// Import modeli
const { Products, Employee, Shop, Warehouse, Orders, OrderDetails } = require('../database/db');

// Konfiguracja
routes.use(cors()); // Cross-Origin Resource Sharing, zabezpieczenie przed tym, żeby serwer z kilientem się nie gryźli
process.env.SECRET_KEY = 'secret'; 

// Autoryzacja tokena
const checkToken = (req, res, next) => {
    let header = req.headers.authorization;
    let token = req.headers.authorization.split('.')[1];
    if (typeof header !== 'undefined') {
        req.token = token;
        next();
    } else {
        res.sendStatus(403);
    }
}

// POST login - autoryzacja użytkownika
routes.post('/login', (req, res) => {
    Employee.findOne({ // Wyszukanie użytkownika
        where: {
            email: req.body.email
        }
    })
    .then(employee => {
        if(req.body.email === employee.email & req.body.password === employee.password) { // Sprawdzenie czy dane się zgadzają
            jwt.sign(employee.dataValues, process.env.SECRET_KEY, { expiresIn: 1440 }, (error, token) => { // Wygenerowanie tokena
                if (error) {
                    console.log(err);
                }
                res.send({ token: token });
            })
        } else {
            res.send('Could not log in.');
        }
    })
    .catch(error => { // Obsługa błędów
        res.send('' + error);
    });
});

// GET products - dane do wyświetlenia zawartości magazynu
routes.get('/warehouse', checkToken, (req, res) => {
    if (handleWorker(req.token)) {
        Products.findAll({
            include: [{
                model: Warehouse
            }]
        }).then(products => {
            res.send(JSON.stringify(products));
        }).catch(error => {
            res.send('' + error);
        });
    }
    else {
        res.sendStatus(403);
    }
});

// GET products - dane do wyświetlenia zawartości sklepu
routes.get('/shop', checkToken, (req, res) => {
    Products.findAll({
        include: [{
            model: Shop
        }]
    }).then(products => {
        res.send(JSON.stringify(products));
    }).catch(error => {
        res.send('' + error);
    });
});

// GET orders - dane do wyświetlenia zamówień
routes.get('/orders', checkToken, (req, res) => {
    Orders.findAll({
        include: [{
            model: Products
        }]
    }).then(orders => {
        res.send(JSON.stringify(orders));
    }).catch(error => {
        res.send('' + error);
    });
});

// GET checkout - wygenerowanie tokenu do zapłaty
routes.get('/checkout', checkToken, (req, res) => {
    let payToken = randomString(16);
    res.send(JSON.stringify({ payToken: payToken }));
});

// POST orders - utowrzenie zamówienia
routes.post('/orders', checkToken, (req, res) => {
    var body = req.body,
        orderId = body.orderid,
        orderdate = body.orderdate,
        employeeId = body.employeeid,
        status = body.status,
        destination = body.destination,
        completionDate = body.completiondate,
        products = body.products,
        orderDetails = [];
        for (let i = 0; i < products.length; i++) {
            orderDetails.push(products[i].orderDetails);
            delete products[i].orderDetails;
        }
        Orders.create({
            orderid: orderId,
            orderdate: orderdate,
            employeeid: employeeId,
            status: status,
            destination: destination,
            completiondate: completionDate
        })
        .then(() => { 
            orderDetails.forEach((detail) => {
                OrderDetails.create({
                    orderid: detail.orderId,
                    productid: detail.productId,
                    quantity: detail.quantity
                });
            });

            if (status === "Ukończono") {
                orderDetails.forEach((detail => {
                    Warehouse.findOne({ where: { productid: detail.productId } })
                    .then(item => {
                        item.increment('quantity', { by: detail.quantity });
                    });
                }))
            }
            res.send(200, 'Success!');
        })
        .catch(error => { res.send(error); });
});

// PATCH order - zaktualizowanie zamówienia
routes.patch('/completeorder', (req, res) => {
    var orderId = req.body.orderId;
    console.log(req.body);
    Orders.findOne({
        where: { orderid: orderId },
        include: [{
            model: Products
        }]
    }).then((order) => {
        let details = [];
        let products = order.products;
        for (var i = 0; i < products.length; i++) {
            details.push(products[i].orderdetails);
        }
        if (order.destination === 'Sklep') {
            details.forEach((detail) => {
                Warehouse.findOne({ where: {productid: detail.productid } })
                .then(item => {
                    item.decrement('quantity', { by: detail.quantity });
                    Shop.findOne({ where: { productid: detail.productid }})
                    .then(item => {
                        item.increment('quantity', { by: detail.quantity });
                    })
                });
            }); 
        } else if (order.destination === 'Magazyn') {
            details.forEach((detail) => {
                Warehouse.findOne({ where: {productid: detail.productid }})
                .then(item => {
                    item.increment('quantity', { by: detail.quantity });
                });
            })
        }
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let completiondate = year.toString() + '-' + month.toString() + '-' + day.toString();
        order.completiondate = completiondate;
        order.status = 'Ukończono';
        order.save({ fields: ['status', 'completiondate'] }).then(() => {
            console.log('Succesful update');
        });
        res.send(200, 'Success');
    })
    .catch(error => {
        res.send(error);
    })
});


const handleBoss = (token) => {
    let payload = Buffer.from(token, 'base64').toString();
    let bearer = JSON.parse(payload);
    if (bearer.job === 'Kierownik') {
        return true;
    }
    else return false;
}

const handleWorker = (token) => {
    let payload = Buffer.from(token, 'base64').toString();
    let bearer = JSON.parse(payload);
    if (bearer.job === 'Magazynier') {
        return true;
    }
    else return false;
}

module.exports = routes;