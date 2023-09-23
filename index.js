import express from 'express';
import cors from 'cors';

const app =express();
const port =1222;
app.use(cors());

app.get('/',(req,res)=>{
    res.json({title:"this is a server for devrevTask"})
})

app.listen(port,()=>{
    console.log(`The server is listening on ${port}`);
})
