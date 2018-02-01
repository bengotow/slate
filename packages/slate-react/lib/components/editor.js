'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _reactPortal = require('react-portal');

var _reactPortal2 = _interopRequireDefault(_reactPortal);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slatePropTypes = require('slate-prop-types');

var _slatePropTypes2 = _interopRequireDefault(_slatePropTypes);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _slate = require('slate');

var _eventHandlers = require('../constants/event-handlers');

var _eventHandlers2 = _interopRequireDefault(_eventHandlers);

var _pluginProps = require('../constants/plugin-props');

var _pluginProps2 = _interopRequireDefault(_pluginProps);

var _after = require('../plugins/after');

var _after2 = _interopRequireDefault(_after);

var _before = require('../plugins/before');

var _before2 = _interopRequireDefault(_before);

var _noop = require('../utils/noop');

var _noop2 = _interopRequireDefault(_noop);

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

var debug = (0, _debug2.default)('slate:editor');

/**
 * Editor.
 *
 * @type {Component}
 */

var Editor = function (_React$Component) {
  _inherits(Editor, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Editor(props) {
    _classCallCheck(this, Editor);

    var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

    _initialiseProps.call(_this);

    _this.state = {};
    _this.tmp = {};
    _this.tmp.updates = 0;
    _this.tmp.resolves = 0;

    // Resolve the plugins and create a stack and schema from them.
    var plugins = _this.resolvePlugins(props.plugins, props.schema);
    var stack = _slate.Stack.create({ plugins: plugins });
    var schema = _slate.Schema.create({ plugins: plugins });
    _this.state.schema = schema;
    _this.state.stack = stack;

    // Run `onChange` on the passed-in value because we need to ensure that it
    // is normalized, and queue the resulting change.
    var change = props.value.change();
    stack.run('onChange', change, _this);
    _this.queueChange(change);
    _this.state.value = change.value;

    // Create a bound event handler for each event.
    _eventHandlers2.default.forEach(function (handler) {
      _this[handler] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this.onEvent.apply(_this, [handler].concat(args));
      };
    });
    return _this;
  }

  /**
   * When the `props` are updated, create a new `Stack` if necessary and run
   * `onChange` to ensure the value is normalized.
   *
   * @param {Object} props
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  /**
   * When the component first mounts, flush any temporary changes.
   */

  /**
   * When the component updates, flush any temporary change.
   */

  /**
   * Queue a `change` object, to be able to flush it later. This is required for
   * when a change needs to be applied to the value, but because of the React
   * lifecycle we can't apply that change immediately. So we cache it here and
   * later can call `this.flushChange()` to flush it.
   *
   * @param {Change} change
   */

  /**
   * Flush a temporarily stored `change` object, for when a change needed to be
   * made but couldn't because of React's lifecycle.
   */

  /**
   * Perform a change on the editor, passing `...args` to `change.call`.
   *
   * @param {Mixed} ...args
   */

  /**
   * Programmatically blur the editor.
   */

  /**
   * Programmatically focus the editor.
   */

  _createClass(Editor, [{
    key: 'render',


    /**
     * Render the editor.
     *
     * @return {Element}
     */

    value: function render() {
      debug('render', this);

      var children = this.stack.map('renderPortal', this.value, this).map(function (child, i) {
        return _react2.default.createElement(
          _reactPortal2.default,
          { key: i, isOpened: true },
          child
        );
      });

      var props = _extends({}, this.props, { children: children });
      var tree = this.stack.render('renderEditor', props, this);
      return tree;
    }

    /**
     * Resolve an array of plugins from `plugins` and `schema` props.
     *
     * In addition to the plugins provided in props, this will initialize three
     * other plugins:
     *
     * - The top-level editor plugin, which allows for top-level handlers, etc.
     * - The two "core" plugins, one before all the other and one after.
     *
     * @param {Array|Void} plugins
     * @param {Schema|Object|Void} schema
     * @return {Array}
     */

  }, {
    key: 'schema',


    /**
     * Getters for exposing public properties of the editor's state.
     */

    get: function get() {
      return this.state.schema;
    }
  }, {
    key: 'stack',
    get: function get() {
      return this.state.stack;
    }
  }, {
    key: 'value',
    get: function get() {
      return this.state.value;
    }

    /**
     * On event.
     *
     * @param {String} handler
     * @param {Event} event
     */

    /**
     * On change.
     *
     * @param {Change} change
     */

  }]);

  return Editor;
}(_react2.default.Component);

