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
   * else if settings === false, return unchanged default settings object
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

    //SETTINGS
    self.userSettings = userSettings; //the unchanged settings object passed from user
    self.validate = self.userSettings.validate;
    //self.autoformat = self.userSettings.autoformat;
    //self.preventErrors = self.userSettings.preventerrors;

    //CLASSES AND REGION SETTINGS
    self.classes = makeSettings($.fn[pluginName].defaultClasses, self.userSettings.classes); //computet html classes used to retrive elements
    self.regionAndFormattingSettings = makeSettings($.fn[pluginName].regionAndFormattingSettings, self.userSettings.regionAndFormattingSettings); //computed region settings for this field

    //VALIDATION
    self.fieldStatus = undefined; //Describes the staus of the field: undefined -> field was never focussed and validated, true -> correct input , 'errorCode' -> incorrect input
    self.fieldValue = undefined; //The value of the field
    self.errorMsgs = makeSettings($.fn[pluginName].errorMsgs, self.userSettings.errorMsgs); //computed error messages settings for this field;
    self.successMsg = self.userSettings.successMsg ? self.userSettings.successMsg : $.fn[pluginName].successMsg; //Success message for this field

    //-----------------------------------
    //Initialise field
    self.selectElements();
    self.initMarkup();
    self.bindEventListeners();
    self.retriveFieldValue();
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
      win.trigger(pluginName + '.markupInitialised', [self]);

      //increment count by one
      count = count + 1;
    },
    bindEventListeners: function () {
      /*
       * Bind event listeners to the field.
       * Right now we just listen for blur,
       * in future other validations methods (live error prevention and autoformatting)
       * will also be supported
       */
      var self = this,
        fieldTag = self.fieldTag,
        fieldType = self.fieldType;


      //Bind blur event on field for field validation.
      self.field.on('blur.' + pluginName, function () {
        self.runValidation();
      });

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.eventListenersAdded', [self]);
    },
    unbindEventListeners: function (eventName) {
      var self = this;
      switch (eventName) {
        case 'blur':
          self.field.off('blur.' + pluginName);
          break;
        case 'input':
          self.field.off('input.' + pluginName);
          break;
        case 'change':
          self.field.off('change.' + pluginName);
          break;
        case 'keydown':
          self.field.off('keydown.' + pluginName);
          break;
      }
    },
    retriveFieldValue: function () {
      var self = this;
      /*
       * @TODO:
       * Retrive value for radios, select, datalist etc...
       */
      self.fieldValue = self.fieldType !== 'checkbox' ? self.field.val() : self.field.is(":checked");
    },
    runValidation: function () {
      /*
       * Run validation on the field:
       * Call each validation function passed from user for validation.
       * If function returns true, proceed, else throw error and exit execution.
       * If no function returns errors, then validate the field by calling self.validateFieldGroup.
       */
      var self = this;


      //loop through all validation functions
      for (var key in self.validate) {
        //retrive current field value and update self.fieldValue
        self.retriveFieldValue();

        //update field status
        self.fieldStatus = self.validation.validate[key](self.validate[key], self.fieldValue);

        //if field status is not true, throw error
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
    validation: {
      //------------------------------------------------------
      //INPUT VALIDATION
      validate: {
        letters: function (param, value) {
          //Check if value does not contain any digit (0-9)
          return /^[]|[\D]+$/.test(value) ? true : 'letters';
        },
        onlyLetters: function (param, value) {
          //Check if value contains only letters (a-z, A-Z)
          return /^[]|[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜäëïöüçÇßØøÅåÆæÞþÐð]+$/.test(value) ? true : 'onlyLetters';
        },
        digits: function (param, value) {
          //Check if value does not contain any letter (a-z, A-Z)
          return /^[]|[^a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜäëïöüçÇßØøÅåÆæÞþÐð]+$/.test(value) ? true : 'digits';
        },
        onlyDigits: function (param, value) {
          //Check if value is digit (0-9)
          return /^[]|[\d]+$/.test(value) ? true : 'onlyDigits';
        },
        int: function (param, value) {
          //check if value is number and int
          var value = parseInt(value, 10);
          return isInt(value) ? true : value === '' ? true : 'int';
        },
        float: function (param, value) {
          return !isNaN(value - parseFloat(value)) ? true : 'float';
        },
        bool: function (param, value) {
          //check if value is true/checked (only for checkbox)
        },
        date: function (param, value) {
          //check if date conforms the ISO date format and is an existing date or 0

          //if value has format XXXX-XX-XX ...
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            value = new Date(value);
            return !isNaN(value.getTime()) ? true : 'date';
          }
          //if field is empty...  
          return value.length === 0 ? true : 'date';
        },
        minDate: function (param, value) {
          //check if date is after the min date passed (ISO format)
          return new Date(value) >= new Date(param) ? true : 'minDate';
        },
        maxDate: function (param, value) {
          //check if date is before the max date passed (ISO format)
          return new Date(value) <= new Date(param) ? true : 'maxDate';
        },
        /*time: function (param, value) {
          //convert time to ISO format
          //check if time is valid ISO time
        },
        minTime: function (param, value) {
          //check if time is after min time passed 
        },
        maxTime: function (param, value) {
          //check if time is before max time passed 
        },*/
        email: function (param, value) {
          //chekc if email is valid
          return /^[]|([\w-\.]+@([\w\-]+\.)+[\w\-]{2,4})?$/.test(value) ? true : 'email';
        },
        telWithPrefix: function (param, value) {
          //check if phone number is valid phone number with prefix
          return /^[]|\+(?:[0-9] ?){6,14}[0-9]$/.test(value) ? true : 'telWithPrefix';
        },
        telNoPrefix: function (param, value) {
          //check if phone number is valid phone number without prefix
          return /^[]|(?:[0-9] ?){6,14}[0-9]$/.test(value) ? true : 'telNoPrefix';
        },
        telPrefix: function (param, value) {
          //check if prefix is a valid prefix
          return /^[]|\+(?:[0-9] ?){1,4}[0-9]$/.test(value) ? true : 'telPrefix';
        },
        password: function (param, value) {
          //check if password is secure
          return /^[]|(?=.*\d)(?=.*[!@#$%\^&*])(?=.*[a-z])(?=.*[A-Z]).{4,50}$/.test(value) ? true : 'password';
        },
        min: function (param, value) {
          var value = parseFloat(value, 10);
          return value >= param ? true : value === '' ? true : 'max';
        },
        max: function (param, value) {
          var value = parseFloat(value, 10);
          return value <= param ? true : value === '' ? true : 'max';
        },
        minLength: function (param, value) {
          //match values higher than param or 0
          var valueLength = value.length;
          return valueLength >= param ? true : valueLength === 0 ? true : 'minLength';
        },
        maxLength: function (param, value) {
          //match values lower than param or 0
          var valueLength = value.length;
          return valueLength <= param ? true : valueLength === 0 ? true : 'maxLength';
        },
        required: function (param, value) {
          return value.length > 0 ? true : 'required';
        },
        match: function (param, value) {
          //check if value matches other field value
          return value === param ? true : 'match';
        },
        ajax: function (param, value) {
          //
        },
      },
      //-----------------------------------------------------
      //AUTOFORMATTING
      autoformat: {
        trim: function (param, value) {
          //remove whitespaces from start and end of string
          return value.trim();
        },
        uppercase: function (param, value) {
          return value.toUpperCase();
        },
        lowercase: function (param, value) {
          return value.toLowerCase();
        },
        capitalize: function (param, value) {
          //capitalize each word in the string
          var valueArray = value.split(' '),
            valueArrayLength = valueArray.length,
            value = '';

          for (var i = 0; i < valueArrayLength; i = i + 1) {
            valueArray[i] = valueArray[i].slice(0, 1).toUpperCase() + valueArray[i].slice(1);
            value = value + ' ' + valueArray[i];
          }

          return value;
        },
        capitalizeFirst: function (param, value) {
          //capitalize first letter of string
          return (value.slice(0, 1).toUpperCase() + value.slice(1));
        },
        replace: function (param, value) {
          //param must be nested arrays or nested objects
          //to allow muliple replacements within one function call
        },
        autocompleteDate: function (param, value) {
          //autocomplete date: insert leading 0 and first tow year digits if user forgets it (e.g: transform 8/8/17 to 08/08/2017)
        },
        insertCharAt: function (param, value) {
          //insert a char at a specified position
        },
        insertCharsEvery: function (param, value) {
          //insert a char every x chars.
        }
      },
      //----------------------------------------------------------
      //PREVENT ERRORS
      prevent: {
        max: function (param, value) {
          //prevent number to be greater than max
        },
        min: function (param, value) {
          //prevent number to be lower than min
        },
        maxLength: function (param, value) {
          //prevent lenght of strig to exceed maximum string length accepted
        },
        notAllowedChars: function (param, value) {
          //prevent not allowed charachter to be typed in the field
        }
      }
    },
    //-------------------------------------------------------------
    //Method caller
    //-------------------------------------------------------------
    methodCaller: function (methodName, methodArg) {
      var self = this;

      switch (methodName) {
        case 'runValidation':
          self.runValidation();
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



  $.fn[pluginName].regionAndFormattingSettings = {
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


  $.fn[pluginName].errorMsgs = {
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
    required: 'This field is required to sucessfully complete the form'
  };

  $.fn[pluginName].successMsg = 'Perfect! You told us exactly what we wanted to know!';

}(jQuery, window, document));


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
    validate: {
      //required: true,
      date: true,
      minDate: '2017-01-01',
      maxDate: '2017-12-31'
    }
  });
});
