const oracledb = require("oracledb");
const loadEnvFile = require("./utils/envUtil");
const fs = require("fs");
const path = require("path");

const envVariables = loadEnvFile("./.env");

// NOTE: Much of the code is inspired from/ based on the example code given by the course.

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
  user: envVariables.ORACLE_USER,
  password: envVariables.ORACLE_PASS,
  connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
  poolMin: 1,
  poolMax: 3,
  poolIncrement: 1,
  poolTimeout: 60,
};

// initialize connection pool
async function initializeConnectionPool() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("Connection pool started");
  } catch (err) {
    console.error("Initialization error: " + err.message);
  }
}

async function closePoolAndExit() {
  console.log("\nTerminating");
  try {
    await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
    console.log("Pool closed");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

initializeConnectionPool();

process.once("SIGTERM", closePoolAndExit).once("SIGINT", closePoolAndExit);

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
  let connection;
  try {
    connection = await oracledb.getConnection(); // Gets a connection from the default pool
    return await action(connection);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
  return await withOracleDB(async (connection) => {
    return true;
  }).catch(() => {
    return false;
  });
}

// attempt to auto run sql script
async function runSQLScript() {
  try {
    const sqlScript = fs.readFileSync(
      "scripts/updatedStockManager.sql",
      "utf8"
    );

    return await withOracleDB(async (connection) => {
      // split into statements by semicolons and ignore empty statements
      const statements = sqlScript
        .split(";")
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

      // execute each statment in our script file
      for (const statement of statements) {
        try {
          await connection.execute(statement, [], { autoCommit: true });
          console.log(`executed statement: ${statement}`);
        } catch (err) {
          console.error(`error executing statement: ${statement}`);
          console.error(err);
        }
      }
      return true; // return true if success for all stamtents
    });
  } catch (err) {
    console.error("error running SQL script:", err);
    return false;
  }
}

async function fetchDemotableFromDb() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT * FROM DEMOTABLE");
    return result.rows;
  }).catch(() => {
    return [];
  });
}

async function initiateDemotable() {
  return await withOracleDB(async (connection) => {
    try {
      await connection.execute(`DROP TABLE DEMOTABLE`);
    } catch (err) {
      console.log("Table might not exist, proceeding to create...");
    }

    const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
    return true;
  }).catch(() => {
    return false;
  });
}

async function insertDemotable(id, name) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
      [id, name],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function updateNameDemotable(oldName, newName) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
      [newName, oldName],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function countDemotable() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT Count(*) FROM DEMOTABLE");
    return result.rows[0][0];
  }).catch(() => {
    return -1;
  });
}

// // stock & exchange relation
// async function initiateStockExchange() {
//   return await withOracleDB(async (connection) => {
//     try {
//       //await connection.execute(`DROP TABLE STOCKEXCHANGE`);
//       await connection.execute(
//         `DROP TABLE STOCKEXCHANGE CASCADE CONSTRAINTS PURGE`
//       );
//     } catch (err) {
//       console.log("Table might not exist, proceeding to create...");
//     }
//
//     const result = await connection.execute(`
//             CREATE TABLE STOCKEXCHANGE (
//                 exchange VARCHAR2(20),
//                 ticker VARCHAR2(5) PRIMARY KEY,
//                 price NUMBER,
//                 marketCap NUMBER,
//                 shares NUMBER,
//                 volume NUMBER
//             )
//         `);
//     return true;
//   }).catch(() => {
//     return false;
//   });
// }

