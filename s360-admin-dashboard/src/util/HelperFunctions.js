import { appConfig } from "../appConfig";

export const fetchBUs = async (bu) => {
  try {
    const response = await fetch(appConfig.backend_Api_Url + "/getBUs");
    const data = await response.json();

    return data["BUs"];
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchProducts = async (bu) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url + "/getProducts?bu=" + bu
    );
    const data = await response.json();

    return data["products"];
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchAccountList = async (bu, product) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/getAWSAccounts?bu=" +
        bu +
        "&product=" +
        product
    );
    const data = await response.json();
    return data["accounts"];
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchPillarScoresV2 = async (
  bu,
  product,
  account,
  region,
  env
) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/wa/v2/getPillarScores?bu=" +
        bu +
        "&product=" +
        product +
        "&accountId=" +
        account +
        "&region=" +
        region +
        "&env=" +
        env
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchHistoricalPillarScoresV2 = async (
  bu,
  product,
  account,
  region,
  fromDate,
  toDate,
  env
) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/wa/v2/getHistoricalPillarScores?bu=" +
        bu +
        "&product=" +
        product +
        "&accountId=" +
        account +
        "&region=" +
        region +
        "&from_date=" +
        fromDate +
        " 00:00" +
        "&to_date=" +
        toDate +
        " 23:59" +
        "&env=" +
        env
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchWAControlsList = async () => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url + "/wa/getWAControlsList"
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchTechStackDetails = async () => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url + "/wa/getTechStackDetails"
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

// const dbName = "CacheDB";
// const dataStore = "resourceData";
// const expirationStore = "expiration";

// // Initialize IndexedDB
// const initDB = () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(dbName, 1);

//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       if (!db.objectStoreNames.contains(dataStore)) {
//         db.createObjectStore(dataStore);
//       }
//       if (!db.objectStoreNames.contains(expirationStore)) {
//         db.createObjectStore(expirationStore);
//       }
//     };

//     request.onsuccess = (event) => {
//       resolve(event.target.result);
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// };

// // Add data to IndexedDB
// const addToDB = (db, store, key, value) => {
//   return new Promise((resolve, reject) => {
//     const transaction = db.transaction([store], "readwrite");
//     const objectStore = transaction.objectStore(store);
//     const request = objectStore.put(value, key);

//     request.onsuccess = () => {
//       resolve();
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// };

// // Retrieve data from IndexedDB
// const getFromDB = (db, store, key) => {
//   return new Promise((resolve, reject) => {
//     const transaction = db.transaction([store], "readonly");
//     const objectStore = transaction.objectStore(store);
//     const request = objectStore.get(key);

//     request.onsuccess = (event) => {
//       resolve(event.target.result);
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// };

// // Remove data from IndexedDB
// const removeFromDB = (db, store, key) => {
//   return new Promise((resolve, reject) => {
//     const transaction = db.transaction([store], "readwrite");
//     const objectStore = transaction.objectStore(store);
//     const request = objectStore.delete(key);

//     request.onsuccess = () => {
//       resolve();
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// };

// Fetch evaluation result data
// export const fetchEvalResultData = async (account, region) => {
//   const db = await initDB();
//   const cacheLimit = 5; // Limiting cache to store only the last 5 accounts
//   const generateCacheKey = (account, region) => `${account}_${region}`;

//   let expirationStoreData;
//   try {
//     expirationStoreData =
//       (await getFromDB(db, expirationStore, "expirations")) || {};
//   } catch (error) {
//     console.error("Error fetching expiration data:", error);
//     expirationStoreData = {};
//   }

//   const currentTimestamp = Date.now();
//   for (const cacheKey in expirationStoreData) {
//     if (currentTimestamp >= expirationStoreData[cacheKey]) {
//       try {
//         await removeFromDB(db, dataStore, cacheKey);
//       } catch (error) {
//         console.error(`Error removing expired cacheKey ${cacheKey}:`, error);
//       }
//       delete expirationStoreData[cacheKey];
//     }
//   }

//   let resourceData = [];
//   const cacheKey = generateCacheKey(account, region);

//   try {
//     resourceData = await getFromDB(db, dataStore, cacheKey);
//   } catch (error) {
//     console.error(`Error retrieving cacheKey ${cacheKey}:`, error);
//     resourceData = null;
//   }

