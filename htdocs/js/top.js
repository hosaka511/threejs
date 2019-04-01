/**
 * __PAGE_NAME__
 *
 * @date 2017-04-07
 */

(function ($) {
  var __NAMESPACE__ = window.__NAMESPACE__ || {};

  __NAMESPACE__.Top = function () {
    var _init = function _init() {
      console.log('top');
    };

    return {
      init: _init
    };
  }();

  __NAMESPACE__.Top.init();
})(jQuery);