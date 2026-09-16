const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`asia26 API listening on port ${port}`);
});
