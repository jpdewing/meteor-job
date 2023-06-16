// /*
//  * decaffeinate suggestions:
//  * DS102: Remove unnecessary code created because of implicit returns
//  * DS205: Consider reworking code to avoid use of IIFEs
//  * DS207: Consider shorter variations of null checks
//  * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
//  */
// //###########################################################################
// //     Copyright (C) 2014-2017 by Vaughn Iverson
// //     meteor-job-class is free software released under the MIT/X11 license.
// //     See included LICENSE file for details.
// //###########################################################################

// // Unit tests

// const assert = require('chai').assert;
// const rewire = require('rewire');
// const sinon = require('sinon');
// const Fiber = require('fibers');

// const Job = rewire ('../src/job_class');

// // Mock DDP class
// class DDP {

//    call(name, params, cb = null) {
//       if ((cb == null) || (typeof cb !== 'function')) {
//          switch (name) {
//             case 'root_true':
//                return true;
//               break;
//             case 'root_false':
//                return false;
//               break;
//             case 'root_param':
//                return params[0];
//               break;
//             case 'root_error':
//                throw new Error("Method failed");
//               break;
//             default:
//                throw new Error("Bad method in call");
//          }
//       } else {
//          switch (name) {
//             case 'root_true':
//                process.nextTick(() => cb(null, true));
//               break;
//             case 'root_false':
//                process.nextTick(() => cb(null, false));
//               break;
//             case 'root_param':
//                process.nextTick(() => cb(null, params[0]));
//               break;
//             case 'root_error':
//                process.nextTick(() => cb(new Error("Method failed")));
//               break;
//             default:
//                process.nextTick(() => cb(new Error("Bad method in call")));
//          }
//        }
//     }

//    connect() {
//       return process.nextTick(() => cb(null));
//     }

//    close() {
//       return process.nextTick(() => cb(null));
//     }

//    subscribe() {
//       return process.nextTick(() => cb(null));
//     }

//    observe() {
//       return process.nextTick(() => cb(null));
//     }
//  }

// const makeDdpStub = action =>
//    function(name, params, cb) {
//       const [err, res] = action(name, params);
//       // console.dir res
//       if (cb != null) {
//          return process.nextTick(() => cb(err, res));
//       } else if (err) {
//          throw err;
//        }
//       return res;
//     }
//  ;

// //##########################################

// describe('Job', function() {

//    it('has class constants', function() {
//       assert.isNumber(Job.forever);
//       assert.isObject(Job.jobPriorities);
//       assert.lengthOf(Object.keys(Job.jobPriorities), 5);
//       assert.isArray(Job.jobRetryBackoffMethods);
//       assert.lengthOf(Job.jobRetryBackoffMethods, 2);
//       assert.isArray(Job.jobStatuses);
//       assert.lengthOf(Job.jobStatuses, 7);
//       assert.isArray(Job.jobLogLevels);
//       assert.lengthOf(Job.jobLogLevels, 4);
//       assert.isArray(Job.jobStatusCancellable);
//       assert.lengthOf(Job.jobStatusCancellable, 4);
//       assert.isArray(Job.jobStatusPausable);
//       assert.lengthOf(Job.jobStatusPausable, 2);
//       assert.isArray(Job.jobStatusRemovable);
//       assert.lengthOf(Job.jobStatusRemovable, 3);
//       assert.isArray(Job.jobStatusRestartable);
//       assert.lengthOf(Job.jobStatusRestartable, 2);
//       assert.isArray(Job.ddpPermissionLevels);
//       assert.lengthOf(Job.ddpPermissionLevels , 4);
//       assert.isArray(Job.ddpMethods);
//       assert.lengthOf(Job.ddpMethods, 18);
//       assert.isObject(Job.ddpMethodPermissions);
//       return assert.lengthOf(Object.keys(Job.ddpMethodPermissions), Job.ddpMethods.length);
//    });

//    it('has a _ddp_apply class variable that defaults as undefined outside of Meteor', () => assert.isUndefined(Job._ddp_apply));

//    describe('setDDP', function() {

//       const ddp = new DDP();

//       describe('default setup', function() {

//          it('throws if given a non-ddp object', () => assert.throws((() => Job.setDDP({})), /Bad ddp object/));

//          it('properly sets the default _ddp_apply class variable', function(done) {
//             sinon.stub(ddp, "call").yieldsAsync();
//             Job.setDDP(ddp);
//             return Job._ddp_apply('test', [], function() {
//                assert(ddp.call.calledOnce);
//                ddp.call.restore();
//                return done();
//             });
//          });

//          it('fails if subsequently called with a collection name', function(done) {
//             assert.throws((() => Job.setDDP(ddp, 'test1')), /Job.setDDP must specify/);
//             return done();
//          });

//          return after(() => Job._ddp_apply = undefined);
//       });

//       return describe('setup with collection name', function() {

//          it('properly sets the _ddp_apply class variable', function(done) {
//             sinon.stub(ddp, "call").yieldsAsync();
//             Job.setDDP(ddp, 'test1');
//             return Job._ddp_apply.test1('test', [], function() {
//                assert(ddp.call.calledOnce);
//                ddp.call.restore();
//                return done();
//             });
//          });

//          it('properly sets the _ddp_apply class variable when called with array', function(done) {
//             sinon.stub(ddp, "call").yieldsAsync();
//             Job.setDDP(ddp, ['test2','test3']);
//             return Job._ddp_apply.test2('test', [], () =>
//                Job._ddp_apply.test3('test', [], function() {
//                   assert.equal(ddp.call.callCount, 2);
//                   ddp.call.restore();
//                   return done();
//                })
//             );
//          });

//          it('fails if subsequently called without a collection name', function(done) {
//             assert.throws((() => Job.setDDP(ddp)), /Job.setDDP must specify/);
//             return done();
//          });

//          return after(() => Job._ddp_apply = undefined);
//       });
//    });

//    describe('Fiber support', function() {

//       const ddp = new DDP();

//       it('accepts a valid collection name and Fiber object and properly yields and runs', function(done) {
//          sinon.stub(ddp, "call").yieldsAsync();
//          Job.setDDP(ddp, 'test1', Fiber);
//          const fib = Fiber(() => Job._ddp_apply.test1('test', []));
//          fib.run();
//          assert(ddp.call.calledOnce);
//          ddp.call.restore();
//          return done();
//       });

//       it('accepts a default collection name and valid Fiber object and properly yields and runs', function(done) {
//          sinon.stub(ddp, "call").yieldsAsync();
//          Job.setDDP(ddp, Fiber);
//          const fib = Fiber(() => Job._ddp_apply('test', []));
//          fib.run();
//          assert(ddp.call.calledOnce);
//          ddp.call.restore();
//          return done();
//       });

//       it('properly returns values from method calls', function(done) {
//          Job.setDDP(ddp, Fiber);
//          const fib = Fiber(function() {
//             assert.isTrue(Job._ddp_apply('root_true', []));
//             assert.isFalse(Job._ddp_apply('root_false', []));
//             assert.deepEqual(Job._ddp_apply('root_param', [['a', 1, null]]), ['a', 1, null]);
//             return done();
//          });
//          return fib.run();
//       });

//       it('properly propagates thrown errors within a Fiber', function(done) {
//          Job.setDDP(ddp, Fiber);
//          const fib = Fiber(function() {
//             assert.throws((() => Job._ddp_apply('root_error', [])), /Method failed/);
//             assert.throws((() => Job._ddp_apply('bad_method', [])), /Bad method in call/);
//             return done();
//          });
//          return fib.run();
//       });

//       return afterEach(() => Job._ddp_apply = undefined);
//    });

//    describe('private function', function() {

//       // Note! These are internal helper functions, NOT part of the external API!
//       describe('methodCall', function() {

//          const ddp = new DDP();

//          before(function() {
//             sinon.spy(ddp, "call");
//             return Job.setDDP(ddp);
//          });

//          const methodCall = Job.__get__('methodCall');

//          it('should be a function', () => assert.isFunction(methodCall));

//          it('should invoke the correct ddp method', done =>
//             methodCall("root", "true", [], function(err, res) {
//                assert(ddp.call.calledOnce);
//                assert(ddp.call.calledWith("root_true"));
//                assert.isTrue(res);
//                return done();
//             })
//          );

