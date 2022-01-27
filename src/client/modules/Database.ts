import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL || "", {
    logging: (sql) => console.log(sql),
});

export const Database = (dependencies : Dependencies) => {
    dependencies.set("admin:database", sequelize);

    const Project = sequelize.define("project", {
        id : {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    const Branch = sequelize.define("branch", {
        id : {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    Project.hasMany(Branch)
    Branch.belongsTo(Project)
};