(function ($) {
  'use strict';
  var formsArray = [],
    fieldsArray = [],

    methods = {},
    countForms = 0,
    countFields = 0,
    a = {
      aHi: 'aria-hidden',
      aDes: 'aria-describedby',
      aLab: 'aria-labelledby',
      r: 'role',
      alert: 'alert',
      aEMsg: 'aria-errormessage',
      aInv: 'aria-invalid',
      aReq: 'aria-required',
      req: 'required',
      t: 'true',
      f: 'false'
    },
    formErrorMessages = {
      placeholder: 'Form submission error'
    },
    formValidMessages = {
      placeholder: 'Form was submitted'
    },
    fieldErrorMessages = {
      placeholder: 'Input is not valid'
    },
    fieldValidMessages = {
      placeholder: 'Input is valid'
    },
    regExps = {
      textString: {
        onlyLetters: /^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð]+$/,
        lettersAndSpaces: /^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð\s]*$/,
        lettersAndDashes: /^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð\-]+$/,
        lettersAndSlashes: /^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð\/]+$/,
        anyNoNumbers: /^[^0-9]*$/ // testare
      },
      numbersString: {
        onlyNumbers: /^[0-9]+$/,
        numbersAndSpaces: /^[0-9\s]+$/,
        numbersAndDashes: /^[0-9\-]+$/,
        numbersAndSlashes: /^[0-9\/]+$/,
        noLetters: /^[^a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð]*$/ // testare
      },
      email: /^([\w-\.]+@([\w\-]+\.)+[\w\-]{2,4})?$/,
      password: {
        highSecurity: /^(?=.*\d)(?=.*[!@#$%\^&*])(?=.*[a-z])(?=.*[A-Z]).{8,50}$/ //letters up and lowercase + numbers + special chars
      },
      tel: {
        withPrefix: /^\+(?:[0-9] ?){6,14}[0-9]$/, //and fax
        withoutPrefix: /^(?:[0-9] ?){6,14}[0-9]$/,
        prefix: /^\+(?:[0-9] ?){1,4}[0-9]$/
      },
      isoDate: /^\d{4}-\d{2}-\d{2}$/,
      creditCard: null // not yet supported
    };



  //PRIVATE FUNCTIONS
  //-----------------------------------------------

  //set id on element if element does not have one
  function setId(element, id, i) {
    var elementId = element.id;
    if (elementId === undefined || elementId === '' || elementId === null) {
      element.id = id + (i + 1);
    }
  }

  //find position (index) of the array
  //at wich all settings and infos about a form are stored
  //given the form id
  function getFormsArrayIndex(formId) {
    var i = 0,
      l = formsArray.length;

    for (i; i < l; i = i + 1) {
      if (formsArray[i][0] === formId) {
        return i;
      }
    }
  }

  //find position (index) of the array
  //at wich all settings and infos about a field are stored
  //given the field id
  function getFieldsArrayIndex(fieldId) {
    var i = 0,
      l = fieldsArray.length;

    for (i; i < l; i = i + 1) {
      if (fieldsArray[i][0] === fieldId) {
        return i;
      }
    }
  }



  //-----------------------------------------------
  //PUBLIC METHODS
  //-----------------------------------------------
  //-----------------------------------------------
  //INIT FORM
  //-----------------------------------------------
  methods.initForm = function (userSettings, formInstance) {
    var formSettings = $.extend(true, {}, $.fn.ariaForms.defaultSettings, userSettings),
      formInstanceId = '',
      fieldsSettings = {},
      fieldSettings = {},
      formArray = [],
      i = 0,
      l = 0;

    //set id on form element,
    //if it does not have one
    setId(formInstance, 'aria-form-', countForms);
    //save id of form into variable
    formInstanceId = formInstance.attr('id');

    //save all fields settings into object
    fieldsSettings = formSettings.fields;

    //delete formSettings.fields
    //'fields' is no more needed in this object
    //because each field is initialised separately
    //and has an own settings object
    delete formSettings.fields;

    //push form id, form instance and form settings into array
    //Id is needed to retrive the index of this form instance from the first level array formsArray
    formArray.push(formInstanceId, formInstance, formSettings, formInstance.find('.' + formSettings.formMessageWrapperClass));

    //push formArray into first level array formsArray
    formsArray.push(formArray);
    /*
    FORMS ARRAY ARCHITECTURE
    formsArray - > formArray -> [0] -> formInstanceId (id of the form element)
                             -> [1] -> formInstance (jQuery object of the form)
                             -> [2] -> formSettings (settings of the form)
                             -> [3] -> formMessagesWrapper (jQuery object of th element in wich messages should be injected)
                            
    */

    //If fields options are passed with form object,
    //initialise each field
    if (formSettings.fields !== null) {
      //initialise fields of the form
      //calling the method initFields on each field
      //i = 0
      l = fieldsSettings.length; //get lenght of array fieldsSettings (=== number of fields to initialise)
      for (i; i < l; i = i + 1) {
        methods.initFields(fieldsSettings[i], formInstance);
      }
    }

    //increment counter
    countForms = countForms + 1;
  };




  //-----------------------------------------------
  //INIT FIELD
  //-----------------------------------------------
  methods.initFields = function (userSettings, formInstance) {
    var fieldSettings = $.extend(true, {
        fieldSelector: null,
        validateOnChange: true,
        validateOnBlur: true
      }, userSettings),
      fieldInstanceId = '',
      fieldArray = [],
      fieldInstance = {},
      formInstanceId = formInstance.attr('id'),
      formInstanceIndex = getFormsArrayIndex(formInstanceId), // get index for this form
      formSettings = formsArray[formInstanceIndex][2], // settings for this field
      i = 0,
      l = 0;

    //Merge fieldSettings with formSettings
    //to get object with complete set of options/settings for this field 
    fieldSettings = $.extend(true, formSettings, fieldSettings);

    //Check if user has passed a field selector
    //if not, throw error
    if (fieldSettings.fieldSelector === null) {
      throw new Error('A field selector must be passed in order to initialise a field');
    }

    //check if field exist and belongs to form
    //if the field does not exist or does not belongs to an initialised form,
    //throw an error
    fieldInstance = $(fieldSettings.fieldSelector);
    if (fieldInstance.length != 1 | !formInstance.has(fieldSettings.fieldSelector)) {
      throw new Error('The pased selector ' + fieldSettings.fieldSelector + ' does not match any child element of an initialised ariaForm.');
    }

    //set id on field element,
    //if it does not have one
    setId(fieldInstance, 'aria-field-', countFields);
    //save id of field into variable
    fieldInstanceId = fieldInstance.attr('id');

    //push field id, field instance, field settings into array
    //also push formInstaneId into array as a reference of the form the fields belongs to.
    fieldArray.push(fieldInstanceId, fieldInstance, fieldSettings, fieldInstance.find('.' + fieldSettings.fieldMessageWrapperClass), formInstanceId, null);

    //push fieldArray into first level array fieldsArray
    fieldsArray.push(fieldArray);
    /*
    FIELDS ARRAY ARCHITECTURE
    fieldsArray - > fieldArray -> [0] -> fieldInstanceId (id of the field element)
                               -> [1] -> fieldInstance (jQuery object of the field)
                               -> [2] -> fieldSettings (settings of the field)
                               -> [3] -> fieldMessagesWrapper (jQuery object of the element inwich messages should be injected)
                               -> [4] -> formInstanceId (id of the form element the field belongs to)
                            
    */

    //increment count 
    countFields = countFields + 1;
  };


  /*
  methods.validateForm = function () {

  };

  methods.validateField = function () {

  };
  */

  $.fn.ariaForms = function (method, userSettings) {
    var formInstance = $(this),
      i = 0,
      l = 0;


    if (formInstance.length !== 1) {
      throw new Error('Method must be called on exactly one form element. Initialisation of multiple forms with one method call is not allowed.');
    }

    //call methods
    switch (method) {
      case 'initForm':
        methods.initForm(userSettings, formInstance);
        break;
      case 'initFields':
        //check if the user has passed a fields property
        //and if fields is an array
        if (userSettings.hasOwnProperty('fields') && userSettings.fields.constructor === Array) {
          //check if the fields array is not empty
          //if it has one or more entries, call method initFields for each entry
          i = 0;
          l = userSettings.fields.length;
          if (l > 0) {
            for (i; i < l; i = i + 1) {
              methods.initFields(userSettings[i], formInstance);
            }
          }
        }
        break;
    }
  };


  $.fn.ariaForms.defaultSettings = {
    //form-only options
    formMessageWrapperClass: 'form__message',
    formMessageErrorClass: 'form__message_not-valid',
    formMessageValidClass: 'form__message_valid',
    formErrorMessages: formErrorMessages,
    formValidMessages: formValidMessages,
    //statistics: false, //collect validation data to improve form usability
    //end form-only options
    fieldClass: 'field',
    labelClass: 'field__label',
    inputClass: 'field__input',
    fieldMessageWrapperClass: 'field__message',
    fieldErrorClass: 'field_not-valid',
    fieldValidClass: 'field_valid',
    labelErrorClass: 'field__label_not-valid',
    labelValidClass: 'field__label_valid',
    inputErrorClass: 'field__input_not-valid',
    inputValidClass: 'field__input_valid',
    fieldMessageErrorClass: 'field__message_not-valid',
    fieldMessageValidClass: 'field__message_valid',
    fieldErrorMessages: fieldErrorMessages,
    fieldValidMessages: fieldValidMessages,
    validateOnChange: true, //live validation, validate field while user is typing, prevent user from typing incorrect chars, prevent max and so on...
    validateOnBlur: true, //validate filed on blur
    fields: null //array with all form field's options
  };

}(jQuery));

