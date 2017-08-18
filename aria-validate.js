(function ($, window, document) {
  'use strict';
  var pluginName = 'ariaValidate', // the name of the plugin
    a = {
      r: 'role',
      aHi: 'aria-hidden',
      aLi: 'aria-live',
      aRe: 'aria-relevant',
      aAt: 'aria-atomic',
      aErM: 'aria-errormessage',
      aInv: 'aria-invalid',
      aOw: 'aria-owns',
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

  /*
   * Return merged settings object, if user passed valid custom settings,
   * else if passed settings is === false, return unchanged default settings object
   */
  function makeSettings(defaultSettings, userSettings) {
    if (userSettings) {
      return $.extend({}, defaultSettings, userSettings);
    } else {
      return defaultSettings;
    }
  }


  //-----------------------------------------
  // The actual plugin constructor
  function AriaValidate(element, userSettings) {
    var self = this;

    self.element = $(element);
    self.userSettings = userSettings; //the unchanged settings object passed from user
    self.classes = makeSettings($.fn[pluginName].defaultClasses, self.userSettings.classes); //computet html classes used to retrive elements
    self.regionSettings = makeSettings($.fn[pluginName].regionSettings, self.userSettings.regionSettings); //computed region settings for this field

    //-----------------------------------
    //Initialise field
    self.selectElements();
    self.initMarkup();
    self.bindEventListeners();
  };



  // Avoid Plugin.prototype conflicts
  $.extend(AriaValidate.prototype, {
    //-------------------------------------------------------------
    //Initialise field
    //-------------------------------------------------------------
    selectElements: function () {
      var self = this,
        classes = self.classes,
        element = self.element;

      /*
       * Retrive all the elements needed to buil up a field group.
       * 
       * Because alert and successbox are not mandatory fields,
       * we check if the boxes are present in markup, and if not we set the variable to false.
       * 
       * We also retrive the tag name of the field and, if the field is input, the value of the attribute type.
       * We need this information to bind the correct event listener to the field for validation (change / input).
       */

      self.field = element.find('.' + classes.fieldClass);
      self.label = element.find('.' + classes.labelClass);
      self.alertbox = element.find('.' + classes.alertboxClass).length === 1 ? element.find('.' + classes.alertboxClass) : false;
      self.successbox = element.find('.' + classes.successboxClass).length === 1 ? element.find('.' + classes.succesboxClass) : false;
      self.fieldTag = self.field.prop('tagName');
      self.fieldType = self.fieldTag === 'INPUT' ? self.field.attr('type') : false;
    },
    initMarkup: function () {
      /*
       * Check the markup.
       * We have to check if:
       * 1 - input has a name and id.
       * 2 - a label is present and the id of the input is referenced in the 'for' attribute of the label
       * 3 - an alertbox (wrapper for alert messages) is present and has an id. Alertbox is not mandatory.
       * 4 - a successbox (wrapper for success messages) is present and has an id. Succesbox is not mandatory.
       */
      var self = this,
        elementId = setId(self.element, self.classes.inputGroupIdPrefix, count),
        fieldId = setId(self.field, elementId + '__input'),
        alertboxId = self.alertbox !== false ? setId(self.alertbox, elementId + '__alertbox') : false,
        successboxId = self.successbox !== false ? setId(self.successbox, elementId + '__successbox') : false;

      //check if 'for' attribute is correctly set on label
      if (!self.label.is('[for="' + fieldId + '"]')) {
        self.label.attr('for', fieldId);
      }

      //add accessibility attributes
      if (self.alertbox) {
        self.field
          .attr(a.aErM, alertboxId);

        self.alertbox
          .attr(a.r, 'alert')
          .attr(a.aLi, 'assertive')
          .attr(a.aRe, 'additions text')
          .attr(a.aAt, a.t)
          .attr(a.aHi, a.t);
      }

      if (self.successbox) {
        self.successbox
          .attr(a.aLi, 'polite')
          .attr(a.aRe, 'additions text')
          .attr(a.aAt, a.t)
          .attr(a.aHi, a.t);

        self.field
          .attr(a.aOw, successboxId);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.initMarkup', [self]);

      //increment count by one
      count = count + 1;
    },
    bindEventListeners: function () {
      var self = this,
        fieldTag = self.fieldTag,
        fieldType = self.fieldType;


      if (fieldTag === 'INPUT' && (fieldType !== 'checkbox' && fieldType !== 'range' && fieldType !== 'radio')) {
        self.field.on('input', function () {
          var i = 0,
            l = self.userSettings.preventErrors.length;
          for (i; i < l; i = i + 1) {
            $.fn[pluginName].preventErrors[self.userSettings.preventErrors[i]]();
          }
        });
      } else {
        self.field.on('change', function () {
          var i = 0,
            l = self.userSettings.preventErrors.length;
          for (i; i < l; i = i + 1) {
            $.fn[pluginName].preventErrors[self.userSettings.preventErrors[i]]();
          }
        });
      }

      self.field.on('blur', function () {
        var i = 0,
          l = self.userSettings.autoformat.length;
        for (i; i < l; i = i + 1) {
          $.fn[pluginName].autoformat[self.userSettings.autoformat[i]]();
        }
      });
    },
    //-------------------------------------------------------------
    //Validation
    invalidateFieldGroup: function () {
      var self = this;

      self.element
        .removeClass(self.classes.fieldGroupValidClass)
        .addClass(self.classes.fieldGroupErrorClass);

      self.field
        .attr(a.aInv, a.t)
        .removeClass(self.classes.fieldValidClass)
        .addClass(self.classes.fieldErrorClass);

      self.label
        .removeClass(self.classes.labelValidClass)
        .addClass(self.classes.labelErrorClass);

      if (self.successbox) {
        self.successbox
          .html('')
          .attr(a.aHi, a.t)
          .removeClass(self.classes.successboxVisibleClass);
      }
      if (self.alertbox && self.errorMsg !== false) {
        self.alertbox
          .html(self.errorMsg)
          .attr(a.aHi, a.f)
          .addClass(self.classes.alertboxVisibleClass);
      }
    },
    validateFieldGroup: function () {
      var self = this;

      self.element
        .removeClass(self.classes.fieldGroupErrorClass)
        .addClass(self.classes.fieldGroupValidClass);

      self.field
        .attr(a.aInv, a.f)
        .removeClass(self.classes.fieldErrorClass)
        .addClass(self.classes.fieldValidClass);

      self.label
        .removeClass(self.classes.labelErrorClass)
        .addClass(self.classes.labelValidClass);

      if (self.alertbox) {
        self.alertbox
          .html('')
          .attr(a.aHi, a.t)
          .removeClass(self.classes.alertboxVisibleClass);
      }
      if (self.successbox && self.successMsg !== false) {
        self.successbox
          .html(self.successMsg)
          .attr(a.aHi, a.f)
          .addClass(self.classes.successboxVisibleClass);
      }
    },
    //-------------------------------------------------------------
    //Method caller
    //-------------------------------------------------------------
    methodCaller: function (methodName, methodArg) {
      //
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
        $.data(self, 'plugin_' + pluginName, new AriaValidate(self, userSettings));
      } else if (typeof userSettings === 'string' && typeof methodArg !== 'undefined') {
        $.data(self, 'plugin_' + pluginName).methodCaller(userSettings, methodArg);
      }
    });
  };

  $.fn[pluginName].preventErrors = {
    test: function (value) {
      console.log(value + ' pre error1');
    },
    test2: function (value) {
      console.log(value + ' prev error 2');
    }
  };
  
  $.fn[pluginName].autoformat = {
    test: function (value) {
      console.log(value + ' autoformat 1');
    },
    test2: function (value) {
      console.log(value + ' autoformat 2');
    }
  };


  $.fn[pluginName].regionSettings = {
    dateFormat: 'eu', // eu / us
    decimalSeparator: ',', // . or ,
    thousandSeparator: '.',
    timeSeparator: ':',
    codeSeparator: '-',
    telPrefixSeparator: ' '
  };

  $.fn[pluginName].defaultClasses = {
    fieldGroupIdPrefix: 'field-group--',
    fieldGroupValidClass: 'field-group_valid',
    fieldGroupErrorClass: 'field-group_error',
    fieldClass: 'field-group__field',
    fieldErrorClass: 'field-group__field_error',
    fieldValidClass: 'field-group__field_valid',
    labelClass: 'field-group__label',
    labelErrorClass: 'field-group__label_error',
    labelValidClass: 'field-group__label_valid',
    alertboxClass: 'field-group__alertbox',
    successboxClass: 'field-group__successbox',
    alertboxVisibleClass: 'field-group__alertbox_visible',
    successboxVisibleClass: 'field-group__successbox_visible',
  };

  $.fn[pluginName].defaultSettings = {
    classes: false,
    validate: false,
    preventErrors: false,
    autoformat: false
  };
}(jQuery, window, document));


$(window).ready(function () {
  //$(window).on('ariaValidate.initMarkup', function (event, element) {
  // console.log(element);
  //})

  $('#integer-test-1').ariaValidate({
    classes: {
      fieldClass: 'input-group__input',
      labelClass: 'input-group__label',
      alertboxClass: 'input-group__alertbox',
      successboxClass: 'input-group__successsbox',
      fieldGroupValidClass: 'field-group_valid',
      fieldGroupErrorClass: 'field-group_error'
    },
    regionSettings: {
      dateFormat: 'us'
    },
    validate: {
      type: 'text',
      minLength: 3,
      maxLength: 100
    },
    preventErrors: ['test', 'test2'],
    autoformat: ['test', 'test2']
  });


  $('#range-test-1').ariaValidate({
    classes: {
      fieldClass: 'input-group__input',
      labelClass: 'input-group__label',
      alertboxClass: 'input-group__alertbox',
      successboxClass: 'input-group__successsbox',
      fieldGroupValidClass: 'field-group_valid',
      fieldGroupErrorClass: 'field-group_error'
    },
    regionSettings: {
      dateFormat: 'us'
    },
    validate: {
      type: 'text',
      minLength: 3,
      maxLength: 100
    },
    preventErrors: ['test', 'test2'],
    autoformat: ['test', 'test2']
  });


  $('#number-test-1').ariaValidate({
    classes: {
      fieldClass: 'input-group__input',
      labelClass: 'input-group__label',
      alertboxClass: 'input-group__alertbox',
      successboxClass: 'input-group__successsbox',
      fieldGroupValidClass: 'field-group_valid',
      fieldGroupErrorClass: 'field-group_error'
    },
    regionSettings: {
      dateFormat: 'us'
    },
    validate: {
      type: 'text',
      minLength: 3,
      maxLength: 100
    },
    preventErrors: ['test', 'test2'],
    autoformat: ['test', 'test2']
  });
});
