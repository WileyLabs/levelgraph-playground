# [LevelGraph Playground](http://wileylabs.github.io/levelgraph-playground)

Playing with [LevelGraph](http://levelgraph.io). Looking for the best way to keep, manage, and query
[JSON-LD](http://json-ld.org/), [N3](https://www.w3.org/TeamSubmission/n3/), and [Turtle](https://www.w3.org/TR/turtle/) documents.

## Local Usage

```bash
$ npm i -g browserify # if you haven't
$ npm i
$ npm run build
$ python -m SimpleHTTPServer # or something similar for your environment
```

Visit `http://localhost:8000` (if you did that python thing).

...do some code...

```bash
$ npm run build
```

Reload your browser.

Rinse. Repeat.

## HTTPS Testing

Much more complex setup:

1. make a certificate
> openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -keyout ~/.ssh/localhost.key -out ~/.ssh/localhost.crt
2. install a dev server
> npm i -g http-server
3. run the dev server using the certificate
> http-server --ssl --cert ~/.ssh/localhost.crt --key ~/.ssh/localhost.key
4. visit the site in your browser
> https://localhost:8080
5. tell your browser that you trust yourself (or at least the certificate you
just made)
> ...involves clicking lots of buttons in different places depending on the
> browser...sorry...
6. hopefully it worked

## License

Apache License 2.0
