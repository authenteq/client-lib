(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.howLongUntilLunch = {})));
}(this, (function (exports) { 'use strict';

  function connect(partnerId, scope, onConnect, onUserAuthenticate) {
    if (onConnect === undefined || onUserAuthenticate === undefined) {
      throw Error('Authenteq API::connect - both onConnect and onUserAuthenticate must be specified');
    }

    const socket = new SockJS(API_LOGIN);
    const stompClient = StompJS.over(socket);

    // Don't print debug messages into console
    stompClient.debug = function() {};

    stompClient.connect({}, () => {
      const transportUrl = socket._transport.url; // eslint-disable-line no-underscore-dangle
      const sessionId = /\/([^/]+)\/websocket/.exec(transportUrl)[1];

      stompClient.subscribe(`/queue/${sessionId}.authenticationId`, (response) => {
        const data = JSON.parse(response.body);
        const tokenId = data.id;

        // Handle tokenId to app logic, so app can display a QR code
        onConnect(tokenId);

        stompClient.subscribe(`/topic/authenticate.${tokenId}`, () => {

          // Handle tokenId back to app logic
          onUserAuthenticate(tokenId);
        });
      });

      stompClient.send('/app/partnerLogin', {}, JSON.stringify({
        partnerId: partnerId,
        scope: scope,
      }));
    });
  }

  exports.connect = connect;

  Object.defineProperty(exports, '__esModule', { value: true });

})));