//          it('should pass the correct method parameters', done =>
//             methodCall("root", "param", ['a', 1, [1,2,3], { foo: 'bar'}], function(err, res) {
//                assert(ddp.call.calledOnce);
//                assert(ddp.call.calledWith("root_param", ['a', 1, [1,2,3], { foo: 'bar'}]));
//                assert.equal(res, 'a');
//                return done();
//             })
//          );

//          it('should invoke the after callback when provided', function(done) {
//             const after = sinon.stub().returns(true);
//             return methodCall("root", "false", [],
//                function(err, res) {
//                   assert(ddp.call.calledOnce);
//                   assert(ddp.call.calledWith("root_false", []));
//                   assert(after.calledOnce);
//                   assert.isTrue(res);
//                   return done();
//                 },
//                after
//             );
//          });

//          it("shouldn't invoke the after callback when error", function(done) {
//             const after = sinon.stub().returns(true);
//             return methodCall("root", "error", [],
//                function(err, res) {
//                   assert(ddp.call.calledOnce);
//                   assert(ddp.call.calledWith("root_error", []));
//                   assert.equal(after.callCount, 0, "After shouldn't be called");
//                   assert.isUndefined(res, "Result isn't undefined");
//                   assert.throws((function() { throw err; }), /Method failed/);
//                   return done();
//                 },
//                after
//             );
//          });

//          it('should invoke the correct ddp method without callback', function() {
//             const res = methodCall("root", "true", []);
//             assert(ddp.call.calledOnce);
//             assert(ddp.call.calledWith("root_true"));
//             return assert.isTrue(res);
//          });

//          it('should pass the correct method parameters without callback', function() {
//             const res = methodCall("root", "param", ['a', 1, [1,2,3], { foo: 'bar'}]);
//             assert(ddp.call.calledOnce);
//             assert(ddp.call.calledWith("root_param", ['a', 1, [1,2,3], { foo: 'bar'}]));
//             return assert.equal(res, 'a');
//          });

//          it('should invoke the after callback when provided without callback', function() {
//             const after = sinon.stub().returns(true);
//             const res = methodCall("root", "false", [], undefined, after);
//             assert(ddp.call.calledOnce);
//             assert(ddp.call.calledWith("root_false", []));
//             assert(after.calledOnce);
//             return assert.isTrue(res);
//          });

//          it("should throw on error when invoked without callback", function() {
//             const after = sinon.stub().returns(true);
//             let res = undefined;
//             assert.throws((() => res = methodCall("root", "error", [], undefined, after)), /Method failed/);
//             assert(ddp.call.calledOnce);
//             assert(ddp.call.calledWith("root_error", []));
//             assert.equal(after.callCount, 0, "After shouldn't be called");
//             return assert.isUndefined(res, "Result isn't undefined");
//          });

//          afterEach(() => ddp.call.reset());

//          return after(() => Job._ddp_apply = undefined);
//       });

//       describe('optionsHelp', function() {

//          const optionsHelp = Job.__get__('optionsHelp');
//          const foo = { bar: "bat" };
//          const gizmo = function() {};

//          it('should return options and a callback when both are provided', function() {
//             const res = optionsHelp([foo], gizmo);
//             return assert.deepEqual(res, [foo, gizmo]);
//        });

//          it('should handle a missing callback and return only options', function() {
//             const res = optionsHelp([foo]);
//             return assert.deepEqual(res, [foo, undefined]);
//        });

//          it('should handle missing options and return empty options and the callback', function() {
//             const res = optionsHelp([], gizmo);
//             return assert.deepEqual(res, [{}, gizmo]);
//        });

//          it('should handle when both options and callback are missing', function() {
//             const res = optionsHelp([], undefined);
//             return assert.deepEqual(res, [{}, undefined]);
//        });

//          it('should throw an error when an invalid callback is provided', () => assert.throws((()=> optionsHelp([foo], 5)), /options not an object or bad callback/));

//          it('should throw an error when a non-array is passed for options', () => assert.throws((()=> optionsHelp(foo, gizmo)), /must be an Array with zero or one elements/));

//          return it('should throw an error when a bad options array is passed', () => assert.throws((()=> optionsHelp([foo, 5], gizmo)), /must be an Array with zero or one elements/));
//       });

//       describe('splitLongArray', function() {

//          const splitLongArray = Job.__get__('splitLongArray');

//          const longArray = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];

//          it('should properly split an array', function() {
//             const res = splitLongArray(longArray, 4);
//             return assert.deepEqual(res, [ [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11] ]);
//        });

//          it('should handle remainders correctly', function() {
//             const res = splitLongArray(longArray, 5);
//             return assert.deepEqual(res, [ [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11] ]);
//        });

//          it('should handle an empty array', function() {
//             const res = splitLongArray([], 5);
//             return assert.deepEqual(res, []);
//        });

//          it('should handle a single element array', function() {
//             const res = splitLongArray([0], 5);
//             return assert.deepEqual(res, [ [0] ]);
//        });

//          it('should throw if not given an array', () => assert.throws((() => splitLongArray({ foo: "bar"}, 5)), /splitLongArray: bad params/));

//          it('should throw if given an out of range max value', () => assert.throws((() => splitLongArray(longArray, 0)), /splitLongArray: bad params/));

//          return it('should throw if given an invalid max value', () => assert.throws((() => splitLongArray(longArray, "cow")), /splitLongArray: bad params/));
//       });

//       describe('concatReduce', function() {
//          const concatReduce = Job.__get__('concatReduce');

//          it('should concat a to b', () => assert.deepEqual(concatReduce([1],2), [1,2]));

//          return it('should work with non array for the first param', () => assert.deepEqual(concatReduce(1,2), [1,2]));
//     });

//       describe('reduceCallbacks', function() {
//          const reduceCallbacks = Job.__get__('reduceCallbacks');

//          it('should return undefined if given a falsy callback', () => assert.isUndefined(reduceCallbacks(undefined, 5)));

//          it('should properly absorb the specified number of callbacks', function() {
//             const spy = sinon.spy();
//             const cb = reduceCallbacks(spy, 3);
//             cb(null, true);
//             cb(null, false);
//             cb(null, true);
//             assert(spy.calledOnce);
//             return assert(spy.calledWith(null, true));
//          });

//          it('should properly reduce the callback results', function() {
//             const spy = sinon.spy();
//             const cb = reduceCallbacks(spy, 3);
//             cb(null, false);
//             cb(null, false);
//             cb(null, false);
//             assert(spy.calledOnce);
//             return assert(spy.calledWith(null, false));
//          });

//          it('should properly reduce with a custom reduce function', function() {
//             const concatReduce = Job.__get__('concatReduce');
//             const spy = sinon.spy();
//             const cb = reduceCallbacks(spy, 3, concatReduce, []);
//             cb(null, false);
//             cb(null, true);
//             cb(null, false);
//             assert(spy.calledOnce, 'callback called too many times');
//             return assert(spy.calledWith(null, [false, true, false]), 'Returned wrong result');
//          });

//          it('should throw if called too many times', function() {
//             const spy = sinon.spy();
//             const cb = reduceCallbacks(spy, 2);
//             cb(null, true);
//             cb(null, true);
//             return assert.throws(cb, /reduceCallbacks callback invoked more than requested/);
//          });

//          it('should throw if given a non-function callback', () => assert.throws((() => reduceCallbacks(5)), /Bad params given to reduceCallbacks/));

//          it('should throw if given an invalid number of callbacks to absorb', () => assert.throws((() => reduceCallbacks((function() { }), 'cow')), /Bad params given to reduceCallbacks/));

//          it('should throw if given an out of range number of callbacks to absorb', () => assert.throws((() => reduceCallbacks((function() { }), 0)), /Bad params given to reduceCallbacks/));

//          return it('should throw if given a non-function reduce', () => assert.throws((() => reduceCallbacks((function() { }), 5, 5)), /Bad params given to reduceCallbacks/));
//       });

//       describe('_setImmediate', function() {

//          const _setImmediate = Job.__get__('_setImmediate');

//          return it('should invoke the provided callback with args', function(done) {
//             const cb = function(a, b) {
//                assert.equal(a, "foo");
//                assert.equal(b, "bar");
//                return done();
//              };
//             return _setImmediate(cb, "foo", "bar");
//          });
//       });

//       return describe('_setInterval', function() {

//          const _setInterval = Job.__get__('_setInterval');
//          const _clearInterval = Job.__get__('_clearInterval');

