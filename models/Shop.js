module.exports = (sequelize, type) => {
    return sequelize.define(
        'shop',
        {
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