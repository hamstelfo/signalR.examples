

function prepareMessage(type, data) {
    var message = {
        type: type,
        data: data
    };

    return JSON.stringify(message);
}
