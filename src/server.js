//server.js// --created by Florian Lepage
const express = require('express')
const app = express()
const port = 3000
const stripe = require('stripe')('sk_test_51HiWyuF6q8U5dXkGJAEJQ59bXU8tRZ74WbBG5pGD4pFeJeYK9Zekhk1sJiy9FA8ngLMLrM7PABdy2C6EMHNbnHIm00aFPQM8Pu');

app.get('/', (req, res) => {
    res.send('Hello World!')
});


stripe.products.list({
    active: true
}).then(respond => {
   for(let i = 0; respond.data.length > i; i++) {
       app.get(`/${respond.data[i].id}/`, (req, res) => {
           res.send(`${respond.data[i].id} is ${respond.data[i].name}`)
       });
   }
}).catch(console.error);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