//          return it('should invoke the provided callback repeatedly with args', function(done) {
//             let cancel = null;
//             let count = 0;
//             const cb = function(a, b) {
//                assert.equal(a, "foo");
//                assert.equal(b, "bar");
//                count++;
//                if (count === 2) {
//                   _clearInterval(cancel);
//                   return done();
//                } else if (count > 2) {
//                   throw "Interval called too many times";
//                 }
//              };

//             return cancel = _setInterval(cb, 10, "foo", "bar");
//          });
//       });
//    });

//    describe('Job constructor', function() {

//       const checkJob = function(job) {
//          assert.instanceOf(job, Job);
//          assert.equal(job.root, 'root');
//          assert.equal(job.type, 'work');
//          assert.deepEqual(job.data, { foo: "bar" });
//          assert.isObject(job._doc);
//          const doc = job._doc;
//          assert.notProperty(doc, '_id');
//          assert.isNull(doc.runId);
//          assert.equal(job.type, doc.type);
//          assert.deepEqual(job.data, doc.data);
//          assert.isString(doc.status);
//          assert.instanceOf(doc.updated, Date);
//          assert.isArray(doc.depends);
//          assert.isArray(doc.resolved);
//          assert.isNumber(doc.priority);
//          assert.isNumber(doc.retries);
//          assert.isNumber(doc.retryWait);
//          assert.isNumber(doc.retried);
//          assert.isString(doc.retryBackoff);
//          assert.instanceOf(doc.retryUntil, Date);
//          assert.isNumber(doc.repeats);
//          assert.isNumber(doc.repeatWait);
//          assert.isNumber(doc.repeated);
//          assert.instanceOf(doc.repeatUntil, Date);
//          assert.instanceOf(doc.after, Date);
//          assert.isArray(doc.log);
//          assert.isObject(doc.progress);
//          return assert.instanceOf(doc.created, Date);
//        };

//       it('should return a new valid Job object', function() {
//          const job = new Job('root', 'work', { foo: "bar" });
//          return checkJob(job);
//       });

//       it('should throw when given bad parameters', () => assert.throw(() => new Job, /new Job: bad parameter/));

//       it('should support using a valid job document', function() {
//          const job = new Job('root', 'work', { foo: "bar" });
//          checkJob(job);
//          const job2 = new Job('root', job.doc);
//          return checkJob(job2);
//       });

//       return it('should support using a valid oobject for root', function() {
//          const job = new Job({ root: 'root'}, 'work', { foo: "bar" });
//          checkJob(job);
//          const job2 = new Job({ root: 'root'}, job.doc);
//          return checkJob(job2);
//       });
//    });

//    describe('job mutator method', function() {

//       let job = null;
//       let doc = null;

//       beforeEach(function() {
//          job = new Job('root', 'work', {});
//          return doc = job._doc;
//       });

//       describe('.depends()', function() {

//          it('should properly update the depends property', function() {
//             const jobA = new Job('root', 'work', {});
//             jobA._doc._id = 'foo';
//             const jobB = new Job('root', 'work', {});
//             jobB._doc._id = 'bar';
//             const j = job.depends([ jobA, jobB ]);
//             assert.equal(j, job);
//             return assert.deepEqual(doc.depends, [ 'foo', 'bar' ]);
//        });

//          it('should accept a singlet Job', function() {
//             const jobA = new Job('root', 'work', {});
//             jobA._doc._id = 'foo';
//             const j = job.depends(jobA);
//             assert.equal(j, job);
//             return assert.deepEqual(doc.depends, [ 'foo' ]);
//        });

//          it('should accept an empty deps array and return the job unchanged', function() {
//             const jobA = new Job('root', 'work', {});
//             jobA._doc._id = 'foo';
//             let j = job.depends(jobA);
//             assert.equal(j, job);
//             assert.deepEqual(doc.depends, [ 'foo' ]);
//             j = job.depends([]);
//             assert.equal(j, job);
//             return assert.deepEqual(doc.depends, [ 'foo' ]);
//        });

//          it('should clear dependencies when passed a falsy value', function() {
//             const jobA = new Job('root', 'work', {});
//             jobA._doc._id = 'foo';
//             const j = job.depends(jobA);
//             assert.equal(j, job);
//             assert.deepEqual(doc.depends, [ 'foo' ]);
//             job.depends(null);
//             return assert.lengthOf(doc.depends, 0);
//          });

//          it('should throw when given a bad parameter', () => assert.throw((() => job.depends("badness")), /Bad input parameter/));

//          it('should throw when given an array containing non Jobs', () => assert.throw((() => job.depends(["Badness"])), /Each provided object/));

//          return it('should throw when given an array containing unsaved Jobs without an _id', function() {
//             const jobA = new Job('root', 'work', {});
//             return assert.throw((() => job.depends([ jobA ])), /Each provided object/);
//          });
//       });

//       describe('.priority()', function() {

//          it('should accept a numeric priority', function() {
//             const j = job.priority(3);
//             assert.equal(j, job);
//             return assert.equal(doc.priority, 3);
//          });

//          it('should accept a valid string priority', function() {
//             const j = job.priority('normal');
//             assert.equal(j, job);
//             return assert.equal(doc.priority, Job.jobPriorities['normal']);
//        });

//          it('should throw when given an invalid priority level', () => assert.throw((() => job.priority('super')), /Invalid string priority level provided/));

//          it('should throw when given an invalid parameter', () => assert.throw((() => job.priority([])), /priority must be an integer or valid priority level/));

//          return it('should throw when given a non-integer', () => assert.throw((() => job.priority(3.14)), /priority must be an integer or valid priority level/));
//       });

//       describe('.retry()', function() {

//          it('should accept a non-negative integer parameter', function() {
//             const j = job.retry(3);
//             assert.equal(j, job);
//             assert.equal(doc.retries, 3 + 1); // This is correct, it adds one.
//             assert.equal(doc.retryWait, 5*60*1000);
//             return assert.equal(doc.retryBackoff, 'constant');
//          });

//          it('should accept an option object', function() {
//             const j = job.retry({ retries: 3, until: new Date(new Date().valueOf() + 60000), wait: 5000, backoff: 'exponential' });
//             assert.equal(j, job);
//             assert.equal(doc.retries, 3 + 1);
//             assert.ok(doc.retryUntil > new Date());
//             assert.equal(doc.retryWait, 5000);
//             return assert.equal(doc.retryBackoff, 'exponential');
//          });

//          it('should throw when given a bad parameter', () => assert.throw((() => job.retry('badness')), /bad parameter: accepts either an integer/));

//          it('should throw when given a negative integer', () => assert.throw((() => job.retry(-1)), /bad parameter: accepts either an integer/));

//          it('should throw when given a numeric non-integer', () => assert.throw((() => job.retry(3.14)), /bad parameter: accepts either an integer/));

//          return it('should throw when given bad options', function() {
//             assert.throw((() => job.retry({ retries: 'badness' })), /bad option: retries must be an integer/);
//             assert.throw((() => job.retry({ retries: -1 })), /bad option: retries must be an integer/);
//             assert.throw((() => job.retry({ retries: 3.14 })), /bad option: retries must be an integer/);
//             assert.throw((() => job.retry({ wait: 'badness' })), /bad option: wait must be an integer/);
//             assert.throw((() => job.retry({ wait: -1 })), /bad option: wait must be an integer/);
//             assert.throw((() => job.retry({ wait: 3.14 })), /bad option: wait must be an integer/);
//             assert.throw((() => job.retry({ backoff: 'bogus' })), /bad option: invalid retry backoff method/);
//             return assert.throw((() => job.retry({ until: 'bogus' })), /bad option: until must be a Date object/);
//          });
//       });

//       describe('.repeat()', function() {

//          it('should accept a non-negative integer parameter', function() {
//             const j = job.repeat(3);
//             assert.equal(j, job);
//             return assert.equal(doc.repeats, 3);
//          });

//          it('should accept an option object', function() {
//             const j = job.repeat({ repeats: 3, until: new Date(new Date().valueOf() + 60000), wait: 5000 });
//             assert.equal(j, job);
//             assert.equal(doc.repeats, 3);
//             assert.ok(doc.repeatUntil > new Date());
//             return assert.equal(doc.repeatWait, 5000);
//          });

//          it('should accept an option object with later.js object', function() {
//             const j = job.repeat({ schedule: { schedules: [{h:[10]}], exceptions: [], other() { return 0; } }});
//             assert.equal(j, job);
//             return assert.deepEqual(doc.repeatWait, { schedules: [{h:[10]}], exceptions: [] });
//        });

