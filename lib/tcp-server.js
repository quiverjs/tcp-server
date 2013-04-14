
var net = require('net')
var nodeStream = require('quiver-node-stream')

var createTcpServer = function(config, socketHandler, callback) {
  var port = config.port
  var host = config.host
  var server = net.createServer(function(socket) {
    var readStream = nodeStream.createNodeReadStreamAdapter(socket)
    var writeStream = nodeStream.createNodeWriteStreamAdapter(socket)

    socketHandler(readStream, writeStream)
  })

  server.listen(port, host, function() {
    callback(null, server)
  })
}

module.exports = {
  createTcpServer: createTcpServer
}