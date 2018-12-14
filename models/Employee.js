module.exports = (sequelize, type) => {
    return sequelize.define('employees',
        {
            employeeid: {
                type: type.INTEGER,
                primaryKey: true,
            },
            name: {
                type: type.STRING
            },
            email: {
                type: type.STRING
            },
            password: {
                type: type.STRING
            },
            job: {
                type: type.STRING
            }
        },
        {
            freezeTableName: true,
            timestamps: false
        }
    )
}
