$(function () {
    var chat = $.connection.chatHub; // chat va a ser nuestra referencia al hub.
    var username;
    do {
        username = prompt("Insert your username: ");
    } while (username === null || username === "");

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
    });

    $('#btnSendMessage').click(function(){
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

});

