var Instapaper = require('instapaper'),
    _ = require('lodash'),
    util = require('./util.js'),
    apiUrl = 'https://www.instapaper.com/api/1.1';

var pickOutputs = {
        '-': {
            keyName: 'folders',
            fields: {
                'folder_id': 'folder_id',
                'title': 'title'
            }
        }
    };

module.exports = {

    /**
     * Authorize module.
     *
     * @param dexter
     * @returns {*}
     */
    authModule: function (dexter) {
        var auth = {},
            consumerKey = dexter.environment('instapaper_consumer_key'),
            consumerSecret = dexter.environment('instapaper_consumer_secret'),

            username = dexter.environment('instapaper_username'),
            password = dexter.environment('instapaper_password');

        if (consumerKey && consumerSecret && username && password) {
            auth.consumerKey = consumerKey;
            auth.consumerSecret = consumerSecret;
            auth.user = username;
            auth.pass = password;

        } else {
            this.fail('A [instapaper_consumer_key, instapaper_consumer_secret, instapaper_username, instapaper_password] environment need for this module.');
        }
        
        return _.isEmpty(auth)? false : auth;
    },
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var auth = this.authModule(dexter),
            client = Instapaper(auth.consumerKey, auth.consumerSecret, {apiUrl: apiUrl});

        if (!auth)
            return;

        client.setUserCredentials(auth.user, auth.pass);
        client.bookmarks.client.request('/folders/list').then(function (folders) {

            this.complete(util.pickResult({ folders: folders }, pickOutputs));

        }.bind(this)).catch(function(err) {
            this.fail(err);

        }.bind(this));
    }
};
