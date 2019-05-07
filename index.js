const express = require('express');
const qs = require('qs');

const config = require('./config.json');
const app = express();
const port = 5000;

const baseAuthUrl = "http://app.pagerduty.com/oauth/authorize";

const authParams = {
    response_type: 'token',
    client_id: config.PD_CLIENT_ID,
    redirect_uri: "https://6d65c87d.ngrok.io/callback"
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

    // retrieve code and request access token

    // e01f9ba03c6d965467d3f95c124aa9569f60b922c1be0b3dc67e478f91c8b550
});

