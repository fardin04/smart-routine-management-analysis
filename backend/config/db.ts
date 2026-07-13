import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbDialect = (process.env.DB_DIALECT || 'postgres').toLowerCase();
let sequelize: Sequelize;

const initDatabase = async (): Promise<Sequelize> => {
  if (dbDialect === 'postgres') {
    const dbHost = process.env.DB_HOST;
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME || 'defaultdb';

    // If critical environment variables are missing, fallback instantly to SQLite
    if (!dbHost || !dbUser || !dbPassword) {
      console.warn('========================================================================');
      console.warn('POSTGRESQL CONFIGURATION WARNING:'+ '⚠️');
      console.warn('Missing DB_HOST, DB_USER, or DB_PASSWORD in environment variables.');
      console.warn('Falling back to local SQLite database storage.');
      console.warn('========================================================================');
      return createSqliteInstance();
    }

    console.log(`Sequelize: Initializing PostgreSQL dialect connection to ${dbHost}:${dbPort}...`);

    const sequelizeOptions: Options = {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 20000, // Slightly extended for external cloud handshakes
        idle: 10000,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: true, // Safeguards connection over the public internet
        },
      },
    };

    const instance = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

    try {
      // Authenticate directly using Sequelize instead of spawning heavy child processes
      await instance.authenticate();
      console.log(`Sequelize: Successfully authenticated with Aiven Cloud PostgreSQL ["${dbName}"].`);
      return instance;
    } catch (error) {
      console.warn('========================================================================');
      console.warn('⚠️  POSTGRESQL CONNECTION ERROR:');
      console.warn(`Could not connect to the cloud PostgreSQL database engine.`);
      console.warn('Falling back to SQLite to maintain service availability.');
      console.warn('========================================================================');
      return createSqliteInstance();
    }
  } else {
    console.log('Sequelize: DB_DIALECT explicit instruction found for local storage layout.');
    return createSqliteInstance();
  }
};

// Helper abstraction to keep instantiation logic DRY
const createSqliteInstance = (): Sequelize => {
  return new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  });
};

// Top-level instantiation execution wrapper
sequelize = (await initDatabase().catch(() => createSqliteInstance()));

export default sequelize;