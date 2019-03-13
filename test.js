const https = require('https')
https.get('https://raw.githubusercontent.com/jrainlau/kuuga/master/release/package.json', (res) => {
  console.log(res)
}).on('error', (e) => {
  console.log(e)
})