//   if (resourceData) {
//     return resourceData;
//   } else {
//     try {
//       const response = await fetch(
//         appConfig.backend_Api_Url +
//           "/wa/getResourceDetails?accountId=" +
//           account +
//           "&region=" +
//           region
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch data: " + response.statusText);
//       }

//       const data = await response.json();
//       const jsonArray = JSON.parse(data);

//       // Cache the fetched data and set expiration time to 1 hour from now
//       await addToDB(db, dataStore, cacheKey, jsonArray);
//       expirationStoreData[cacheKey] = currentTimestamp + 3600000; // 1 hour in milliseconds
//       await addToDB(db, expirationStore, "expirations", expirationStoreData);

//       // Check cache limit and remove oldest entry if necessary
//       const cacheKeys = Object.keys(expirationStoreData);
//       if (cacheKeys.length > cacheLimit) {
//         const oldestCacheKey = cacheKeys.reduce((oldest, current) => {
//           return expirationStoreData[current] < expirationStoreData[oldest]
//             ? current
//             : oldest;
//         });
//         try {
//           await removeFromDB(db, dataStore, oldestCacheKey);
//         } catch (error) {
//           console.error(
//             `Error removing oldest cacheKey ${oldestCacheKey}:`,
//             error
//           );
//         }
//         delete expirationStoreData[oldestCacheKey];
//         await addToDB(db, expirationStore, "expirations", expirationStoreData);
//       }

//       return jsonArray;
//     } catch (error) {
//       console.error("Error fetching data from API:", error);
//       return null;
//     }
//   }
// };

// export const fetchEvalResultDataV2 = async (bu, product, account, region) => {
//   try {
//     const response = await fetch(
//       appConfig.backend_Api_Url +
//         "/wa/v2/getResourceDetails?bu=" +
//         bu +
//         "&product=" +
//         product +
//         "&accountId=" +
//         account +
//         "&region=" +
//         region
//       );
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching data from backend api", error);
//   }
// }

export const fetchPillarControlStatsData = async (
  bu,
  product,
  account,
  region,
  env
) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/wa/pillarControlStats?bu=" +
        bu +
        "&product=" +
        product +
        "&accountId=" +
        account +
        "&region=" +
        region +
        "&env=" +
        env
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchSeverityControlStatsData = async (
  bu,
  product,
  account,
  region,
  pillar,
  env
) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/wa/severityControlStats?bu=" +
        bu +
        "&product=" +
        product +
        "&accountId=" +
        account +
        "&region=" +
        region +
        "&pillar=" +
        pillar +
        "&env=" +
        env
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchControlResourceData = async (
  bu,
  product,
  account,
  region,
  control,
  env
) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/wa/controlResources?bu=" +
        bu +
        "&product=" +
        product +
        "&accountId=" +
        account +
        "&region=" +
        region +
        "&controlID=" +
        control +
        "&env=" +
        env
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchFRTicketsForControlForAccount = async (
  controlID,
  account,
  region
) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/wa/getFRTicketsForControlForAccount?control_id=" +
        controlID +
        "&account_id=" +
        account +
        "&region=" +
        region
    );
    // const data =[{"TktId": "1", "title": "Ticket 1", "status": "Open", "severity": "High", "created": "2021-09-01", "updated": "2021-09-01", "description": "This is a test ticket", "controlID": "1", "product": "Test Product", "account": "Test Account", "region": "us-east-1", "env": "Test Env", "assignee": "Test Assignee", "comments": [{"comment": "This is a test comment", "created": "2021-09-01", "author": "Test Author"}]},
    //              {"TktId": "2", "title": "Ticket 2", "status": "Open", "severity": "Medium", "created": "2021-09-01", "updated": "2021-09-01", "description": "This is a test ticket", "controlID": "1", "product": "Test Product", "account": "Test Account", "region": "us-east-1", "env": "Test Env", "assignee": "Test Assignee", "comments": [{"comment": "This is a test comment", "created": "2021-09-01", "author": "Test Author"}]}];
    const data = response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
};

export const fetchFRTicketsForControlForProduct = async (
  controlID,
  product,
  region
) => {
  try {
    const response = await fetch(
      appConfig.backend_Api_Url +
        "/wa/getFRTicketsForControlForProduct?control_id=" +
        controlID +
        "&product=" +
        product+
        "&region=" +
        region
    );
    const data = response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from backend api", error);
  }
}