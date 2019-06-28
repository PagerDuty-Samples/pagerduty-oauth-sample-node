# pagerduty-oauth-sample-node
# *** TODO: BEFORE MAKING REPO PUBLIC REMOVE CLIENT_ID AND SECRET. :) ***
This is a sample project to illustrate how to build an OAuth flow in Node to authorize access to a user's PagerDuty account and data.

If you're an application builder, users of your application will need to access their PagerDuty data in a safe and secure way. This is done through an access token that can be [manually generated](https://support.pagerduty.com/docs/generating-api-keys) by the user in the PagerDuty UI. Or, you can provide an automated process by implementing an OAuth flow in your application.

## What is OAuth
*should this section be here?*

## Enable OAuth
To enable OAuth for your application, you'll first need to register your app for the PagerDuty API. Instructions for registering your application can be found in [this article (NEEDS LINK)]().

## Configure Sample
Once you have registered your App, there are a few key pieces of information you'll need to build your OAuth flow. In the **App Functionality** section you'll need to grab the value(s) for **Redirect URLs**, the **Client Id** and **Client Secret**. 

Take those three values and plug them into the `config.json` file in this project. 

```json
{
    "PD_CLIENT_ID": "<YOUR_CLIENT_ID_HERE>",
    "PD_CLIENT_SECRET": "<YOUR_CLIENT_SECRET_HERE>",
    "REDIRECT_URI": "http://localhost:5000/callback"
}
```
## Run Sample
To use this sample, you'll need to perform `npm install` at the root of the project directory. This will install three dependent packages [request](https://github.com/request/request), [node-pagerduty](https://github.com/kmart2234/node-pagerduty), and [express](https://github.com/expressjs/express).

To run the sample run `node index.js`. You should be greeted with a message that says, `Express server running on port 5000`. 

In your browser, go to `http://localhost:5000` where you'll see a link to `Connect to PagerDuty`. Click that to initiate the OAuth flow. You'll be taken to PagerDuty, where you'll be asked to login (if necessary), and then to authorize access of your PagerDuty account to the sample application.

If all goes well, the callback page on the sample should present a friendly welcome message, along with your avatar.

## How This Works
To initiate the flow make a `GET` call to `https://app.pagerduty.com/oauth/authorize` with the query string parameters listed in `authParams` as seen below.

```javascript
const baseOAuthUrl = "https://app.pagerduty.com/oauth";

const authParams = {
    response_type: 'code',
    client_id: config.PD_CLIENT_ID,
    redirect_uri: config.REDIRECT_URI
};
const authUrl = `${baseOAuthUrl}/authorize?${qs.stringify(authParams)}`;
```
The values for `client_id` and `redirect_uri` are taken from `config.json`, and `response_type` is important as it tells PagerDuty what type of flow you initiating. In this case, by setting `response_type: 'code'` we are kicking off an Authorization Grant Flow.

A successful response from calling the `/oauth/authorize` endpoint should result in PagerDuty calling the `redirect_uri` you specified, which is the `/callback` in this project. The function at the `/callback` endpoint is expecting PagerDuty to send a `code` in the query string. Using this `code` and the `PD_CLIENT_SECRET` in `config.json` you are now ready to request an Access Token. 

To request an access token from PagerDuty you'll `POST` the following token parameters in the body of the request to `https://app.pagerduty.com/oauth/token`. 

```javascript
const tokenParams = {
    grant_type: `authorization_code`,
    client_id: config.PD_CLIENT_ID,
    client_secret: config.PD_CLIENT_SECRET,
    code: req.query.code,
    redirect_uri: config.REDIRECT_URI
};
```

Using the [request](https://github.com/request/request) library this call looks like this:

```javascript
request.post(`${baseOAuthUrl}/token`, {
    json: tokenParams     
}, (error, tres, body) => {
    ...
}
```
Inside the callback function for the POST to `/token` we first check if there are any errors and log them to the console:
```javascript
if (error) {
    console.error(error);
    return;
}
```
Then, we use the [node-pagerduty](https://github.com/kmart2234/node-pagerduty) library to make a request to the [PagerDuty REST API](https://v2.developer.pagerduty.com/docs/rest-api) to make sure the newly acquired Access Token works.

```javascript
const pd = new pdClient(body.access_token, body.token_type);
pd.users.getCurrentUser({})
    .then(uRes => {
        res.send(`<h1>PagerDuty OAuth2 Sample</h1><div><img src='${JSON.parse(uRes.body).user.avatar_url}' /> <h2>Hello, ${JSON.parse(uRes.body).user.name}!</h2></div>`);
    })
    .catch(err => {
        console.log(err);
    });
```

Please post to the [Developer Forums](https://community.pagerduty.com/c/dev) if you get stuck or have any questions.

