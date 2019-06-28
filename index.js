const express = require('express');
const qs = require('qs');
const request = require('request');
const pdClient = require('node-pagerduty');

const config = require('./config.json');
const app = express();
const port = 5000;

// baseOAuthUrl -- endpoint for initiating an OAuth flow
const baseOAuthUrl = "https://app.pagerduty.com/oauth";

// parameters to send to the `oauth/authorize` endpoint to initiate flow
const authParams = {
    response_type: 'code',
    client_id: config.PD_CLIENT_ID,
    redirect_uri: config.REDIRECT_URI
};
const authUrl = `${baseOAuthUrl}/authorize?${qs.stringify(authParams)}`;

app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
});

app.get('/',  (req, res) => {
    res.send(`<h1>PagerDuty OAuth2 Sample</h1><a href="/auth">Connect to PagerDuty</a>`);
});

app.get('/auth', (req, res) => {
    res.redirect(authUrl);
});

app.get('/callback', (req, res) => {
    // retrieve code and request access token
    const tokenParams = {
        grant_type: `authorization_code`,
        client_id: config.PD_CLIENT_ID,
        client_secret: config.PD_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: config.REDIRECT_URI
    };

    request.post(`${baseOAuthUrl}/token`, {
        json: tokenParams     
    }, (error, tres, body) => {
        if (error) {
            console.error(error);
            return;
        }
        // Use the access token to make a call to the PagerDuty API
        const pd = new pdClient(body.access_token, body.token_type);
        pd.users.getCurrentUser({})
            .then(uRes => {
                res.send(`<h1>PagerDuty OAuth2 Sample</h1><div><img src='${JSON.parse(uRes.body).user.avatar_url}' /> <h2>Hello, ${JSON.parse(uRes.body).user.name}!</h2></div>`);
            })
            .catch(err => {
                console.log(err);
            });
    });
});

