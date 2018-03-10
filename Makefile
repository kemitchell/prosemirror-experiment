build/browser.js: $(wildcard *.js)
	./node_modules/.bin/browserify index.js > build/browser.js
