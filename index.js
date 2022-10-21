const express = require('express');
const qs = require('qs');
const request = require('request');
const pdClient = require('node-pagerduty');

const config = require('./config.json');
const app = express();
const port = process.env.PORT || 5000;
const stateParm = "yourState";

// baseOAuthUrl -- endpoint for initiating an OAuth flow
const baseOAuthUrl = "https://app.pagerduty.com/oauth";

// parameters to send to the `oauth/authorize` endpoint to initiate flow
const authParams = {
    response_type: 'code',
    client_id: config.PD_CLIENT_ID,
    redirect_uri: config.REDIRECT_URI,
    state: stateParm // optional
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
    // first check if the request contains any errors and display them to the browser
    if (req.query.error) {
        res.send(`<h1>PagerDuty OAuth2 Sample</h1><div style="color:red;">Error: ${req.query.error}</div><div style="color:red;">${req.query.error_description}</div>`);
        return;
    }
    // printing state that was passed in during the initial auth request
    console.log(`state: ${req.query.state}`);

    const tokenParams = {
        grant_type: `authorization_code`,
        client_id: config.PD_CLIENT_ID,
        client_secret: config.PD_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: config.REDIRECT_URI
    };
    
    // retrieve code and request access token
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

app.get('/refresh', (req, res) => {
    // first check if the request contains any errors and display them to the browser
    if (req.query.error) {
        res.send(`<h1>PagerDuty OAuth2 Sample</h1><div style="color:red;">Error: ${req.query.error}</div><div style="color:red;">${req.query.error_description}</div>`);
        return;
    }
    // printing state that was passed in during the initial auth request
    console.log(`state: ${req.query.state}`);

    const tokenParams = {
        grant_type: `refresh_token`,
        client_id: config.PD_CLIENT_ID,
        client_secret: config.PD_CLIENT_SECRET,
        refresh_token: req.query.refresh_token
    };

    // retrieve code and request access token
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
