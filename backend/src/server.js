const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`Webshop API running on port ${env.port}`);
});