$(document).ready(function () {
  'use strict';
  $('#demo-form').ariaForms('initForm', {
    fields: [
      {
        fieldSelector: '#int-test-required',
        fieldType: 'int',
        required: true
      },
      {
        fieldSelector: '#int-test',
        fieldType: 'int',
        required: false

      }
    ]
  });
  //$('form').ariaForms('initFields', {});
});


/*
options:

$('#my-form').ariaForm({
  errorMessages: {
  //object with error messages to override default error messages
  },
  errorMessageClass: 'message__error', // class added to error messages
  validMessages: false | {
  //object with validation confirmation messages
  },
  validMessageClass: 'message__valid', \\ class added to validation messages
  formErrorClass: false | 'form_not-valid',
  formValidClass: false | 'form_valid',
  fieldErrorClass: 'field_not-valid',
  fieldValidClass: 'field_valid',
  labelErrorClass: false | 'label_not-valid',
  labelValidClass: false | 'label_valid',
  onFormError: false | function call, //call a function if an error is encountered on form submission
  onFieldError: false | function call, //call a function if the user input is invalid on input blur
  onFieldValid: false | function call, //call a function if the user input is valid on input blur
  submit: false | function //if function is passed, sincronous form submission is blocked and the function passed is called for async form submission
  fields: [
    {
      fieldSelector: $('#name'),
      fieldType: 'text' | ... complete the list!!!!!!!!!!
      required: true | false,
      minChar: 2 | false //min number of charachters
      maxChar: 50 | false //max number of charachters
      min: 0 | false //min number
      max: 10 | false //max number
      liveValidation: true | false, //prevent user from typing not allowed charachter, or too long strings etc...
      autoFormatting: false | {
        changeCase: false | 'firstUppercase' | 'allUppercase' | 'allLowercase',
        trimWhitespaces: true | false
        replaceChars: true
      },
      errorMessages: {
        //object with field-specific error messages
      },
      errorMessageClass: 'ciao' //override
      validMessages: false | {
        //object with field-specific validation confirmation messages
      },
      validMessageClass: 'hello', //override
      fieldErrorClass: 'field_not-valid', //override default not-valid class
      fieldValidClass: 'field_valid' //override default valid class
      labelErrorClass: 'label_not-valid', //override
      labelValidClass: 'label_valid', //override
      onFieldError: false | function call, //call a function if the user input is invalid on input blur
      onFieldValid: false | function call, //call a function if the user input is valid on input blur
    }
  ]
});


 
Methods
 
//init
 
//destroy
 
//remove
 
//show field/s if condition is met
 
//hide field/s if condition is met
 
//reset form / reset field
 
//hide messages
  
//register new regex (?)

 
*/
