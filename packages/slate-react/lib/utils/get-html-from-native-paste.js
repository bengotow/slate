'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactDom = require('react-dom');

/**
 * Get clipboard HTML data by capturing the HTML inserted by the browser's
 * native paste action. To make this work, `preventDefault()` may not be
 * called on the `onPaste` event. As this method is asynchronous, a callback
 * is needed to return the HTML content. This solution was adapted from
 * http://stackoverflow.com/a/6804718.
 *
 * @param {Component} component
 * @param {Function} callback
 */

function getHtmlFromNativePaste(component, callback) {
  // Create an off-screen clone of the element and give it focus.
  var el = (0, _reactDom.findDOMNode)(component);
  var clone = el.cloneNode();
  clone.setAttribute('class', '');
  clone.setAttribute('style', 'position: fixed; left: -9999px');
  el.parentNode.insertBefore(clone, el);
  clone.focus();

  // Tick forward so the native paste behaviour occurs in cloned element and we
  // can get what was pasted from the DOM.
  setTimeout(function () {
    if (clone.childElementCount > 0) {
      // If the node contains any child nodes, that is the HTML content.
      var html = clone.innerHTML;
      clone.parentNode.removeChild(clone);
      callback(html);
    } else {
      // Only plain text, no HTML.
      callback();
    }
  }, 0);
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getHtmlFromNativePaste;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9nZXQtaHRtbC1mcm9tLW5hdGl2ZS1wYXN0ZS5qcyJdLCJuYW1lcyI6WyJnZXRIdG1sRnJvbU5hdGl2ZVBhc3RlIiwiY29tcG9uZW50IiwiY2FsbGJhY2siLCJlbCIsImNsb25lIiwiY2xvbmVOb2RlIiwic2V0QXR0cmlidXRlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImZvY3VzIiwic2V0VGltZW91dCIsImNoaWxkRWxlbWVudENvdW50IiwiaHRtbCIsImlubmVySFRNTCIsInJlbW92ZUNoaWxkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUFXQSxTQUFTQSxzQkFBVCxDQUFnQ0MsU0FBaEMsRUFBMkNDLFFBQTNDLEVBQXFEO0FBQ25EO0FBQ0EsTUFBTUMsS0FBSywyQkFBWUYsU0FBWixDQUFYO0FBQ0EsTUFBTUcsUUFBUUQsR0FBR0UsU0FBSCxFQUFkO0FBQ0FELFFBQU1FLFlBQU4sQ0FBbUIsT0FBbkIsRUFBNEIsRUFBNUI7QUFDQUYsUUFBTUUsWUFBTixDQUFtQixPQUFuQixFQUE0QixnQ0FBNUI7QUFDQUgsS0FBR0ksVUFBSCxDQUFjQyxZQUFkLENBQTJCSixLQUEzQixFQUFrQ0QsRUFBbEM7QUFDQUMsUUFBTUssS0FBTjs7QUFFQTtBQUNBO0FBQ0FDLGFBQVcsWUFBTTtBQUNmLFFBQUlOLE1BQU1PLGlCQUFOLEdBQTBCLENBQTlCLEVBQWlDO0FBQy9CO0FBQ0EsVUFBTUMsT0FBT1IsTUFBTVMsU0FBbkI7QUFDQVQsWUFBTUcsVUFBTixDQUFpQk8sV0FBakIsQ0FBNkJWLEtBQTdCO0FBQ0FGLGVBQVNVLElBQVQ7QUFDRCxLQUxELE1BS087QUFDTDtBQUNBVjtBQUNEO0FBQ0YsR0FWRCxFQVVHLENBVkg7QUFXRDs7QUFFRDs7Ozs7O2tCQU1lRixzQiIsImZpbGUiOiJnZXQtaHRtbC1mcm9tLW5hdGl2ZS1wYXN0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgZmluZERPTU5vZGUgfSBmcm9tICdyZWFjdC1kb20nXG5cbi8qKlxuICogR2V0IGNsaXBib2FyZCBIVE1MIGRhdGEgYnkgY2FwdHVyaW5nIHRoZSBIVE1MIGluc2VydGVkIGJ5IHRoZSBicm93c2VyJ3NcbiAqIG5hdGl2ZSBwYXN0ZSBhY3Rpb24uIFRvIG1ha2UgdGhpcyB3b3JrLCBgcHJldmVudERlZmF1bHQoKWAgbWF5IG5vdCBiZVxuICogY2FsbGVkIG9uIHRoZSBgb25QYXN0ZWAgZXZlbnQuIEFzIHRoaXMgbWV0aG9kIGlzIGFzeW5jaHJvbm91cywgYSBjYWxsYmFja1xuICogaXMgbmVlZGVkIHRvIHJldHVybiB0aGUgSFRNTCBjb250ZW50LiBUaGlzIHNvbHV0aW9uIHdhcyBhZGFwdGVkIGZyb21cbiAqIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzY4MDQ3MTguXG4gKlxuICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuXG5mdW5jdGlvbiBnZXRIdG1sRnJvbU5hdGl2ZVBhc3RlKGNvbXBvbmVudCwgY2FsbGJhY2spIHtcbiAgLy8gQ3JlYXRlIGFuIG9mZi1zY3JlZW4gY2xvbmUgb2YgdGhlIGVsZW1lbnQgYW5kIGdpdmUgaXQgZm9jdXMuXG4gIGNvbnN0IGVsID0gZmluZERPTU5vZGUoY29tcG9uZW50KVxuICBjb25zdCBjbG9uZSA9IGVsLmNsb25lTm9kZSgpXG4gIGNsb25lLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnJylcbiAgY2xvbmUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdwb3NpdGlvbjogZml4ZWQ7IGxlZnQ6IC05OTk5cHgnKVxuICBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjbG9uZSwgZWwpXG4gIGNsb25lLmZvY3VzKClcblxuICAvLyBUaWNrIGZvcndhcmQgc28gdGhlIG5hdGl2ZSBwYXN0ZSBiZWhhdmlvdXIgb2NjdXJzIGluIGNsb25lZCBlbGVtZW50IGFuZCB3ZVxuICAvLyBjYW4gZ2V0IHdoYXQgd2FzIHBhc3RlZCBmcm9tIHRoZSBET00uXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGlmIChjbG9uZS5jaGlsZEVsZW1lbnRDb3VudCA+IDApIHtcbiAgICAgIC8vIElmIHRoZSBub2RlIGNvbnRhaW5zIGFueSBjaGlsZCBub2RlcywgdGhhdCBpcyB0aGUgSFRNTCBjb250ZW50LlxuICAgICAgY29uc3QgaHRtbCA9IGNsb25lLmlubmVySFRNTFxuICAgICAgY2xvbmUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjbG9uZSlcbiAgICAgIGNhbGxiYWNrKGh0bWwpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE9ubHkgcGxhaW4gdGV4dCwgbm8gSFRNTC5cbiAgICAgIGNhbGxiYWNrKClcbiAgICB9XG4gIH0sIDApXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBnZXRIdG1sRnJvbU5hdGl2ZVBhc3RlXG4iXX0=