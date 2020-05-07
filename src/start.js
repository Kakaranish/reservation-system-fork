import app from './app';
import { connectProdDb } from './mongo-utils';

connectProdDb();

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});