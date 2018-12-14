// Załadowanie modeli
var ProductModel = require('../models/Products');
var EmployeeModel = require('../models/Employee');
var OrdersModel = require('../models/Orders');
var ShopModel = require('../models/Shop');
var WarehouseModel = require('../models/Warehouse');
var OrderDetailsModel = require('../models/OrderDetails');

const Sequelize = require('sequelize');
// Konfiguracja połączenia
const sequelize = new Sequelize('ino', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
    port: 3306,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// ORM
const Products = ProductModel(sequelize, Sequelize);
const Employee = EmployeeModel(sequelize, Sequelize);
const Orders = OrdersModel(sequelize, Sequelize);
const Shop = ShopModel(sequelize, Sequelize);
const Warehouse = WarehouseModel(sequelize, Sequelize);
const OrderDetails = OrderDetailsModel(sequelize, Sequelize);

// Relacje
Products.belongsTo(Warehouse, { targetKey: 'productid', foreignKey: 'productid' });
Products.belongsTo(Shop, { targetKey: 'productid', foreignKey: 'productid' });
Employee.belongsTo(Orders, { targetKey: 'employeeid', foreignKey: 'employeeid' });
Orders.belongsToMany(Products, { through: OrderDetails, foreignKey: 'orderid' });
Products.belongsToMany(Orders, { through: OrderDetails, foreignKey: 'productid' });

// Synchronizacja
sequelize.sync()
    .then(() => {
        console.log('Successful sync.')
    });

module.exports = {
    Products,
    Employee,
    Shop,
    Warehouse,
    Orders,
    OrderDetails,
}