//          it('should throw when given a bad parameter', () => assert.throw((() => job.repeat('badness')), /bad parameter: accepts either an integer/));

//          it('should throw when given a negative integer', () => assert.throw((() => job.repeat(-1)), /bad parameter: accepts either an integer/));

//          it('should throw when given a numeric non-integer', () => assert.throw((() => job.repeat(3.14)), /bad parameter: accepts either an integer/));

//          return it('should throw when given bad options', function() {
//             assert.throw((() => job.repeat({ repeats: 'badness' })), /bad option: repeats must be an integer/);
//             assert.throw((() => job.repeat({ repeats: -1 })), /bad option: repeats must be an integer/);
//             assert.throw((() => job.repeat({ repeats: 3.14 })), /bad option: repeats must be an integer/);
//             assert.throw((() => job.repeat({ wait: 'badness' })), /bad option: wait must be an integer/);
//             assert.throw((() => job.repeat({ wait: -1 })), /bad option: wait must be an integer/);
//             assert.throw((() => job.repeat({ wait: 3.14 })), /bad option: wait must be an integer/);
//             assert.throw((() => job.repeat({ until: 'bogus' })), /bad option: until must be a Date object/);
//             assert.throw((() => job.repeat({ wait: 5, schedule: {}})), /bad options: wait and schedule options are mutually exclusive/);
//             assert.throw((() => job.repeat({ schedule: 'bogus' })), /bad option, schedule option must be an object/);
//             assert.throw((() => job.repeat({ schedule: {}})), /bad option, schedule object requires a schedules attribute of type Array/);
//             assert.throw((() => job.repeat({ schedule: { schedules: 5 }})), /bad option, schedule object requires a schedules attribute of type Array/);
//             return assert.throw((() => job.repeat({ schedule: { schedules: [], exceptions: 5 }})), /bad option, schedule object exceptions attribute must be an Array/);
//          });
//       });

//       describe('.after()', function() {

//          it('should accept a valid Date', function() {
//             const d = new Date();
//             const j = job.after(d);
//             assert.equal(j, job);
//             return assert.equal(doc.after, d);
//          });

//          it('should accept an undefined value', function() {
//             const j = job.after();
//             assert.equal(j, job);
//             assert.instanceOf(doc.after, Date);
//             return assert(doc.after <= new Date());
//          });

//          return it('should throw if given a bad parameter', function() {
//             assert.throw((() => job.after({ foo: "bar" })), /Bad parameter, after requires a valid Date object/);
//             assert.throw((() => job.after(123)), /Bad parameter, after requires a valid Date object/);
//             return assert.throw((() => job.after(false)), /Bad parameter, after requires a valid Date object/);
//          });
//       });

//       return describe('.delay()', function() {

//          it('should accept a valid delay', function() {
//             const j = job.delay(5000);
//             assert.equal(j, job);
//             assert.instanceOf(doc.after, Date);
//             return assert.closeTo(doc.after.valueOf(), new Date().valueOf() + 5000, 1000);
//          });

//          it('should accept an undefined parameter', function() {
//             const j = job.delay();
//             assert.equal(j, job);
//             assert.instanceOf(doc.after, Date);
//             return assert.closeTo(doc.after.valueOf(), new Date().valueOf(), 1000);
//          });

//          return it('should throw when given an invalid parameter', function() {
//             assert.throw((() => job.delay(-1.234)), /Bad parameter, delay requires a non-negative integer/);
//             assert.throw((() => job.delay(new Date())), /Bad parameter, delay requires a non-negative integer/);
//             return assert.throw((() => job.delay(false)), /Bad parameter, delay requires a non-negative integer/);
//          });
//       });
//    });

//    return describe('communicating', function() {

//       let ddp = null;

//       before(function() {
//          ddp = new DDP();
//          return Job.setDDP(ddp);
//       });

//       describe('job status method', function() {

//          let job = null;
//          let doc = null;

//          beforeEach(function() {
//             job = new Job('root', 'work', {});
//             return doc = job._doc;
//          });

//          describe('.save()', function() {

//             before(() =>
//                sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                   let res;
//                   if (name !== 'root_jobSave') { throw new Error('Bad method name'); }
//                   doc = params[0];
//                   const options = params[1];
//                   if (options.cancelRepeats) {
//                      throw new Error('cancelRepeats');
//                    }
//                   if (typeof doc === 'object') {
//                      res = "newId";
//                   } else {
//                      res = null;
//                    }
//                   return [null, res];})));

//             it('should make valid DDP call when invoked', function() {
//                const res = job.save();
//                return assert.equal(res, "newId");
//             });

//             it('should work with a callback', done =>
//                job.save(function(err, res) {
//                   assert.equal(res, "newId");
//                   return done();
//                })
//             );

//             it('should properly pass cancelRepeats option', () => assert.throw((() => job.save({ cancelRepeats: true })), /cancelRepeats/));

//             it('should properly pass cancelRepeats option with callback', () => assert.throw((() => job.save({ cancelRepeats: true }, function() {} )), /cancelRepeats/));

//             afterEach(() => Job._ddp_apply.resetHistory());

//             return after(() => Job._ddp_apply.restore());
//          });

//          describe('.refresh()', function() {

//             before(() =>
//                sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                   let res;
//                   if (name !== 'root_getJob') { throw new Error('Bad method name'); }
//                   const id = params[0];
//                   const options = params[1];
//                   if (options.getLog) {
//                      throw new Error('getLog');
//                    }
//                   if (id === 'thisId') {
//                      res = { foo: 'bar' };
//                   } else {
//                      res = null;
//                    }
//                   return [null, res];})));

//             it('should make valid DDP call when invoked', function() {
//                doc._id = 'thisId';
//                const res = job.refresh();
//                assert.deepEqual(job._doc, { foo: 'bar' });
//                return assert.equal(res, job);
//             });

//             it('should work with a callback', function(done) {
//                doc._id = 'thisId';
//                return job.refresh(function(err, res) {
//                   assert.deepEqual(job._doc, { foo: 'bar' });
//                   assert.equal(res, job);
//                   return done();
//                });
//             });

//             it("shouldn't modify job when not found on server", function() {
//                doc._id = 'thatId';
//                const res = job.refresh();
//                assert.isFalse(res);
//                return assert.deepEqual(job._doc, doc);
//             });

//             it('should properly pass getLog option', function() {
//                doc._id = 'thisId';
//                return assert.throw((() => job.refresh({ getLog: true })), /getLog/);
//             });

//             it('should throw when called on an unsaved job', () => assert.throw((() => job.refresh()), /on an unsaved job/));

//             afterEach(() => Job._ddp_apply.resetHistory());

//             return after(() => Job._ddp_apply.restore());
//          });

//          describe('.log()', function() {

//             before(() =>
//                sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                   let res;
//                   if (name !== 'root_jobLog') { throw new Error('Bad method name'); }
//                   const id = params[0];
//                   const runId = params[1];
//                   const msg = params[2];
//                   const level = (params[3] != null ? params[3].level : undefined) != null ? (params[3] != null ? params[3].level : undefined) : 'gerinfo';
//                   if ((id === 'thisId') && (runId === 'thatId') && (msg === 'Hello') && Job.jobLogLevels.includes(level)) {
//                      res = level;
//                   } else {
//                      res = false;
//                    }
//                   return [null, res];})));

//             it('should add a valid log entry to the local state when invoked before a job is saved', function() {
//                const j = job.log('Hello', { level: 'success' });
//                assert.equal(j, job);
//                const thisLog = doc.log[1]; //  [0] is the 'Created' log message
//                assert.equal(thisLog.message, 'Hello');
//                assert.equal(thisLog.level, 'success');
//                assert.instanceOf(thisLog.time, Date);
//                return assert.closeTo(thisLog.time.valueOf(), new Date().valueOf(), 1000);
//             });

//             it('should make valid DDP call when invoked on a saved job', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const res = job.log('Hello');
//                return assert.equal(res, 'info');
//             });

//             it('should correctly pass level option', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const res = job.log('Hello', { level: 'danger' });
//                return assert.equal(res, 'danger');
//             });

//             it('should work with a callback', function(done) {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                return job.log('Hello', { level: 'success' }, function(err, res) {
//                   assert.equal(res, 'success');
//                   return done();
//                });
//             });

//             it('should throw when passed an invalid message', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                return assert.throw((() => job.log(43, { level: 'danger' })), /Log message must be a string/);
//             });