async function insertStockExchange(
  tickerID,
  price,
  marketCap,
  shares,
  volume,
  StockExchangeName
) {
  if (!sanitizeHelper(tickerID) || !sanitizeHelper(StockExchangeName)) {
    console.error("insertStockExchange blocked due to suspicious input");
    return false;
  }

  return await withOracleDB(async (connection) => {
    const checkValidForeignKey = await connection.execute(
      `SELECT COUNT(*) FROM STOCKEXCHANGE WHERE StockExchangeName = :StockExchangeName`,
      [StockExchangeName]
    );

    if (checkValidForeignKey.rows[0][0] === 0) {
      return "ForeignKeyViolated";
    }

    const result = await connection.execute(
      `INSERT INTO STOCKEXCHANGE (tickerID, price, marketCap, shares, volume, StockExchangeName) VALUES (:tickerID, :price, :marketCap, :shares, :volume, :StockExchangeName)`,
      [tickerID, price, marketCap, shares, volume, StockExchangeName],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function deleteStockById(tickerID) {
  if (!sanitizeHelper(tickerID)) {
    console.error("deleteStockById blocked due to suspicious input");
    return false;
  }

  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `DELETE FROM STOCKEXCHANGE WHERE tickerID = :tickerID`,
      [tickerID],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function fetchStockExchangeTableFromDb() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT * FROM STOCKEXCHANGE");
    return result.rows;
  }).catch(() => {
    return [];
  });
}

function sanitizeHelper(value) {
  if (typeof value !== "string") {
    return true;
  }
  const lc = value.toLowerCase();

  const blacklisted = ["drop table", "truncate table", "--", "/*", "*/", ";"];

  for (const item of blacklisted) {
    if (lc.includes(item)) {
      return false;
    }
  }
  return true;
}

async function updateStockExchange(
  tickerID,
  newPrice,
  newMarketCap,
  newVolume,
  newShares,
  newExchangeName
) {
  if (!sanitizeHelper(tickerID) || !sanitizeHelper(newExchangeName)) {
    console.error("updateStockExchange blocked due to suspicious input");
    return false;
  }

  return await withOracleDB(async (connection) => {
    const updates = [];
    const params = {};
    params.tickerID = tickerID;

    if (newPrice != null && newPrice !== "") {
      updates.push("price = :price");
      params.price = newPrice;
    }
    if (newMarketCap != null && newMarketCap !== "") {
      updates.push("marketCap = :marketCap");
      params.marketCap = newMarketCap;
    }
    if (newVolume != null && newVolume !== "") {
      updates.push("volume = :volume");
      params.volume = newVolume;
    }
    if (newShares != null && newShares !== "") {
      updates.push("shares = :shares");
      params.shares = newShares;
    }
    if (newExchangeName != null && newExchangeName !== "") {
      updates.push("StockExchangeName = :exchangeName");
      params.exchangeName = newExchangeName;
    }

    const result = await connection.execute(
      `
      UPDATE STOCKEXCHANGE
      SET ${updates.join(", ")}
      WHERE tickerID = :tickerID
      `,
      params,
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

async function fetchExchangeAndLocationFromDb() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT * FROM StockExchangeLocation"
    );
    return result.rows;
  }).catch(() => {
    return [];
  });
}

//LocationAndCurrency stuff
async function fetchLocationAndCurrencyFromDb() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT * FROM LocationAndCurrency"
    );
    return result.rows;
  }).catch(() => {
    return [];
  });
}

// async function initiateLocationAndCurrency() {
//   return await withOracleDB(async (connection) => {
//     try {
//       await connection.execute(`DROP TABLE LocationAndCurrency`);
//     } catch (err) {
//       console.log("Table might not exist, proceeding to create...");
//     }
//
//     const result = await connection.execute(`
//             CREATE TABLE LocationAndCurrency (
//                 CurrencyLocation VARCHAR2(20),
//                 Currency         VARCHAR2(20) NOT NULL,
//                 PRIMARY KEY (CurrencyLocation)
//             )
//         `);
//     return true;
//   }).catch(() => {
//     return false;
//   });
// }

