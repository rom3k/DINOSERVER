module.exports = (sequelize, type) => {
    return sequelize.define(
        'orders',
        {
            orderid: {
                type: type.INTEGER,
                primaryKey: true
            },
            orderdate: {
                type: type.DATEONLY,
                defaultValue: type.NOW
            },
            employeeid: type.INTEGER,
            status: type.INTEGER,
            completiondate: {
                type: type.DATEONLY || null,
                defaultValue: null
            },
            destination: type.STRING
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );
}