//             it('should throw when passed an invalid level', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                assert.throw((() => job.log('Hello', { level: 'blargh' })), /Log level options must be one of Job.jobLogLevels/);
//                return assert.throw((() => job.log('Hello', { level: [] })), /Log level options must be one of Job.jobLogLevels/);
//             });

//             describe('echo option', function() {

//                let jobConsole = null;

//                before(function() {
//                   jobConsole = Job.__get__('console');
//                   return Job.__set__('console', {
//                      info(...params) { throw new Error('info'); },
//                      log(...params) { throw new Error('success'); },
//                      warn(...params) { throw new Error('warning'); },
//                      error(...params) { throw new Error('danger'); }
//                    }
//                   );
//                });

//                it('should echo the log to the console at the level requested', function() {
//                   assert.doesNotThrow((() => job.log('Hello')), 'echo occurred without being requested');
//                   assert.doesNotThrow((() => job.log('Hello', { echo: false })), 'echo occurred when explicitly disabled');
//                   assert.throw((() => job.log('Hello', { echo: true })), /info/);
//                   assert.throw((() => job.log('Hello', { echo: true, level: 'info' })), /info/);
//                   assert.throw((() => job.log('Hello', { echo: true, level: 'success' })), /success/);
//                   assert.throw((() => job.log('Hello', { echo: true, level: 'warning' })), /warning/);
//                   return assert.throw((() => job.log('Hello', { echo: true, level: 'danger' })), /danger/);
//                });

//                it("shouldn't echo the log to the console below the level requested", function() {
//                   assert.doesNotThrow((() => job.log('Hello', { echo: 'warning' })));
//                   assert.doesNotThrow((() => job.log('Hello', { echo: 'warning', level: 'info' })));
//                   assert.doesNotThrow((() => job.log('Hello', { echo: 'warning', level: 'success' })));
//                   assert.throw((() => job.log('Hello', { echo: 'warning', level: 'warning' })), /warning/);
//                   return assert.throw((() => job.log('Hello', { echo: 'warning', level: 'danger' })), /danger/);
//                });

//                return after(() => Job.__set__('console', jobConsole));
//             });

//             afterEach(() => Job._ddp_apply.resetHistory());

//             return after(() => Job._ddp_apply.restore());
//          });

//          describe('.progress()', function() {

//             before(() =>
//                sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                   let res;
//                   if (name !== 'root_jobProgress') { throw new Error('Bad method name'); }
//                   const id = params[0];
//                   const runId = params[1];
//                   const completed = params[2];
//                   const total = params[3];
//                   if ( (id === 'thisId') &&
//                        (runId === 'thatId') &&
//                        (typeof completed === 'number') &&
//                        (typeof total === 'number') &&
//                        (0 <= completed && completed <= total) &&
//                        (total > 0) ) {
//                      res = (100 * completed) / total;
//                   } else {
//                      res = false;
//                    }
//                   return [null, res];})));

//             it('should add a valid progress update to the local state when invoked before a job is saved', function() {
//                const j = job.progress(2.5, 10);
//                assert.equal(j, job);
//                return assert.deepEqual(doc.progress, { completed: 2.5, total: 10, percent: 25 });
//           });

//             it('should make valid DDP call when invoked on a saved job', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const res = job.progress(5, 10);
//                return assert.equal(res, 50);
//             });

//             it('should work with a callback', function(done) {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                return job.progress(7.5, 10, function(err, res) {
//                   assert.equal(res, 75);
//                   return done();
//                });
//             });

//             describe('echo option', function() {

//                let jobConsole = null;

//                before(function() {
//                   jobConsole = Job.__get__('console');
//                   return Job.__set__('console',
//                      {info(...params) { throw new Error('info'); }});
//                });

//                it('should progress updates to the console when requested', function() {
//                   assert.doesNotThrow((() => job.progress(0, 100)));
//                   assert.doesNotThrow((() => job.progress(0, 100, { echo: false })));
//                   return assert.throw((() => job.progress(0, 100, { echo: true })), /info/);
//                });

//                return after(() => Job.__set__('console', jobConsole));
//             });

//             it('should throw when given invalid paramters', function() {
//                assert.throw((() => job.progress(true, 100)), /job.progress: something is wrong with progress params/);
//                assert.throw((() => job.progress(0, "hundred")), /job.progress: something is wrong with progress params/);
//                assert.throw((() => job.progress(-1, 100)), /job.progress: something is wrong with progress params/);
//                assert.throw((() => job.progress(2, 1)), /job.progress: something is wrong with progress params/);
//                assert.throw((() => job.progress(0, 0)), /job.progress: something is wrong with progress params/);
//                assert.throw((() => job.progress(0, -1)), /job.progress: something is wrong with progress params/);
//                return assert.throw((() => job.progress(-2, -1)), /job.progress: something is wrong with progress params/);
//             });

//             afterEach(() => Job._ddp_apply.resetHistory());

//             return after(() => Job._ddp_apply.restore());
//          });

//          describe('.done()', function() {

//             before(() =>
//                sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                   let res;
//                   if (name !== 'root_jobDone') { throw new Error('Bad method name'); }
//                   const id = params[0];
//                   const runId = params[1];
//                   const result = params[2];
//                   const options = params[3];
//                   if ( (id === 'thisId') &&
//                        (runId === 'thatId') &&
//                        (typeof result === 'object')) {
//                      res = result;
//                   } else if (options.resultId) {
//                      res = result.resultId;
//                   } else {
//                      res = false;
//                    }
//                   return [null, res];})));

//             it('should make valid DDP call when invoked on a running job', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const res = job.done();
//                return assert.deepEqual(res, {});
//           });

//             it('should properly handle a result object', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const result = {
//                   foo: 'bar',
//                   status: 0
//                 };
//                const res = job.done(result);
//                return assert.deepEqual(res, result);
//             });

//             it('should properly handle a non-object result', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const result = "Done!";
//                const res = job.done(result);
//                return assert.deepEqual(res, { value: result });
//           });

//             it('should work with a callback', function(done) {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                return job.done(function(err, res) {
//                   assert.deepEqual(res, {});
//                   return done();
//                });
//             });

//             it('should throw when called on an unsaved job', () => assert.throw((() => job.done()), /an unsaved or non-running job/));

//             it('should throw when called on a nonrunning job', function() {
//                doc._id = 'thisId';
//                return assert.throw((() => job.done()), /an unsaved or non-running job/);
//             });

//             it('should properly pass the repeatId option', function() {
//                doc._id = 'someId';
//                doc.runId = 'otherId';
//                return job.done({ repeatId: "testID" }, { repeatId: true }, function(err, res) {
//                   assert.deepEqual(res, "testID");
//                   return done();
//                });
//             });

//             afterEach(() => Job._ddp_apply.resetHistory());

//             return after(() => Job._ddp_apply.restore());
//          });

//          describe('.fail()', function() {

//             before(() =>
//                sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                   let res;
//                   if (name !== 'root_jobFail') { throw new Error('Bad method name'); }
//                   const id = params[0];
//                   const runId = params[1];
//                   const err = params[2];
//                   const options = params[3];
//                   if ( (id === 'thisId') &&
//                        (runId === 'thatId') &&
//                        (typeof err === 'object')) {
//                      if (options.fatal) {
//                         throw new Error("Fatal Error!");
//                       }
//                      res = err;
//                   } else {
//                      res = false;
//                    }
//                   return [null, res];})));

//             it('should make valid DDP call when invoked on a running job', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const res = job.fail();
//                return assert.deepEqual(res, { value: "No error information provided" });
//           });

//             it('should properly handle an error string', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const err = 'This is an error';
//                const res = job.fail(err);
//                return assert.deepEqual(res, { value: err });
//           });

//             it('should properly handle an error object', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                const err = { message: 'This is an error' };
//                const res = job.fail(err);
//                return assert.equal(res, err);
//             });

//             it('should work with a callback', function(done) {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                return job.fail(function(err, res) {
//                   assert.equal(res.value, "No error information provided");
//                   return done();
//                });
//             });

//             it('should properly handle the fatal option', function() {
//                doc._id = 'thisId';
//                doc.runId = 'thatId';
//                return assert.throw((() => job.fail("Fatal error!", { fatal: true })), /Fatal Error!/);
//             });

//             it('should throw when called on an unsaved job', () => assert.throw((() => job.fail()), /an unsaved or non-running job/));

