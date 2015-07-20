should          = require("should")
libstring       = require("../dist/libstring")

StringPrototype = libstring.prototypes
StringFormatter = libstring.StringFormatter

describe("libstring", ->
    TEST_STRING       = "libstring test"
    TEST_HTML         = "<test>libstring (\"'format' &amp; 'polyfill'\")</test>"
    TEST_ESCAPED_HTML = "&lt;test&gt;libstring (&quot;&#039;format&#039; &amp;amp; &#039;polyfill&#039;&quot;)&lt;/test&gt;"
    DECIMAL_NUMBER    = 10761.937554
    INTEGER_NUMBER    = 8395
    DATE              = new Date(2009, 5, 15, 13, 45, 30, 0)

    it("should extend prototype and constructor of String", ->
        String.format.should.be.equal(StringFormatter.invoke)
        String.prototype.should.have.properties(StringPrototype)
    )

    describe("#includes(String, Number?)", ->
        it("should return true when the value is found", ->
            StringPrototype.includes.call(TEST_STRING, "string").should.be.true()
            StringPrototype.includes.call(TEST_STRING, "string", 3).should.be.true()
        )

        it("should return false when the value is not found", ->
            StringPrototype.includes.call(TEST_STRING, "number").should.be.false()
            StringPrototype.includes.call(TEST_STRING, "string", 10).should.be.false()
        )
    )

    describe("#startsWith(String, Number?)", ->
        it("should return true when the value starts with the string", ->
            StringPrototype.startsWith.call(TEST_STRING, "lib").should.be.true()
            StringPrototype.startsWith.call(TEST_STRING, "string", 3).should.be.true()
        )

        it("should return false when the value does not start with the string", ->
            StringPrototype.startsWith.call(TEST_STRING, "string").should.be.false()
            StringPrototype.startsWith.call(TEST_STRING, "string", 10).should.be.false()
        )
    )

    describe("#endsWith(String, Number?)", ->
        it("should return true when the value ends with the string", ->
            StringPrototype.endsWith.call(TEST_STRING, "test").should.be.true()
            StringPrototype.endsWith.call(TEST_STRING, "string", 9).should.be.true()
        )

        it("should return false when the value does not end with the string", ->
            StringPrototype.endsWith.call(TEST_STRING, "string").should.be.false()
            StringPrototype.endsWith.call(TEST_STRING, "string", 14).should.be.false()
        )
    )

    describe("#repeat(String, Number)", ->
        it("should return a new string that contains the specified number of copies of the string", ->
            StringPrototype.repeat.call(TEST_STRING, 3).should.be.equal(TEST_STRING + TEST_STRING + TEST_STRING)
        )

        it("should throw an error when the repeat count is negative or Infinity", ->
            (-> StringPrototype.repeat.call(TEST_STRING, -1)).should.throw()
            (-> StringPrototype.repeat.call(TEST_STRING, Infinity)).should.throw()
        )
    )

    describe("#escapeHTML(String)", ->
        it("should return an HTML-escaped string", ->
            StringPrototype.escapeHTML.call(TEST_HTML).should.be.equal(TEST_ESCAPED_HTML)
        )
    )

    describe("#unescapeHTML(String)", ->
        it("should return an HTML-unescaped string", ->
            StringPrototype.unescapeHTML.call(TEST_ESCAPED_HTML).should.be.equal(TEST_HTML)
        )
    )

    describe("#format(String, Number)", ->
        it("should return a currency string represents the Number", ->
            StringFormatter.invoke("{0:C}", DECIMAL_NUMBER).should.be.equal("¥10,762")
            StringFormatter.invoke("{0:C}", INTEGER_NUMBER).should.be.equal("¥8,395")
        )

        it("should return a decimal string represents the Number", ->
            StringFormatter.invoke("{0:D6}", INTEGER_NUMBER).should.be.equal("008395")
        )

        it("should return an exponential string represents the Number", ->
            StringFormatter.invoke("{0:e03}", DECIMAL_NUMBER).should.be.equal("1.076e+4")
            StringFormatter.invoke("{0:E03}", INTEGER_NUMBER).should.be.equal("8.395E+3")
        )

        it("should return a fixed-point string represents the Number", ->
            StringFormatter.invoke("{0:F04}", DECIMAL_NUMBER).should.be.equal("10761.9376")
            StringFormatter.invoke("{0:F01}", INTEGER_NUMBER).should.be.equal("8395.0")
        )

        it("should return a comma-separated string represents the Number", ->
            StringFormatter.invoke("{0:N01}", INTEGER_NUMBER).should.be.equal("8,395.0")
            StringFormatter.invoke("{0:N03}", DECIMAL_NUMBER).should.be.equal("10,761.938")
        )

        it("should return a percent string represents the Number", ->
            StringFormatter.invoke("{0:P02}", DECIMAL_NUMBER / 10000).should.be.equal("107.62 %")
            StringFormatter.invoke("{0:P02}", INTEGER_NUMBER / 10000.0).should.be.equal("83.95 %")
        )

        it("should return a hexadecimal string represents the Number", ->
            StringFormatter.invoke("{0:x}", INTEGER_NUMBER).should.be.equal("20cb")
            StringFormatter.invoke("{0:X}", INTEGER_NUMBER).should.be.equal("20CB")
        )
    )

    describe("#format(String, Date)", ->
        it("should return a formatted string represents the Date", ->
            StringFormatter.invoke("{0:d}", DATE).should.be.equal("2009/06/15")
            StringFormatter.invoke("{0:D}", DATE).should.be.equal("2009年6月15日")
            StringFormatter.invoke("{0:t}", DATE).should.be.equal("13:45")
            StringFormatter.invoke("{0:T}", DATE).should.be.equal("13:45:30")
            StringFormatter.invoke("{0:f}", DATE).should.be.equal("2009年6月15日 13:45")
            StringFormatter.invoke("{0:F}", DATE).should.be.equal("2009年6月15日 13:45:30")
            StringFormatter.invoke("{0:g}", DATE).should.be.equal("2009/06/15 13:45")
            StringFormatter.invoke("{0:G}", DATE).should.be.equal("2009/06/15 13:45:30")
            StringFormatter.invoke("{0:y}", DATE).should.be.equal("2009年6月")
            StringFormatter.invoke("{0:m}", DATE).should.be.equal("6月15日")
            StringFormatter.invoke("{0:r}", DATE).should.be.equal("Mon, 15 Jun 2009 04:45:30 GMT")
            StringFormatter.invoke("{0:o}", DATE).should.be.equal("2009-06-15T13:45:30.0000000")
            StringFormatter.invoke("{0:s}", DATE).should.be.equal("2009-06-15T13:45:30")
            StringFormatter.invoke("{0:u}", DATE).should.be.equal("2009-06-15 13:45:30Z")
            StringFormatter.invoke("{0:U}", DATE).should.be.equal("2009年6月15日 4:45:30")
        )
    )
)
