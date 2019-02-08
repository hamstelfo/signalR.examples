using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SignalR_Chat.Hubs
{
    //Cada vez q un cliente se contecte, se crea una nueva instancia.
    public class ChatHub : Hub // Esta clase que hereda de Hub, nos permite exponer al cliente los métodos que aquí definamos.
    {

        public static List<Client> ConnectedUsers { get; set; } = new List<Client>();
        public void Connect(string username)
        {
            Client c = new Client()
            {
                Username = username,
                ID = Context.ConnectionId // Nos quedamos con su id por si queremos mandarle algo extra en otro momento o algo.
            };
            ConnectedUsers.Add(c); // Lo agregamos a la lista de usuarios conectados.
            // Aquí podemos llamar a todos los clientes (All)            
            Clients.All.updateUsers(ConnectedUsers.Count(), ConnectedUsers.Select(u => u.Username));
            // Pero también podríamos llamar sólo al que ha realizado la conexión con:
            // Clients.Caller.[nombre del método que EL CLIENTE EXPONE AL SERVIDOR] >> es decir que podemos exponer métodos de cliente al servidor además del servidor al cliente.
            // updateUsers debe estar declarado en el cliente, en este caso...
        }


        public void Send(string message)
        {
            var sender = ConnectedUsers.First(u => u.ID.Equals(Context.ConnectionId));
            Clients.All.broadcastMessage(sender.Username, message);
        }

        // Otra forma de hacer esto, en vez de mandarle el msg a todos, podría ser sólo a uno (por username). No lo explica del todo, pero weno..
        public void SendToOneUser(string message, string username)
        {
            var sender = ConnectedUsers.First(u => u.ID.Equals(Context.ConnectionId));
            // Buscamos el ID de conexión para poder mandarle el mensaje.
            Clients.Client(ConnectedUsers.FirstOrDefault(u => u.Username.Equals(username)).ID).Send(message);            
        }

        // SignalR ofrece 3 métodos para controlar el ciclo de vida de conexión de los clientes: onConnected, onDisconnected y onRecconected (se llaman automáticamente).
        // Este método está sobreescrito.
        // OnConnected no puede recibir parámetros, así que creamos Connect (arriba) para poder almacenar el username.
        public override Task OnDisconnected(bool stopCalled)
        {
            // Buscamos el usuario q se ha desconectado.
            var disconnectedUser = ConnectedUsers.FirstOrDefault(c => c.ID.Equals(Context.ConnectionId));
            ConnectedUsers.Remove(disconnectedUser); // Lo borramos de la lista.
            Clients.All.updateUsers(ConnectedUsers.Count(), ConnectedUsers.Select(u => u.Username)); // Actualizamos la lista de todos los demás que sí siguen conectados.
            return base.OnDisconnected(stopCalled);
        }
    }


    public class Client
    {
        public string Username { get; set; }

        public string ID { get; set; }
    }

}
