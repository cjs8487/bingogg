# PlayBingo Websocket
WebSockets are the primary communication method of choice for applications that
need to both send data to the server and receive data from the server.

## Versioning
**While PlayBingo is still in its beta stages, we make no guarantees about the
portability of the websocket protocol between versions. The protocol version
will not be incremented according to the normal rules as documented here unless
there is an extreme case.**

###### Current Protocol Version: v1

We strive to avoid making breaking changes to the websocket protocol whenever
possible. The protocol is versioned using a form of semantic versioning.
Whenever a breaking change to the protocol is introduced, the version number
will be incremented. If significant changes are made within a version, without
amounting to a breaking change, we may increment the minor version. The
websocket protocol versioning does not use patch versions, nor will new features
necessarily cause a version change.

## Connecting to a PlayBingo Websocket
Creating and establishing a connection to the server via websocket is a multistep process.
1. Obtain connection credentials for the room you want to join. Usually, you
   will only need the room password for this. You will also need a nickname
   that identifies your connection. Nicknames do not need to be unique, and have
   no character set restrictions.
2. Send a POST request to /api/rooms/{slug}/authorize, where slug is the unique
   slug of the room to authorize for, providing the password in the request
   body.
3. Create the websocket connection to /socket/{slug}
4. Send a join message with your authorization token and nickname.

Once you are authorized for a room, your authorization does not expire as long
as the room is active and the token is not revoked. Authorization tokens are 
not specific to a connection, however they do uniquely identify your user 
within the room, so you should refrain from using the same authorization token 
for multiple connections. Additionally, tokens are associated with the session
for the which they were created, which means any connection can act as you if
that session was associated with a login session. We make no guarantees that
this will continue to work this way in the future; we may at any point choose 
to lock an authorization token to the first connection to join with it.

The server will periodically close connections that it identifies
as inactive. Connections that are actively interacting with the room are not at
risk of being auto-closed, however in some cases spectator connections may be,
if the connection remains open for an extended period. If the server determines
that a connection needs to be closed, it will close the connection via the
normal websocket standard, which should result in your connection being informed
of the closure. If your connection is closed by the server, you need to repeat
the authorization process. Unfortunately, this will result in a new identity
being generated for your connection, which will remove any identity mapped data
(currently this only impacts racetime.gg integration). In the future this will
likely change, and there will be a way to regain access to your existing
identity.

### What Next?
Once you've sent the join message, you should receive a `connected` message which
both indicates a successful join, and will also give you the current room state.

## Message Anatomy
PlayBingo encodes messages in JSON. Currently, there are no plans to support any
other form of encoding.

### Server Messages
Server messages are messages sent by the server, usually in response to one or
more actions happening. In Protocol v1, all server messages are sent to all open
connections at the time of the triggering action, with the exception of
`connected` messages (which are only sent to the newly connected client).

Server messages all take the same basic format
```json
{
    "action": "actionType",
}
```
where action indicates the type of action the server is communicating, which
also dictates what data is in the message. Additionally, any server message may
also include an array of players, which indicates that player information
changed as a result of the triggering action.
```json
{
    "players": []
}
```

For simplicity, the sample messages in this documentation do not include the
player array.

#### Connected
A connected message sent in response to a successful `join` action. It contains
identity information for your connection, as well the current status of the room.

##### Sample Message
```json
{
    "action": "connected",
    "board": {
        "board": [
            {
                "goal": "Complete a goal",
                "description": "Complete any goal by any means necessary",
                "colors": [
                    "blue",
                    "#00ffaa"
                ]
            }
        ]
    },
    "chatHistory": [],
    "nickname": "websocket player",
    "color": "blue",
    "roomData": {
        "name": "Websocket Documentation",
        "game": "PlayBingo",
        "slug": "ferocious-bingo-4821",
        "gameSlug": "bingo"
        "racetimeConnection": {
            "gameActive": false
        }
    }
}
```

### Room Actions
Room actions are messages sent by clients to indicate an attempt to change the
state of the room. The server may reject the state change for any reason, with
or without notification. Typically, the absence of a corresponding server
message in response to a room action is sufficient indication that the action
failed, though not all actions will result in messages.

Room actions take a very similar form to server messages, with the same base
form.
```json
{
    "action": "actionType",
}
```
`action` here once again represents what action is being taken and must be one
of the values known to the server. Unknown values in the `action` field will
result in the message being ignored.

Many actions require additional inputs to be provided. Whenever additional
inputs are required, they are provided in the `payload` field. The structure of
the field varies from action to action, the specifics of each one are discussed
in the following sections