async function insertLocationAndCurrency(currencyLocation, currency) {
  if (!sanitizeHelper(currencyLocation) || !sanitizeHelper(currency)) {
    console.error("insertLocationAndCurrency blocked due to suspicious input");
    return false;
  }

  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO LocationAndCurrency (CurrencyLocation, Currency) VALUES (:currencyLocation, :currency)`,
      [currencyLocation, currency],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function countLocationAndCurrency() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT Count(*) FROM LocationAndCurrency"
    );
    return result.rows[0][0];
  }).catch(() => {
    return -1;
  });
}

async function deleteLocationAndCurrency(CurrencyLocation) {
  if (!sanitizeHelper(CurrencyLocation)) {
    console.error("deleteLocationAndCurrency blocked due to suspicious input");
    return false;
  }

  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `DELETE FROM LocationAndCurrency WHERE CurrencyLocation = :currencyLocation`,
      [CurrencyLocation],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function selectStockWithConditions(conditions) {
  return await withOracleDB(async (connection) => {
    let baseQuery = "SELECT * FROM STOCKEXCHANGE";
    let clauseList = [];
    let bindParams = {};

    conditions.forEach((cond, i) => {
      const bindKey = `val${i}`;
      if (i === 0) {
        clauseList.push(`${cond.attribute} ${cond.operator} :${bindKey}`);
      } else {
        clauseList.push(
          `${cond.logic} ${cond.attribute} ${cond.operator} :${bindKey}`
        );
      }
      bindParams[bindKey] = cond.value;
    });

    if (clauseList.length > 0) {
      baseQuery += " WHERE " + clauseList.join(" ");
    }

    const result = await connection.execute(baseQuery, bindParams);
    return result.rows;
  }).catch((err) => {
    console.error("selectStockWithConditions error:", err);
    return false;
  });
}

async function fetchStockExchangeLocationFromDb() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT * FROM StockExchangeLocation"
    );
    return result.rows;
  }).catch(() => {
    return [];
  });
}

// joins location currency and exchange location tables based on WHERE = location
async function joinLocationCurrencyExchange(currencyLocation) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT S.StockExchangeName, S.CurrencyLocation, L.Currency FROM StockExchangeLocation S JOIN LocationAndCurrency L ON S.CurrencyLocation = L.CurrencyLocation WHERE S.CurrencyLocation = :currencyLocation",
      [currencyLocation]
    );
    // console.log(currencyLocation);
    // console.log(1);
    // console.log(result);
    // console.log(2);
    // console.log(result.rows);

    return result.rows;
  }).catch(() => {
    console.log("failed");
    return [];
  });
}

async function divideStockExchange() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT DISTINCT sel.StockExchangeName 
       FROM StockExchangeLocation sel
       WHERE NOT EXISTS (
         SELECT column_value 
         FROM TABLE(SYS.ODCIVARCHAR2LIST('AMZON', 'APPLE', 'NTFLX', 'GOOGL', 'FACEB'))
         MINUS
         (SELECT DISTINCT se.TickerID
          FROM StockExchange se
          WHERE se.StockExchangeName = sel.StockExchangeName 
          AND (se.TickerID = 'AMZON' OR 
               se.TickerID = 'APPLE' OR 
               se.TickerID = 'NTFLX' OR 
               se.TickerID = 'GOOGL' OR se.TickerID = 'FACEB'))
       )`
    );
    return result.rows;
  }).catch((error) => {
    console.error("Error in divideStockExchange:", error);
    return [];
  });
}

async function aggregateGroupByStockExchange() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT se.StockExchangeName, SUM(se.MarketCap)
       FROM STOCKEXCHANGE se
       GROUP BY se.StockExchangeName
       ORDER BY se.StockExchangeName ASC
       `
    );
    return result.rows;
  }).catch((error) => {
    console.error("Error in aggregateGroupByStockExchange:", error);
    return [];
  });
}

async function aggregateHavingStockExchange() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT se.StockExchangeName, SUM(se.Volume), AVG(se.Price)
       FROM STOCKEXCHANGE se
       GROUP BY se.StockExchangeName
       HAVING AVG(se.Price) > 15
       ORDER BY se.StockExchangeName ASC
       `
    );
    return result.rows;
  }).catch((error) => {
    console.error("Error in aggregateGrouByStockExchange:", error);
    return [];
  });
}

