const express = require('express');

const port = 3000;
const app = express();

app.use(express.static('public'));
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));