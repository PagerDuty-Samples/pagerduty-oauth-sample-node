const express = require('express');
const qs = require('qs');

const config = require('./config.json');
const app = express();
const port = 5000;

const baseAuthUrl = "http://app.pagerduty.com/oauth/authorize";

const authParams = {
    response_type: 'token',
    client_id: config.PD_CLIENT_ID,
    redirect_uri: config.REDIRECT_URI
};

function buildAuthUrl(params) {
    return `${baseAuthUrl}?${qs.stringify(params)}`;
}

const authUrl = buildAuthUrl(authParams);

app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
});


app.get('/',  (req, res) => {
    res.send(`<a href="/auth">Connect to PagerDuty</a>`);
});

app.get('/auth', (req, res) => {
    res.redirect(authUrl);
});

app.get('/callback', (req, res) => {
    console.log(req);

    // TODO: retrieve code and request access token
});