// async function nestedAggregationStockExchange() {
//   return await withOracleDB(async (connection) => {
//     const result = await connection.execute(
//       `SELECT se.StockExchangeName, SUM(se.Volume * se.Shares)
//        FROM STOCKEXCHANGE se
//        GROUP BY se.StockExchangeName
//        HAVING SUM(se.Volume * se.Shares) >= ALL (SELECT SUM(se2.Volume * se2.Shares)
//                                                         FROM STOCKEXCHANGE se2
//                                                         GROUP BY se2.StockExchangeName)
//        `
//     );
//     return result.rows;
//   }).catch((error) => {
//     console.error("Error in aggregateGrouByStockExchange:", error);
//     return [];
//   });
// }

async function nestedAggregationStockExchange() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT se.StockExchangeName, AVG(se.Price) AS AvgPrice
       FROM STOCKEXCHANGE se
       GROUP BY se.StockExchangeName
       HAVING AVG(se.Price) <= ALL (SELECT AVG(se2.Price)
                            FROM STOCKEXCHANGE se2
                            GROUP BY se2.StockExchangeName)
       `
    );
    return result.rows;
  }).catch((error) => {
    console.error("Error in aggregateGrouByStockExchange:", error);
    return [];
  });
}

// script will initiate table
// async function initiateStockExchangeLocation() {
//   return await withOracleDB(async (connection) => {
//     try {
//       await connection.execute(`DROP TABLE StockExchangeLocation`);
//     } catch (err) {
//       console.log("Table might not exist, proceeding to create...");
//     }
//
//     const result = await connection.execute(`
//             CREATE TABLE DEMOTABLE (
//                 id NUMBER PRIMARY KEY,
//                 name VARCHAR2(20)
//             )
//             CREATE TABLE StockExchangeLocation (
//                 StockExchangeName VARCHAR2(255),
//                 CurrencyLocation  VARCHAR2(255),
//                 PRIMARY KEY (StockExchangeName),
//                 FOREIGN KEY (CurrencyLocation)
//                   REFERENCES LocationAndCurrency (CurrencyLocation)
//                   ON DELETE CASCADE
//             )
//         `);
//     return true;
//   }).catch(() => {
//     return false;
//   });
// }

async function projectStockExchange(columns) {
  return await withOracleDB(async (connection) => {
    const allowedColumns = [
      "TICKERID",
      "PRICE",
      "MARKETCAP",
      "SHARES",
      "VOLUME",
      "STOCKEXCHANGENAME",
    ];
    const selected = columns.filter((col) =>
      allowedColumns.includes(col.toUpperCase())
    );

    if (selected.length === 0) {
      throw new Error("No valid columns selected");
    }

    const sql = `SELECT DISTINCT ${selected.join(", ")} FROM STOCKEXCHANGE`;
    const result = await connection.execute(sql);
    return result.rows;
  }).catch((err) => {
    console.error("projectStockExchange error:", err);
    return false;
  });
}

module.exports = {
  testOracleConnection,
  runSQLScript,
  fetchDemotableFromDb,
  initiateDemotable,
  insertDemotable,
  updateNameDemotable,
  countDemotable,
  fetchStockExchangeTableFromDb,
  //initiateStockExchange,
  insertStockExchange,
  updateStockExchange, // update everything
  selectStockWithConditions, //Selection
  fetchLocationAndCurrencyFromDb,
  //initiateLocationAndCurrency,
  insertLocationAndCurrency,
  countLocationAndCurrency,
  projectStockExchange,
  deleteLocationAndCurrency,
  deleteStockById,
  fetchStockExchangeLocationFromDb,
  joinLocationCurrencyExchange,
  //initiateStockExchangeLocation,
  divideStockExchange,
  aggregateGroupByStockExchange,
  aggregateHavingStockExchange,
  nestedAggregationStockExchange,
  fetchExchangeAndLocationFromDb,
};