//             it('should throw when called on a nonrunning job', function() {
//                doc._id = 'thisId';
//                return assert.throw((() => job.fail()), /an unsaved or non-running job/);
//             });

//             afterEach(() => Job._ddp_apply.resetHistory());

//             return after(() => Job._ddp_apply.restore());
//          });

//          return describe('job control operation', function() {

//             const makeJobControl = (op, method) =>

//                describe(op, function() {

//                   before(() =>
//                      sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                         let res;
//                         if (name !== `root_${method}`) { throw new Error(`Bad method name: ${name}`); }
//                         const id = params[0];
//                         if (id === 'thisId') {
//                            res = true;
//                         } else {
//                            res = false;
//                          }
//                         return [null, res];})));

//                   it('should properly invoke the DDP method', function() {
//                      assert.isFunction(job[op]);
//                      doc._id = 'thisId';
//                      const res = job[op]();
//                      return assert.isTrue(res);
//                   });

//                   it('should return false if the id is not on the server', function() {
//                      assert.isFunction(job[op]);
//                      doc._id = 'badId';
//                      const res = job[op]();
//                      return assert.isFalse(res);
//                   });

//                   it('should work with a callback', function(done) {
//                      let res;
//                      assert.isFunction(job[op]);
//                      doc._id = 'thisId';
//                      return res = job[op](function(err, res) {
//                         assert.isTrue(res);
//                         return done();
//                      });
//                   });

//                   if (['pause', 'resume'].includes(op)) {
//                      it('should alter local state when called on an unsaved job', function() {
//                         const bad = 'badStatus';
//                         doc.status = bad;
//                         const res = job[op]();
//                         assert.equal(res, job);
//                         return assert.notEqual(doc.status, bad);
//                      });

//                      it('should alter local state when called on an unsaved job with callback', function(done) {
//                         let res;
//                         const bad = 'badStatus';
//                         doc.status = bad;
//                         return res = job[op](function(err, res) {
//                            assert.isTrue(res);
//                            assert.notEqual(doc.status, bad);
//                            return done();
//                         });
//                      });
//                   } else {
//                      it('should throw when called on an unsaved job', () => assert.throw((() => job[op]()), /on an unsaved job/));
//                    }

//                   afterEach(() => Job._ddp_apply.resetHistory());

//                   return after(() => Job._ddp_apply.restore());
//                })
//              ;

//             makeJobControl('pause', 'jobPause');
//             makeJobControl('resume', 'jobResume');
//             makeJobControl('ready', 'jobReady');
//             makeJobControl('cancel', 'jobCancel');
//             makeJobControl('restart', 'jobRestart');
//             makeJobControl('rerun', 'jobRerun');
//             return makeJobControl('remove', 'jobRemove');
//          });
//       });

//       return describe('class method', function() {

//          describe('getWork', function() {

//             before(() =>
//                sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                   if (name !== 'root_getWork') { throw new Error('Bad method name'); }
//                   const type = params[0][0];
//                   const max = (params[1] != null ? params[1].maxJobs : undefined) != null ? (params[1] != null ? params[1].maxJobs : undefined) : 1;
//                   const res = (() => { switch (type) {
//                      case 'work':
//                         return ( __range__(1, max, true).map((i) => new Job('root', type, { i: 1 })._doc) );
//                      case 'nowork':
//                         return [];
//                   } })();
//                   return [null, res];})));

//             it('should make a DDP method call and return a Job by default without callback', function() {
//                const res = Job.getWork('root', 'work', {});
//                return assert.instanceOf(res, Job);
//             });

//             it('should return undefined when no work is available without callback', function() {
//                const res = Job.getWork('root', 'nowork', {});
//                return assert.isUndefined(res);
//             });

//             it('should return an array of Jobs when options.maxJobs > 1 without callback', function() {
//                const res = Job.getWork('root', 'work', { maxJobs: 2 });
//                assert.isArray(res);
//                assert.lengthOf(res, 2);
//                return assert.instanceOf(res[0], Job);
//             });

//             it('should return an empty array when options.maxJobs > 1 and there is no work without callback', function() {
//                const res = Job.getWork('root', 'nowork', { maxJobs: 2 });
//                assert.isArray(res);
//                return assert.lengthOf(res, 0);
//             });

//             it('should throw when given on invalid value for the timeout option', function() {
//                assert.throw((() => Job.getWork('root', 'nowork', { workTimeout: "Bad" })), /must be a positive integer/);
//                assert.throw((() => Job.getWork('root', 'nowork', { workTimeout: 0 })), /must be a positive integer/);
//                return assert.throw((() => Job.getWork('root', 'nowork', { workTimeout: -1 })), /must be a positive integer/);
//             });

//             afterEach(() => Job._ddp_apply.resetHistory());

//             return after(() => Job._ddp_apply.restore());
//          });

//          describe('makeJob', function() {

//             const jobDoc = function() {
//                const j = new Job('root', 'work', {})._doc;
//                j._id = { _str: 'skljfdf9s0ujfsdfl3' };
//                return j;
//              };

//             it('should return a valid job instance when called with a valid job document', function() {
//                const res = new Job('root', jobDoc());
//                return assert.instanceOf(res, Job);
//             });

//             return it('should throw when passed invalid params', function() {
//                assert.throw((() => new Job()), /bad parameter/);
//                assert.throw((() => new Job(5, jobDoc())), /bad parameter/);
//                return assert.throw((() => new Job('work', {})), /bad parameter/);
//             });
//          });

//          describe('get Job(s) by ID', function() {

//             const getJobStub = function(name, params) {
//                let res;
//                let j;
//                if (name !== 'root_getJob') { throw new Error('Bad method name'); }
//                const ids = params[0];

//                const one = function(id) {
//                   j = (() => { switch (id) {
//                      case 'goodID':
//                         return new Job('root', 'work', { i: 1 })._doc;
//                      default:
//                         return undefined;
//                   } })();
//                   return j;
//                 };

//                if (ids instanceof Array) {
//                   res = ((() => {
//                     const result = [];
//                     for (j of ids) {
//                       if (j === 'goodID') {
//                         result.push(one(j));
//                       }
//                     }
//                     return result;
//                   })());
//                } else {
//                   res = one(ids);
//                 }

//                return [null, res];
//              };

//             describe('getJob', function() {

//                before(() => sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(getJobStub)));

//                it('should return a valid job instance when called with a good id', function() {
//                   const res = Job.getJob('root', 'goodID');
//                   return assert.instanceOf(res, Job);
//                });

//                it('should return undefined when called with a bad id', function() {
//                   const res = Job.getJob('root', 'badID');
//                   return assert.isUndefined(res);
//                });

//                afterEach(() => Job._ddp_apply.resetHistory());

//                return after(() => Job._ddp_apply.restore());
//             });

//             return describe('getJobs', function() {

//                before(() => sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(getJobStub)));

//                it('should return valid job instances for good IDs only', function() {
//                   const res = Job.getJobs('root', ['goodID', 'badID', 'goodID']);
//                   assert(Job._ddp_apply.calledOnce, 'getJob method called more than once');
//                   assert.isArray(res);
//                   assert.lengthOf(res, 2);
//                   assert.instanceOf(res[0], Job);
//                   return assert.instanceOf(res[1], Job);
//                });

//                it('should return an empty array for all bad IDs', function() {
//                   const res = Job.getJobs('root', ['badID', 'badID', 'badID']);
//                   assert(Job._ddp_apply.calledOnce, 'getJob method called more than once');
//                   assert.isArray(res);
//                   return assert.lengthOf(res, 0);
//                });

//                afterEach(() => Job._ddp_apply.resetHistory());

//                return after(() => Job._ddp_apply.restore());
//             });
//          });

//          describe('multijob operation', function() {

//             const makeMulti = (op, method) =>

//                describe(op, function() {

//                   before(() =>
//                      sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                         if (name !== `root_${method}`) { throw new Error(`Bad method name: ${name}`); }
//                         const ids = params[0];
//                         return [null, ids.indexOf('goodID') !== -1];})));

//                   it('should return true if there are any good IDs', function() {
//                      assert.isFunction(Job[op]);
//                      const res = Job[op]('root', ['goodID', 'badID', 'goodID']);
//                      assert(Job._ddp_apply.calledOnce, `${op} method called more than once`);
//                      assert.isBoolean(res);
//                      return assert.isTrue(res);
//                   });

