/*global describe, it */
'use strict'

//
// Libraries.
//
const expect = require('chai').expect

//
// Functions.
//
const validation = require("../../utils/validation");

//
// Types.
//
const ValidationReport = require('../../models/ValidationReport')

//
// Local globals.
//
let report = {}
let result = true
let descriptor = "not used"

//
// Validate boolean.
//
describe('validateBoolean()', function () {

    describe('Boolean works: true.', function () {
        let type = { "_type": "_type_boolean" }
        let value = [ { "value": true }, "value" ]

        it('Should succeed.', function () {

            report = new ValidationReport(descriptor, value)
            result = validation.validateBoolean(type, value, report)

            expect(result).to.equal(true)
        })

        it('Ensure report has status.', function () {
            expect(report.hasOwnProperty("status")).to.equal(true)
        })

        it('Ensure status code is correct.', function () {
            expect(report.status.code).to.equal(0)
        })
    })

    describe('Boolean works: false.', function () {
        let type = { "_type": "_type_boolean" }
        let value = [ { "value": false }, "value" ]

        it('Should succeed.', function () {

            report = new ValidationReport(descriptor, value)
            result = validation.validateBoolean(type, value, report)

            expect(result).to.equal(true)
        })

        it('Ensure report has status.', function () {
            expect(report.hasOwnProperty("status")).to.equal(true)
        })

        it('Ensure status code is correct.', function () {
            expect(report.status.code).to.equal(0)
        })
    })

    describe('Boolean fails with integer: 12.', function () {
        let type = { "_type": "_type_boolean" }
        let value = [ { "value": 12 }, "value" ]

        it('Should fail.', function () {

            report = new ValidationReport(descriptor, value)
            result = validation.validateBoolean(type, value, report)

            expect(result).to.equal(false)
        })

        it('Ensure report has status.', function () {
            expect(report.hasOwnProperty("status")).to.equal(true)
        })

        it('Ensure status code is correct.', function () {
            expect(report.status.code).to.equal(10)
        })
    })

    describe('Boolean fails with number: 1.2.', function () {
        let type = { "_type": "_type_boolean" }
        let value = [ { "value": 1.2 }, "value" ]

        it('Should fail.', function () {

            report = new ValidationReport(descriptor, value)
            result = validation.validateBoolean(type, value, report)

            expect(result).to.equal(false)
        })

        it('Ensure report has status.', function () {
            expect(report.hasOwnProperty("status")).to.equal(true)
        })

        it('Ensure status code is correct.', function () {
            expect(report.status.code).to.equal(10)
        })
    })

    describe('Boolean fails with string: "true".', function () {
        let type = { "_type": "_type_boolean" }
        let value = [ { "value": "true" }, "value" ]

        it('Should fail.', function () {

            report = new ValidationReport(descriptor, value)
            result = validation.validateBoolean(type, value, report)

            expect(result).to.equal(false)
        })

        it('Ensure report has status.', function () {
            expect(report.hasOwnProperty("status")).to.equal(true)
        })

        it('Ensure status code is correct.', function () {
            expect(report.status.code).to.equal(10)
        })
    })

    describe('Boolean fails with object: {"key": "value"}.', function () {
        let type = { "_type": "_type_boolean" }
        let value = [ { "value": {"key": "value"} }, "value" ]

        it('Should fail.', function () {

            report = new ValidationReport(descriptor, value)
            result = validation.validateBoolean(type, value, report)

            expect(result).to.equal(false)
        })

        it('Ensure report has status.', function () {
            expect(report.hasOwnProperty("status")).to.equal(true)
        })

        it('Ensure status code is correct.', function () {
            expect(report.status.code).to.equal(10)
        })
    })

}) // validateBoolean()
