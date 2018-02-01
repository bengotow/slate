'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _mergeWith = require('lodash/mergeWith');

var _mergeWith2 = _interopRequireDefault(_mergeWith);

var _immutable = require('immutable');

var _slateSchemaViolations = require('slate-schema-violations');

var _coreSchemaRules = require('../constants/core-schema-rules');

var _coreSchemaRules2 = _interopRequireDefault(_coreSchemaRules);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _stack = require('./stack');

var _stack2 = _interopRequireDefault(_stack);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:schema');

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  stack: _stack2.default.create(),
  document: {},
  blocks: {},
  inlines: {}
};

/**
 * Schema.
 *
 * @type {Schema}
 */

var Schema = function (_Record) {
  _inherits(Schema, _Record);

  function Schema() {
    _classCallCheck(this, Schema);

    return _possibleConstructorReturn(this, (Schema.__proto__ || Object.getPrototypeOf(Schema)).apply(this, arguments));
  }

  _createClass(Schema, [{
    key: 'getRule',


    /**
     * Get the rule for an `object`.
     *
     * @param {Mixed} object
     * @return {Object}
     */

    value: function getRule(object) {
      switch (object.object) {
        case 'document':
          return this.document;
        case 'block':
          return this.blocks[object.type];
        case 'inline':
          return this.inlines[object.type];
      }
    }

    /**
     * Get a dictionary of the parent rule validations by child type.
     *
     * @return {Object|Null}
     */

  }, {
    key: 'getParentRules',
    value: function getParentRules() {
      var blocks = this.blocks,
          inlines = this.inlines;

      var parents = {};

      for (var key in blocks) {
        var rule = blocks[key];
        if (rule.parent == null) continue;
        parents[key] = rule;
      }

      for (var _key in inlines) {
        var _rule = inlines[_key];
        if (_rule.parent == null) continue;
        parents[_key] = _rule;
      }

      return Object.keys(parents).length == 0 ? null : parents;
    }

    /**
     * Fail validation by returning a normalizing change function.
     *
     * @param {String} violation
     * @param {Object} context
     * @return {Function}
     */

  }, {
    key: 'fail',
    value: function fail(violation, context) {
      var _this2 = this;

      return function (change) {
        debug('normalizing', { violation: violation, context: context });
        var rule = context.rule;
        var size = change.operations.size;

        if (rule.normalize) rule.normalize(change, violation, context);
        if (change.operations.size > size) return;
        _this2.normalize(change, violation, context);
      };
    }

    /**
     * Normalize an invalid value with `violation` and `context`.
     *
     * @param {Change} change
     * @param {String} violation
     * @param {Mixed} context
     */

  }, {
    key: 'normalize',
    value: function normalize(change, violation, context) {
      switch (violation) {
        case _slateSchemaViolations.CHILD_OBJECT_INVALID:
        case _slateSchemaViolations.CHILD_TYPE_INVALID:
        case _slateSchemaViolations.CHILD_UNKNOWN:
        case _slateSchemaViolations.FIRST_CHILD_OBJECT_INVALID:
        case _slateSchemaViolations.FIRST_CHILD_TYPE_INVALID:
        case _slateSchemaViolations.LAST_CHILD_OBJECT_INVALID:
        case _slateSchemaViolations.LAST_CHILD_TYPE_INVALID:
          {
            var child = context.child,
                node = context.node;

            return child.object == 'text' && node.object == 'block' && node.nodes.size == 1 ? change.removeNodeByKey(node.key) : change.removeNodeByKey(child.key);
          }

        case _slateSchemaViolations.CHILD_REQUIRED:
        case _slateSchemaViolations.NODE_TEXT_INVALID:
        case _slateSchemaViolations.PARENT_OBJECT_INVALID:
        case _slateSchemaViolations.PARENT_TYPE_INVALID:
          {
            var _node = context.node;

            return _node.object == 'document' ? _node.nodes.forEach(function (child) {
              return change.removeNodeByKey(child.key);
            }) : change.removeNodeByKey(_node.key);
          }

        case _slateSchemaViolations.NODE_DATA_INVALID:
          {
            var _node2 = context.node,
                key = context.key;

            return _node2.data.get(key) === undefined && _node2.object != 'document' ? change.removeNodeByKey(_node2.key) : change.setNodeByKey(_node2.key, { data: _node2.data.delete(key) });
          }

        case _slateSchemaViolations.NODE_IS_VOID_INVALID:
          {
            var _node3 = context.node;

            return change.setNodeByKey(_node3.key, { isVoid: !_node3.isVoid });
          }

        case _slateSchemaViolations.NODE_MARK_INVALID:
          {
            var _node4 = context.node,
                mark = context.mark;

            return _node4.getTexts().forEach(function (t) {
              return change.removeMarkByKey(t.key, 0, t.text.length, mark);
            });
          }
      }
    }

    /**
     * Validate a `node` with the schema, returning a function that will fix the
     * invalid node, or void if the node is valid.
     *
     * @param {Node} node
     * @return {Function|Void}
     */

  }, {
    key: 'validateNode',
    value: function validateNode(node) {
      var _this3 = this;

      var ret = this.stack.find('validateNode', node);
      if (ret) return ret;

      if (node.object == 'text') return;

      var rule = this.getRule(node) || {};
      var parents = this.getParentRules();
      var ctx = { node: node, rule: rule };

      if (rule.isVoid != null) {
        if (node.isVoid != rule.isVoid) {
          return this.fail(_slateSchemaViolations.NODE_IS_VOID_INVALID, ctx);
        }
      }

      if (rule.data != null) {
        for (var key in rule.data) {
          var fn = rule.data[key];
          var value = node.data.get(key);

          if (!fn(value)) {
            return this.fail(_slateSchemaViolations.NODE_DATA_INVALID, _extends({}, ctx, { key: key, value: value }));
          }
        }
      }

      if (rule.marks != null) {
        var marks = node.getMarks().toArray();

        var _loop = function _loop(mark) {
          if (!rule.marks.some(function (def) {
            return def.type === mark.type;
          })) {
            return {
              v: _this3.fail(_slateSchemaViolations.NODE_MARK_INVALID, _extends({}, ctx, { mark: mark }))
            };
          }
        };

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = marks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var mark = _step.value;

            var _ret = _loop(mark);

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      if (rule.text != null) {
        var text = node.text;


        if (!rule.text.test(text)) {
          return this.fail(_slateSchemaViolations.NODE_TEXT_INVALID, _extends({}, ctx, { text: text }));
        }
      }

      if (rule.first != null) {
        var _rule$first = rule.first,
            objects = _rule$first.objects,
            types = _rule$first.types;

        var child = node.nodes.first();

        if (child && objects && !objects.includes(child.object)) {
          return this.fail(_slateSchemaViolations.FIRST_CHILD_OBJECT_INVALID, _extends({}, ctx, { child: child }));
        }

        if (child && types && !types.includes(child.type)) {
          return this.fail(_slateSchemaViolations.FIRST_CHILD_TYPE_INVALID, _extends({}, ctx, { child: child }));
        }
      }

      if (rule.last != null) {
        var _rule$last = rule.last,
            _objects = _rule$last.objects,
            _types = _rule$last.types;

        var _child = node.nodes.last();

        if (_child && _objects && !_objects.includes(_child.object)) {
          return this.fail(_slateSchemaViolations.LAST_CHILD_OBJECT_INVALID, _extends({}, ctx, { child: _child }));
        }

        if (_child && _types && !_types.includes(_child.type)) {
          return this.fail(_slateSchemaViolations.LAST_CHILD_TYPE_INVALID, _extends({}, ctx, { child: _child }));
        }
      }

      if (rule.nodes != null || parents != null) {
        var nextDef = function nextDef() {
          offset = offset == null ? null : 0;
          def = defs.shift();
          min = def && (def.min == null ? 0 : def.min);
          max = def && (def.max == null ? Infinity : def.max);
          return !!def;
        };

        var nextChild = function nextChild() {
          index = index == null ? 0 : index + 1;
          offset = offset == null ? 0 : offset + 1;
          _child2 = children[index];
          if (max != null && offset == max) nextDef();
          return !!_child2;
        };

        var rewind = function rewind() {
          offset -= 1;
          index -= 1;
        };

        var children = node.nodes.toArray();
        var defs = rule.nodes != null ? rule.nodes.slice() : [];

        var offset = void 0;
        var min = void 0;
        var index = void 0;
        var def = void 0;
        var max = void 0;
        var _child2 = void 0;

        if (rule.nodes != null) {
          nextDef();
        }

        while (nextChild()) {
          if (parents != null && _child2.object != 'text' && _child2.type in parents) {
            var r = parents[_child2.type];

            if (r.parent.objects != null && !r.parent.objects.includes(node.object)) {
              return this.fail(_slateSchemaViolations.PARENT_OBJECT_INVALID, { node: _child2, parent: node, rule: r });
            }

            if (r.parent.types != null && !r.parent.types.includes(node.type)) {
              return this.fail(_slateSchemaViolations.PARENT_TYPE_INVALID, { node: _child2, parent: node, rule: r });
            }
          }

          if (rule.nodes != null) {
            if (!def) {
              return this.fail(_slateSchemaViolations.CHILD_UNKNOWN, _extends({}, ctx, { child: _child2, index: index }));
            }

            if (def.objects != null && !def.objects.includes(_child2.object)) {
              if (offset >= min && nextDef()) {
                rewind();
                continue;
              }
              return this.fail(_slateSchemaViolations.CHILD_OBJECT_INVALID, _extends({}, ctx, { child: _child2, index: index }));
            }

            if (def.types != null && !def.types.includes(_child2.type)) {
              if (offset >= min && nextDef()) {
                rewind();
                continue;
              }
              return this.fail(_slateSchemaViolations.CHILD_TYPE_INVALID, _extends({}, ctx, { child: _child2, index: index }));
            }
          }
        }

        if (rule.nodes != null) {
          while (min != null) {
            if (offset < min) {
              return this.fail(_slateSchemaViolations.CHILD_REQUIRED, _extends({}, ctx, { index: index }));
            }

            nextDef();
          }
        }
      }
    }

    /**
     * Return a JSON representation of the schema.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        document: this.document,
        blocks: this.blocks,
        inlines: this.inlines
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get() {
      return 'schema';
    }
  }, {
    key: 'kind',
    get: function get() {
      _slateDevLogger2.default.deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Schema` with `attrs`.
     *
     * @param {Object|Schema} attrs
     * @return {Schema}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Schema.isSchema(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Schema.fromJSON(attrs);
      }

      throw new Error('`Schema.create` only accepts objects or schemas, but you passed it: ' + attrs);
    }

    /**
     * Create a `Schema` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Schema}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Schema.isSchema(object)) {
        return object;
      }

      var plugins = object.plugins;


      if (object.rules) {
        throw new Error('Schemas in Slate have changed! They are no longer accept a `rules` property.');
      }

      if (object.nodes) {
        throw new Error('Schemas in Slate have changed! They are no longer accept a `nodes` property.');
      }

      if (!plugins) {
        plugins = [{ schema: object }];
      }

      var schema = resolveSchema(plugins);
      var stack = _stack2.default.create({ plugins: [].concat(_toConsumableArray(_coreSchemaRules2.default), _toConsumableArray(plugins)) });
      var ret = new Schema(_extends({}, schema, { stack: stack }));
      return ret;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isSchema',


    /**
     * Check if `any` is a `Schema`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isSchema(any) {
      return !!(any && any[_modelTypes2.default.SCHEMA]);
    }
  }]);

  return Schema;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Resolve a set of schema rules from an array of `plugins`.
 *
 * @param {Array} plugins
 * @return {Object}
 */

Schema.fromJS = Schema.fromJSON;
function resolveSchema() {
  var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var schema = {
    document: {},
    blocks: {},
    inlines: {}
  };

  plugins.slice().reverse().forEach(function (plugin) {
    if (!plugin.schema) return;

    if (plugin.schema.rules) {
      throw new Error('Schemas in Slate have changed! They are no longer accept a `rules` property.');
    }

    if (plugin.schema.nodes) {
      throw new Error('Schemas in Slate have changed! They are no longer accept a `nodes` property.');
    }

    var _plugin$schema = plugin.schema,
        _plugin$schema$docume = _plugin$schema.document,
        document = _plugin$schema$docume === undefined ? {} : _plugin$schema$docume,
        _plugin$schema$blocks = _plugin$schema.blocks,
        blocks = _plugin$schema$blocks === undefined ? {} : _plugin$schema$blocks,
        _plugin$schema$inline = _plugin$schema.inlines,
        inlines = _plugin$schema$inline === undefined ? {} : _plugin$schema$inline;

    var d = resolveDocumentRule(document);
    var bs = {};
    var is = {};

    for (var key in blocks) {
      bs[key] = resolveNodeRule('block', key, blocks[key]);
    }

    for (var _key2 in inlines) {
      is[_key2] = resolveNodeRule('inline', _key2, inlines[_key2]);
    }

    (0, _mergeWith2.default)(schema.document, d, customizer);
    (0, _mergeWith2.default)(schema.blocks, bs, customizer);
    (0, _mergeWith2.default)(schema.inlines, is, customizer);
  });

  return schema;
}

/**
 * Resolve a document rule `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 */

function resolveDocumentRule(obj) {
  return _extends({
    data: {},
    nodes: null
  }, obj);
}

/**
 * Resolve a node rule with `type` from `obj`.
 *
 * @param {String} object
 * @param {String} type
 * @param {Object} obj
 * @return {Object}
 */

function resolveNodeRule(object, type, obj) {
  return _extends({
    data: {},
    isVoid: null,
    nodes: null,
    first: null,
    last: null,
    parent: null,
    text: null
  }, obj);
}

/**
 * A Lodash customizer for merging schema definitions. Special cases `objects`
 * and `types` arrays to be unioned, and ignores new `null` values.
 *
 * @param {Mixed} target
 * @param {Mixed} source
 * @return {Array|Void}
 */

function customizer(target, source, key) {
  if (key == 'objects' || key == 'types') {
    return target == null ? source : target.concat(source);
  } else {
    return source == null ? target : source;
  }
}

/**
 * Attach a pseudo-symbol for type checking.
 */

Schema.prototype[_modelTypes2.default.SCHEMA] = true;

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Schema.prototype, ['getParentRules'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Schema}
 */

exports.default = Schema;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvc2NoZW1hLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiREVGQVVMVFMiLCJzdGFjayIsImNyZWF0ZSIsImRvY3VtZW50IiwiYmxvY2tzIiwiaW5saW5lcyIsIlNjaGVtYSIsIm9iamVjdCIsInR5cGUiLCJwYXJlbnRzIiwia2V5IiwicnVsZSIsInBhcmVudCIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJ2aW9sYXRpb24iLCJjb250ZXh0IiwiY2hhbmdlIiwic2l6ZSIsIm9wZXJhdGlvbnMiLCJub3JtYWxpemUiLCJjaGlsZCIsIm5vZGUiLCJub2RlcyIsInJlbW92ZU5vZGVCeUtleSIsImZvckVhY2giLCJkYXRhIiwiZ2V0IiwidW5kZWZpbmVkIiwic2V0Tm9kZUJ5S2V5IiwiZGVsZXRlIiwiaXNWb2lkIiwibWFyayIsImdldFRleHRzIiwicmVtb3ZlTWFya0J5S2V5IiwidCIsInRleHQiLCJyZXQiLCJmaW5kIiwiZ2V0UnVsZSIsImdldFBhcmVudFJ1bGVzIiwiY3R4IiwiZmFpbCIsImZuIiwidmFsdWUiLCJtYXJrcyIsImdldE1hcmtzIiwidG9BcnJheSIsInNvbWUiLCJkZWYiLCJ0ZXN0IiwiZmlyc3QiLCJvYmplY3RzIiwidHlwZXMiLCJpbmNsdWRlcyIsImxhc3QiLCJuZXh0RGVmIiwib2Zmc2V0IiwiZGVmcyIsInNoaWZ0IiwibWluIiwibWF4IiwiSW5maW5pdHkiLCJuZXh0Q2hpbGQiLCJpbmRleCIsImNoaWxkcmVuIiwicmV3aW5kIiwic2xpY2UiLCJyIiwidG9KU09OIiwiZGVwcmVjYXRlIiwiYXR0cnMiLCJpc1NjaGVtYSIsImZyb21KU09OIiwiRXJyb3IiLCJwbHVnaW5zIiwicnVsZXMiLCJzY2hlbWEiLCJyZXNvbHZlU2NoZW1hIiwiYW55IiwiU0NIRU1BIiwiZnJvbUpTIiwicmV2ZXJzZSIsInBsdWdpbiIsImQiLCJyZXNvbHZlRG9jdW1lbnRSdWxlIiwiYnMiLCJpcyIsInJlc29sdmVOb2RlUnVsZSIsImN1c3RvbWl6ZXIiLCJvYmoiLCJ0YXJnZXQiLCJzb3VyY2UiLCJjb25jYXQiLCJwcm90b3R5cGUiLCJ0YWtlc0FyZ3VtZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7QUFpQkE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFFBQVEscUJBQU0sY0FBTixDQUFkOztBQUVBOzs7Ozs7QUFNQSxJQUFNQyxXQUFXO0FBQ2ZDLFNBQU8sZ0JBQU1DLE1BQU4sRUFEUTtBQUVmQyxZQUFVLEVBRks7QUFHZkMsVUFBUSxFQUhPO0FBSWZDLFdBQVM7QUFKTSxDQUFqQjs7QUFPQTs7Ozs7O0lBTU1DLE07Ozs7Ozs7Ozs7Ozs7QUFxRko7Ozs7Ozs7NEJBT1FDLE0sRUFBUTtBQUNkLGNBQVFBLE9BQU9BLE1BQWY7QUFDRSxhQUFLLFVBQUw7QUFBaUIsaUJBQU8sS0FBS0osUUFBWjtBQUNqQixhQUFLLE9BQUw7QUFBYyxpQkFBTyxLQUFLQyxNQUFMLENBQVlHLE9BQU9DLElBQW5CLENBQVA7QUFDZCxhQUFLLFFBQUw7QUFBZSxpQkFBTyxLQUFLSCxPQUFMLENBQWFFLE9BQU9DLElBQXBCLENBQVA7QUFIakI7QUFLRDs7QUFFRDs7Ozs7Ozs7cUNBTWlCO0FBQUEsVUFDUEosTUFETyxHQUNhLElBRGIsQ0FDUEEsTUFETztBQUFBLFVBQ0NDLE9BREQsR0FDYSxJQURiLENBQ0NBLE9BREQ7O0FBRWYsVUFBTUksVUFBVSxFQUFoQjs7QUFFQSxXQUFLLElBQU1DLEdBQVgsSUFBa0JOLE1BQWxCLEVBQTBCO0FBQ3hCLFlBQU1PLE9BQU9QLE9BQU9NLEdBQVAsQ0FBYjtBQUNBLFlBQUlDLEtBQUtDLE1BQUwsSUFBZSxJQUFuQixFQUF5QjtBQUN6QkgsZ0JBQVFDLEdBQVIsSUFBZUMsSUFBZjtBQUNEOztBQUVELFdBQUssSUFBTUQsSUFBWCxJQUFrQkwsT0FBbEIsRUFBMkI7QUFDekIsWUFB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ZixFQUEwQixDQUN4QixnQkFEd0IsQ0FBMUIsRUFFRztBQUNEQyxrQkFBZ0I7QUFEZixDQUZIOztBQU1BOzs7Ozs7a0JBTWUxRixNIiwiZmlsZSI6InNjaGVtYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJ1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnaXMtcGxhaW4tb2JqZWN0J1xuaW1wb3J0IGxvZ2dlciBmcm9tICdzbGF0ZS1kZXYtbG9nZ2VyJ1xuaW1wb3J0IG1lcmdlV2l0aCBmcm9tICdsb2Rhc2gvbWVyZ2VXaXRoJ1xuaW1wb3J0IHsgUmVjb3JkIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQge1xuICBDSElMRF9PQkpFQ1RfSU5WQUxJRCxcbiAgQ0hJTERfUkVRVUlSRUQsXG4gIENISUxEX1RZUEVfSU5WQUxJRCxcbiAgQ0hJTERfVU5LTk9XTixcbiAgRklSU1RfQ0hJTERfT0JKRUNUX0lOVkFMSUQsXG4gIEZJUlNUX0NISUxEX1RZUEVfSU5WQUxJRCxcbiAgTEFTVF9DSElMRF9PQkpFQ1RfSU5WQUxJRCxcbiAgTEFTVF9DSElMRF9UWVBFX0lOVkFMSUQsXG4gIE5PREVfREFUQV9JTlZBTElELFxuICBOT0RFX0lTX1ZPSURfSU5WQUxJRCxcbiAgTk9ERV9NQVJLX0lOVkFMSUQsXG4gIE5PREVfVEVYVF9JTlZBTElELFxuICBQQVJFTlRfT0JKRUNUX0lOVkFMSUQsXG4gIFBBUkVOVF9UWVBFX0lOVkFMSUQsXG59IGZyb20gJ3NsYXRlLXNjaGVtYS12aW9sYXRpb25zJ1xuXG5pbXBvcnQgQ09SRV9TQ0hFTUFfUlVMRVMgZnJvbSAnLi4vY29uc3RhbnRzL2NvcmUtc2NoZW1hLXJ1bGVzJ1xuaW1wb3J0IE1PREVMX1RZUEVTIGZyb20gJy4uL2NvbnN0YW50cy9tb2RlbC10eXBlcydcbmltcG9ydCBTdGFjayBmcm9tICcuL3N0YWNrJ1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vdXRpbHMvbWVtb2l6ZSdcblxuLyoqXG4gKiBEZWJ1Zy5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuY29uc3QgZGVidWcgPSBEZWJ1Zygnc2xhdGU6c2NoZW1hJylcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgc3RhY2s6IFN0YWNrLmNyZWF0ZSgpLFxuICBkb2N1bWVudDoge30sXG4gIGJsb2Nrczoge30sXG4gIGlubGluZXM6IHt9LFxufVxuXG4vKipcbiAqIFNjaGVtYS5cbiAqXG4gKiBAdHlwZSB7U2NoZW1hfVxuICovXG5cbmNsYXNzIFNjaGVtYSBleHRlbmRzIFJlY29yZChERUZBVUxUUykge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFNjaGVtYWAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxTY2hlbWF9IGF0dHJzXG4gICAqIEByZXR1cm4ge1NjaGVtYX1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9IHt9KSB7XG4gICAgaWYgKFNjaGVtYS5pc1NjaGVtYShhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgcmV0dXJuIFNjaGVtYS5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYFNjaGVtYS5jcmVhdGVcXGAgb25seSBhY2NlcHRzIG9iamVjdHMgb3Igc2NoZW1hcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgU2NoZW1hYCBmcm9tIGEgSlNPTiBgb2JqZWN0YC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgKiBAcmV0dXJuIHtTY2hlbWF9XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTihvYmplY3QpIHtcbiAgICBpZiAoU2NoZW1hLmlzU2NoZW1hKG9iamVjdCkpIHtcbiAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG5cbiAgICBsZXQgeyBwbHVnaW5zIH0gPSBvYmplY3RcblxuICAgIGlmIChvYmplY3QucnVsZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2NoZW1hcyBpbiBTbGF0ZSBoYXZlIGNoYW5nZWQhIFRoZXkgYXJlIG5vIGxvbmdlciBhY2NlcHQgYSBgcnVsZXNgIHByb3BlcnR5LicpXG4gICAgfVxuXG4gICAgaWYgKG9iamVjdC5ub2Rlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTY2hlbWFzIGluIFNsYXRlIGhhdmUgY2hhbmdlZCEgVGhleSBhcmUgbm8gbG9uZ2VyIGFjY2VwdCBhIGBub2Rlc2AgcHJvcGVydHkuJylcbiAgICB9XG5cbiAgICBpZiAoIXBsdWdpbnMpIHtcbiAgICAgIHBsdWdpbnMgPSBbeyBzY2hlbWE6IG9iamVjdCB9XVxuICAgIH1cblxuICAgIGNvbnN0IHNjaGVtYSA9IHJlc29sdmVTY2hlbWEocGx1Z2lucylcbiAgICBjb25zdCBzdGFjayA9IFN0YWNrLmNyZWF0ZSh7IHBsdWdpbnM6IFsgLi4uQ09SRV9TQ0hFTUFfUlVMRVMsIC4uLnBsdWdpbnMgXSB9KVxuICAgIGNvbnN0IHJldCA9IG5ldyBTY2hlbWEoeyAuLi5zY2hlbWEsIHN0YWNrIH0pXG4gICAgcmV0dXJuIHJldFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGBmcm9tSlNgLlxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTID0gU2NoZW1hLmZyb21KU09OXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgYFNjaGVtYWAuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzU2NoZW1hKGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLlNDSEVNQV0pXG4gIH1cblxuICAvKipcbiAgICogT2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgcmV0dXJuICdzY2hlbWEnXG4gIH1cblxuICBnZXQga2luZCgpIHtcbiAgICBsb2dnZXIuZGVwcmVjYXRlKCdzbGF0ZUAwLjMyLjAnLCAnVGhlIGBraW5kYCBwcm9wZXJ0eSBvZiBTbGF0ZSBvYmplY3RzIGhhcyBiZWVuIHJlbmFtZWQgdG8gYG9iamVjdGAuJylcbiAgICByZXR1cm4gdGhpcy5vYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJ1bGUgZm9yIGFuIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge01peGVkfSBvYmplY3RcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICBnZXRSdWxlKG9iamVjdCkge1xuICAgIHN3aXRjaCAob2JqZWN0Lm9iamVjdCkge1xuICAgICAgY2FzZSAnZG9jdW1lbnQnOiByZXR1cm4gdGhpcy5kb2N1bWVudFxuICAgICAgY2FzZSAnYmxvY2snOiByZXR1cm4gdGhpcy5ibG9ja3Nbb2JqZWN0LnR5cGVdXG4gICAgICBjYXNlICdpbmxpbmUnOiByZXR1cm4gdGhpcy5pbmxpbmVzW29iamVjdC50eXBlXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBkaWN0aW9uYXJ5IG9mIHRoZSBwYXJlbnQgcnVsZSB2YWxpZGF0aW9ucyBieSBjaGlsZCB0eXBlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R8TnVsbH1cbiAgICovXG5cbiAgZ2V0UGFyZW50UnVsZXMoKSB7XG4gICAgY29uc3QgeyBibG9ja3MsIGlubGluZXMgfSA9IHRoaXNcbiAgICBjb25zdCBwYXJlbnRzID0ge31cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGJsb2Nrcykge1xuICAgICAgY29uc3QgcnVsZSA9IGJsb2Nrc1trZXldXG4gICAgICBpZiAocnVsZS5wYXJlbnQgPT0gbnVsbCkgY29udGludWVcbiAgICAgIHBhcmVudHNba2V5XSA9IHJ1bGVcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbmxpbmVzKSB7XG4gICAgICBjb25zdCBydWxlID0gaW5saW5lc1trZXldXG4gICAgICBpZiAocnVsZS5wYXJlbnQgPT0gbnVsbCkgY29udGludWVcbiAgICAgIHBhcmVudHNba2V5XSA9IHJ1bGVcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMocGFyZW50cykubGVuZ3RoID09IDAgPyBudWxsIDogcGFyZW50c1xuICB9XG5cbiAgLyoqXG4gICAqIEZhaWwgdmFsaWRhdGlvbiBieSByZXR1cm5pbmcgYSBub3JtYWxpemluZyBjaGFuZ2UgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2aW9sYXRpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuXG4gIGZhaWwodmlvbGF0aW9uLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIChjaGFuZ2UpID0+IHtcbiAgICAgIGRlYnVnKGBub3JtYWxpemluZ2AsIHsgdmlvbGF0aW9uLCBjb250ZXh0IH0pXG4gICAgICBjb25zdCB7IHJ1bGUgfSA9IGNvbnRleHRcbiAgICAgIGNvbnN0IHsgc2l6ZSB9ID0gY2hhbmdlLm9wZXJhdGlvbnNcbiAgICAgIGlmIChydWxlLm5vcm1hbGl6ZSkgcnVsZS5ub3JtYWxpemUoY2hhbmdlLCB2aW9sYXRpb24sIGNvbnRleHQpXG4gICAgICBpZiAoY2hhbmdlLm9wZXJhdGlvbnMuc2l6ZSA+IHNpemUpIHJldHVyblxuICAgICAgdGhpcy5ub3JtYWxpemUoY2hhbmdlLCB2aW9sYXRpb24sIGNvbnRleHQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZSBhbiBpbnZhbGlkIHZhbHVlIHdpdGggYHZpb2xhdGlvbmAgYW5kIGBjb250ZXh0YC5cbiAgICpcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmlvbGF0aW9uXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHRcbiAgICovXG5cbiAgbm9ybWFsaXplKGNoYW5nZSwgdmlvbGF0aW9uLCBjb250ZXh0KSB7XG4gICAgc3dpdGNoICh2aW9sYXRpb24pIHtcbiAgICAgIGNhc2UgQ0hJTERfT0JKRUNUX0lOVkFMSUQ6XG4gICAgICBjYXNlIENISUxEX1RZUEVfSU5WQUxJRDpcbiAgICAgIGNhc2UgQ0hJTERfVU5LTk9XTjpcbiAgICAgIGNhc2UgRklSU1RfQ0hJTERfT0JKRUNUX0lOVkFMSUQ6XG4gICAgICBjYXNlIEZJUlNUX0NISUxEX1RZUEVfSU5WQUxJRDpcbiAgICAgIGNhc2UgTEFTVF9DSElMRF9PQkpFQ1RfSU5WQUxJRDpcbiAgICAgIGNhc2UgTEFTVF9DSElMRF9UWVBFX0lOVkFMSUQ6IHtcbiAgICAgICAgY29uc3QgeyBjaGlsZCwgbm9kZSB9ID0gY29udGV4dFxuICAgICAgICByZXR1cm4gY2hpbGQub2JqZWN0ID09ICd0ZXh0JyAmJiBub2RlLm9iamVjdCA9PSAnYmxvY2snICYmIG5vZGUubm9kZXMuc2l6ZSA9PSAxXG4gICAgICAgICAgPyBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KG5vZGUua2V5KVxuICAgICAgICAgIDogY2hhbmdlLnJlbW92ZU5vZGVCeUtleShjaGlsZC5rZXkpXG4gICAgICB9XG5cbiAgICAgIGNhc2UgQ0hJTERfUkVRVUlSRUQ6XG4gICAgICBjYXNlIE5PREVfVEVYVF9JTlZBTElEOlxuICAgICAgY2FzZSBQQVJFTlRfT0JKRUNUX0lOVkFMSUQ6XG4gICAgICBjYXNlIFBBUkVOVF9UWVBFX0lOVkFMSUQ6IHtcbiAgICAgICAgY29uc3QgeyBub2RlIH0gPSBjb250ZXh0XG4gICAgICAgIHJldHVybiBub2RlLm9iamVjdCA9PSAnZG9jdW1lbnQnXG4gICAgICAgICAgPyBub2RlLm5vZGVzLmZvckVhY2goY2hpbGQgPT4gY2hhbmdlLnJlbW92ZU5vZGVCeUtleShjaGlsZC5rZXkpKVxuICAgICAgICAgIDogY2hhbmdlLnJlbW92ZU5vZGVCeUtleShub2RlLmtleSlcbiAgICAgIH1cblxuICAgICAgY2FzZSBOT0RFX0RBVEFfSU5WQUxJRDoge1xuICAgICAgICBjb25zdCB7IG5vZGUsIGtleSB9ID0gY29udGV4dFxuICAgICAgICByZXR1cm4gbm9kZS5kYXRhLmdldChrZXkpID09PSB1bmRlZmluZWQgJiYgbm9kZS5vYmplY3QgIT0gJ2RvY3VtZW50J1xuICAgICAgICAgID8gY2hhbmdlLnJlbW92ZU5vZGVCeUtleShub2RlLmtleSlcbiAgICAgICAgICA6IGNoYW5nZS5zZXROb2RlQnlLZXkobm9kZS5rZXksIHsgZGF0YTogbm9kZS5kYXRhLmRlbGV0ZShrZXkpIH0pXG4gICAgICB9XG5cbiAgICAgIGNhc2UgTk9ERV9JU19WT0lEX0lOVkFMSUQ6IHtcbiAgICAgICAgY29uc3QgeyBub2RlIH0gPSBjb250ZXh0XG4gICAgICAgIHJldHVybiBjaGFuZ2Uuc2V0Tm9kZUJ5S2V5KG5vZGUua2V5LCB7IGlzVm9pZDogIW5vZGUuaXNWb2lkIH0pXG4gICAgICB9XG5cbiAgICAgIGNhc2UgTk9ERV9NQVJLX0lOVkFMSUQ6IHtcbiAgICAgICAgY29uc3QgeyBub2RlLCBtYXJrIH0gPSBjb250ZXh0XG4gICAgICAgIHJldHVybiBub2RlLmdldFRleHRzKCkuZm9yRWFjaCh0ID0+IGNoYW5nZS5yZW1vdmVNYXJrQnlLZXkodC5rZXksIDAsIHQudGV4dC5sZW5ndGgsIG1hcmspKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBhIGBub2RlYCB3aXRoIHRoZSBzY2hlbWEsIHJldHVybmluZyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBmaXggdGhlXG4gICAqIGludmFsaWQgbm9kZSwgb3Igdm9pZCBpZiB0aGUgbm9kZSBpcyB2YWxpZC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufFZvaWR9XG4gICAqL1xuXG4gIHZhbGlkYXRlTm9kZShub2RlKSB7XG4gICAgY29uc3QgcmV0ID0gdGhpcy5zdGFjay5maW5kKCd2YWxpZGF0ZU5vZGUnLCBub2RlKVxuICAgIGlmIChyZXQpIHJldHVybiByZXRcblxuICAgIGlmIChub2RlLm9iamVjdCA9PSAndGV4dCcpIHJldHVyblxuXG4gICAgY29uc3QgcnVsZSA9IHRoaXMuZ2V0UnVsZShub2RlKSB8fCB7fVxuICAgIGNvbnN0IHBhcmVudHMgPSB0aGlzLmdldFBhcmVudFJ1bGVzKClcbiAgICBjb25zdCBjdHggPSB7IG5vZGUsIHJ1bGUgfVxuXG4gICAgaWYgKHJ1bGUuaXNWb2lkICE9IG51bGwpIHtcbiAgICAgIGlmIChub2RlLmlzVm9pZCAhPSBydWxlLmlzVm9pZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYWlsKE5PREVfSVNfVk9JRF9JTlZBTElELCBjdHgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUuZGF0YSAhPSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBydWxlLmRhdGEpIHtcbiAgICAgICAgY29uc3QgZm4gPSBydWxlLmRhdGFba2V5XVxuICAgICAgICBjb25zdCB2YWx1ZSA9IG5vZGUuZGF0YS5nZXQoa2V5KVxuXG4gICAgICAgIGlmICghZm4odmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChOT0RFX0RBVEFfSU5WQUxJRCwgeyAuLi5jdHgsIGtleSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChydWxlLm1hcmtzICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IG1hcmtzID0gbm9kZS5nZXRNYXJrcygpLnRvQXJyYXkoKVxuXG4gICAgICBmb3IgKGNvbnN0IG1hcmsgb2YgbWFya3MpIHtcbiAgICAgICAgaWYgKCFydWxlLm1hcmtzLnNvbWUoZGVmID0+IGRlZi50eXBlID09PSBtYXJrLnR5cGUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChOT0RFX01BUktfSU5WQUxJRCwgeyAuLi5jdHgsIG1hcmsgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChydWxlLnRleHQgIT0gbnVsbCkge1xuICAgICAgY29uc3QgeyB0ZXh0IH0gPSBub2RlXG5cbiAgICAgIGlmICghcnVsZS50ZXh0LnRlc3QodGV4dCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChOT0RFX1RFWFRfSU5WQUxJRCwgeyAuLi5jdHgsIHRleHQgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocnVsZS5maXJzdCAhPSBudWxsKSB7XG4gICAgICBjb25zdCB7IG9iamVjdHMsIHR5cGVzIH0gPSBydWxlLmZpcnN0XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUubm9kZXMuZmlyc3QoKVxuXG4gICAgICBpZiAoY2hpbGQgJiYgb2JqZWN0cyAmJiAhb2JqZWN0cy5pbmNsdWRlcyhjaGlsZC5vYmplY3QpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhaWwoRklSU1RfQ0hJTERfT0JKRUNUX0lOVkFMSUQsIHsgLi4uY3R4LCBjaGlsZCB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoY2hpbGQgJiYgdHlwZXMgJiYgIXR5cGVzLmluY2x1ZGVzKGNoaWxkLnR5cGUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhaWwoRklSU1RfQ0hJTERfVFlQRV9JTlZBTElELCB7IC4uLmN0eCwgY2hpbGQgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocnVsZS5sYXN0ICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHsgb2JqZWN0cywgdHlwZXMgfSA9IHJ1bGUubGFzdFxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLm5vZGVzLmxhc3QoKVxuXG4gICAgICBpZiAoY2hpbGQgJiYgb2JqZWN0cyAmJiAhb2JqZWN0cy5pbmNsdWRlcyhjaGlsZC5vYmplY3QpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhaWwoTEFTVF9DSElMRF9PQkpFQ1RfSU5WQUxJRCwgeyAuLi5jdHgsIGNoaWxkIH0pXG4gICAgICB9XG5cbiAgICAgIGlmIChjaGlsZCAmJiB0eXBlcyAmJiAhdHlwZXMuaW5jbHVkZXMoY2hpbGQudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChMQVNUX0NISUxEX1RZUEVfSU5WQUxJRCwgeyAuLi5jdHgsIGNoaWxkIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUubm9kZXMgIT0gbnVsbCB8fCBwYXJlbnRzICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5ub2Rlcy50b0FycmF5KClcbiAgICAgIGNvbnN0IGRlZnMgPSBydWxlLm5vZGVzICE9IG51bGwgPyBydWxlLm5vZGVzLnNsaWNlKCkgOiBbXVxuXG4gICAgICBsZXQgb2Zmc2V0XG4gICAgICBsZXQgbWluXG4gICAgICBsZXQgaW5kZXhcbiAgICAgIGxldCBkZWZcbiAgICAgIGxldCBtYXhcbiAgICAgIGxldCBjaGlsZFxuXG4gICAgICBmdW5jdGlvbiBuZXh0RGVmKCkge1xuICAgICAgICBvZmZzZXQgPSBvZmZzZXQgPT0gbnVsbCA/IG51bGwgOiAwXG4gICAgICAgIGRlZiA9IGRlZnMuc2hpZnQoKVxuICAgICAgICBtaW4gPSBkZWYgJiYgKGRlZi5taW4gPT0gbnVsbCA/IDAgOiBkZWYubWluKVxuICAgICAgICBtYXggPSBkZWYgJiYgKGRlZi5tYXggPT0gbnVsbCA/IEluZmluaXR5IDogZGVmLm1heClcbiAgICAgICAgcmV0dXJuICEhZGVmXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG5leHRDaGlsZCgpIHtcbiAgICAgICAgaW5kZXggPSBpbmRleCA9PSBudWxsID8gMCA6IGluZGV4ICsgMVxuICAgICAgICBvZmZzZXQgPSBvZmZzZXQgPT0gbnVsbCA/IDAgOiBvZmZzZXQgKyAxXG4gICAgICAgIGNoaWxkID0gY2hpbGRyZW5baW5kZXhdXG4gICAgICAgIGlmIChtYXggIT0gbnVsbCAmJiBvZmZzZXQgPT0gbWF4KSBuZXh0RGVmKClcbiAgICAgICAgcmV0dXJuICEhY2hpbGRcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJld2luZCgpIHtcbiAgICAgICAgb2Zmc2V0IC09IDFcbiAgICAgICAgaW5kZXggLT0gMVxuICAgICAgfVxuXG4gICAgICBpZiAocnVsZS5ub2RlcyAhPSBudWxsKSB7XG4gICAgICAgIG5leHREZWYoKVxuICAgICAgfVxuXG4gICAgICB3aGlsZSAobmV4dENoaWxkKCkpIHtcbiAgICAgICAgaWYgKHBhcmVudHMgIT0gbnVsbCAmJiBjaGlsZC5vYmplY3QgIT0gJ3RleHQnICYmIGNoaWxkLnR5cGUgaW4gcGFyZW50cykge1xuICAgICAgICAgIGNvbnN0IHIgPSBwYXJlbnRzW2NoaWxkLnR5cGVdXG5cbiAgICAgICAgICBpZiAoci5wYXJlbnQub2JqZWN0cyAhPSBudWxsICYmICFyLnBhcmVudC5vYmplY3RzLmluY2x1ZGVzKG5vZGUub2JqZWN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChQQVJFTlRfT0JKRUNUX0lOVkFMSUQsIHsgbm9kZTogY2hpbGQsIHBhcmVudDogbm9kZSwgcnVsZTogciB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyLnBhcmVudC50eXBlcyAhPSBudWxsICYmICFyLnBhcmVudC50eXBlcy5pbmNsdWRlcyhub2RlLnR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsKFBBUkVOVF9UWVBFX0lOVkFMSUQsIHsgbm9kZTogY2hpbGQsIHBhcmVudDogbm9kZSwgcnVsZTogciB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChydWxlLm5vZGVzICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoIWRlZikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChDSElMRF9VTktOT1dOLCB7IC4uLmN0eCwgY2hpbGQsIGluZGV4IH0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGRlZi5vYmplY3RzICE9IG51bGwgJiYgIWRlZi5vYmplY3RzLmluY2x1ZGVzKGNoaWxkLm9iamVjdCkpIHtcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPj0gbWluICYmIG5leHREZWYoKSkge1xuICAgICAgICAgICAgICByZXdpbmQoKVxuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChDSElMRF9PQkpFQ1RfSU5WQUxJRCwgeyAuLi5jdHgsIGNoaWxkLCBpbmRleCB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkZWYudHlwZXMgIT0gbnVsbCAmJiAhZGVmLnR5cGVzLmluY2x1ZGVzKGNoaWxkLnR5cGUpKSB7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ID49IG1pbiAmJiBuZXh0RGVmKCkpIHtcbiAgICAgICAgICAgICAgcmV3aW5kKClcbiAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWwoQ0hJTERfVFlQRV9JTlZBTElELCB7IC4uLmN0eCwgY2hpbGQsIGluZGV4IH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChydWxlLm5vZGVzICE9IG51bGwpIHtcbiAgICAgICAgd2hpbGUgKG1pbiAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKG9mZnNldCA8IG1pbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChDSElMRF9SRVFVSVJFRCwgeyAuLi5jdHgsIGluZGV4IH0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dERlZigpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2NoZW1hLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuXG4gIHRvSlNPTigpIHtcbiAgICBjb25zdCBvYmplY3QgPSB7XG4gICAgICBvYmplY3Q6IHRoaXMub2JqZWN0LFxuICAgICAgZG9jdW1lbnQ6IHRoaXMuZG9jdW1lbnQsXG4gICAgICBibG9ja3M6IHRoaXMuYmxvY2tzLFxuICAgICAgaW5saW5lczogdGhpcy5pbmxpbmVzLFxuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgdG9KU2AuXG4gICAqL1xuXG4gIHRvSlMoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKClcbiAgfVxuXG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHNldCBvZiBzY2hlbWEgcnVsZXMgZnJvbSBhbiBhcnJheSBvZiBgcGx1Z2luc2AuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGx1Z2luc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHJlc29sdmVTY2hlbWEocGx1Z2lucyA9IFtdKSB7XG4gIGNvbnN0IHNjaGVtYSA9IHtcbiAgICBkb2N1bWVudDoge30sXG4gICAgYmxvY2tzOiB7fSxcbiAgICBpbmxpbmVzOiB7fSxcbiAgfVxuXG4gIHBsdWdpbnMuc2xpY2UoKS5yZXZlcnNlKCkuZm9yRWFjaCgocGx1Z2luKSA9PiB7XG4gICAgaWYgKCFwbHVnaW4uc2NoZW1hKSByZXR1cm5cblxuICAgIGlmIChwbHVnaW4uc2NoZW1hLnJ1bGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NjaGVtYXMgaW4gU2xhdGUgaGF2ZSBjaGFuZ2VkISBUaGV5IGFyZSBubyBsb25nZXIgYWNjZXB0IGEgYHJ1bGVzYCBwcm9wZXJ0eS4nKVxuICAgIH1cblxuICAgIGlmIChwbHVnaW4uc2NoZW1hLm5vZGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NjaGVtYXMgaW4gU2xhdGUgaGF2ZSBjaGFuZ2VkISBUaGV5IGFyZSBubyBsb25nZXIgYWNjZXB0IGEgYG5vZGVzYCBwcm9wZXJ0eS4nKVxuICAgIH1cblxuICAgIGNvbnN0IHsgZG9jdW1lbnQgPSB7fSwgYmxvY2tzID0ge30sIGlubGluZXMgPSB7fX0gPSBwbHVnaW4uc2NoZW1hXG4gICAgY29uc3QgZCA9IHJlc29sdmVEb2N1bWVudFJ1bGUoZG9jdW1lbnQpXG4gICAgY29uc3QgYnMgPSB7fVxuICAgIGNvbnN0IGlzID0ge31cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGJsb2Nrcykge1xuICAgICAgYnNba2V5XSA9IHJlc29sdmVOb2RlUnVsZSgnYmxvY2snLCBrZXksIGJsb2Nrc1trZXldKVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGlubGluZXMpIHtcbiAgICAgIGlzW2tleV0gPSByZXNvbHZlTm9kZVJ1bGUoJ2lubGluZScsIGtleSwgaW5saW5lc1trZXldKVxuICAgIH1cblxuICAgIG1lcmdlV2l0aChzY2hlbWEuZG9jdW1lbnQsIGQsIGN1c3RvbWl6ZXIpXG4gICAgbWVyZ2VXaXRoKHNjaGVtYS5ibG9ja3MsIGJzLCBjdXN0b21pemVyKVxuICAgIG1lcmdlV2l0aChzY2hlbWEuaW5saW5lcywgaXMsIGN1c3RvbWl6ZXIpXG4gIH0pXG5cbiAgcmV0dXJuIHNjaGVtYVxufVxuXG4vKipcbiAqIFJlc29sdmUgYSBkb2N1bWVudCBydWxlIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiByZXNvbHZlRG9jdW1lbnRSdWxlKG9iaikge1xuICByZXR1cm4ge1xuICAgIGRhdGE6IHt9LFxuICAgIG5vZGVzOiBudWxsLFxuICAgIC4uLm9iaixcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmUgYSBub2RlIHJ1bGUgd2l0aCBgdHlwZWAgZnJvbSBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gb2JqZWN0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHJlc29sdmVOb2RlUnVsZShvYmplY3QsIHR5cGUsIG9iaikge1xuICByZXR1cm4ge1xuICAgIGRhdGE6IHt9LFxuICAgIGlzVm9pZDogbnVsbCxcbiAgICBub2RlczogbnVsbCxcbiAgICBmaXJzdDogbnVsbCxcbiAgICBsYXN0OiBudWxsLFxuICAgIHBhcmVudDogbnVsbCxcbiAgICB0ZXh0OiBudWxsLFxuICAgIC4uLm9iaixcbiAgfVxufVxuXG4vKipcbiAqIEEgTG9kYXNoIGN1c3RvbWl6ZXIgZm9yIG1lcmdpbmcgc2NoZW1hIGRlZmluaXRpb25zLiBTcGVjaWFsIGNhc2VzIGBvYmplY3RzYFxuICogYW5kIGB0eXBlc2AgYXJyYXlzIHRvIGJlIHVuaW9uZWQsIGFuZCBpZ25vcmVzIG5ldyBgbnVsbGAgdmFsdWVzLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHRhcmdldFxuICogQHBhcmFtIHtNaXhlZH0gc291cmNlXG4gKiBAcmV0dXJuIHtBcnJheXxWb2lkfVxuICovXG5cbmZ1bmN0aW9uIGN1c3RvbWl6ZXIodGFyZ2V0LCBzb3VyY2UsIGtleSkge1xuICBpZsKgKGtleSA9PSAnb2JqZWN0cycgfHwga2V5ID09ICd0eXBlcycpwqB7XG4gICAgcmV0dXJuwqB0YXJnZXQgPT0gbnVsbCA/IHNvdXJjZSA6IHRhcmdldC5jb25jYXQoc291cmNlKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBzb3VyY2UgPT0gbnVsbCA/IHRhcmdldCA6IHNvdXJjZVxuICB9XG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5TY2hlbWEucHJvdG90eXBlW01PREVMX1RZUEVTLlNDSEVNQV0gPSB0cnVlXG5cbi8qKlxuICogTWVtb2l6ZSByZWFkIG1ldGhvZHMuXG4gKi9cblxubWVtb2l6ZShTY2hlbWEucHJvdG90eXBlLCBbXG4gICdnZXRQYXJlbnRSdWxlcycsXG5dLCB7XG4gIHRha2VzQXJndW1lbnRzOiB0cnVlLFxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge1NjaGVtYX1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBTY2hlbWFcbiJdfQ==