(function ($) {
  'use strict';
  var methods = {};


  $.fn.ariaForms = function (userSettings) {
    console.log('forms');
  };

}(jQuery));

$(document).ready(function () {
  'use strict';
  $('body').ariaForms();

  console.log('ci');

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
