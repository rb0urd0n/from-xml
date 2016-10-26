// #!/usr/bin/env mocha -R spec

/* jshint mocha:true */
/* jshint browser:true */

var hasRequire = ('undefined' !== typeof require);
var Global = ('undefined' !== typeof window) && window || this;
var fromXML = hasRequire ? require('../').fromXML : Global.fromXML;
var chai = hasRequire ? require('chai') : Global.chai;
var assert = chai && chai.assert;

describe('fromXML', function() {
  it('string', function() {
    assert.deepEqual(fromXML('foo'), 'foo');
  });

  it('element', function() {
    assert.deepEqual(fromXML('<foo>FOO</foo>'),
      {foo: "FOO"});
    assert.deepEqual(fromXML('<foo></foo>'),
      {foo: ""});
    assert.deepEqual(fromXML('<foo><bar>BAR</bar></foo>'),
      {foo: {bar: "BAR"}});
    assert.deepEqual(fromXML('<foo><bar>BAR</bar><baz>BAZ</baz></foo>'),
      {foo: {bar: "BAR", baz: "BAZ"}});
    assert.deepEqual(fromXML('<foo><bar>BAR</bar><bar>QUX</bar></foo>'),
      {foo: {bar: ["BAR", "QUX"]}});
    assert.deepEqual(fromXML('<foo><bar>BAR</bar><baz>BAZ</baz><baz>QUX</baz></foo>'),
      {foo: {bar: "BAR", baz: ["BAZ", "QUX"]}});
    assert.deepEqual(fromXML('<foo><bar>BAR</bar>FOO</foo>'),
      {foo: {bar: "BAR", "": "FOO"}});
    assert.deepEqual(fromXML('<foo>FOO<bar>BAR</bar>BAZ</foo>'),
      {foo: {"": ["FOO", {bar: "BAR"}, "BAZ"]}});
  });

  it('attributes', function() {
    assert.deepEqual(fromXML('<foo bar="BAR"></foo>'),
      {foo: {"@bar": "BAR"}});
    assert.deepEqual(fromXML("<foo bar='BAR'></foo>"),
      {foo: {"@bar": "BAR"}});
    assert.deepEqual(fromXML('<foo bar=BAR></foo>'),
      {foo: {"@bar": "BAR"}});
    assert.deepEqual(fromXML('<foo bar=""></foo>'),
      {foo: {"@bar": ""}});
    assert.deepEqual(fromXML("<foo bar=''></foo>"),
      {foo: {"@bar": ""}});
    assert.deepEqual(fromXML('<foo bar=></foo>'),
      {foo: {"@bar": ""}});
    assert.deepEqual(fromXML('<foo bar></foo>'),
      {foo: {"@bar": null}});
    assert.deepEqual(fromXML('<foo bar="BAR" baz="BAZ"></foo>'),
      {foo: {"@bar": "BAR", "@baz": "BAZ"}});
    assert.deepEqual(fromXML('<foo bar baz></foo>'),
      {foo: {"@bar": null, "@baz": null}});
  });

  it('attributes and child elements', function() {
    assert.deepEqual(fromXML('<foo bar="BAR">FOO</foo>'),
      {foo: {"@bar": "BAR", "": "FOO"}});
    assert.deepEqual(fromXML('<foo bar="BAR" baz="BAZ">FOO</foo>'),
      {foo: {"@bar": "BAR", "@baz": "BAZ", "": "FOO"}});
    assert.deepEqual(fromXML('<foo bar="BAR" baz="BAZ"><qux>QUX</qux></foo>'),
      {foo: {"@bar": "BAR", "@baz": "BAZ", "qux": "QUX"}});
    assert.deepEqual(fromXML('<foo bar="BAR" baz="BAZ"><qux>QUX</qux>QUUX</foo>'),
      {foo: {"@bar": "BAR", "@baz": "BAZ", "qux": "QUX", "": "QUUX"}});
    assert.deepEqual(fromXML('<foo bar="BAR" baz="BAZ"><qux>QUX</qux><quux>QUUX</quux></foo>'),
      {foo: {"@bar": "BAR", "@baz": "BAZ", "qux": "QUX", "quux": "QUUX"}});
  });

  it('empty element', function() {
    assert.deepEqual(fromXML('<foo/>'),
      {foo: null});
    assert.deepEqual(fromXML('<foo bar="BAR"/>'),
      {foo: {"@bar": "BAR"}});
    assert.deepEqual(fromXML('<foo><bar/></foo>'),
      {foo: {"bar": null}});
    assert.deepEqual(fromXML('<foo><bar/><baz/></foo>'),
      {foo: {"bar": null, "baz": null}});
    assert.deepEqual(fromXML('<foo><bar baz="BAZ"/></foo>'),
      {foo: {"bar": {"@baz": "BAZ"}}});
    assert.deepEqual(fromXML('<foo><bar baz/></foo>'),
      {foo: {"bar": {"@baz": null}}});
  });

  it('comment', function() {
    assert.deepEqual(fromXML('<foo><!bar></foo>'),
      {foo: {"!": "bar"}});
    assert.deepEqual(fromXML('<foo><!--bar--></foo>'),
      {foo: {"!": "--bar--"}});
    assert.deepEqual(fromXML('<foo><!bar><!baz></foo>'),
      {foo: {"!": ["bar", "baz"]}});
    assert.deepEqual(fromXML('<foo><!--bar--><!--baz--></foo>'),
      {foo: {"!": ["--bar--", "--baz--"]}});
    assert.deepEqual(fromXML('<foo><!bar><!--baz--></foo>'),
      {foo: {"!": ["bar", "--baz--"]}});
    assert.deepEqual(fromXML('<foo><!--L<G>A&Q"--></foo>'),
      {foo: {"!": '--L<G>A&Q"--'}});
  });

  it('xml declaration', function() {
    assert.deepEqual(fromXML('<?xml version="1.1"?>'),
      {"?": 'xml version="1.1"'});
    assert.deepEqual(fromXML(
      '<?xml version="1.0"?>\n' +
      '<!DOCTYPE foo SYSTEM "foo.dtd">\n' +
      '<foo>FOO</foo>\n'), {
      "?": 'xml version="1.0"',
      "!": 'DOCTYPE foo SYSTEM "foo.dtd"',
      "foo": "FOO"
    });
  });

  it('cdata', function() {
    assert.deepEqual(fromXML('<foo><![CDATA[FOO]]></foo>'),
      {"foo": "FOO"});
    assert.deepEqual(fromXML('<foo bar="BAR"><![CDATA[FOOBAR]]></foo>'),
      {"foo": {"@bar": "BAR", "": "FOOBAR"}});
    assert.deepEqual(fromXML('<foo><![CDATA[L<G>A&Q"]]></foo>'),
      {"foo": 'L<G>A&Q"'});
  });

  it('escape', function() {
    assert.deepEqual(fromXML('L&lt;G&gt;A&amp;Q&quot;'), 'L<G>A&Q"');
    assert.deepEqual(fromXML('<foo>L&lt;G&gt;A&amp;Q&quot;</foo>'), {foo: 'L<G>A&Q"'});
    assert.deepEqual(fromXML('<foo bar="L&lt;G&gt;A&amp;Q&quot;"></foo>'), {foo: {"@bar": 'L<G>A&Q"'}});
  });
});