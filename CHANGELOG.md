# Changelog

All notable changes to this project will be documented in this file.


## [0.0.23] - 2021-04-13
### Fixed

- [Issue 14](https://github.com/msrivastav13/node-sf-bulk2/issues/14) - Set `maxBodyLength` and `maxContentLength` to Infinity for axios.

## [0.0.22] - 2021-04-12

### Fixed

- Typo - The method `abortbulkQueryJob` is now renamed to `abortBulkQueryJob`

## [0.0.21] - 2021-04-12

### Fixed

- Typo - The method `getBulkqueryResults` is now renamed to `getBulkQueryResults`

## [0.0.20] - 2021-04-12

### Fixed

- [Issue 11](https://github.com/msrivastav13/node-sf-bulk2/issues/11) - Typo error in `getInjestJobInfo` method name. Now the method name is `getIngestJobInfo`. 
- [Issue 10](https://github.com/msrivastav13/node-sf-bulk2/issues/10) Return `headers` and `response` for the `getBulkqueryResults` method.