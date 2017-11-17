'use strict';

var contracts = require('@monax/legacy-contracts');
var fs = require('fs');
var http = require('http');
var address = require('./epm.json').deployStorageK;
var abi = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));
var accounts = require('./accounts.json');
var chainUrl;
var manager;
var contract;
var server;

chainUrl = 'http://localhost:1337/rpc';

// Instantiate the contract object manager using the chain URL and the account
// data.
manager = contracts.newContractManagerDev(chainUrl,
  accounts.simplechain_full_000);

// Instantiate the contract object using the ABI and the address.
contract = manager.newContractFactory(abi).at(address);

// Create an HTTP server.
server = http.createServer(function (request, response) {
  var body;
  var value;

  switch (request.method) {
    case 'GET':
      console.log("Received request to get Idi's number.");

      // Get the value from the contract and return it to the HTTP client.
      contract.get(function (error, result) {
        if (error) {
          response.statusCode = 500;
        } else {
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.write(JSON.stringify(result['c'][0]));
        }

        response.end('\n');
      });

      break;

    case 'PUT':
      body = '';

      request.on('data', function (chunk) {
        body += chunk;
      });

      request.on('end', function () {
        value = JSON.parse(body);
        console.log("Received request to set Idi's number to " + value + '.');

        // Set the value in the contract.
        contract.set(value, function (error) {
          response.statusCode = error ? 500 : 200;
          response.end();
        })
      });

      break;

    default:
      response.statusCode = 501;
      response.end();
  }
});

// Tell the server to listen to incoming requests on the port specified in the
// environment.
server.listen(process.env.IDI_PORT, function () {
  console.log('Listening for HTTP requests on port ' + process.env.IDI_PORT + '.')
});
