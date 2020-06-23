import app from './app';
import { connectDb } from './mongo-utils';

connectDb();

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});