/**
 * Mix in the property types for the event handlers.
 */

Editor.propTypes = {
  autoCorrect: _propTypes2.default.bool,
  autoFocus: _propTypes2.default.bool,
  className: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  placeholder: _propTypes2.default.any,
  plugins: _propTypes2.default.array,
  readOnly: _propTypes2.default.bool,
  role: _propTypes2.default.string,
  schema: _propTypes2.default.object,
  spellCheck: _propTypes2.default.bool,
  style: _propTypes2.default.object,
  tabIndex: _propTypes2.default.number,
  value: _slatePropTypes2.default.value.isRequired
};
Editor.defaultProps = {
  autoFocus: false,
  autoCorrect: true,
  onChange: _noop2.default,
  plugins: [],
  readOnly: false,
  schema: {},
  spellCheck: true
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.componentWillReceiveProps = function (props) {
    var schema = _this2.schema,
        stack = _this2.stack;

    // Increment the updates counter as a baseline.

    _this2.tmp.updates++;

    // If the plugins or the schema have changed, we need to re-resolve the
    // plugins, since it will result in a new stack and new validations.
    if (props.plugins != _this2.props.plugins || props.schema != _this2.props.schema) {
      var plugins = _this2.resolvePlugins(props.plugins, props.schema);
      stack = _slate.Stack.create({ plugins: plugins });
      schema = _slate.Schema.create({ plugins: plugins });
      _this2.setState({ schema: schema, stack: stack });

      // Increment the resolves counter.
      _this2.tmp.resolves++;

      // If we've resolved a few times already, and it's exactly in line with
      // the updates, then warn the user that they may be doing something wrong.
      if (_this2.tmp.resolves > 5 && _this2.tmp.resolves == _this2.tmp.updates) {
        _slateDevLogger2.default.warn('A Slate <Editor> is re-resolving `props.plugins` or `props.schema` on each update, which leads to poor performance. This is often due to passing in a new `schema` or `plugins` prop with each render by declaring them inline in your render function. Do not do this!');
      }
    }

    // Run `onChange` on the passed-in value because we need to ensure that it
    // is normalized, and queue the resulting change.
    var change = props.value.change();
    stack.run('onChange', change, _this2);
    _this2.queueChange(change);
    _this2.setState({ value: change.value });
  };

  this.componentDidMount = function () {
    _this2.flushChange();
  };

  this.componentDidUpdate = function () {
    _this2.flushChange();
  };

  this.queueChange = function (change) {
    if (change.operations.size) {
      debug('queueChange', { change: change });
      _this2.tmp.change = change;
    }
  };

  this.flushChange = function () {
    var change = _this2.tmp.change;


    if (change) {
      debug('flushChange', { change: change });
      delete _this2.tmp.change;
      _this2.props.onChange(change);
    }
  };

  this.change = function () {
    var _value$change;

    var change = (_value$change = _this2.value.change()).call.apply(_value$change, arguments);
    _this2.onChange(change);
  };

  this.blur = function () {
    _this2.change(function (c) {
      return c.blur();
    });
  };

  this.focus = function () {
    _this2.change(function (c) {
      return c.focus();
    });
  };

  this.onEvent = function (handler, event) {
    _this2.change(function (change) {
      _this2.stack.run(handler, event, change, _this2);
    });
  };

  this.onChange = function (change) {
    debug('onChange', { change: change });

    _this2.stack.run('onChange', change, _this2);
    var value = change.value;
    var onChange = _this2.props.onChange;

    if (value == _this2.value) return;
    onChange(change);
  };

  this.resolvePlugins = function (plugins, schema) {
    var beforePlugin = (0, _before2.default)();
    var afterPlugin = (0, _after2.default)();
    var editorPlugin = {
      schema: schema || {}
    };

    var _loop = function _loop(_prop) {
      // Skip `onChange` because the editor's `onChange` is special.
      if (_prop == 'onChange') return 'continue';

      // Skip `schema` because it can't be proxied easily, so it must be
      // passed in as an argument to this function instead.
      if (_prop == 'schema') return 'continue';

      // Define a function that will just proxies into `props`.
      editorPlugin[_prop] = function () {
        var _props;

        return _this2.props[_prop] && (_props = _this2.props)[_prop].apply(_props, arguments);
      };
    };

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = _pluginProps2.default[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _prop = _step2.value;

        var _ret = _loop(_prop);

        if (_ret === 'continue') continue;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return [beforePlugin, editorPlugin].concat(_toConsumableArray(plugins || []), [afterPlugin]);
  };
};

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = _eventHandlers2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var prop = _step.value;

    Editor.propTypes[prop] = _propTypes2.default.func;
  }

  /**
   * Export.
   *
   * @type {Component}
   */
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

