const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.port || 4001;

app.listen(PORT, () =>{ 
    console.log(`Listening on port ${PORT}`); 
});