/*
MIT License

Copyright (c) 2017 Davide Trisolini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory); //AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery')); //CommonJS
    } else {
        factory(jQuery, window);
    }
}(function ($, window) {
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
      dV: 'data-value',
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
   * else if settings === false, return unchanged default settings object
   */
  function makeSettings(defaultSettings, userSettings) {
    if (userSettings) {
      return $.extend({}, defaultSettings, userSettings);
    }
    return defaultSettings;
  }

  /*
   * Build strings of namespaced event
   */
  function namespaceEventString(eventsString, namesapce) {
    var events = eventsString.split(' '), //split events list array
      eventsLenght = events.length,
      namespacedEvents = '';

    for (var i = 0; i < eventsLenght; i = i + 1) {
      namespacedEvents = namespacedEvents + ' ' + events[i] + '.' + namesapce;
    }

    return String(namespacedEvents);
  }

  /*
   * Convert date from US format (MM/DD/YYYY) or from EU format(DD/MM/YYYY) to ISO format
   */
  function convertDateToIso(value, format, separator) {
    /*
     * Check if date is already in ISO format or is empty,
     * and return unchanged value if true.
     */
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    /*
     * Date is not in ISO format and is not empty.
     * We have to try to convert it in ISO format
     * 1 - Split in array
     * 2 - Check if array length is 3 and check the length of each entry (should be: 2,2,4).
     * 2 - Reconstruct date by repositioning day, month and year based on regioin settings and change date separator (-)
     */
    value = value.split(separator);

    if (value.length === 3 && value[0].length === 2 && value[1].length === 2 && value[2].length === 4) {
      if (format === 'eu') {
        value = value[2] + '-' + value[1] + '-' + value[0];
      } else if (format === 'us') {
        value = value[2] + '-' + value[0] + '-' + value[1];
      }
      return value;
    }

    // if it is not possible to convert the date, then return false.
    return false;
  }

  /*
   * Calculate date with or without offset starting from an ISO-formatted date and an offset (optional)
   * (for maxDate and minDate validation functions)
   * @TODO: TEST!!
   */
  function calculateDate(param, dateFormat, dateSeparator) {
    if (Array.isArray(param)) {
      var offset = param[1];
      param = param[0].attr(a.dV) || param[0].val();

      if (param.length === 3 && !param) {
        param = param[2];
      }

      param = convertDateToIso(param, dateFormat, dateSeparator);
      param = new Date(param);
      param = param.setDate(param.getDate() + offset);
      return param;
    }

    param = param.attr(a.dV) || param.val();
    return convertDateToIso(param, regionSettings.dateFormat, regionSettings.dateSeparator);
  }

  /*
   * Calculate minLenght and maxLenght with or without offset starting from object or array
   * (for maxLength and minLength validation functions)
   * @TODO: TEST!!
   */
  function calculateLength(param) {
    if (Array.isArray(param)) {
      var offset = param[1];
      param = param[0].attr(a.dV) !== '' ? param[0].attr(a.dV).length : param[0].val().length;

      if (param.length === 3 && !param) {
        param = param[2];
      }

      param = param + offset;
      return param > 0 ? param : offset;
    }
    param = param.attr(a.dV).length || param.val().length
    return param;
  }

  /*
   * Calculate min and max with or without offset starting from object or array
   * (for max and min validation functions)
   * @TODO: TEST!!
   */
  function calculateInt(param) {
    if (Array.isArray(param)) {
      var offset = param[1];
      param = param[0].attr(a.dV) || param[0].val();

      if (param.length === 3 && !param) {
        param = param[2];
      }

      return parseFloat(param, 10) + offset;
    }

    param = param.attr(a.dV) || param.val();
    return parseFloat(param, 10);
  }


  //-----------------------------------------
  // The actual plugin constructor
  function AriaValidate(element, userSettings) {
    var self = this;

    self.element = $(element);

    //DEFAULT SETTINGS
    self.userSettings = userSettings; //the unchanged settings object passed from user
    self.behaviour = self.userSettings.behaviour;
    self.behaviourLength = self.behaviour.length;

    //CLASSES
    self.classes = makeSettings($.fn[pluginName].defaultClasses, self.userSettings.classes); //computed html classes used to retrive elements

    //REGION SETTINGS
    self.regionSettings = makeSettings($.fn[pluginName].defaultRegionSettings, self.userSettings.regionSettings);

    //VALIDATION
    self.fieldStatus = undefined; //Describes the staus of the field: undefined -> field was never focussed and validated, true -> correct input , 'errorCode' -> incorrect input
    self.fieldValue = undefined; //The value of the field
    self.errorMsgs = makeSettings($.fn[pluginName].defaultErrorMsgs, self.userSettings.errorMsgs); //computed error messages settings for this field;
    self.successMsg = self.userSettings.successMsg ? self.userSettings.successMsg : $.fn[pluginName].defaultSuccessMsg; //Success message for this field

    //REGISTERED EVENTS
    self.eventListeners = null;

    //-----------------------------------
    //Initialise field
    self.selectElements();
    self.initMarkup();
    self.addBehaviour();
    self.updateFieldValue();
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

      self.field = element.find('.' + classes.fieldClass); //length could be > 1 in case of radio
      self.label = element.find('.' + classes.labelClass); //length could be > 1 in case of radio
      self.alertbox = element.find('.' + classes.alertboxClass).length === 1 ? element.find('.' + classes.alertboxClass) : false;
      self.successbox = element.find('.' + classes.successboxClass).length === 1 ? element.find('.' + classes.successboxClass) : false;

      /*
       * If only one field is present inside of the field group,
       * then retrive TagName, fieldType  and fieldName for the field
       */
      if (self.field.length === 1) {
        self.fieldTag = self.field.prop('tagName');
        self.fieldType = self.fieldTag === 'INPUT' ? self.field.attr('type') : false;
        self.fieldName = self.userSettings.fieldName || self.field.attr('name');
      } else {
        //Set values for radio button
        self.fieldTag = 'INPUT';
        self.fieldType = 'radio';
        self.fieldName = self.userSettings.fieldName || $(self.field[0]).attr('name');
      }
    },
    initMarkup: function () {
      /*
       * Check the markup.
       * We have to check if:
       * 1 - input has an id (otherwise set a scripting-generated id)
       * 2 - a label is present and the id of the input is referenced in the 'for' attribute of the label (otherwise set for attribute)
       * 3 - an alertbox (wrapper for alert messages) is present and has an id. Alertbox is not mandatory.
       * 4 - a successbox (wrapper for success messages) is present and has an id. Succesbox is not mandatory.
       *
       */
      var self = this,
        elementId = setId(self.element, self.classes.inputGroupIdPrefix, count),
        fieldId = '',
        alertboxId = self.alertbox !== false ? setId(self.alertbox, elementId + '__alertbox') : false,
        successboxId = self.successbox !== false ? setId(self.successbox, elementId + '__successbox') : false;


      if (self.fieldType !== 'radio') {
        //Not radio
        fieldId = setId(self.field, elementId + '__input');

        //check if 'for' attribute is correctly set on label
        if (!self.label.is('[for="' + fieldId + '"]')) {
          self.label.attr('for', fieldId);
        }

      } else {
        //Radio buttons
        fieldId = [];

        self.field.each(function (index) {
          var currentField = $(this);
          fieldId.push(setId(currentField, (elementId + '__input' + '-' + index)));

          //check if 'for' attribute is correctly set on label
          if (!currentField.is('[for="' + fieldId[index] + '"]')) {
            $(self.label[index]).attr('for', fieldId[index]);
          }
        });
      }



      //add accessibility attributes to fieldbox, if the element exists
      if (self.alertbox) {
        self.field.attr(a.aErM, alertboxId);

        self.alertbox
          .attr(a.r, 'alert')
          .attr(a.aLi, 'assertive')
          .attr(a.aRe, 'additions text')
          .attr(a.aAt, a.t)
          .attr(a.aHi, a.t);
      }

      //add accessibility attributes to successbox, if the element exists
      if (self.successbox) {
        self.field.attr(a.aOw, successboxId);

        self.successbox
          .attr(a.aLi, 'polite')
          .attr(a.aRe, 'additions text')
          .attr(a.aAt, a.t)
          .attr(a.aHi, a.t);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.markupInitialised', [self]);

      //increment count by one
      count = count + 1;
    },
    addBehaviour: function () {
      var self = this,
        behaviour = self.behaviour,
        behaviourLength = self.behaviourLength;


      for (var i = 0; i < behaviourLength; i = i + 1) {
        self.bindEventListeners(behaviour[i]);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.behaviourAdded', [self]);
    },
    bindEventListeners: function (currentBehaviour) {
      //@TODO Check if custom behaviours works correctly when triggered from aria-form
      var self = this,
        events = namespaceEventString(currentBehaviour.event, pluginName),
        autoformatRules = currentBehaviour.autoformat || false,
        validateRules = currentBehaviour.validate || false,
        main = currentBehaviour.main || false; //check if current behaviour is set as 'main behaviour'


      //Bind event listeners to field
      self.field.on(events, function () {
        if (autoformatRules) {
          self.performAutoformat(autoformatRules);
        }
        if (validateRules) {
          self.performValidation(validateRules, main);
        }

        //Keep track of registered event listeners
        self.eventListeners = self.eventListeners + ' ' + currentBehaviour.event; //@TODO Check what happens if one event is used in multiple behaviours
      });
    },
    unbindEventListeners: function (events) {
      var self = this,
        events = namespaceEventString(events, pluginName);

      self.field.off(namespaceEventString(events, pluginName));
      self.eventListeners = self.eventListeners.replace(events, ''); //@TODO Testen ob string wird korrekterwei�e entfernt


      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.eventListenersRemoved', [self]);
    },
    updateFieldValue: function () {
      var self = this;

      if (self.fieldType === 'checkbox') {
        //checkbox
        self.fieldValue = self.field.prop('checked');
      } else if (self.fieldType === 'radio') {
        //radio
        self.fieldValue = self.field.filter(':checked').length === 1 ? self.field.filter(':checked').val() : false;
      } else {
        self.fieldValue = self.field.val() || '';
      }
      /*
       * Save the user input in attribute data-value.
       * Maybe useful for some external plugin
       */
      self.field.attr(a.dV, self.fieldValue);
    },
    performAutoformat: function (autoformatRules) {
      /*
       * Perform autoformatting on the field:
       * Call each autoformatting function passed from user.
       * Each autoformatting functions updates the value of the input.
       * When all functions have been performed, we have the formatted value.
       * Replace the old user input with the new formatted value.
       */
      var self = this;

      //retrive current field value and update self.fieldValue
      self.updateFieldValue();

      for (var key in autoformatRules) {
        self.fieldValue = $.fn[pluginName].autoformatFunctions[key](self.fieldValue, autoformatRules[key], self.regionSettings);
      }

      //update the field value
      self.field.val(self.fieldValue);

    },
    performValidation: function (validationRules, main) {
      /*
       * Perform validation on the field:
       * Call each validation function passed from user for validation.
       * If function returns true, proceed, else throw error and exit execution.
       * If no function returns errors, then validate the field by calling self.validateFieldGroup().
       */
      var self = this;

      //retrive current field value and update self.fieldValue
      self.updateFieldValue();

      //loop through all validation functions
      for (var key in validationRules) {
        //update field status
        var fieldStatus = $.fn[pluginName].validateFunctions[key](self.fieldValue, validationRules[key], self.regionSettings);
        /*
         * If field status is false, invalidate the field group
         * and show the error message relative to the error encountered while validationg
         * by calling invalidateFieldGroup
         */
        if (fieldStatus !== true) {
          self.fieldStatus = fieldStatus;
          self.invalidateFieldGroup();
          return;
        }
      }

      /*
       * No error occured:
       * validate field group if this is main behaviour,
       * otherwise reset field group
       */
      if (main) {
        self.validateFieldGroup(main);
      } else {
        self.resetFieldGroup();
      }
    },
    invalidateFieldGroup: function () {
      var self = this;

      //add error classes to field group and remove valid classes
      self.element
        .removeClass(self.classes.fieldGroupValidClass)
        .addClass(self.classes.fieldGroupErrorClass);

      //add error classes to field and remove valid classes
      self.field
        .attr(a.aInv, a.t)
        .removeClass(self.classes.fieldValidClass)
        .addClass(self.classes.fieldErrorClass);

      //add error classes to label and remove valid classes
      self.label
        .removeClass(self.classes.labelValidClass)
        .addClass(self.classes.labelErrorClass);

      //hide successbox and remove the success message
      if (self.successbox) {
        self.successbox
          .html('')
          .attr(a.aHi, a.t)
          .removeClass(self.classes.successboxVisibleClass);
      }

      //append error message to alertbox and show alert
      if (self.alertbox && self.fieldStatus !== true) {
        self.alertbox
          .html(self.errorMsgs[self.fieldStatus])
          .attr(a.aHi, a.f)
          .addClass(self.classes.alertboxVisibleClass);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.isInvalid', [self]);
    },
    validateFieldGroup: function () {
      var self = this;

      //remove error classes and add valid classes to field group
      self.element
        .removeClass(self.classes.fieldGroupErrorClass)
        .addClass(self.classes.fieldGroupValidClass);

      //remove error classes and add valid classes to field
      self.field
        .attr(a.aInv, a.f)
        .removeClass(self.classes.fieldErrorClass)
        .addClass(self.classes.fieldValidClass);

      //remove error classes and add valid classes to label
      self.label
        .removeClass(self.classes.labelErrorClass)
        .addClass(self.classes.labelValidClass);

      //remove error message from alertbox and hide alertbox
      if (self.alertbox) {
        self.alertbox
          .html('')
          .attr(a.aHi, a.t)
          .removeClass(self.classes.alertboxVisibleClass);
      }

      //Append success message to succesbox and show message
      if (self.successbox && self.successMsg !== false) {
        self.successbox
          .html(self.successMsg)
          .attr(a.aHi, a.f)
          .addClass(self.classes.successboxVisibleClass);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.isValid', [self]);
    },
    resetFieldGroup: function () {
      var self = this;

      //remove error and valid classes from element
      self.element
        .removeClass(self.classes.fieldGroupErrorClass)
        .removeClass(self.classes.fieldGroupValidClass);

      //remove error and valid classes from field
      self.field
        .removeAttr(a.aInv)
        .removeClass(self.classes.fieldErrorClass)
        .removeClass(self.classes.fieldValidClass);

      //remove error and valid classes from label
      self.label
        .removeClass(self.classes.labelErrorClass)
        .removeClass(self.classes.labelValidClass);

      //remove error message from alertbox and hide alertbox
      if (self.alertbox) {
        self.alertbox
          .html('')
          .attr(a.aHi, a.t)
          .removeClass(self.classes.alertboxVisibleClass);
      }

      //remove success message from alertbox and hide alertbox
      if (self.successbox && self.successMsg !== false) {
        self.successbox
          .html('')
          .attr(a.aHi, a.t)
          .removeClass(self.classes.successboxVisibleClass);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.resetted', [self]);
    },
    destroy: function () {
      /*
       * @TODO Test: self.eventListeners,  removeData
       */
      var self = this;

      //Unbind event listeners
      self.unbindEventListeners(self.eventListeners);
      self.eventListeners = null;

      //Remove jQuery.data
      $.removeData(self, 'plugin_' + pluginName);
    },
    //-------------------------------------------------------------
    //Method caller
    //-------------------------------------------------------------
    methodCaller: function (methodName, methodArg) {
      var self = this;

      switch (methodName) {
      case 'updateFieldValue':
        self.updateFieldValue();
        break;
      case 'unbindEventListeners':
        self.unbindEventListeners(methodArg);
        break;
      case 'destroy':
        self.destroy(); //@TODO Test method
        break;
      case 'invalidateField':
        self.invalidateFieldGroup(); //@TODO Test method
        break;
      case 'resetField':
        self.resetFieldGroup(); //@TODO Test method
        break;
      }
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
      } else if (typeof userSettings === 'string') {
        $.data(self, 'plugin_' + pluginName).methodCaller(userSettings, methodArg);
      }
    });
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

  $.fn[pluginName].defaultRegionSettings = {
    dateFormat: 'eu',
    dateSeparator: '/',
    //timeSeparator: ':',
    decimalSeparator: ','
  };

  $.fn[pluginName].defaultErrorMsgs = {
    letters: 'Digits are not allowed in this field',
    onlyLetters: 'Only letters are accepted',
    digits: 'Letters are not allowed in this field',
    onlyDigits: 'Only digits are accepted',
    int: 'Enter a whole number (e.g. 12)',
    float: 'Enter a number (e.g. 12.168 or 16)',
    bool: 'You have to check this checkbox in order to continue',
    date: 'Not a valid date',
    minDate: 'The date entered is too far in the past',
    maxDate: 'The date entered is too far in the future',
    time: 'Entera valid time (e.g. 10:30)',
    minTime: 'Time is before the minimum time',
    maxTime: 'Time is after the maximum time',
    email: 'Enter a valid email address',
    telWithPrefix: 'Enter a valid phone number with the county prefix (e.g. +49 373837638)',
    telNoPrefix: 'Enter a valid phone number',
    telPrefix: 'Not a valid prefix',
    password: 'Password is not secure',
    min: 'The entered number is too small',
    max: 'The entered number is too big',
    minLength: 'The length of the input is too short',
    maxLength: 'Field length exceeds the maximum number of chars allowed',
    required: 'This field is required to sucessfully complete the form',
    tokens: 'Please choose one value from the list',
    match: 'No match',
    customRegex: 'Regex match returned "false"',
    ajax: 'server says no!',
    ajaxError: 'Server error.'
  };

  $.fn[pluginName].defaultSuccessMsg = 'Perfect! You told us exactly what we wanted to know!';

  //------------------------------------------------------
  //VALIDATION
  $.fn[pluginName].validateFunctions = {
    /*
     * Validation functions:
     * Arguments:
     * fieldValue -> value of the field
     * param (not every functions needs this argument) -> value for validation passed from author
     * regionSettings (not every functions needs this argument) -> the computed region settings
     *
     * Output:
     * true if valid,
     * name of error if not valid (e.g.: 'email', if e-mail is not valid)
     */

    letters: function (fieldValue) {
      //Check if value does not contain any digit (0-9)
      return /^[\D]*$/.test(fieldValue) ? true : 'letters';
    },
    onlyLetters: function (fieldValue) {
      //Check if value contains only letters (a-z, A-Z)
      return /^[a-zA-Z�������������������������������������������������������������]*$/.test(fieldValue) ? true : 'onlyLetters';
    },
    digits: function (fieldValue) {
      //Check if value contains any letters (a-z, A-Z)
      return /^[^a-zA-Z�������������������������������������������������������������]*$/.test(fieldValue) ? true : 'digits';
    },
    onlyDigits: function (fieldValue) {
      //Check if value is digit (0-9)
      return /^[\d]*$/.test(fieldValue) ? true : 'onlyDigits';
    },
    int: function (fieldValue) {
      //check if value is number and int
      var value = parseInt(fieldValue, 10);
      return Number.isInteger(value) ? true : value === '' ? true : 'int';
    },
    float: function (fieldValue, param, regionSettings) {
      /*
       * Chech if decimal separator occurs 0 or 1 time in the string
       * and check wich separator was used
       */
      var testComma = fieldValue.split(','),
        testDot = fieldValue.split('.');

      if ((testComma.length >= 2 && regionSettings.decimalSeparator === '.') ||
        (testDot.length >= 2 && regionSettings.decimalSeparator === ',')) {
        return 'float';
      }

      //Replace comma with dot for validation, otherwise value will not parse as float
      if (regionSettings.decimalSeparator === ',') {
        fieldValue = fieldValue.replace(/,/, '.');
      }

      //chech if number is float
      return !isNaN(fieldValue - parseFloat(fieldValue)) ? true : 'float';
    },
    bool: function (fieldValue) {
      //check if value is true/checked (only for checkbox and radio groups)
      return fieldValue ? true : 'bool';
    },
    date: function (fieldValue, param, regionSettings) {
      //check if date has ISO date format and is an existing date or 0
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      //if convertDateToIso returned false, then the date is obviously not valid, throw error
      if (fieldValue === false) {
        return 'date';
      }

      //if fieldValue is not empty ('') we can proceed and validate it
      if (fieldValue !== '') {
        var value = new Date(fieldValue);
        return !isNaN(value.getTime()) ? true : 'date';
      }

      //if fieldValue is empty return true
      return true;
    },
    minDate: function (fieldValue, param, regionSettings) {
      if (fieldValue === '') {
        return true;
      }

      /*
       * Bind value of param to other object:
       * If param is an object, we must deduce the value from the passed field
       * by retriving the data-val attribute or the value of the field
       */
      if (typeof param === 'object') {
        param = calculateDate(param, regionSettings.dateFormat, regionSettings.dateSeparator);
      }

      //check if date is after the min date passed (ISO format)
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      return new Date(fieldValue) >= new Date(param) ? true : 'minDate';
    },
    maxDate: function (fieldValue, param, regionSettings) {
      if (fieldValue === '') {
        return true;
      }

      /*
       * Bind value of param to other object:
       * If param is an object, we must deduce the value from the passed field
       * by retriving the data-val attribute or the value of the field
       */
      if (typeof param === 'object') {
        param = calculateDate(param, regionSettings.dateFormat, regionSettings.dateSeparator);
      }

      //check if date is before the max date passed (ISO format)
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      return new Date(fieldValue) <= new Date(param) ? true : 'maxDate';
    },
    /*time: function (fieldValue, param) {
      //convert time to ISO format
      //check if time is valid ISO time
    },
    minTime: function (fieldValue, param) {
      //check if time is after min time passed
    },
    maxTime: function (fieldValue, param) {
      //check if time is before max time passed
    },*/
    email: function (fieldValue, param) {
      //chekc if email is valid
      return /^([\w-\.]+@([\w\-]+\.)+[\w\-]{2,4})?$/.test(fieldValue) ? true : 'email';
    },
    telWithPrefix: function (fieldValue) {
      //check if phone number is valid phone number with prefix
      return /^(\+(?:[0-9] ?){6,14}[0-9])?$/.test(fieldValue) ? true : 'telWithPrefix';
    },
    telNoPrefix: function (fieldValue) {
      //check if phone number is valid phone number without prefix
      return /^((?:[0-9] ?){6,14}[0-9])?$/.test(fieldValue) ? true : 'telNoPrefix';
    },
    telPrefix: function (fieldValue) {
      //check if prefix is a valid prefix
      return /^(\+(?:[0-9] ?){1,4}[0-9])?$/.test(fieldValue) ? true : 'telPrefix';
    },
    password: function (fieldValue) {
      //check if password is secure
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,50})/.test(fieldValue) ? true : 'password';
    },
    min: function (fieldValue, param) {
      /*
       * Bind value of param to other object:
       * If param is an object, we must deduce the value from the passed field
       * by retriving the data-val attribute or the value of the field
       */
      if (typeof param === 'object') {
        param = calculateInt(param);
      }

      var value = parseFloat(fieldValue, 10);
      return value >= param ? true : value === '' ? true : 'min';
    },
    max: function (fieldValue, param) {
      /*
       * Bind value of param to other object:
       * If param is an object, we must deduce the value from the passed field
       * by retriving the data-val attribute or the value of the field
       */
      if (typeof param === 'object') {
        param = calculateInt(param);
      }

      var value = parseFloat(fieldValue, 10);
      return value <= param ? true : value === '' ? true : 'max';
    },
    minLength: function (fieldValue, param) {
      /*
       * Bind value of param to other object:
       * If param is an object, we must deduce the value from the passed field
       * by retriving the data-val attribute or the value of the field
       */
      if (typeof param === 'object') {
        param = calculateLength(param);
      }

      //match values higher than param or 0
      var valueLength = fieldValue.length;
      return valueLength >= param ? true : valueLength === 0 ? true : 'minLength';
    },
    maxLength: function (fieldValue, param) {
      /*
       * Bind value of param to other object:
       * If param is an object, we must deduce the value from the passed field
       * by retriving the data-val attribute or the value of the field
       */
      if (typeof param === 'object') {
        param = calculateLength(param);
      }

      //match values lower than param or 0
      var valueLength = fieldValue.length;
      return valueLength <= param ? true : valueLength === 0 ? true : 'maxLength';
    },
    required: function (fieldValue) {
      return fieldValue.length > 0 ? true : 'required';
    },
    tokens: function (fieldValue, param) {

      //@TODO Live collections: akzeptierte Werte automatisch aktualisieren.
      /*
       * Check if value entered corresponds to one value from a given list (token)
       * param is an array of options/possible values
       */
      var paramLength = param.length;

      for (var i = 0; i < paramLength; i = i + 1) {
        if (param[i] === fieldValue) {
          return true;
        }
      }
      return 'tokens';
    },
    matchMain: function (fieldValue, param) {
      //check if value matches other field value
      //param is the input to match
      var matchVal = param.val();

      if (matchVal !== '') {
        return fieldValue === matchVal ? true : 'match';
      }
      return true;
    },
    match: function (fieldValue, param) {
      //check if value matches other field value
      //param is the input to match
      return fieldValue === param.val() ? true : 'match';
    },
    customRegex: function (fieldValue, param) {
      return param.test(fieldValue) ? true : 'customRegex';
    },
    ajax: function (fieldValue, param) {
      $.ajax({
        method: 'POST',
        url: param,
        data: fieldValue
      }).done(function (data) {
        return data === 'true' ? true : 'ajax';
      }).fail(function () {
        //trigger ajaxError on window and pass param (url of the failed request)
        win.trigger(pluginName + '.ajaxError', param);

        return 'ajaxError';
      });
    }
  };

  //-----------------------------------------------------
  //AUTOFORMATTING
  $.fn[pluginName].autoformatFunctions = {
    /*
     * Autoformatting functions:
     * Arguments:
     * fieldValue: value of the field
     * param (not every functions needs param) -> value for autoformatting passed from author
     *
     * Output:
     * Formatted value.
     */
    trim: function (fieldValue) {
      //remove whitespaces from start and end of string
      return fieldValue.trim();
    },
    uppercase: function (fieldValue) {
      return fieldValue.toUpperCase();
    },
    lowercase: function (fieldValue) {
      return fieldValue.toLowerCase();
    },
    capitalize: function (fieldValue) {
      //capitalize each word in the string
      var valueArray = fieldValue.split(' '),
        valueArrayLength = valueArray.length,
        value = '';

      for (var i = 0; i < valueArrayLength; i = i + 1) {
        valueArray[i] = valueArray[i].slice(0, 1).toUpperCase() + valueArray[i].slice(1);
        value = value + ' ' + valueArray[i];
      }

      return value;
    },
    capitalizeFirst: function (fieldValue) {
      //capitalize first letter of string
      return fieldValue.slice(0, 1).toUpperCase() + fieldValue.slice(1);
    },
    replace: function (fieldValue, param) {
      /*
       * replace one or more chars in a string
       * param can be object or arrays of objects to allow muliple replacements within one function call
       * e.g.:
       * var param = {
       *       searchFor: /[-]/g, //regex to replace each instance of -
       *       replaceWith: '/',
       *     }
       *
       * or
       *
       * var param = [
       *      {
       *        searchFor: /[-]/g,
       *        replaceWith: '/',
       *      },
       *      {
       *        searchFor: /[:]/g,
       *        replaceWith: '/',
       *      },
       *      {
       *        searchFor: /[.]/g,
       *        replaceWith: '/',
       *      }
       *     ]
       */
      if (Array.isArray(param) && param.length > 0) {
        var paramLenght = param.length;
        for (var i = 0; i < paramLenght; i = i + 1) {
          fieldValue = fieldValue.replace(param[i].searchFor, param[i].replaceWith);
        }
      } else {
        fieldValue = fieldValue.replace(param.searchFor, param.replaceWith);
      }
      return fieldValue;
    },
    autocompleteDate: function (fieldValue, param, regionSettings) {
      if (param === '' || param === undefined) {
        param = '20'; //21st. century by default, if author does not pass a value
      }

      if (fieldValue === '') {
        return fieldValue;
      }

      var dateSeparator = regionSettings.dateSeparator,
        value = fieldValue.split(regionSettings.dateSeparator),
        day = '',
        month = '',
        year = '';

      if (value.length !== 3) {
        return fieldValue;
      }

      day = value[0];
      month = value[1];
      year = value[2];

      if (day.length === 1) {
        day = '0' + day;
      }
      if (month.length === 1) {
        month = '0' + month;
      }
      if (year.length === 2) {
        year = param + year;
      }

      return day + dateSeparator + month + dateSeparator + year;
    },
    /*insertCharAt: function () {
        //@TODO
    },
    insertCharEvery: function () {
        //@TODO
    }*/
  };

}));
