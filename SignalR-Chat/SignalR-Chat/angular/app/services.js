'use strict';

app.factory('backendHubProxy', ['$rootScope', 'backendServerUrl', function ($rootScope, backendServerUrl) {

    function backendFactory(serverUrl, hubName) {
        var connection = $.hubConnection(backendServerUrl);
        var proxy = connection.createHubProxy(hubName);
        var invokesOverrides = [];

        connection.start().done(function () {
            console.log("conneecctaadoooorrr");
        });

        var chat2 = connection.chatHub;
        var chat3 = proxy.client;
        var chat = $.connection.chatHub; // chat va a ser nuestra referencia al hub.
        var username = "Angular User";

        // Definimos las funciones que luego son llamadas desde el servidor.
        chat.client.updateUsers = function (userCount, userList) {
            $('#onlineUsersCount').text('Online users: ' + userCount);
            $('#userList').empty();
            userList.forEach(function (username) {
                $('#userList').append('<li>' + username + '</li>');
            });
        }

        chat.client.broadcastMessage = function (username, message) {
            $('#messagesArea').append('<li><strong>' + username + '</strong>: ' + message);
        }

        chat.client.showError = function (message) {
            $('#theError').html(message);
            $('#theError').show();
        }
        chat.client.showOK = function (message) {
            $('#theSuccess').html(message);
            $('#theSuccess').show();
        }

        // En la conexión enviamos también el usuario, aunque podríamos haber hecho esto:
        //$.connection.hub.start();
        $.connection.hub.start().done(function () {
            chat.server.connect(username); // OJO A LOWER CAMEL CASE, IMPORTANTE!!! laPrimeraEnMinisculaYLuegoEnMayuscula
            overrideSetUp();
            /*invokesOverrides.forEach(function (theInvoke) {
                try {
                    chat.invoke(theInvoke.methodName)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                if (theInvoke.callback) {
                                    theInvoke.callback(result);
                                }
                            });
                        });
                }
                catch (err) {
                    console.log(err);
                }
            });*/
        });

        function overrideSetUp() {
            invokesOverrides.forEach(function (theInvoke) {
                try {
                    chat.invoke(theInvoke.methodName)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                if (theInvoke.callback) {
                                    theInvoke.callback(result);
                                }
                            });
                        });
                }
                catch (err) {
                    console.log(err);
                }
            });
            invokesOverrides = [];
        }

        $('#btnSendMessage').click(function () {
            var message = $('#userMessage').val();
            chat.server.send(message);
            $('#userMessage').val("");
        });

        $('#btnSendMessageJSon').click(function () {
            var message = prepareMessage(6, $('#userMessage2').val());
            chat.server.sendJSon(message);
            $('#userMessage2').val("");
            $('#theSuccess').hide();
            $('#theError').hide();
        });

        $('#btnSendMessageJSonError').click(function () {
            var message = $('#userMessage2').val();
            chat.server.sendJSon(message);
            $('#userMessage2').val("");
            $('#theSuccess').hide();
            $('#theError').hide();
        });

        function prepareMessage(type, data) {
            var message = {
                type: type,
                data: data
            };

            return JSON.stringify(message);
        }

        return {

            on: function (eventName, callback) {
                chat.on(eventName, function (result) {
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback(result);
                        }
                    });
                });
            },
            invoke: function (methodName, callback) {
                invokesOverrides.push({ methodName: methodName, callback: callback });
                if (chat && chat.state === $.signalR.connectionState.connected) {
                    overrideSetUp();
                }
            }
        };
    };

    return backendFactory;
}]);
