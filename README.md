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

## Initiate Flow
To initiate the flow make a `GET` call to `https://app.pagerduty.com/oauth/authorize` with the query string parameters listed in `authParams` as seen below.

```javascript
const authParams = {
    response_type: 'code',
    client_id: config.PD_CLIENT_ID,
    redirect_uri: config.REDIRECT_URI
};
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

In our project we want to make sure the newly acquired Access Token works, so we use the [node-pagerduty](https://github.com/kmart2234/node-pagerduty) library to make a request on the REST API. To show which account the access token belongs to, our sample gets the current user. 

## Run Sample
To use this sample, you'll need to perform `npm install` at the root of the project directory. This will install three dependent packages [request](https://github.com/request/request), [node-pagerduty](https://github.com/kmart2234/node-pagerduty), and [express](https://github.com/expressjs/express).

To run the sample run `node index.js`. You should be greeted with a message that says, `Express server running on port 5000`. 

In your browser, go to `http://localhost:5000` where you'll see a link to `Connect to PagerDuty`. Click that to initiate the OAuth flow. You'll be taken to PagerDuty, where you'll be asked to login (if necessary), and then to authorize access of your PagerDuty account to the sample application.

If all goes well, the callback page on the sample should present a friendly welcome message, along with your avatar.

If all did not go well, or if you have any questions please post to the [Developer Forums](https://community.pagerduty.com/c/dev).