//                   it('should return false if there are all bad IDs', function() {
//                      assert.isFunction(Job[op]);
//                      const res = Job[op]('root', ['badID', 'badID']);
//                      assert(Job._ddp_apply.calledOnce, `${op} method called more than once`);
//                      assert.isBoolean(res);
//                      return assert.isFalse(res);
//                   });

//                   afterEach(() => Job._ddp_apply.resetHistory());

//                   return after(() => Job._ddp_apply.restore());
//                })
//              ;

//             makeMulti('pauseJobs', 'jobPause');
//             makeMulti('resumeJobs', 'jobResume');
//             makeMulti('cancelJobs', 'jobCancel');
//             makeMulti('restartJobs', 'jobRestart');
//             return makeMulti('removeJobs', 'jobRemove');
//          });

//          return describe('control method', function() {

//             const makeControl = op =>

//                describe(op, function() {

//                   before(() =>
//                      sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//                         if (name !== `root_${op}`) { throw new Error(`Bad method name: ${name}`); }
//                         return [null, true];})));

//                   it('should return a boolean', function() {
//                      assert.isFunction(Job[op]);
//                      const res = Job[op]('root');
//                      assert(Job._ddp_apply.calledOnce, `${op} method called more than once`);
//                      return assert.isBoolean(res);
//                   });

//                   afterEach(() => Job._ddp_apply.resetHistory());

//                   return after(() => Job._ddp_apply.restore());
//                })
//              ;

//             makeControl('startJobs');
//             makeControl('stopJobs');
//             makeControl('startJobServer');
//             return makeControl('shutdownJobServer');
//          });
//       });
//    });
// });

// //##########################################

// describe('JobQueue', function() {

//    const ddp = new DDP();
//    let failCalls = 0;
//    let doneCalls = 0;
//    let numJobs = 5;

//    before(function() {
//       Job._ddp_apply = undefined;
//       Job.setDDP(ddp);
//       return sinon.stub(Job, "_ddp_apply").callsFake(makeDdpStub(function(name, params) {
//          let err = null;
//          let res = null;
//          const makeJobDoc = function(idx) {
//             if (idx == null) { idx = 0; }
//             const job = new Job('root', 'work', { idx });
//             const doc = job._doc;
//             doc._id = `thisId${idx}`;
//             doc.runId = `thatId${idx}`;
//             doc.status = 'running';
//             return doc;
//           };
//          switch (name) {
//             case 'root_jobDone':
//                doneCalls++;
//                res = true;
//               break;
//             case 'root_jobFail':
//                failCalls++;
//                res = true;
//               break;
//             case 'root_getWork':
//                var type = params[0][0];
//                var max = (params[1] != null ? params[1].maxJobs : undefined) != null ? (params[1] != null ? params[1].maxJobs : undefined) : 1;
//                if (numJobs === 0) {
//                   res = [];
//                } else {
//                   switch (type) {
//                      case 'noWork':
//                         res = [];
//                        break;
//                      case 'work':
//                         numJobs--;
//                         res = [ makeJobDoc() ];
//                        break;
//                      case 'workMax':
//                         if (max < numJobs) {
//                            max = numJobs;
//                          }
//                         numJobs -= max;
//                         res = (__range__(1, max, true).map((i) => makeJobDoc(i)));
//                        break;
//                      case 'returnError':
//                         err = new Error("MongoError: connection n to w.x.y.z:27017 timed out");
//                        break;
//                   }
//                 }
//               break;
//             default:
//                throw new Error(`Bad method name: ${name}`);
//          }
//          return [err, res];}));});

//    beforeEach(function() {
//       failCalls = 0;
//       doneCalls = 0;
//       return numJobs = 5;
//    });

//    it('should throw when an invalid options are used', function(done) {
//      assert.throws((() => Job.processJobs(42, 'noWork', { }, function(job, cb) {})),
//        /must be nonempty string/);
//      assert.throws((() => Job.processJobs('', 'noWork', { }, function(job, cb) {})),
//        /must be nonempty string/);
//      assert.throws((() => Job.processJobs('root', 42, { }, function(job, cb) {})),
//        /must be nonempty string or array of nonempty strings/);
//      assert.throws((() => Job.processJobs('root', '', { }, function(job, cb) {})),
//        /must be nonempty string or array of nonempty strings/);
//      assert.throws((() => Job.processJobs('root', [], { }, function(job, cb) {})),
//        /must be nonempty string or array of nonempty strings/);
//      assert.throws((() => Job.processJobs('root', [''], { }, function(job, cb) {})),
//        /must be nonempty string or array of nonempty strings/);
//      assert.throws((() => Job.processJobs('root', ['noWork',''], { }, function(job, cb) {})),
//        /must be nonempty string or array of nonempty strings/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { pollInterval: -1 }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { concurrency: 'Bad' }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { concurrency: -1 }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { payload: 'Bad' }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { payload: -1 }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { prefetch: 'Bad' }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { prefetch: -1 }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { workTimeout: 'Bad' }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { workTimeout: -1 }, function(job, cb) {})),
//        /must be a positive integer/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { callbackStrict: 1 }, function(job, cb) {})),
//        /must be a boolean/);
//      assert.throws((() => Job.processJobs('root', 'noWork', { errorCallback: 1 }, function(job, cb) {})),
//        /must be a function/);
//      return done();
//    });

//    it('should return a valid JobQueue when called', function(done) {
//       const q = Job.processJobs('root', 'noWork', { pollInterval: 100 }, function(job, cb) {
//          job.done();
//          return cb(null);
//       });
//       assert.instanceOf(q, Job.__get__("JobQueue"));
//       return q.shutdown({ quiet: true }, function() {
//          assert.equal(doneCalls, 0);
//          assert.equal(failCalls, 0);
//          return done();
//       });
//    });

//    it('should return a valid JobQueue when called with array of job types', function(done) {
//       const q = Job.processJobs('root', ['noWork', 'noWork2'], { pollInterval: 100 }, function(job, cb) {
//          job.done();
//          return cb(null);
//       });
//       assert.instanceOf(q, Job.__get__("JobQueue"));
//       return q.shutdown({ quiet: true }, function() {
//          assert.equal(doneCalls, 0);
//          assert.equal(failCalls, 0);
//          return done();
//       });
//    });

//    it('should send shutdown notice to console when quiet is false', function(done) {
//       const jobConsole = Job.__get__('console');
//       const revert = Job.__set__({
//          console: {
//             info(...params) { throw new Error('info'); },
//             log(...params) { throw new Error('success'); },
//             warn(...params) { throw new Error('warning'); },
//             error(...params) { throw new Error('danger'); }
//           }
//       });
//       const q = Job.processJobs('root', 'noWork', { pollInterval: 100 }, function(job, cb) {
//          job.done();
//          return cb(null);
//       });
//       assert.instanceOf(q, Job.__get__("JobQueue"));
//       assert.throws((() => q.shutdown(() => done())), /warning/);
//       revert();
//       return q.shutdown({ quiet: true }, function() {
//          assert.equal(doneCalls, 0);
//          assert.equal(failCalls, 0);
//          return done();
//       });
//    });

//    it('should invoke worker when work is returned', function(done) {
//       let q;
//       return q = Job.processJobs('root', 'work', { pollInterval: 100 }, function(job, cb) {
//          job.done();
//          q.shutdown({ quiet: true }, function() {
//             assert.equal(doneCalls, 1);
//             assert.equal(failCalls, 0);
//             return done();
//          });
//          return cb(null);
//       });
//    });

//    it('should invoke worker when work is returned from a manual trigger', function(done) {
//       var q = Job.processJobs('root', 'work', { pollInterval: 0 }, function(job, cb) {
//          job.done();
//          q.shutdown({ quiet: true }, function() {
//             assert.equal(doneCalls, 1);
//             assert.equal(failCalls, 0);
//             return done();
//          });
//          return cb(null);
//       });
//       assert.equal(q.pollInterval, Job.forever);
//       assert.isNull(q._interval);
//       return setTimeout(
//          () => q.trigger(),
//          20
//       );
//    });

//    it('should successfully start in paused state and resume', function(done) {
//       let flag = false;
//       var q = Job.processJobs('root', 'work', { pollInterval: 10 }, function(job, cb) {
//          assert.isTrue(flag);
//          job.done();
//          q.shutdown({ quiet: true }, function() {
//             assert.equal(doneCalls, 1);
//             assert.equal(failCalls, 0);
//             return done();
//          });
//          return cb(null);
//       }).pause();
//       return setTimeout(
//          function() {
//             flag = true;
//             return q.resume();
//           },
//          20
//       );
//    });

