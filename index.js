var Instapaper = require('instapaper')
  , _          = require('lodash')
  , util       = require('./util.js')
  , apiUrl     = 'https://www.instapaper.com/api/1.1'
;

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
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var auth   = dexter.provider('instapaper').credentials() 
          , client = Instapaper(auth.consumer_key, auth.consumer_secret, {apiUrl: apiUrl})
          , filter = step.input('title').first()
          , self   = this
        ;

        if (!auth) return self.fail('No instapaper auth credentials provided');

        client.setOAuthCredentials(auth.access_token, auth.access_token_secret);
        client.bookmarks.client.request('/folders/list')
            .then(function (folders) {
                folders = util.pickResult({ folders: folders }, pickOutputs);
                if(filter) {
                    folders = _.where(folders, { title: filter });
                }
                self.complete(folders);
            })
            .catch(function(err) {
                self.fail(err);
            });
    }
};