exports.default = Editor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2VkaXRvci5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsIkVkaXRvciIsInByb3BzIiwic3RhdGUiLCJ0bXAiLCJ1cGRhdGVzIiwicmVzb2x2ZXMiLCJwbHVnaW5zIiwicmVzb2x2ZVBsdWdpbnMiLCJzY2hlbWEiLCJzdGFjayIsImNyZWF0ZSIsImNoYW5nZSIsInZhbHVlIiwicnVuIiwicXVldWVDaGFuZ2UiLCJmb3JFYWNoIiwiaGFuZGxlciIsImFyZ3MiLCJvbkV2ZW50IiwiY2hpbGRyZW4iLCJtYXAiLCJjaGlsZCIsImkiLCJ0cmVlIiwicmVuZGVyIiwiQ29tcG9uZW50IiwicHJvcFR5cGVzIiwiYXV0b0NvcnJlY3QiLCJib29sIiwiYXV0b0ZvY3VzIiwiY2xhc3NOYW1lIiwic3RyaW5nIiwib25DaGFuZ2UiLCJmdW5jIiwicGxhY2Vob2xkZXIiLCJhbnkiLCJhcnJheSIsInJlYWRPbmx5Iiwicm9sZSIsIm9iamVjdCIsInNwZWxsQ2hlY2siLCJzdHlsZSIsInRhYkluZGV4IiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImRlZmF1bHRQcm9wcyIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJzZXRTdGF0ZSIsIndhcm4iLCJjb21wb25lbnREaWRNb3VudCIsImZsdXNoQ2hhbmdlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwib3BlcmF0aW9ucyIsInNpemUiLCJjYWxsIiwiYmx1ciIsImMiLCJmb2N1cyIsImV2ZW50IiwiYmVmb3JlUGx1Z2luIiwiYWZ0ZXJQbHVnaW4iLCJlZGl0b3JQbHVnaW4iLCJwcm9wIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxxQkFBTSxjQUFOLENBQWQ7O0FBRUE7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QWtDO0FBQUEsWUFBdkJBLEtBQXVCOztBQUFBLHlCQUF2QkEsS0FBdUI7O0FBQUEsaUNBTVY7QUFNdkI7QUFuQm1DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBcUJwQyxZQUNFSCxZQURGLEVBRUVFLFlBRkYsNEJBR012RCxXQUFXLEVBSGpCLElBSUVzRCxXQUpGO0FBTUQsRzs7Ozs7Ozs7QUFTSCw0S0FBbUM7QUFBQSxRQUF4QkUsSUFBd0I7O0FBQ2pDOUQsV0FBTzBCLFNBQVAsQ0FBaUJvQyxJQUFqQixJQUF5QixvQkFBTTdCLElBQS9CO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQU1lakMsTSIsImZpbGUiOiJlZGl0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1ZydcbmltcG9ydCBQb3J0YWwgZnJvbSAncmVhY3QtcG9ydGFsJ1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFNsYXRlVHlwZXMgZnJvbSAnc2xhdGUtcHJvcC10eXBlcydcbmltcG9ydCBUeXBlcyBmcm9tICdwcm9wLXR5cGVzJ1xuaW1wb3J0IGxvZ2dlciBmcm9tICdzbGF0ZS1kZXYtbG9nZ2VyJ1xuaW1wb3J0IHsgU2NoZW1hLCBTdGFjayB9IGZyb20gJ3NsYXRlJ1xuXG5pbXBvcnQgRVZFTlRfSEFORExFUlMgZnJvbSAnLi4vY29uc3RhbnRzL2V2ZW50LWhhbmRsZXJzJ1xuaW1wb3J0IFBMVUdJTlNfUFJPUFMgZnJvbSAnLi4vY29uc3RhbnRzL3BsdWdpbi1wcm9wcydcbmltcG9ydCBBZnRlclBsdWdpbiBmcm9tICcuLi9wbHVnaW5zL2FmdGVyJ1xuaW1wb3J0IEJlZm9yZVBsdWdpbiBmcm9tICcuLi9wbHVnaW5zL2JlZm9yZSdcbmltcG9ydCBub29wIGZyb20gJy4uL3V0aWxzL25vb3AnXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOmVkaXRvcicpXG5cbi8qKlxuICogRWRpdG9yLlxuICpcbiAqIEB0eXBlIHtDb21wb25lbnR9XG4gKi9cblxuY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAvKipcbiAgICogUHJvcGVydHkgdHlwZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgYXV0b0NvcnJlY3Q6IFR5cGVzLmJvb2wsXG4gICAgYXV0b0ZvY3VzOiBUeXBlcy5ib29sLFxuICAgIGNsYXNzTmFtZTogVHlwZXMuc3RyaW5nLFxuICAgIG9uQ2hhbmdlOiBUeXBlcy5mdW5jLFxuICAgIHBsYWNlaG9sZGVyOiBUeXBlcy5hbnksXG4gICAgcGx1Z2luczogVHlwZXMuYXJyYXksXG4gICAgcmVhZE9ubHk6IFR5cGVzLmJvb2wsXG4gICAgcm9sZTogVHlwZXMuc3RyaW5nLFxuICAgIHNjaGVtYTogVHlwZXMub2JqZWN0LFxuICAgIHNwZWxsQ2hlY2s6IFR5cGVzLmJvb2wsXG4gICAgc3R5bGU6IFR5cGVzLm9iamVjdCxcbiAgICB0YWJJbmRleDogVHlwZXMubnVtYmVyLFxuICAgIHZhbHVlOiBTbGF0ZVR5cGVzLnZhbHVlLmlzUmVxdWlyZWQsXG4gIH1cblxuICAvKipcbiAgICogRGVmYXVsdCBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGF1dG9Gb2N1czogZmFsc2UsXG4gICAgYXV0b0NvcnJlY3Q6IHRydWUsXG4gICAgb25DaGFuZ2U6IG5vb3AsXG4gICAgcGx1Z2luczogW10sXG4gICAgcmVhZE9ubHk6IGZhbHNlLFxuICAgIHNjaGVtYToge30sXG4gICAgc3BlbGxDaGVjazogdHJ1ZSxcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG4gICAqL1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHt9XG4gICAgdGhpcy50bXAgPSB7fVxuICAgIHRoaXMudG1wLnVwZGF0ZXMgPSAwXG4gICAgdGhpcy50bXAucmVzb2x2ZXMgPSAwXG5cbiAgICAvLyBSZXNvbHZlIHRoZSBwbHVnaW5zIGFuZCBjcmVhdGUgYSBzdGFjayBhbmQgc2NoZW1hIGZyb20gdGhlbS5cbiAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5yZXNvbHZlUGx1Z2lucyhwcm9wcy5wbHVnaW5zLCBwcm9wcy5zY2hlbWEpXG4gICAgY29uc3Qgc3RhY2sgPSBTdGFjay5jcmVhdGUoeyBwbHVnaW5zIH0pXG4gICAgY29uc3Qgc2NoZW1hID0gU2NoZW1hLmNyZWF0ZSh7IHBsdWdpbnMgfSlcbiAgICB0aGlzLnN0YXRlLnNjaGVtYSA9IHNjaGVtYVxuICAgIHRoaXMuc3RhdGUuc3RhY2sgPSBzdGFja1xuXG4gICAgLy8gUnVuIGBvbkNoYW5nZWAgb24gdGhlIHBhc3NlZC1pbiB2YWx1ZSBiZWNhdXNlIHdlIG5lZWQgdG8gZW5zdXJlIHRoYXQgaXRcbiAgICAvLyBpcyBub3JtYWxpemVkLCBhbmQgcXVldWUgdGhlIHJlc3VsdGluZyBjaGFuZ2UuXG4gICAgY29uc3QgY2hhbmdlID0gcHJvcHMudmFsdWUuY2hhbmdlKClcbiAgICBzdGFjay5ydW4oJ29uQ2hhbmdlJywgY2hhbmdlLCB0aGlzKVxuICAgIHRoaXMucXVldWVDaGFuZ2UoY2hhbmdlKVxuICAgIHRoaXMuc3RhdGUudmFsdWUgPSBjaGFuZ2UudmFsdWVcblxuICAgIC8vIENyZWF0ZSBhIGJvdW5kIGV2ZW50IGhhbmRsZXIgZm9yIGVhY2ggZXZlbnQuXG4gICAgRVZFTlRfSEFORExFUlMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgdGhpc1toYW5kbGVyXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIHRoaXMub25FdmVudChoYW5kbGVyLCAuLi5hcmdzKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgYHByb3BzYCBhcmUgdXBkYXRlZCwgY3JlYXRlIGEgbmV3IGBTdGFja2AgaWYgbmVjZXNzYXJ5IGFuZCBydW5cbiAgICogYG9uQ2hhbmdlYCB0byBlbnN1cmUgdGhlIHZhbHVlIGlzIG5vcm1hbGl6ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgKi9cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gKHByb3BzKSA9PiB7XG4gICAgbGV0IHsgc2NoZW1hLCBzdGFjayB9ID0gdGhpc1xuXG4gICAgLy8gSW5jcmVtZW50IHRoZSB1cGRhdGVzIGNvdW50ZXIgYXMgYSBiYXNlbGluZS5cbiAgICB0aGlzLnRtcC51cGRhdGVzKytcblxuICAgIC8vIElmIHRoZSBwbHVnaW5zIG9yIHRoZSBzY2hlbWEgaGF2ZSBjaGFuZ2VkLCB3ZSBuZWVkIHRvIHJlLXJlc29sdmUgdGhlXG4gICAgLy8gcGx1Z2lucywgc2luY2UgaXQgd2lsbCByZXN1bHQgaW4gYSBuZXcgc3RhY2sgYW5kIG5ldyB2YWxpZGF0aW9ucy5cbiAgICBpZiAocHJvcHMucGx1Z2lucyAhPSB0aGlzLnByb3BzLnBsdWdpbnMgfHwgcHJvcHMuc2NoZW1hICE9IHRoaXMucHJvcHMuc2NoZW1hKSB7XG4gICAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5yZXNvbHZlUGx1Z2lucyhwcm9wcy5wbHVnaW5zLCBwcm9wcy5zY2hlbWEpXG4gICAgICBzdGFjayA9IFN0YWNrLmNyZWF0ZSh7IHBsdWdpbnMgfSlcbiAgICAgIHNjaGVtYSA9IFNjaGVtYS5jcmVhdGUoeyBwbHVnaW5zIH0pXG4gICAgICB0aGlzLnNldFN0YXRlKHsgc2NoZW1hLCBzdGFjayB9KVxuXG4gICAgICAvLyBJbmNyZW1lbnQgdGhlIHJlc29sdmVzIGNvdW50ZXIuXG4gICAgICB0aGlzLnRtcC5yZXNvbHZlcysrXG5cbiAgICAgIC8vIElmIHdlJ3ZlIHJlc29sdmVkIGEgZmV3IHRpbWVzIGFscmVhZHksIGFuZCBpdCdzIGV4YWN0bHkgaW4gbGluZSB3aXRoXG4gICAgICAvLyB0aGUgdXBkYXRlcywgdGhlbiB3YXJuIHRoZSB1c2VyIHRoYXQgdGhleSBtYXkgYmUgZG9pbmcgc29tZXRoaW5nIHdyb25nLlxuICAgICAgaWYgKHRoaXMudG1wLnJlc29sdmVzID4gNSAmJiB0aGlzLnRtcC5yZXNvbHZlcyA9PSB0aGlzLnRtcC51cGRhdGVzKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdBIFNsYXRlIDxFZGl0b3I+IGlzIHJlLXJlc29sdmluZyBgcHJvcHMucGx1Z2luc2Agb3IgYHByb3BzLnNjaGVtYWAgb24gZWFjaCB1cGRhdGUsIHdoaWNoIGxlYWRzIHRvIHBvb3IgcGVyZm9ybWFuY2UuIFRoaXMgaXMgb2Z0ZW4gZHVlIHRvIHBhc3NpbmcgaW4gYSBuZXcgYHNjaGVtYWAgb3IgYHBsdWdpbnNgIHByb3Agd2l0aCBlYWNoIHJlbmRlciBieSBkZWNsYXJpbmcgdGhlbSBpbmxpbmUgaW4geW91ciByZW5kZXIgZnVuY3Rpb24uIERvIG5vdCBkbyB0aGlzIScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUnVuIGBvbkNoYW5nZWAgb24gdGhlIHBhc3NlZC1pbiB2YWx1ZSBiZWNhdXNlIHdlIG5lZWQgdG8gZW5zdXJlIHRoYXQgaXRcbiAgICAvLyBpcyBub3JtYWxpemVkLCBhbmQgcXVldWUgdGhlIHJlc3VsdGluZyBjaGFuZ2UuXG4gICAgY29uc3QgY2hhbmdlID0gcHJvcHMudmFsdWUuY2hhbmdlKClcbiAgICBzdGFjay5ydW4oJ29uQ2hhbmdlJywgY2hhbmdlLCB0aGlzKVxuICAgIHRoaXMucXVldWVDaGFuZ2UoY2hhbmdlKVxuICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogY2hhbmdlLnZhbHVlIH0pXG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgY29tcG9uZW50IGZpcnN0IG1vdW50cywgZmx1c2ggYW55IHRlbXBvcmFyeSBjaGFuZ2VzLlxuICAgKi9cblxuICBjb21wb25lbnREaWRNb3VudCA9ICgpID0+IHtcbiAgICB0aGlzLmZsdXNoQ2hhbmdlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBjb21wb25lbnQgdXBkYXRlcywgZmx1c2ggYW55IHRlbXBvcmFyeSBjaGFuZ2UuXG4gICAqL1xuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSA9ICgpID0+IHtcbiAgICB0aGlzLmZsdXNoQ2hhbmdlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWV1ZSBhIGBjaGFuZ2VgIG9iamVjdCwgdG8gYmUgYWJsZSB0byBmbHVzaCBpdCBsYXRlci4gVGhpcyBpcyByZXF1aXJlZCBmb3JcbiAgICogd2hlbiBhIGNoYW5nZSBuZWVkcyB0byBiZSBhcHBsaWVkIHRvIHRoZSB2YWx1ZSwgYnV0IGJlY2F1c2Ugb2YgdGhlIFJlYWN0XG4gICAqIGxpZmVjeWNsZSB3ZSBjYW4ndCBhcHBseSB0aGF0IGNoYW5nZSBpbW1lZGlhdGVseS4gU28gd2UgY2FjaGUgaXQgaGVyZSBhbmRcbiAgICogbGF0ZXIgY2FuIGNhbGwgYHRoaXMuZmx1c2hDaGFuZ2UoKWAgdG8gZmx1c2ggaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAgICovXG5cbiAgcXVldWVDaGFuZ2UgPSAoY2hhbmdlKSA9PiB7XG4gICAgaWYgKGNoYW5nZS5vcGVyYXRpb25zLnNpemUpIHtcbiAgICAgIGRlYnVnKCdxdWV1ZUNoYW5nZScsIHsgY2hhbmdlIH0pXG4gICAgICB0aGlzLnRtcC5jaGFuZ2UgPSBjaGFuZ2VcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmx1c2ggYSB0ZW1wb3JhcmlseSBzdG9yZWQgYGNoYW5nZWAgb2JqZWN0LCBmb3Igd2hlbiBhIGNoYW5nZSBuZWVkZWQgdG8gYmVcbiAgICogbWFkZSBidXQgY291bGRuJ3QgYmVjYXVzZSBvZiBSZWFjdCdzIGxpZmVjeWNsZS5cbiAgICovXG5cbiAgZmx1c2hDaGFuZ2UgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBjaGFuZ2UgfSA9IHRoaXMudG1wXG5cbiAgICBpZiAoY2hhbmdlKSB7XG4gICAgICBkZWJ1ZygnZmx1c2hDaGFuZ2UnLCB7IGNoYW5nZSB9KVxuICAgICAgZGVsZXRlIHRoaXMudG1wLmNoYW5nZVxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShjaGFuZ2UpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gYSBjaGFuZ2Ugb24gdGhlIGVkaXRvciwgcGFzc2luZyBgLi4uYXJnc2AgdG8gYGNoYW5nZS5jYWxsYC5cbiAgICpcbiAgICogQHBhcmFtIHtNaXhlZH0gLi4uYXJnc1xuICAgKi9cblxuICBjaGFuZ2UgPSAoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMudmFsdWUuY2hhbmdlKCkuY2FsbCguLi5hcmdzKVxuICAgIHRoaXMub25DaGFuZ2UoY2hhbmdlKVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2dyYW1tYXRpY2FsbHkgYmx1ciB0aGUgZWRpdG9yLlxuICAgKi9cblxuICBibHVyID0gKCkgPT4ge1xuICAgIHRoaXMuY2hhbmdlKGMgPT4gYy5ibHVyKCkpXG4gIH1cblxuICAvKipcbiAgICogUHJvZ3JhbW1hdGljYWxseSBmb2N1cyB0aGUgZWRpdG9yLlxuICAgKi9cblxuICBmb2N1cyA9ICgpID0+IHtcbiAgICB0aGlzLmNoYW5nZShjID0+IGMuZm9jdXMoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXR0ZXJzIGZvciBleHBvc2luZyBwdWJsaWMgcHJvcGVydGllcyBvZiB0aGUgZWRpdG9yJ3Mgc3RhdGUuXG4gICAqL1xuXG4gIGdldCBzY2hlbWEoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2NoZW1hXG4gIH1cblxuICBnZXQgc3RhY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc3RhY2tcbiAgfVxuXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS52YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaGFuZGxlclxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKi9cblxuICBvbkV2ZW50ID0gKGhhbmRsZXIsIGV2ZW50KSA9PiB7XG4gICAgdGhpcy5jaGFuZ2UoKGNoYW5nZSkgPT4ge1xuICAgICAgdGhpcy5zdGFjay5ydW4oaGFuZGxlciwgZXZlbnQsIGNoYW5nZSwgdGhpcylcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGNoYW5nZS5cbiAgICpcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKi9cblxuICBvbkNoYW5nZSA9IChjaGFuZ2UpID0+IHtcbiAgICBkZWJ1Zygnb25DaGFuZ2UnLCB7IGNoYW5nZSB9KVxuXG4gICAgdGhpcy5zdGFjay5ydW4oJ29uQ2hhbmdlJywgY2hhbmdlLCB0aGlzKVxuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICAgIGNvbnN0IHsgb25DaGFuZ2UgfSA9IHRoaXMucHJvcHNcbiAgICBpZiAodmFsdWUgPT0gdGhpcy52YWx1ZSkgcmV0dXJuXG4gICAgb25DaGFuZ2UoY2hhbmdlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgZWRpdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgKi9cblxuICByZW5kZXIoKSB7XG4gICAgZGVidWcoJ3JlbmRlcicsIHRoaXMpXG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuc3RhY2tcbiAgICAgIC5tYXAoJ3JlbmRlclBvcnRhbCcsIHRoaXMudmFsdWUsIHRoaXMpXG4gICAgICAubWFwKChjaGlsZCwgaSkgPT4gPFBvcnRhbCBrZXk9e2l9IGlzT3BlbmVkPntjaGlsZH08L1BvcnRhbD4pXG5cbiAgICBjb25zdCBwcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgY2hpbGRyZW4gfVxuICAgIGNvbnN0IHRyZWUgPSB0aGlzLnN0YWNrLnJlbmRlcigncmVuZGVyRWRpdG9yJywgcHJvcHMsIHRoaXMpXG4gICAgcmV0dXJuIHRyZWVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGFuIGFycmF5IG9mIHBsdWdpbnMgZnJvbSBgcGx1Z2luc2AgYW5kIGBzY2hlbWFgIHByb3BzLlxuICAgKlxuICAgKiBJbiBhZGRpdGlvbiB0byB0aGUgcGx1Z2lucyBwcm92aWRlZCBpbiBwcm9wcywgdGhpcyB3aWxsIGluaXRpYWxpemUgdGhyZWVcbiAgICogb3RoZXIgcGx1Z2luczpcbiAgICpcbiAgICogLSBUaGUgdG9wLWxldmVsIGVkaXRvciBwbHVnaW4sIHdoaWNoIGFsbG93cyBmb3IgdG9wLWxldmVsIGhhbmRsZXJzLCBldGMuXG4gICAqIC0gVGhlIHR3byBcImNvcmVcIiBwbHVnaW5zLCBvbmUgYmVmb3JlIGFsbCB0aGUgb3RoZXIgYW5kIG9uZSBhZnRlci5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheXxWb2lkfSBwbHVnaW5zXG4gICAqIEBwYXJhbSB7U2NoZW1hfE9iamVjdHxWb2lkfSBzY2hlbWFcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIHJlc29sdmVQbHVnaW5zID0gKHBsdWdpbnMsIHNjaGVtYSkgPT4ge1xuICAgIGNvbnN0IGJlZm9yZVBsdWdpbiA9IEJlZm9yZVBsdWdpbigpXG4gICAgY29uc3QgYWZ0ZXJQbHVnaW4gPSBBZnRlclBsdWdpbigpXG4gICAgY29uc3QgZWRpdG9yUGx1Z2luID0ge1xuICAgICAgc2NoZW1hOiBzY2hlbWEgfHwge31cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHByb3Agb2YgUExVR0lOU19QUk9QUykge1xuICAgICAgLy8gU2tpcCBgb25DaGFuZ2VgIGJlY2F1c2UgdGhlIGVkaXRvcidzIGBvbkNoYW5nZWAgaXMgc3BlY2lhbC5cbiAgICAgIGlmIChwcm9wID09ICdvbkNoYW5nZScpIGNvbnRpbnVlXG5cbiAgICAgIC8vIFNraXAgYHNjaGVtYWAgYmVjYXVzZSBpdCBjYW4ndCBiZSBwcm94aWVkIGVhc2lseSwgc28gaXQgbXVzdCBiZVxuICAgICAgLy8gcGFzc2VkIGluIGFzIGFuIGFyZ3VtZW50IHRvIHRoaXMgZnVuY3Rpb24gaW5zdGVhZC5cbiAgICAgIGlmIChwcm9wID09ICdzY2hlbWEnKSBjb250aW51ZVxuXG4gICAgICAvLyBEZWZpbmUgYSBmdW5jdGlvbiB0aGF0IHdpbGwganVzdCBwcm94aWVzIGludG8gYHByb3BzYC5cbiAgICAgIGVkaXRvclBsdWdpbltwcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzW3Byb3BdICYmIHRoaXMucHJvcHNbcHJvcF0oLi4uYXJncylcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgYmVmb3JlUGx1Z2luLFxuICAgICAgZWRpdG9yUGx1Z2luLFxuICAgICAgLi4uKHBsdWdpbnMgfHwgW10pLFxuICAgICAgYWZ0ZXJQbHVnaW5cbiAgICBdXG4gIH1cblxufVxuXG5cbi8qKlxuICogTWl4IGluIHRoZSBwcm9wZXJ0eSB0eXBlcyBmb3IgdGhlIGV2ZW50IGhhbmRsZXJzLlxuICovXG5cbmZvciAoY29uc3QgcHJvcCBvZiBFVkVOVF9IQU5ETEVSUykge1xuICBFZGl0b3IucHJvcFR5cGVzW3Byb3BdID0gVHlwZXMuZnVuY1xufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7Q29tcG9uZW50fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IEVkaXRvclxuIl19