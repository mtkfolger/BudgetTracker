const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB
let db;
//request is the object that will hold our db (object)
const request = indexedDB.open("budget", 1);
//triggered on DB creation
request.onsuccess = ({ target }) => {//target is "event.target that the change happened on"
  db = target.result;
  console.log(db.result)
  // check if app is online before reading from db
  if (navigator.onLine) {//navigator works in window object to check to see if online
    checkDatabase();
  }
};
//after on success
//triggered in order to make changes (object stores, indexes, keyPath)
//3:14:00
request.onupgradeneeded = ({ target }) => {//event.target is the target that the change happened on
  let db = target.result;
  //"pending" instance of a change; Name of of object store so needs to be consistent
  db.createObjectStore("pending", { autoIncrement: true });
};
//error handling
request.onerror = function(event) {
  console.log("Holy cow! " + event.target.errorCode);
};
function saveRecord(record) {//record just means an object
  const transaction = db.transaction(["pending"], "readwrite"); //array of object stores you want to work with, "readwrite" means crud, readonly is readonly
  const store = transaction.objectStore("pending");// adds "pending" DB instanct to object store
//new crud transaction is opened and adds the object to object store
  store.add(record);
}
function checkDatabase() { ///funnels through post in index.js
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {//if there are objects in pending, let's get them to our DB
      fetch("/api/transaction/bulk", {//fetch built int all modern browsers like Ajax
        method: "POST",//another way to make http calls
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        return response.json();
      })
      .then(() => {
        // delete records if successful
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}
// listen for app coming back online
window.addEventListener("online", checkDatabase);