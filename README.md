# chattadata.js
ChattaData JavaScript Client

## install
```sh
npm install chattadata
```

## usage
```js
const { ChattaData } = require("chattadata");

const client = await ChattaData.init({
    username: process.env.CHATTADATA_USERNAME,
    password: process.env.CHATTADATA_PASSWORD
});

// get an array of column names
await client.get_column_names({ id: "abcd-1234" });
["ID", "Description", "Created At", ...]

// get dataset as a csv string
await client.get_csv({ id: "abcd-1234" });
"Field1,Field2,Field3\na,b,c"

// update/append the current dataset with the csv string
await client.post_csv({ id: "abcd-1234", csv: "ID,Description,\"Created At\"..." });

// replace the current dataset with the csv string
await client.put_csv({ id: "abcd-1234", csv: "ID,Description,\"Created At\"..." });
```