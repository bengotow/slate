'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transferTypes = require('../constants/transfer-types');

var _transferTypes2 = _interopRequireDefault(_transferTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The default plain text transfer type.
 *
 * @type {String}
 */

var TEXT = _transferTypes2.default.TEXT;

/**
 * Set data with `type` and `content` on an `event`.
 *
 * COMPAT: In Edge, custom types throw errors, so embed all non-standard
 * types in text/plain compound object. (2017/7/12)
 *
 * @param {Event} event
 * @param {String} type
 * @param {String} content
 */

function setEventTransfer(event, type, content) {
  var mime = _transferTypes2.default[type.toUpperCase()];

  if (!mime) {
    throw new Error('Cannot set unknown transfer type "' + mime + '".');
  }

  if (event.nativeEvent) {
    event = event.nativeEvent;
  }

  var transfer = event.dataTransfer || event.clipboardData;

  try {
    transfer.setData(mime, content);
  } catch (err) {
    var prefix = 'SLATE-DATA-EMBED::';
    var text = transfer.getData(TEXT);
    var obj = {};

    // If the existing plain text data is prefixed, it's Slate JSON data.
    if (text.substring(0, prefix.length) === prefix) {
      try {
        obj = JSON.parse(text.substring(prefix.length));
      } catch (e) {
        throw new Error('Failed to parse Slate data from `DataTransfer` object.');
      }
    }

    // Otherwise, it's just set it as is.
    else {
        obj[TEXT] = text;
      }

    obj[mime] = content;
    var string = '' + prefix + JSON.stringify(obj);
    transfer.setData(TEXT, string);
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = setEventTransfer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9zZXQtZXZlbnQtdHJhbnNmZXIuanMiXSwibmFtZXMiOlsiVEVYVCIsInNldEV2ZW50VHJhbnNmZXIiLCJldmVudCIsInR5cGUiLCJjb250ZW50IiwibWltZSIsInRvVXBwZXJDYXNlIiwiRXJyb3IiLCJuYXRpdmVFdmVudCIsInRyYW5zZmVyIiwiZGF0YVRyYW5zZmVyIiwiY2xpcGJvYXJkRGF0YSIsInNldERhdGEiLCJlcnIiLCJwcmVmaXgiLCJ0ZXh0IiwiZ2V0RGF0YSIsIm9iaiIsInN1YnN0cmluZyIsImxlbmd0aCIsIkpTT04iLCJwYXJzZSIsImUiLCJzdHJpbmciLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOzs7Ozs7QUFFQTs7Ozs7O0lBTVFBLEksMkJBQUFBLEk7O0FBRVI7Ozs7Ozs7Ozs7O0FBV0EsU0FBU0MsZ0JBQVQsQ0FBMEJDLEtBQTFCLEVBQWlDQyxJQUFqQyxFQUF1Q0MsT0FBdkMsRUFBZ0Q7QUFDOUMsTUFBTUMsT0FBTyx3QkFBZUYsS0FBS0csV0FBTCxFQUFmLENBQWI7O0FBRUEsTUFBSSxDQUFDRCxJQUFMLEVBQVc7QUFDVCxVQUFNLElBQUlFLEtBQUosd0NBQStDRixJQUEvQyxRQUFOO0FBQ0Q7O0FBRUQsTUFBSUgsTUFBTU0sV0FBVixFQUF1QjtBQUNyQk4sWUFBUUEsTUFBTU0sV0FBZDtBQUNEOztBQUVELE1BQU1DLFdBQVdQLE1BQU1RLFlBQU4sSUFBc0JSLE1BQU1TLGFBQTdDOztBQUVBLE1BQUk7QUFDRkYsYUFBU0csT0FBVCxDQUFpQlAsSUFBakIsRUFBdUJELE9BQXZCO0FBQ0QsR0FGRCxDQUVFLE9BQU9TLEdBQVAsRUFBWTtBQUNaLFFBQU1DLFNBQVMsb0JBQWY7QUFDQSxRQUFNQyxPQUFPTixTQUFTTyxPQUFULENBQWlCaEIsSUFBakIsQ0FBYjtBQUNBLFFBQUlpQixNQUFNLEVBQVY7O0FBRUE7QUFDQSxRQUFJRixLQUFLRyxTQUFMLENBQWUsQ0FBZixFQUFrQkosT0FBT0ssTUFBekIsTUFBcUNMLE1BQXpDLEVBQWlEO0FBQy9DLFVBQUk7QUFDRkcsY0FBTUcsS0FBS0MsS0FBTCxDQUFXTixLQUFLRyxTQUFMLENBQWVKLE9BQU9LLE1BQXRCLENBQVgsQ0FBTjtBQUNELE9BRkQsQ0FFRSxPQUFPRyxDQUFQLEVBQVU7QUFDVixjQUFNLElBQUlmLEtBQUosQ0FBVSx3REFBVixDQUFOO0FBQ0Q7QUFDRjs7QUFFRDtBQVJBLFNBU0s7QUFDSFUsWUFBSWpCLElBQUosSUFBWWUsSUFBWjtBQUNEOztBQUVERSxRQUFJWixJQUFKLElBQVlELE9BQVo7QUFDQSxRQUFNbUIsY0FBWVQsTUFBWixHQUFxQk0sS0FBS0ksU0FBTCxDQUFlUCxHQUFmLENBQTNCO0FBQ0FSLGFBQVNHLE9BQVQsQ0FBaUJaLElBQWpCLEVBQXVCdUIsTUFBdkI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7a0JBTWV0QixnQiIsImZpbGUiOiJzZXQtZXZlbnQtdHJhbnNmZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBUUkFOU0ZFUl9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvdHJhbnNmZXItdHlwZXMnXG5cbi8qKlxuICogVGhlIGRlZmF1bHQgcGxhaW4gdGV4dCB0cmFuc2ZlciB0eXBlLlxuICpcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cblxuY29uc3QgeyBURVhUIH0gPSBUUkFOU0ZFUl9UWVBFU1xuXG4vKipcbiAqIFNldCBkYXRhIHdpdGggYHR5cGVgIGFuZCBgY29udGVudGAgb24gYW4gYGV2ZW50YC5cbiAqXG4gKiBDT01QQVQ6IEluIEVkZ2UsIGN1c3RvbSB0eXBlcyB0aHJvdyBlcnJvcnMsIHNvIGVtYmVkIGFsbCBub24tc3RhbmRhcmRcbiAqIHR5cGVzIGluIHRleHQvcGxhaW4gY29tcG91bmQgb2JqZWN0LiAoMjAxNy83LzEyKVxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlbnRcbiAqL1xuXG5mdW5jdGlvbiBzZXRFdmVudFRyYW5zZmVyKGV2ZW50LCB0eXBlLCBjb250ZW50KSB7XG4gIGNvbnN0IG1pbWUgPSBUUkFOU0ZFUl9UWVBFU1t0eXBlLnRvVXBwZXJDYXNlKCldXG5cbiAgaWYgKCFtaW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0IHVua25vd24gdHJhbnNmZXIgdHlwZSBcIiR7bWltZX1cIi5gKVxuICB9XG5cbiAgaWYgKGV2ZW50Lm5hdGl2ZUV2ZW50KSB7XG4gICAgZXZlbnQgPSBldmVudC5uYXRpdmVFdmVudFxuICB9XG5cbiAgY29uc3QgdHJhbnNmZXIgPSBldmVudC5kYXRhVHJhbnNmZXIgfHwgZXZlbnQuY2xpcGJvYXJkRGF0YVxuXG4gIHRyeSB7XG4gICAgdHJhbnNmZXIuc2V0RGF0YShtaW1lLCBjb250ZW50KVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zdCBwcmVmaXggPSAnU0xBVEUtREFUQS1FTUJFRDo6J1xuICAgIGNvbnN0IHRleHQgPSB0cmFuc2Zlci5nZXREYXRhKFRFWFQpXG4gICAgbGV0IG9iaiA9IHt9XG5cbiAgICAvLyBJZiB0aGUgZXhpc3RpbmcgcGxhaW4gdGV4dCBkYXRhIGlzIHByZWZpeGVkLCBpdCdzIFNsYXRlIEpTT04gZGF0YS5cbiAgICBpZiAodGV4dC5zdWJzdHJpbmcoMCwgcHJlZml4Lmxlbmd0aCkgPT09IHByZWZpeCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgb2JqID0gSlNPTi5wYXJzZSh0ZXh0LnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcGFyc2UgU2xhdGUgZGF0YSBmcm9tIGBEYXRhVHJhbnNmZXJgIG9iamVjdC4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgaXQncyBqdXN0IHNldCBpdCBhcyBpcy5cbiAgICBlbHNlIHtcbiAgICAgIG9ialtURVhUXSA9IHRleHRcbiAgICB9XG5cbiAgICBvYmpbbWltZV0gPSBjb250ZW50XG4gICAgY29uc3Qgc3RyaW5nID0gYCR7cHJlZml4fSR7SlNPTi5zdHJpbmdpZnkob2JqKX1gXG4gICAgdHJhbnNmZXIuc2V0RGF0YShURVhULCBzdHJpbmcpXG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHNldEV2ZW50VHJhbnNmZXJcbiJdfQ==