(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['b'], factory);
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

    return namespacedEvents;
  }


  /*
   * Convert date from US format (MM/DD/YYYY) or from EU format(DD/MM/YYYY) to ISO format 
   */
  function convertDateToIso(value, format, separator) {
    value = value.split(separator);

    if (format === 'eu') {
      value = value[2] + '-' + value[1] + '-' + value[0];
    } else if (format === 'us') {
      value = value[2] + '-' + value[0] + '-' + value[1];
    }
    return value;
  }




  //-----------------------------------------
  // The actual plugin constructor
  function AriaValidate(element, userSettings) {
    var self = this;

    self.element = $(element);

    //DEFAULT SETTINGS
    self.userSettings = userSettings; //the unchanged settings object passed from user
    self.validate = self.userSettings.validate;
    self.autoformat = self.userSettings.autoformat;
    //self.preventErrors = self.userSettings.preventErrors;

    //CLASSES
    self.classes = makeSettings($.fn[pluginName].defaultClasses, self.userSettings.classes); //computet html classes used to retrive elements

    //EVENTS
    self.events = makeSettings($.fn[pluginName].defaultEvents, self.userSettings.events); //computed events to bind

    //REGION SETTINGS
    self.regionSettings = makeSettings($.fn[pluginName].defaultRegionSettings, self.userSettings.regionSettings);

    //VALIDATION
    self.fieldStatus = undefined; //Describes the staus of the field: undefined -> field was never focussed and validated, true -> correct input , 'errorCode' -> incorrect input
    self.fieldValue = undefined; //The value of the field
    self.errorMsgs = makeSettings($.fn[pluginName].defaultErrorMsgs, self.userSettings.errorMsgs); //computed error messages settings for this field;
    self.successMsg = self.userSettings.successMsg ? self.userSettings.successMsg : $.fn[pluginName].defaultSuccessMsg; //Success message for this field



    //-----------------------------------
    //Initialise field
    self.selectElements();
    self.initMarkup();
    self.bindEventListeners();
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

      self.field = element.find('.' + classes.fieldClass);
      self.label = element.find('.' + classes.labelClass);
      self.alertbox = element.find('.' + classes.alertboxClass).length === 1 ? element.find('.' + classes.alertboxClass) : false;
      self.successbox = element.find('.' + classes.successboxClass).length === 1 ? element.find('.' + classes.successboxClass) : false;
      self.fieldTag = self.field.prop('tagName');
      self.fieldType = self.fieldTag === 'INPUT' ? self.field.attr('type') : false;
    },
    initMarkup: function () {
      /*
       * Check the markup.
       * We have to check if:
       * 1 - input has an id (otherwise set a scripting-generated id)
       * 2 - a label is present and the id of the input is referenced in the 'for' attribute of the label (otherwise set for attribute)
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

      //add accessibility attributes to fieldbox, if the element exists
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

      //add accessibility attributes to successbox, if the element exists
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
      win.trigger(pluginName + '.markupInitialised', [self]);

      //increment count by one
      count = count + 1;
    },
    bindEventListeners: function () {
      /*
       * Bind event listeners to the field.
       * and perform autofromatting and validation
       */
      var self = this;

      //Bind event on field for error prevention.
      /*
      self.field.on(self.events.preventErrorsOn, function () {
        self.performPreventErrors();
      });
      */

      //Bind event on field for autoformatting.
      self.field.on(self.events.autoformatOn, function () {
        self.performAutoformat();
      });

      //Bind event on field for field validation.
      self.field.on(self.events.validateOn, function () {
        self.performValidation();
      });


      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.eventListenersAdded', [self]);
    },
    unbindEventListeners: function (events) {
      var self = this


      self.field.off(namespaceEventString(events, pluginName));

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.eventListenersRemoved', [self]);
    },
    updateFieldValue: function () {
      var self = this;

      self.fieldValue = self.field.val() || '';

      /*
       * Save the user input in attribute data-value.
       * Maybe useful for some external plugin
       */
      self.field.attr('data-value', self.fieldValue);
    },
    performAutoformat: function () {
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


      for (var key in self.autoformat) {
        self.fieldValue = $.fn[pluginName].autoformatFunctions[key](self.fieldValue, self.regionSettings, self.autoformat[key]);
      }

      //update the field value
      self.field.val(self.fieldValue);
    },
    performValidation: function () {
      /*
       * Perform validation on the field:
       * Call each validation function passed from user for validation.
       * If function returns true, proceed, else throw error and exit execution.
       * If no function returns errors, then validate the field by calling self.validateFieldGroup.
       */
      var self = this;

      //retrive current field value and update self.fieldValue
      self.updateFieldValue();


      //loop through all validation functions
      for (var key in self.validate) {

        //update field status
        self.fieldStatus = $.fn[pluginName].validateFunctions[key](self.fieldValue, self.regionSettings, self.validate[key]);
        /*
         * If field status is not true, invalidate the field group
         * and show the error message relative to the error encountered while validationg
         */
        if (self.fieldStatus !== true) {
          self.invalidateFieldGroup();
          return;
        }
      }
      //no error occured, validate field group
      self.validateFieldGroup();
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

      //append success message to succesbox and show message
      if (self.successbox && self.successMsg !== false) {
        self.successbox
          .html(self.successMsg)
          .attr(a.aHi, a.f)
          .addClass(self.classes.successboxVisibleClass);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.isValid', [self]);
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
        case 'validate':
          self.performValidation();
          break;
        case 'autoformat':
          self.performAutoformat();
          break;
        case 'invalidateField':
          self.invalidateFieldGroup();
          break;
        case 'validateField':
          self.validateFieldGroup();
          break;
        case 'unbindEventListeners':
          self.unbindEventListeners(methodArg);
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

  $.fn[pluginName].defaultEvents = {
    //preventErrorsOn: 'input',
    autoformatOn: 'blur',
    validateOn: 'blur'
  };

  $.fn[pluginName].defaultRegionSettings = {
    dateFormat: 'eu',
    dateSeparator: '/',
    //timeSeparator: ':',
    decimalSeparator: ',',
    thousandSeparator: '.'
  }

  $.fn[pluginName].defaultErrorMsgs = {
    letters: 'Digits are not allowed in this field',
    onlyLetters: 'Only letters are accepted',
    digits: 'Letters are not allowed in this field',
    onlyDigits: 'Only digits are accepted',
    int: 'Enter a whole number (e.g. 12)',
    float: 'Enter a number (e.g. 12.13 or 16)',
    bool: 'You habe to check this checkbox',
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
    match: 'No match',
    customRegex: 'Regex match returned "false"',
    ajax: 'server says no!'
  };

  $.fn[pluginName].defaultSuccessMsg = 'Perfect! You told us exactly what we wanted to know!';

  /*$.fn[pluginName].defaultErrorPreventionMsgs = {
    //
  }*/




  //------------------------------------------------------
  //VALIDATION
  $.fn[pluginName].validateFunctions = {
    /*
     * Validation functions:
     * Arguments: 
     * fieldValue -> value of the field
     * param (not every functions needs param) -> value for validation passed from author 
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
      return /^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜäëïöüçÇßØøÅåÆæÞþÐð]*$/.test(fieldValue) ? true : 'onlyLetters';
    },
    digits: function (fieldValue) {
      //Check if value does not contain any letter (a-z, A-Z)
      return /^[^a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜäëïöüçÇßØøÅåÆæÞþÐð]*$/.test(fieldValue) ? true : 'digits';
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
    float: function (fieldValue) {
      return !isNaN(fieldValue - parseFloat(fieldValue)) ? true : 'float';
    },
    /*
    bool: function (fieldValue) {
      //check if value is true/checked (only for checkbox)
    },*/
    date: function (fieldValue, regionSettings) {
      //check if date has ISO date format and is an existing date or 0
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      if (/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
        var value = new Date(fieldValue);
        return !isNaN(value.getTime()) ? true : 'date';
      }
      //if field is empty...  
      return fieldValue === '' ? true : 'date';
    },
    minDate: function (fieldValue, regionSettings, param) {
      //check if date is after the min date passed (ISO format)
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      if (fieldValue === '') {
        return true;
      }
      return new Date(fieldValue) >= new Date(param) ? true : 'minDate';
    },
    maxDate: function (fieldValue, regionSettings, param) {
      //check if date is before the max date passed (ISO format)
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      if (fieldValue === '') {
        return true;
      }
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
      return /^((?=.*\d)(?=.*[!@#$%\^&*])(?=.*[a-z])(?=.*[A-Z]).{4,50})?$/.test(fieldValue) ? true : 'password';
    },
    min: function (fieldValue, param) {
      var value = parseFloat(fieldValue, 10);
      return value >= param ? true : value === '' ? true : 'min';
    },
    max: function (fieldValue, param) {
      var value = parseFloat(fieldValue, 10);
      return value <= param ? true : value === '' ? true : 'max';
    },
    minLength: function (fieldValue, param) {
      //match values higher than param or 0
      var valueLength = fieldValue.length;
      return valueLength >= param ? true : valueLength === 0 ? true : 'minLength';
    },
    maxLength: function (fieldValue, param) {
      //match values lower than param or 0
      var valueLength = fieldValue.length;
      return valueLength <= param ? true : valueLength === 0 ? true : 'maxLength';
    },
    required: function (fieldValue) {
      return fieldValue.length > 0 ? true : 'required';
    },
    match: function (fieldValue, param) {
      //check if value matches other field value
      return fieldValue === param.val() ? true : 'match';
    },
    customRegex: function (fieldValue, param) {
      return param.test(fieldValue) ? true : 'customRegex';
    },
    ajax: function (fieldValue, param) {
      //
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
       *       searchFor: '-',
       *       replaceWith: '/',
       *     }
       * 
       * or 
       * 
       * var param = [
       *      {
       *        searchFor: '-',
       *        replaceWith: '/',
       *      },
       *      {
       *        searchFor: '.',
       *        replaceWith: '/',
       *      },
       *      {
       *        searchFor: ' ',
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
    insertCharAt: function (fieldValue, param) {
      /*
       * insert a char at a specified position (useful for separating phone prefix from phone number)
       * Param must be an object with following two prop:
       * var param = {
       *       index: 4, //the index of where to split the string
       *       char: '-' //the char you to insert in the string
       *     }
       */
      if (fieldValue.length === 0) {
        return;
      }

      var index = param.index,
        char = param.char,
        firstPart = fieldValue.substring(0, index),
        secondPart = fieldValue.substring(index);

      return (firstPart + '' + char + '' + secondPart);

    },
    insertCharEvery: function (fieldValue, param) {
      /*
       * insert a char every x chars. (useful for formatting creadit cards numbers or other codes)
       * Param must be an object with following two props:
       * var param = {
       *       delta: 4, //the length of each chunk
       *       char: '-' //the char you to insert between every chunk
       *     }
       */
      if (fieldValue.length === 0) {
        return;
      }

      var delta = param.delta,
        char = param.char,
        chunks = fieldValue.match(/.{1,3}/g),
        chunksLength = chunks.length,
        value = '';

      for (var i = 0; i < chunksLength; i = i + 1) {
        if (i === 0) {
          value = chunks[i];
        } else {
          value = value + '' + char + '' + chunks[i];
        }
      }
      return value;
    }
  };


  //----------------------------------------------------------
  //ERRORS PREVENTION
  /* For future versions of plugin
  $.fn[pluginName].preventErrorsFunctions = {
      max: function (fieldValue, param) {
          //prevent number to be greater than max
      },
      min: function (fieldValue, param) {
          //prevent number to be lower than min
      },
      maxLength: function (fieldValue, param) {
          //prevent lenght of strig to exceed maximum string length accepted
      },
      notAllowedChars: function (fieldValue, param) {
          //prevent not allowed charachter to be typed in the field
      }
  };
  */

}(jQuery, window)));


$(window).ready(function () {

  $('#number-test-1').ariaValidate({
    classes: {
      fieldClass: 'input-group__input',
      labelClass: 'input-group__label',
      alertboxClass: 'input-group__alertbox',
      successboxClass: 'input-group__successbox',
      fieldGroupValidClass: 'field-group_valid',
      fieldGroupErrorClass: 'field-group_error'
    },
    events: {
      //preventErrorsOn: 'input',
      autoformatOn: 'input',
      validateOn: 'blur'
    },
    preventErrors: {
      //configuration
    },
    autoformat: {
      uppercase: true
    },
    validate: {
      required: true,
      date: true
        //customRegex: /^[a-z]*$/,
        //minDate: '2017-10-05',
        //maxDate: '2017-12-05'
    }
  });
});
