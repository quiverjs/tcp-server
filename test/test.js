
var net = require('net')
var should = require('should')
var createTcpServer = require('../lib/tcp-server').createTcpServer

describe('tcp server test', function() {
  it('hello world test', function(callback) {
    var socketHandler = function(readStream, writeStream) {
      writeStream.write('hello from server')

      var readBuffer = ''

      var onHelloFromClient = function() {
        writeStream.write('bye from server')
        writeStream.closeWrite()
        onHelloFromClient = null
      }

      var doPipe = function() {
        readStream.read(function(streamClosed, data) {
          if(streamClosed) return

          readBuffer += data
          if(readBuffer == 'hello from client') {
            onHelloFromClient()
          }
          doPipe()
        })
      }
      doPipe()
    }

    var serverConfig = { port: 8004 }
    createTcpServer(serverConfig, socketHandler, function(err, server) {
      if(err) throw err

      var notYet = function() {
        throw new Error('not yet')
      }

      var onHelloFromServer = notYet
      var onByeFromServer = notYet
      var onEnd = notYet
      var replyBuffer = ''

      var client = net.connect(serverConfig, function() {
        onHelloFromServer = function() {
          client.write('hello from client')
          onByeFromServer = function() {
            onEnd = callback
          }
        }
      })

      client.on('data', function(data) {
        replyBuffer += data
        if(replyBuffer == 'hello from server') {
          onHelloFromServer()
          replyBuffer = ''
        } else if(replyBuffer == 'bye from server') {
          onByeFromServer()
          replyBuffer = ''
        }
      })

      client.on('end', function() {
        onEnd()
      })
    })
  })
})