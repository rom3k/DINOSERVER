module.exports = (sequelize, type) => {
    return sequelize.define('orderdetails',
        {
            orderid: {
                type: type.INTEGER,
                primaryKey: true
            },
            productid: {
                type: type.INTEGER,
                primaryKey: true
            },
            quantity: type.INTEGER
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );
}
    
