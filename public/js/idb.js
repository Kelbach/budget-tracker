let db;
const request = indexedDB.open('budget-tracker', 1);


request.onupgradeneeded = function(event) {
    
    const db = event.target.result;
     
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
      uploadBudget();
    }
};
  
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

function saveRecord(record) { 
    const transaction = db.transaction(['new_budget'], 'readwrite');
    
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    budgetObjectStore.add(record);
}

function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access your object store
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
  
    // more to come...
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['new_budget'], 'readwrite');
            // access the new_budget object store
            const budgetObjectStore = transaction.objectStore('new_budget');
            // clear all items in your store
            budgetObjectStore.clear();

            alert('All saved transactions has been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
};

// listen for app coming back online
window.addEventListener('online', uploadBudget);