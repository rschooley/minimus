TESTS = $(shell find tests -name "*-tests.js")

tests:
	NODE_ENV=test mocha $(TESTS)

.PHONY: tests