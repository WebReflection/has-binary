/* global describe it Blob */

var hasBinary = require('./');
var assert = require('better-assert');
var fs = require('fs');

describe('has-binarydata', function () {
  it('should work with buffer', function () {
    assert(hasBinary(fs.readFileSync('./test.js')));
  });

  it('should work with an array that does not contain binary', function () {
    var arr = [1, 'cool', 2];
    assert(!hasBinary(arr));
  });

  it('should work with an array that contains a buffer', function () {
    var arr = [1, new Buffer('asdfasdf', 'utf8'), 2];
    assert(hasBinary(arr));
  });

  it('should work with an object that does not contain binary', function () {
    var ob = {a: 'a', b: [], c: 1234, toJSON: '{"a": "a"}'};
    assert(!hasBinary(ob));
  });

  it('should work with an object that contains a buffer', function () {
    var ob = {a: 'a', b: new Buffer('abc'), c: 1234, toJSON: '{"a": "a"}'};
    assert(hasBinary(ob));
  });

  it('should work with an object whose toJSON() returns a buffer', function () {
    var ob = {a: 'a', b: [], c: 1234, toJSON: function () { return new Buffer('abc'); }};
    assert(hasBinary(ob));
  });

  it('should work with an object by calling toJSON() once', function () {
    var ob = { toJSON: function () { return this; } };
    assert(!hasBinary(ob));
  });

  it('should work with null', function () {
    assert(!hasBinary(null));
  });

  it('should work with undefined', function () {
    assert(!hasBinary(undefined));
  });

  it('should work with a complex object that contains undefined and no binary', function () {
    var ob = {
      x: ['a', 'b', 123],
      y: undefined,
      z: {a: 'x', b: 'y', c: 3, d: null},
      w: []
    };
    assert(!hasBinary(ob));
  });

  it('should work with a complex object that contains undefined and binary', function () {
    var ob = {
      x: ['a', 'b', 123],
      y: undefined,
      z: {a: 'x', b: 'y', c: 3, d: null},
      w: [],
      bin: new Buffer('xxx')
    };
    assert(hasBinary(ob));
  });

  if (global.ArrayBuffer) {
    it('should work with an ArrayBuffer', function () {
      assert(hasBinary(new ArrayBuffer()));
    });
  }

  if (global.Blob) {
    it('should work with a Blob', function () {
      assert(hasBinary(new Blob()));
    });
  } else {
    it('should not crash if global Blob is not a function', function () {
      global.Blob = [ 1, 2, 3 ];
      assert(!hasBinary(global.Blob));
    });
  }

  it('should work with recursive structures and no blobs', function () {
    var child = {
      foo: 'bar'
    };
    var parent = {
      zoo: 'gar',
      child: child
    };
    child.parent = parent;
    assert(!hasBinary(child));
  });

  it('should work with recursive structures and blobs', function () {
    var child = {
      foo: 'bar'
    };
    var parent = {
      zoo: 'gar',
      child: child,
      blob: new Buffer('xxx')
    };
    child.parent = parent;
    assert(hasBinary(child));
  });
});
