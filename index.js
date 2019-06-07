const express = require('express');
const qs = require('qs');
const request = require('request');
const pdClient = require('node-pagerduty');

const config = require('./config.json');
const app = express();
const port = 5000;


const baseAuthUrl = "http://app.pagerduty.com/oauth";

const authParams = {
    response_type: 'code',
    client_id: config.PD_CLIENT_ID,
    redirect_uri: config.REDIRECT_URI
};

function buildAuthUrl(params) {
    return `${baseAuthUrl}/authorize?${qs.stringify(params)}`;
}

const authUrl = buildAuthUrl(authParams);

function getAccessToken(tParams) {
    let pdToken = {};

    request.post(`${baseAuthUrl}/token`, {
        json: tParams     
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            return;
        }
        // test token
        const pd = new pdClient(body.access_token, body.token_type);
        pd.schedules.listSchedule({})
            .then(res => {
                console.log(res.body);
            })
            .catch(err => {
                console.log(err);
            });
        
    });
}

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
    console.log(req.query);

    // retrieve code and request access token
    const tokenParams = {
        grant_type: `authorization_code`,
        client_id: config.PD_CLIENT_ID,
        client_secret: config.PD_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: config.REDIRECT_URI
    };

    getAccessToken(tokenParams);
});

