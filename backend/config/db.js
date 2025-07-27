import { Sequelize } from 'sequelize';
import config from './environment.js';

const sequelize = new Sequelize(
  config.mysqlDatabase,
  config.mysqlUser,
  config.mysqlPassword,
  {
    host: config.mysqlHost,
    port: config.mysqlPort,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB; 