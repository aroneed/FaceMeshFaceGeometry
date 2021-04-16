import http.server
import ssl

httpd = http.server.HTTPServer(("0.0.0.0", 8080), http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile="cacert.pem", keyfile="cakey.pem")

httpd.serve_forever()
