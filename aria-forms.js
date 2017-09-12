(function ($, window, document) {
  'use strict';
  var pluginName = 'ariaForms', // the name of the plugin
    a = {
      r: 'role',
      aHi: 'aria-hidden',
      aLi: 'aria-live',
      aRe: 'aria-relevant',
      aAt: 'aria-atomic',
      aErM: 'aria-errormessage',
      aInv: 'aria-invalid',
      req: 'required',
      ty: 'type',
      t: 'true',
      f: 'false'
    },
    count = 0,
    win = $(window);


  //-----------------------------------------
  //Private functions
  /*
   * set id of the element passed along
   * if the element does not have one
   * and return the id of the element
   * If no suffix is passed, then do not set it
   */
  function setId(element, idPrefix, idSuffix) {
    idSuffix = idSuffix !== undefined ? idSuffix : '';

    if (!element.is('[id]')) {
      element.attr('id', idPrefix + idSuffix);
    }
    return element.attr('id');
  }


  //-----------------------------------------
  // The actual plugin constructor
  function AriaForms(element, userSettings) {
    var self = this;
    self.makeSettings(userSettings);
    self.selectElements(element);
    self.initMarkup();
    self.initField();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(AriaForms.prototype, {
    makeSettings: function (userSettings) {
      var self = this;
      //generate objects with settings
      self.settings = $.extend({}, $.fn[pluginName].defaultSettings, userSettings); //fiel specific settings
      self.errorMessages = $.extend({}, $.fn[pluginName].globalErrorMessages, self.settings.errorMessages); //error
    },
    selectElements: function (element) {
      var self = this,
        settings = self.settings;
      //input group's elements
      self.element = $(element);
      self.field = self.element.find('.' + settings.fieldClass);
      self.fieldType = self.input.prop('tagName');
      self.inputElementType = self.fieldType === 'input' ? self.field.attr(a.ty) : false;
      self.label = self.element.find('.' + settings.labelClass);
      self.alertbox = self.element.find('.' + settings.alertboxClass);
    },
    initMarkup: function () {
      /*
       * Check if the markup is correctly set up,
       * If not, try to automatically correct errors where possible,
       * We have to check if:
       * 1 - input has a name and id.
       * 2 - a label is present and the id of the input is referenced in the 'for' attribute of the label
       * 3 - an alertbox (wrapper for alert messages) is present and has an id.
       *
       */
      var self = this,
        elementId = setId(self.element, self.settings.inputGroupIdPrefix, count),
        fieldId = setId(self.field, elementId + '__input'),
        alertboxId = setId(self.alertbox, elementId + '__alertbox');

      //check if 'for' attribute is correctly set on label
      if (!self.label.is('[for="' + fieldId + '"]')) {
        self.label.attr('for', fieldId);
      }

      /* Check if a field initialised as 'required' misses the attribute 'required',
       * or if a field initialised as 'non-required' has the attribute 'required'.
       * We give precedence to the settings passed with plugin when the markup diffearse from the settigns
       */
      if (self.settings.required && !self.field.prop(a.req)) {
        self.field.prop(a.req, true);
      } else if (!self.settings.required && self.input.prop(a.req)) {
        self.field.prop(a.req, false);
      }

      //add accessibility attributes
      self.field
        .attr(a.aErM, alertboxId);

      self.alertbox
        .attr(a.r, 'alert')
        .attr(a.aLi, 'assertive')
        .attr(a.aRe, 'additions text')
        .attr(a.aAt, a.t)
        .attr(a.aHi, a.t)
        .hide();
    },
    initField: function () {
      var self = this,
        settings = self.settings;


      /*
       * Enable validation on input change on field,
       * if validateOnInput is set to true 
       */
      if (settings.validateOnInput) {
        if (self.fieldType === 'textarea' || (self.fieldType === 'input' && self.inputElementType !== 'checkbox' && self.inputElementType !== 'radio')) {
          self.field.on('input.' + pluginName, function () {
            //call function....
          });
        } else {
          self.field.on('change.' + pluginName, function () {
            //call function....
          });
        }
      }

    },
    methodCaller: function () {

    }
  });



  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (userSettings, methodArg) {
    return this.each(function () {
      var self = this;
      /*
       * If following conditions matches, then the plugin must be initialsied:
       * Check if the plugin is instantiated for the first time
       * Check if the argument passed is an object or undefined (no arguments)
       */
      if (!$.data(self, 'plugin_' + pluginName) && (typeof userSettings === 'object' || typeof userSettings === 'undefined')) {
        $.data(self, 'plugin_' + pluginName, new AriaForms(self, userSettings));
      } else if (typeof userSettings === 'string' && typeof methodArg !== 'undefined') {
        $.data(self, 'plugin_' + pluginName).methodCaller(userSettings, methodArg);
      }
    });
  };

  $.fn[pluginName].globalSettings = {
    fullDateFormat: 'dd/mm/yyyy', // mm/dd/yyyy
    shortDateFormat: 'd/m/yy', //m/d/yy
    decimalSeparator: ',', // . or ,
    thousandSeparator: '.',
    //timeSeparator: ':',
    codesSeparator: '-',
    telPrefixSeparator: ' '
  };

  //Define default settings for ariaForms
  $.fn[pluginName].defaultSettings = {
    fieldGroupIdPrefix: 'input-group--',
    fieldClass: 'input-group__input',
    labelClass: 'input-group__label',
    alertboxClass: 'input-group__alertbox',
    fieldGroupValidClass: 'input-group_valid',
    fieldGroupErrorClass: 'input-group_error',
    //inputGroupDisabledClass: 'input-group_disabled',
    type: 'text', //text, letters, int, float, bool, date, time, day, month, year, email, tel/fax tel/fax prefix tel/fax with prefix, password, custom
    customRegex: false,
    required: false,
    min: false,
    max: false,
    minLength: false,
    maxLength: false,
    validateOnInput: true, //validate while typing: prevent incorrect input while typing (if supported by field type)
    validateOnBlur: true, //validate field when looses focus
    autoFormat: true, //try to automatically format field (if possible. E.g.: remove whitespaces, format phone, numbers, replace dots with slashes etc.) based on field type
    separator: false, //
    errorMessages: false // pass object of custom error messages for the current field 
  };

  $.fn[pluginName].globalErrorMessages = {};

  $.fn[pluginName].globalRegExpressions = {};
}(jQuery, window, document));


$(document).ready(function () {
  'use strict';
  $('#integer-test-1').ariaForms({
    type: 'int',
    required: true
  });

});
