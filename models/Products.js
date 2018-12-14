module.exports = (sequelize, type) => {
    return sequelize.define(
        'products',
        {
            productid: {
                type: type.INTEGER,
                primaryKey: true,
            },
            name: {
                type: type.STRING,
                allowNull: false
            },
            serialnumber: {
                type: type.STRING
            },
            price: {
                type: type.FLOAT
            }
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );   
}