//    it('should successfully accept multiple jobs from getWork', function(done) {
//       let q;
//       let count = 5;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, prefetch: 4 }, function(job, cb) {
//          assert.equal(q.length(), count-1, 'q.length is incorrect');
//          assert.equal(q.running(), 1, 'q.running is incorrect');
//          if (count === 5) {
//             assert.isTrue(q.full(), 'q.full should be true');
//             assert.isFalse(q.idle(), 'q.idle should be false');
//           }
//          job.done();
//          count--;
//          if (count === 0) {
//             q.shutdown({ quiet: true }, function() {
//                assert.equal(doneCalls, 5, 'doneCalls is incorrect');
//                assert.equal(failCalls, 0, 'failCalls is incorrect');
//                return done();
//             });
//           }
//          return cb(null);
//       });
//    });

//    it('should successfully accept and process multiple simultaneous jobs concurrently', function(done) {
//       let q;
//       let count = 0;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, concurrency: 5 }, function(job, cb) {
//          count++;
//          return setTimeout(
//             function() {
//                assert.equal(q.length(), 0);
//                assert.equal(q.running(), count);
//                count--;
//                job.done();
//                if (!(count > 0)) {
//                   q.shutdown({ quiet: true }, function() {
//                      assert.equal(doneCalls, 5);
//                      assert.equal(failCalls, 0);
//                      return done();
//                   });
//                 }
//                return cb(null);
//              },
//             25
//          );
//       });
//    });

//    it('should successfully accept and process multiple simultaneous jobs in one worker', function(done) {
//       let q;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, payload: 5 }, function(jobs, cb) {
//          assert.equal(jobs.length, 5);
//          assert.equal(q.length(), 0);
//          assert.equal(q.running(), 1);
//          for (let j of jobs) { j.done(); }
//          q.shutdown({ quiet: true }, function() {
//             assert.equal(doneCalls, 5);
//             assert.equal(failCalls, 0);
//             return done();
//          });
//          return cb();
//       });
//    });

//    it('should successfully accept and process multiple simultaneous jobs concurrently and within workers', function(done) {
//       let q;
//       let count = 0;
//       numJobs = 25;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, payload: 5, concurrency: 5 }, function(jobs, cb) {
//          count += jobs.length;
//          return setTimeout(
//             function() {
//                assert.equal(q.length(), 0);
//                assert.equal(q.running(), count / 5);
//                count -= jobs.length;
//                for (let j of jobs) { j.done(); }
//                if (!(count > 0)) {
//                   q.shutdown({ quiet: true }, function() {
//                      assert.equal(doneCalls, 25);
//                      assert.equal(failCalls, 0);
//                      return done();
//                   });
//                 }
//                return cb(null);
//              },
//             25
//          );
//       });
//    });

//    it('should successfully perform a soft shutdown', function(done) {
//       let q;
//       let count = 5;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, prefetch: 4 }, function(job, cb) {
//          count--;
//          assert.equal(q.length(), count);
//          assert.equal(q.running(), 1);
//          assert.isTrue(q.full());
//          job.done();
//          if (count === 4) {
//             q.shutdown({ quiet: true, level: 'soft' }, function() {
//                assert(count === 0);
//                assert.equal(q.length(), 0);
//                assert.isFalse(Job._ddp_apply.calledWith("root_jobFail"));
//                assert.equal(doneCalls, 5);
//                assert.equal(failCalls, 0);
//                return done();
//             });
//           }
//          return cb(null);
//       });
//    });

//    it('should successfully perform a normal shutdown', function(done) {
//       let q;
//       let count = 5;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, concurrency: 2, prefetch: 3 }, (job, cb) =>
//          setTimeout(
//             function() {
//                count--;
//                job.done();
//                if (count === 4) {
//                   q.shutdown({ quiet: true, level: 'normal' }, function() {
//                      assert.equal(count, 3);
//                      assert.equal(q.length(), 0);
//                      assert.isTrue(Job._ddp_apply.calledWith("root_jobFail"));
//                      assert.equal(doneCalls, 2);
//                      assert.equal(failCalls, 3);
//                      return done();
//                   });
//                 }
//                return cb(null);
//              },
//             25
//          )
//       );
//    });


//    it('should successfully perform a normal shutdown with both payload and concurrency', function(done) {
//       let q;
//       let count = 0;
//       numJobs = 25;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, payload: 5, concurrency: 2, prefetch: 15 }, function(jobs, cb) {
//          count += jobs.length;
//          return setTimeout(
//             function() {
//                assert.equal(q.running(), count / 5);
//                count -= jobs.length;
//                for (let j of jobs) { j.done(); }
//                if (count === 5) {
//                   q.shutdown({ quiet: true }, function() {
//                      assert.equal(q.length(), 0, 'jobs remain in task list');
//                      assert.equal(count, 0, 'count is wrong value');
//                      assert.isTrue(Job._ddp_apply.calledWith("root_jobFail"));
//                      assert.equal(doneCalls, 10);
//                      assert.equal(failCalls, 15);
//                      return done();
//                   });
//                 }
//                return cb(null);
//              },
//             25
//          );
//       });
//    });

//    it('should successfully perform a hard shutdown', function(done) {
//       let q;
//       let count = 0;
//       let time = 20;
//       return q = Job.processJobs('root', 'workMax', { pollInterval: 100, concurrency: 2, prefetch: 3 }, function(job, cb) {
//          setTimeout(
//             function() {
//                count++;
//                if (count === 1) {
//                   job.done();
//                   q.shutdown({ level: 'hard', quiet: true }, function() {
//                      assert.equal(q.length(), 0);
//                      assert.equal(count, 1);
//                      assert.isTrue(Job._ddp_apply.calledWith("root_jobFail"));
//                      assert.equal(doneCalls, 1, 'wrong number of .done() calls');
//                      assert.equal(failCalls, 4, 'wrong number of .fail() calls');
//                      return done();
//                   });
//                   return cb(null);
//                 }
//              },  // Other workers will never call back
//             time
//          );
//          return time += 20;
//       });
//    });

//    it('should throw when using callbackStrict option and multiple callback invokes happen', function(done) {
//       let q;
//       return q = Job.processJobs('root', 'work', { callbackStrict: true, pollInterval: 100, concurrency: 1, prefetch: 0 }, (job, cb) =>
//          setTimeout(
//             function() {
//                job.done();
//                cb();
//                assert.throws(cb, /callback was invoked multiple times/);
//                return q.shutdown({ level: 'hard', quiet: true }, function() {
//                   assert.equal(doneCalls, 1);
//                   assert.equal(failCalls, 0);
//                   return done();
//                });
//              },
//             25
//          )
//       );
//    });

//    it('should throw when using callbackStrict option and multiple callback invokes happen 2', function(done) {
//       let q;
//       return q = Job.processJobs('root', 'work', { callbackStrict: true, pollInterval: 100, concurrency: 1, prefetch: 0 }, (job, cb) =>
//          setTimeout(
//             function() {
//                job.done(function() {
//                   assert.throws(cb, /callback was invoked multiple times/);
//                   return q.shutdown({ level: 'hard', quiet: true }, function() {
//                      assert.equal(doneCalls, 1);
//                      assert.equal(failCalls, 0);
//                      return done();
//                   });
//                });
//                return cb();
//              },
//             25
//          )
//       );
//    });

//    it('should invoke errorCallback when an error is returned from getWork', function(done) {
//       let q;
//       const ecb = function(err, res) {
//          assert.instanceOf(err, Error);
//          return q.shutdown({ level: 'hard', quiet: true }, function() {
//             assert.equal(doneCalls, 0);
//             assert.equal(failCalls, 0);
//             return done();
//          });
//        };

//       return q = Job.processJobs('root', 'returnError', { pollInterval: 100, concurrency: 1, prefetch: 0, errorCallback: ecb }, function(job, cb) {} );
//    });

//    afterEach(() => Job._ddp_apply.resetHistory());

//    return after(() => Job._ddp_apply.restore());
// });

// function __range__(left, right, inclusive) {
//   let range = [];
//   let ascending = left < right;
//   let end = !inclusive ? right : ascending ? right + 1 : right - 1;
//   for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
//     range.push(i);
//   }
//   return range;
// }
