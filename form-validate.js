/*!
 * modernizr v3.3.1
 * Build https://modernizr.com/download?-datalistelem-inputtypes-dontmin
 *
 * Copyright (c)
 *  Faruk Ates
 *  Paul Irish
 *  Alex Sexton
 *  Ryan Seddon
 *  Patrick Kettner
 *  Stu Cox
 *  Richard Herrera

 * MIT License
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in the
 * current UA and makes the results available to you in two ways: as properties on
 * a global `Modernizr` object, and as classes on the `<html>` element. This
 * information allows you to progressively enhance your pages with a granular level
 * of control over the experience.
 */

;
(function (window, document, undefined) {
  var tests = [];


  /**
   *
   * ModernizrProto is the constructor for Modernizr
   *
   * @class
   * @access public
   */

  var ModernizrProto = {
    // The current version, dummy
    _version: '3.3.1',

    // Any settings that don't work as separate modules
    // can go in here as configuration.
    _config: {
      'classPrefix': '',
      'enableClasses': true,
      'enableJSClass': true,
      'usePrefixes': true
    },

    // Queue of tests
    _q: [],

    // Stub these for people who are listening
    on: function (test, cb) {
      // I don't really think people should do this, but we can
      // safe guard it a bit.
      // -- NOTE:: this gets WAY overridden in src/addTest for actual async tests.
      // This is in case people listen to synchronous tests. I would leave it out,
      // but the code to *disallow* sync tests in the real version of this
      // function is actually larger than this.
      var self = this;
      setTimeout(function () {
        cb(self[test]);
      }, 0);
    },

    addTest: function (name, fn, options) {
      tests.push({
        name: name,
        fn: fn,
        options: options
      });
    },

    addAsyncTest: function (fn) {
      tests.push({
        name: null,
        fn: fn
      });
    }
  };



  // Fake some of Object.create so we can force non test results to be non "own" properties.
  var Modernizr = function () {};
  Modernizr.prototype = ModernizrProto;

  // Leak modernizr globally when you `require` it rather than force it here.
  // Overwrite name so constructor name is nicer :D
  Modernizr = new Modernizr();



  var classes = [];


  /**
   * is returns a boolean if the typeof an obj is exactly type.
   *
   * @access private
   * @function is
   * @param {*} obj - A thing we want to check the type of
   * @param {string} type - A string to compare the typeof against
   * @returns {boolean}
   */

  function is(obj, type) {
    return typeof obj === type;
  };

  /**
   * Run through all tests and detect their support in the current UA.
   *
   * @access private
   */

  function testRunner() {
    var featureNames;
    var feature;
    var aliasIdx;
    var result;
    var nameIdx;
    var featureName;
    var featureNameSplit;

    for (var featureIdx in tests) {
      if (tests.hasOwnProperty(featureIdx)) {
        featureNames = [];
        feature = tests[featureIdx];
        // run the test, throw the return value into the Modernizr,
        // then based on that boolean, define an appropriate className
        // and push it into an array of classes we'll join later.
        //
        // If there is no name, it's an 'async' test that is run,
        // but not directly added to the object. That should
        // be done with a post-run addTest call.
        if (feature.name) {
          featureNames.push(feature.name.toLowerCase());

          if (feature.options && feature.options.aliases && feature.options.aliases.length) {
            // Add all the aliases into the names list
            for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
              featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
            }
          }
        }

        // Run the test, or use the raw value if it's not a function
        result = is(feature.fn, 'function') ? feature.fn() : feature.fn;


        // Set each of the names on the Modernizr object
        for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
          featureName = featureNames[nameIdx];
          // Support dot properties as sub tests. We don't do checking to make sure
          // that the implied parent tests have been added. You must call them in
          // order (either in the test, or make the parent test a dependency).
          //
          // Cap it to TWO to make the logic simple and because who needs that kind of subtesting
          // hashtag famous last words
          featureNameSplit = featureName.split('.');

          if (featureNameSplit.length === 1) {
            Modernizr[featureNameSplit[0]] = result;
          } else {
            // cast to a Boolean, if not one already
            /* jshint -W053 */
            if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
              Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
            }

            Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
          }

          classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
        }
      }
    }
  };

  /**
   * docElement is a convenience wrapper to grab the root element of the document
   *
   * @access private
   * @returns {HTMLElement|SVGElement} The root element of the document
   */

  var docElement = document.documentElement;


  /**
   * A convenience helper to check if the document we are running in is an SVG document
   *
   * @access private
   * @returns {boolean}
   */

  var isSVG = docElement.nodeName.toLowerCase() === 'svg';


  /**
   * createElement is a convenience wrapper around document.createElement. Since we
   * use createElement all over the place, this allows for (slightly) smaller code
   * as well as abstracting away issues with creating elements in contexts other than
   * HTML documents (e.g. SVG documents).
   *
   * @access private
   * @function createElement
   * @returns {HTMLElement|SVGElement} An HTML or SVG element
   */

  function createElement() {
    if (typeof document.createElement !== 'function') {
      // This is the case in IE7, where the type of createElement is "object".
      // For this reason, we cannot call apply() as Object is not a Function.
      return document.createElement(arguments[0]);
    } else if (isSVG) {
      return document.createElementNS.call(document, 'http://www.w3.org/2000/svg', arguments[0]);
    } else {
      return document.createElement.apply(document, arguments);
    }
  }

  ;

  /**
   * since we have a fairly large number of input tests that don't mutate the input
   * we create a single element that can be shared with all of those tests for a
   * minor perf boost
   *
   * @access private
   * @returns {HTMLInputElement}
   */
  var inputElem = createElement('input');

  /*!
  {
    "name": "Form input types",
    "property": "inputtypes",
    "caniuse": "forms",
    "tags": ["forms"],
    "authors": ["Mike Taylor"],
    "polyfills": [
      "jquerytools",
      "webshims",
      "h5f",
      "webforms2",
      "nwxforms",
      "fdslider",
      "html5slider",
      "galleryhtml5forms",
      "jscolor",
      "html5formshim",
      "selectedoptionsjs",
      "formvalidationjs"
    ]
  }
  !*/
  /* DOC
  Detects support for HTML5 form input types and exposes Boolean subproperties with the results:

  ```javascript
  Modernizr.inputtypes.color
  Modernizr.inputtypes.date
  Modernizr.inputtypes.datetime
  Modernizr.inputtypes['datetime-local']
  Modernizr.inputtypes.email
  Modernizr.inputtypes.month
  Modernizr.inputtypes.number
  Modernizr.inputtypes.range
  Modernizr.inputtypes.search
  Modernizr.inputtypes.tel
  Modernizr.inputtypes.time
  Modernizr.inputtypes.url
  Modernizr.inputtypes.week
  ```
  */

  // Run through HTML5's new input types to see if the UA understands any.
  //   This is put behind the tests runloop because it doesn't return a
  //   true/false like all the other tests; instead, it returns an object
  //   containing each input type with its corresponding true/false value

  // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
  var inputtypes = 'search tel url email datetime date month week time datetime-local number range color'.split(' ');
  var inputs = {};

  Modernizr.inputtypes = (function (props) {
    var len = props.length;
    var smile = '1)';
    var inputElemType;
    var defaultView;
    var bool;

    for (var i = 0; i < len; i++) {

      inputElem.setAttribute('type', inputElemType = props[i]);
      bool = inputElem.type !== 'text' && 'style' in inputElem;

      // We first check to see if the type we give it sticks..
      // If the type does, we feed it a textual value, which shouldn't be valid.
      // If the value doesn't stick, we know there's input sanitization which infers a custom UI
      if (bool) {

        inputElem.value = smile;
        inputElem.style.cssText = 'position:absolute;visibility:hidden;';

        if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {

          docElement.appendChild(inputElem);
          defaultView = document.defaultView;

          // Safari 2-4 allows the smiley as a value, despite making a slider
          bool = defaultView.getComputedStyle &&
            defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
            // Mobile android web browser has false positive, so must
            // check the height to see if the widget is actually there.
            (inputElem.offsetHeight !== 0);

          docElement.removeChild(inputElem);

        } else if (/^(search|tel)$/.test(inputElemType)) {
          // Spec doesn't define any special parsing or detectable UI
          //   behaviors so we pass these through as true

          // Interestingly, opera fails the earlier test, so it doesn't
          //  even make it here.

        } else if (/^(url|email)$/.test(inputElemType)) {
          // Real url and email support comes with prebaked validation.
          bool = inputElem.checkValidity && inputElem.checkValidity() === false;

        } else {
          // If the upgraded input compontent rejects the :) text, we got a winner
          bool = inputElem.value != smile;
        }
      }

      inputs[props[i]] = !!bool;
    }
    return inputs;
  })(inputtypes);

  /*!
  {
    "name": "Input attributes",
    "property": "input",
    "tags": ["forms"],
    "authors": ["Mike Taylor"],
    "notes": [{
      "name": "WHATWG spec",
      "href": "https://html.spec.whatwg.org/multipage/forms.html#input-type-attr-summary"
    }],
    "knownBugs": ["Some blackberry devices report false positive for input.multiple"]
  }
  !*/
  /* DOC
  Detects support for HTML5 `<input>` element attributes and exposes Boolean subproperties with the results:

  ```javascript
  Modernizr.input.autocomplete
  Modernizr.input.autofocus
  Modernizr.input.list
  Modernizr.input.max
  Modernizr.input.min
  Modernizr.input.multiple
  Modernizr.input.pattern
  Modernizr.input.placeholder
  Modernizr.input.required
  Modernizr.input.step
  ```
  */

  // Run through HTML5's new input attributes to see if the UA understands any.
  // Mike Taylr has created a comprehensive resource for testing these attributes
  //   when applied to all input types:
  //   miketaylr.com/code/input-type-attr.html

  // Only input placeholder is tested while textarea's placeholder is not.
  // Currently Safari 4 and Opera 11 have support only for the input placeholder
  // Both tests are available in feature-detects/forms-placeholder.js

  var inputattrs = 'autocomplete autofocus list placeholder max min multiple pattern required step'.split(' ');
  var attrs = {};

  Modernizr.input = (function (props) {
    for (var i = 0, len = props.length; i < len; i++) {
      attrs[props[i]] = !!(props[i] in inputElem);
    }
    if (attrs.list) {
      // safari false positive's on datalist: webk.it/74252
      // see also github.com/Modernizr/Modernizr/issues/146
      attrs.list = !!(createElement('datalist') && window.HTMLDataListElement);
    }
    return attrs;
  })(inputattrs);

  /*!
  {
    "name": "datalist Element",
    "caniuse": "datalist",
    "property": "datalistelem",
    "tags": ["elem"],
    "builderAliases": ["elem_datalist"],
    "warnings": ["This test is a dupe of Modernizr.input.list. Only around for legacy reasons."],
    "notes": [{
      "name": "CSS Tricks Article",
      "href": "https://css-tricks.com/15346-relevant-dropdowns-polyfill-for-datalist/"
    },{
      "name": "Mike Taylor Code",
      "href": "https://miketaylr.com/code/datalist.html"
    }]
  }
  !*/

  // lol. we already have a test for datalist built in! silly you.
  // Leaving it around in case anyone's using it

  Modernizr.addTest('datalistelem', Modernizr.input.list);


  // Run each test
  testRunner();

  delete ModernizrProto.addTest;
  delete ModernizrProto.addAsyncTest;

  // Run the things that are supposed to run after the tests
  for (var i = 0; i < Modernizr._q.length; i++) {
    Modernizr._q[i]();
  }

  // Leak Modernizr namespace
  window.Modernizr = Modernizr;


  ;

})(window, document);


//Modernizr detects
$(document).ready(function () {
  var date = $('input[type=date]');

  //change date field with text field
  if (!Modernizr.inputtypes.date) {
    date.attr('type', 'text');
  }
});


//VALIDATION
$(document).ready(function () {
  /*maxerr: 50, vars: true, regexp: false, sloppy: false */
  'use strict';
  var id,
    validateThis,
    a,
    b,
    c,
    d,
    e,
    g,
    x,
    y,
    type,
    customRegex,
    max,
    min,
    th,
    val,
    //variables for data types attributes
    dT = 'data-type',
    dAccept = 'data-accept',
    dMin = 'data-min',
    dMax = 'data-max',
    dC = 'data-case',
    //data types values
    str = $('[' + dT + ' = string]'),
    nr = $('[' + dT + ' = number]'),
    txt = $('[' + dT + ' = text]'),
    email = $('[' + dT + ' = email]'),
    passwd = $('[' + dT + ' = password]'),
    dCh = $('[' + dT + ' = check]'),
    int = $('[' + dT + ' = int]'),
    date = $('[' + dT + ' = date]'),
    ddVal = 'data-date-value', // attribute for date input polyfill
    time = $('[' + dT + ' = time]'),
    year = $('[' + dT + ' = year]'),
    month = $('[' + dT + ' = month]'),
    day = $('[' + dT + ' = day]'),
    wDay = $('[' + dT + ' = weekday]'),
    telFax = $('[' + dT + ' = tel-fax]'),
    telFaxNoPref = $('[' + dT + ' = tel-fax-no-pref]'),
    telFaxPref = $('[' + dT + ' = tel-fax-pref]'),
    //multiple fields selctors
    maxSel = $('[data-type=string][data-max], [data-type=password][data-max], [data-type=text][data-max], [data-type=zip-code][data-max]'), // selector for all fields could have data-max set and need preventing input of too long strings 
    //push selector
    push = $('[data-push]'),
    dCSel = $('[' + dC + ']'),
    //classes
    erW = $('.cs-error-wrapper'),
    er = $('.cs-error'),
    v = $('.cs-validate'),
    vF = $('.cs-validate-form'),
    //submit buttons selector
    submitBtn = $('input[type="submit"], button[type="submit"]'),
    //WAI ARIA ATTRIBUTES
    ai = 'aria-invalid',
    ah = 'aria-hidden',
    ae = 'aria-errormessage',
    t = 'true',
    f = 'false',
    //OTHER ATTRIBUTES
    ds = 'disabled',
    //AUDIO FILE
    errorSound = new Audio('error.wav');


  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/



  //ACCESSIBILITY:
  //inject aria attributes in the form(s) fields.
  v.attr(ai, f);
  v.each(function () {
    th = $(this);
    a = th.attr('id');
    b = $('.cs-error-wrapper[data-for=' + a + ']').attr('id');
    th.attr(ae, b);
  });
  erW.attr('role', 'alert').attr('aria-live', 'assertive').find('.cs-error').attr(ah, t).hide();

  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/



  //INPUT STATE and ATTRIBUTE FUNCTIONS + VALIDATION AND ERROR HANDLING FUNCTIONS

  //status checker
  //1 - get id of input field to validate
  //2 - check if field has validation class '.cs-validate'
  //if field does not have cs-validate class, will not be validated
  function statusChecker(th) {
    //get id
    if (th.is('[id]')) {
      var id = th.attr('id');
      //check if input field has class cs-validate
      if (th.is('.cs-validate')) {
        return true;
      }
    } else {
      //if no id is set, throw error in console
      //!!!!!!!!!!!!!!!!!!!!!For debugging only
      console.log('some field is missing attribute ID!');
      //
    }
  }

  //attribute checker
  //check if field specific data-attributes are set or not and if they are empty
  function attrChecker(th, attr) {
    if (th.is('[' + attr + ']')) {
      var a = th.attr(attr);
      if (a === '') {
        //if data-* attribute has empty value throw error in console
        //!!!!!!!!!!!!!!!!!!!!!For debugging only
        console.log('remove data- attribute, or set a valid value');
        //
        return false;
      } else {
        return a;
      }
    } else {
      return false;
    }
  }

  function playErrorSound(code) {
    if (code !== 100) {
      errorSound.play();
    }
  }

  //ERROR HANDLER
  function errorHandler(th, code) {
    var id = th.attr('id'),
      em = th.attr(ae);
    //reset error messages
    $('#' + em).find('.cs-error').hide().attr(ah, t);
    if (code !== false && code !== true) {
      //show error message
      $('.cs-error[data-for="' + id + '"][data-error="' + code + '"]').show().attr(ah, f);
      //set aria-invalid to true
      th.attr(ai, t);
      //play error sound
      playErrorSound(code);
    } else if (code === true) {
      //set aria-invalid to false
      th.attr(ai, f);
    }
  }


  //validation handler
  //handle validation for required and not required fields
  //1- check if field value is != 0
  //2- if field value is != 0: input can be validated
  //3- if field value === 0: chek if field is required
  function validationHandler(th, value) {
    //check if field is a required field
    if (value !== '') {
      //field is not empty.
      //User input should be validated
      return true;
    } else {
      //the field is empty:
      //check if the field is marked as required
      if (th.is('[required]')) {
        //the field is required:
        //stop validation process. call errorHandler
        //error code 100: required field missing input
        errorHandler(th, 100);
        return false;
      } else {
        //if field is empty but not required return false, because the field does not need any validation
        return false;
      }
    }
  }


  //HIDE ERRORS
  function hideErrors(th) {
    var id = th.attr('id'),
      em = th.attr(ae);
    //reset error messages
    $('#' + em).find('.cs-error').hide().attr(ah, t);
  }


  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/



  //UTILITIES FUNCTIONS

  //check min and max lenght
  function minMax(value, min, max) {
    min = parseInt(min, 10);
    max = parseInt(max, 10);
    //check for min
    if (min !== '') {
      if (value.length < min) {
        return 1; //string is too short
      }
    }
    //check for max
    if (max !== '') {
      if (value.length > max) {
        return 2; //string is too long
      }
    }
    return true;
  }

  //check min and max number 
  function minMaxNumber(value, min, max) {
    min = parseInt(min, 10);
    max = parseInt(max, 10);
    //check for min
    if (min !== '') {
      if (value < min) {
        return 1; //string is too short
      }
    }
    //check for max
    if (max !== '') {
      if (value > max) {
        return 2; //string is too long
      }
    }
    return true;
  }

  //check if is integer
  function isInt(n) {
    if (typeof n === 'number' && (n % 1) === 0) {
      return true;
    } else {
      return false;
    }
  }

  //prevent user from typing too long strings in input with data-max attribute set
  function stopTyping(e, th, max) {
    max = parseInt(max, 10);
    if (e.which < 0x20) {
      // e.which < 0x20, then it's not a printable character
      // e.which === 0 - Not a character
      return true; // Do nothing
    }
    if (th.val().length === max) {
      e.preventDefault();
      return 3; //max string lenght was reached
    }
    return false;
  }

  //check if user has pressed a number, an uppercase letter, a lowercase letter, or other special carachters
  function checkKeyCodeRange(e) {
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      return 0; // Number
    } else if (e.keyCode >= 65 && e.keyCode <= 90) {
      return 1; // Alphabet upper case
    } else if (e.keyCode >= 97 && e.keyCode <= 122) {
      return 2; // Alphabet lower case
    } else if (e.keyCode === 46) {
      return 3; // Dot
    } else if (e.keyCode === 44) {
      return 4; // comma
    } else if (e.keyCode === 47) {
      return 5; // slash (/)
    } else if (e.keyCode === 92) {
      return 6; // backslash (\)
    } else if (e.keyCode === 45) {
      return 7; // dash (-)
    } else if (e.keyCode === 32) {
      return 8; // whitespace ( )
    } else {
      return 9; // other keys...(?)
    }
  }

  //convert input to uppercase
  function toUpperCase(th) {
    var v = th.val().toUpperCase();
    th.val(v);
    return false;
  }

  //convert input to lowercase
  function toLowerCase(th) {
    var v = th.val().toLowerCase();
    th.val(v);
    return false;
  }

  //convert first letter to uppercase, all other to lowercase
  function toUpperCaseFirst(th) {
    var v = th.val().toLowerCase(),
      f = v.slice(0, 1).toUpperCase(),
      s = v.slice(1);
    th.val(f + s);
    return false;
  }

  //check for select tag and range type. Find out if input is select or range
  //(if input is select or type='range', no validation on keypress is needed)
  function checkSelectAndRange(th) {
    if (th.is('select, input[type="range"]')) {
      return true;
    }
  }

  //check date format (YYY-MM-DD)
  function checkDate(value) {
    var re = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    if (!re.test(value)) {
      return false;
    }
    value = new Date(value);
    if (isNaN(value.getTime())) {
      return false
    }
    return true;
  }


  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/



  //VALIDATION FUNCTIONS


  //general strings
  function vString(th, value, accept, min, max) {
    var re,
      mm;
    if (accept === "none" || accept === false) {
      //try to automatically reformat user input (before validation)
      value = value.trim().replace(/\s/g, '').replace(/-/g, '').replace(/\\/g, '').replace(/\//g, '');
      //set regex for validation
      re = new RegExp(/^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð]+$/);
    } else {
      if (accept === "spaces") {
        re = new RegExp(/^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð\s]*$/);
        //try to automatically reformat user input (before validation)
        value = value.trim().replace(/-/g, ' ').replace(/\\/g, ' ').replace(/\//g, ' ');
      } else if (accept === "dashes") {
        re = new RegExp(/^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð\-]+$/);
        //try to automatically reformat user input (before validation)
        value = value.trim().replace(/\s/g, '-').replace(/\\/g, '-').replace(/\//g, '-');
      } else if (accept === "slashes") {
        re = new RegExp(/^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð\/]+$/);
        //try to automatically reformat user input (before validation)
        value = value.trim().replace(/\s/g, '/').replace(/\\/g, '/').replace(/-/g, '/');
      } else if (accept === "all") {
        re = new RegExp(/^[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸçÇŒœßØøÅåÆæÞþÐð\.\:\,\;\?\!\_\"\'\-\/\s]*$/);
        //no reformatting needed
      }
    }
    //replace value in form
    th.val(value);

    if (!re.test(value)) {
      return 0; //some carachters are not allowed
    }
    //check min and max
    mm = minMax(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //general number
  function vNumber(th, value, accept, min, max) {
    var re,
      mm;
    if (accept === "none" || accept === false) {
      //try to automatically reformat user input (before validation)
      value = value.trim().replace(/\s/g, '').replace(/-/g, '').replace(/\//g, '').replace(/\./g, '').replace(/\,/g, '').replace(/\:/g, '');
      //set regex for validation
      re = new RegExp(/^[0-9]+$/);
    } else {
      if (accept === "dashes") {
        re = new RegExp(/^[0-9\-]+$/);
        //try to automatically reformat user input (before validation)
        value = value.trim().replace(/\s/g, '-').replace(/\//g, '-').replace(/\./g, '-').replace(/\,/g, '-').replace(/\:/g, '-');
      } else if (accept === "slashes") {
        re = new RegExp(/^[0-9\/]+$/);
        //try to automatically reformat user input (before validation)
        value = value.trim().replace(/\s/g, '/').replace(/-/g, '/').replace(/\./g, '/').replace(/\,/g, '/').replace(/\:/g, '/');
      }
    }
    //replace value in form
    th.val(value);

    if (!re.test(value)) {
      return 0; // some carachters are not allowed
    }
    //check min and max
    mm = minMax(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //general text field
  function vText(th, value, min, max) {
    value = value.trim();
    th.val(value);

    var mm = minMax(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //e-mail address
  function vEmail(value) {
    value = value.trim();
    th.val(value);
    //original regex was: /^([\w-\.]+@([\w\-]+\.)+[\w\-]{2,4})?$/
    var re = new RegExp(/^([\w-\.]+@([\w\-]+\.)+[\w\-]{2,4})?$/);
    if (!re.test(value)) {
      return 0; //return code 0. Invalid e-mail address
    } else {
      return true;
    }
  }

  //password
  function vPasswd(value, min, max) {
    // original reges: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{4,50}$/
    var re = new RegExp(/^(?=.*\d)(?=.*[!@#$%\^&*])(?=.*[a-z])(?=.*[A-Z]).{4,50}$/),
      mm = minMax(value, min, max);
    if (mm !== true) {
      return mm;
    }
    //check if password is valid
    //validity check is the last step of validation in this function
    //because the user must be informed before about the number of carachter he needs to enter
    if (!re.test(value)) {
      return 0; //password is not valid
    }
    return true;
  }

  //integer number
  function vInt(th, value, min, max) {
    //try to convert to integer, if not an integer try to automatically format number
    value = parseInt(value, 10);
    //formt number - replace input value
    if (isNaN(value)) {
      th.val('');
    } else {
      th.val(value);
    }
    //check if is an integer
    if (isInt(value) === false) {
      return 0; //not an integer
    }
    //check min and max
    var mm = minMaxNumber(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //year
  function vYear(value, min, max) {
    value = parseInt(value, 10);
    //check if input is integer and 4 digit long
    if (isInt(value) === false || value < 0 || value > 9999) {
      return 0; //not a valid year
    }
    //check min and max
    var mm = minMaxNumber(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //Month
  function vMonth(value, min, max) {
    value = parseInt(value, 10);
    //check if input is integer and between 1 and 12
    if (isInt(value) === false || value < 1 || value > 12) {
      return 0; //not a valid month
    }
    //check min and max
    var mm = minMaxNumber(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //day
  function vDay(value, min, max) {
    value = parseInt(value, 10);
    //check if input is integer and between 1 and 31
    if (isInt(value) === false || value < 1 || value > 31) {
      return 0; //not a valid day of month
    }
    //check min and max
    var mm = minMaxNumber(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //day of the week
  function vWDay(value, min, max) {
    value = parseInt(value, 10);
    //check if input is integer and between 1 and 31
    if (isInt(value) === false || value < 1 || value > 7) {
      return 0; //not a valid day of month
    }
    //check min and max
    var mm = minMaxNumber(value, min, max);
    if (mm !== true) {
      return mm;
    }
    return true;
  }

  //date
  function vDate(th, value, min, max, inputType, inputFormat) {
    //if input type is 'text', convert date to ISO format for validation
    if (inputType === 'text') {
      //try to format date
      value = value.trim().replace(/\./g, '/').replace(/-/g, '/');
      var splitDate = value.split('/'),
        day,
        month,
        year;
      
      //check if date can be splitted in 3 parts (day, month and year)
      //if the array splitDate contains < 3 elments, than the input is not a valid date
      if(splitDate.length !== 3) {
        return 0; //not a valid date
      }
      //string formatting
      if (inputFormat === 'eu') {
        day = splitDate[0];
        month = splitDate[1];
        year = splitDate[2];
      } else if (inputFormat === 'us') {
        day = splitDate[1];
        month = splitDate[0];
        year = splitDate[2];
      }

      //check for string lenghts and set leading 0 if lenght is < 2
      if (day.length < 2) {
        day = '0' + day;
      }
      if (month.length < 2) {
        month = '0' + month;
      }
      //automatically add 20 if year input is short format (17 -> 2017) and prevent error 
      if (year.length < 3) {
        year = '20' + year;
      }
      th.val(day + '/' + month + '/' + year);

      //convert date to ISO format for validation
      value = year + '-' + month + '-' + day;
    }

    //check if all values have the correct ISO date format (YYYY-MM-DD)
    //create objects with dates
    if (checkDate(value) === true) {
      value = new Date(value);
    } else {
      return 0; //not a valid date
    }
    if (checkDate(min) === true) {
      min = new Date(min);
    }
    if (checkDate(max) === true) {
      max = new Date(max);
    }
    //check for min and max
    if (value < min) {
      return 1;
    }
    if (value > max) {
      return 2;
    }
  }

  //time (hour+min)
  function vTime(value, min, max) {

  }

  //Tel and Fax numbers with prefix (eg. +39 0471346 ...)
  function vTelFax(th, value) {
    //try to format input
    value = value.trim().replace(/-/g, '').replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
    th.val(value);
    //validate
    var re = new RegExp(/^\+(?:[0-9] ?){6,14}[0-9]$/),
      mm = minMax(value, 7, 15);
    if (mm !== true) {
      return mm;
    }
    if (!re.test(value)) {
      return 0;
    }
    return true;
  }

  //Tel and Fax numbers without prefix
  function vTelFaxNoPref(th, value) {
    //try to format input
    value = value.trim().replace(/-/g, '').replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
    th.val(value);
    //validate
    var re = new RegExp(/^(?:[0-9] ?){6,14}[0-9]$/),
      mm = minMax(value, 6, 14);
    if (mm !== true) {
      return mm;
    }
    if (!re.test(value)) {
      return 0;
    }
    return true;
  }

  //Tel and Fax Prefixes (eg. +39, +49)
  function vTelFaxPref(th, value) {
    //try to format input
    value = value.trim().replace(/-/g, '').replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
    th.val(value);
    //validate
    var re = new RegExp(/^\+(?:[0-9] ?){1,4}[0-9]$/),
      mm = minMax(value, 2, 5);
    if (mm !== true) {
      return mm;
    }
    if (!re.test(value)) {
      return 0;
    }
    return true;
  }

  //Validate confirmation field
  function vConfirmation() {

  }
  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/


  //SUBMIT FUNCTIONS
  //check form status on submit
  submitBtn.click(function (e) {
    e.preventDefault();
    th = $(this);
    th.closest('form').find('input, textarea, select').each(function () {
      th = $(this);
      if ($(this).is('[aria-invalid="true"]')) {        
        //throw error: incorrect input in one or more fields
        return false;
      }
    });
  });

  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/



  //prevent user from typing too many carachters in field with data-max set
  maxSel.keypress(function (e) {
    th = $(this);
    //if input is select or type='range', no validation on keypress is needed
    //exit function and stop validation
    if (checkSelectAndRange(th) === true) {
      return false;
    }
    a = attrChecker(th, dMax);
    y = stopTyping(e, th, a);
    errorHandler(th, y);
  });

  //prevent user from typing uncorrect carachters in number field
  //e.g.: prevent typing if user tries to write "hello" in a number field
  int.keypress(function (e) {
    th = $(this);
    //if input is select or type='range', no validation on keypress is needed
    //exit function and stop validation
    if (checkSelectAndRange(th) === true) {
      return false;
    }
    a = checkKeyCodeRange(e);
    //if only numbers are allowed ... 
    //prevent user from typing any other carachter
    if (a !== 0) { //number
      if (e.keyCode !== 41 && e.keyCode !== 45) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      }
    } else {
      hideErrors(th);
    }
  });

  //prevent user from typing uncorrect carachters in year field
  //e.g.: prevent typing if user tries to write "hello" in a year field
  year.keypress(function (e) {
    th = $(this);

    //if input is select or type='range', no validation on keypress is needed
    //exit function and stop validation
    if (checkSelectAndRange(th) === true) {
      return false;
    }
    //prevent user from typing too many carachters
    y = stopTyping(e, th, 4);
    errorHandler(th, y);

    a = checkKeyCodeRange(e);
    //prevent user from typing any other carachter
    if (a !== 0) { //number
      e.preventDefault();
      //call error with code 50: not allowed carachter
      errorHandler(th, 50);
    } else if (y !== 3) {
      hideErrors(th);
    }
  });

  //prevent user from typing uncorrect carachters in month field
  //e.g.: prevent typing if user tries to write "hello" in a month field
  month.keypress(function (e) {
    th = $(this);

    //if input is select or type='range', no validation on keypress is needed
    //exit function and stop validation
    if (checkSelectAndRange(th) === true) {
      return false;
    }
    //prevent user from typing too many carachters
    y = stopTyping(e, th, 2);
    errorHandler(th, y);

    a = checkKeyCodeRange(e);
    //prevent user from typing any other carachter
    if (a !== 0) { //number
      e.preventDefault();
      //call error with code 50: not allowed carachter
      errorHandler(th, 50);
    } else if (y !== 3) {
      hideErrors(th);
    }
  });

  //prevent user from typing uncorrect carachters in day field
  //e.g.: prevent typing if user tries to write "hello" in a day field
  day.keypress(function (e) {
    th = $(this);

    //if input is select or type='range', no validation on keypress is needed
    //exit function and stop validation
    if (checkSelectAndRange(th) === true) {
      return false;
    }
    //prevent user from typing too many carachters
    y = stopTyping(e, th, 2);
    errorHandler(th, y);

    a = checkKeyCodeRange(e);
    //prevent user from typing any other carachter
    if (a !== 0) { //number
      e.preventDefault();
      //call error with code 50: not allowed carachter
      errorHandler(th, 50);
    } else if (y !== 3) {
      hideErrors(th);
    }
  });

  date.keypress(function (e) {
    th = $(this);
    c = attrChecker(th, 'type');

    //if input type is date no validation on keypress needed
    if (c === 'date') {
      return false;
    }
    //prevent user from typing too many carachters
    y = stopTyping(e, th, 10);
    errorHandler(th, y);

    a = checkKeyCodeRange(e);
    //prevent user from typing any other carachter than numbers and /
    if (a !== 0 && a !== 5 && a !== 7 && a !== 3) { //number
      e.preventDefault();
      //call error with code 50: not allowed carachter
      errorHandler(th, 50);
    } else if (y !== 3) {
      hideErrors(th);
    }
  });

  //prevent user from typing uncorrect carachters in number field
  //e.g.: prevent typing if user tries to write "hello" in a number field
  nr.keypress(function (e) {
    th = $(this);
    a = checkKeyCodeRange(e);
    b = attrChecker(th, dAccept);
    c = attrChecker(th, dMax);

    //prevent user from typing too many carachters
    y = stopTyping(e, th, c);
    errorHandler(th, y);

    //if only numbers are allowed ... 
    if (b === 'none') {
      //prevent user from typing any other carachter
      if (a !== 0) { //number
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      } else if (y !== 3) {
        hideErrors(th);
      }
    } else if (b === 'dashes') {
      //accept numbers and dashes
      if (a !== 0 && a !== 7) { //number and dashes
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      } else if (y !== 3) {
        hideErrors(th);
      }
    } else if (b === 'slashes') {
      //accept numbers and slashes
      if (a !== 0 && a !== 5) { //number and slashes
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      } else if (y !== 3) {
        hideErrors(th);
      }
    }
  });

  //prevent user from typing uncorrect carachters in string field
  //e.g.: prevent typing if user tries to write "04" in a string field
  str.keypress(function (e) {
    th = $(this);
    a = checkKeyCodeRange(e);
    b = attrChecker(th, dAccept);
    //if only letters are allowed ... 
    if (b === 'none') {
      //prevent user from typing any other carachter
      if (a !== 1 && a !== 2) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      } else {
        hideErrors(th);
      }
    } else if (b === 'spaces') {
      if (a !== 1 && a !== 2 && a !== 8) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      } else {
        hideErrors(th);
      }
    } else if (b === 'dashes') {
      if (a !== 1 && a !== 2 && a !== 7) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      } else {
        hideErrors(th);
      }
    } else if (b === 'slashes') {
      if (a !== 1 && a !== 2 && a !== 5) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      }
    } else if (b === 'all') {
      if (a === 0) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      } else {
        hideErrors(th);
      }
    }
  });

  //check password strenght
  passwd.keyup(function () {
    th = $(this);
    a = th.val();
    b = new RegExp(/\d/);
    c = new RegExp(/[a-z]/);
    d = new RegExp(/[A-Z]/);
    e = new RegExp(/\W/);
    g = 0;
    if (b.test(a)) {
      g = g + 1;
    }
    if (c.test(a)) {
      g = g + 1;
    }
    if (d.test(a)) {
      g = g + 1;
    }
    if (e.test(a)) {
      g = g + 1;
    }
    if (a.length > 6) {
      g = g + 1;
    }
    if (a.length > 9) {
      g = g + 1;
    }
    if (a.length > 12) {
      g = g + 1;
    }
    if (a.length > 15) {
      g = g + 1;
    }
    x = th.attr('data-security');
    th.attr('data-security-level', g);
    $("#" + x).attr('data-security-level', g);
  });

  //tel and fax numbers with prefix
  telFax.keypress(function (e) {
    th = $(this);
    y = stopTyping(e, th, 15);
    errorHandler(th, y);

    a = checkKeyCodeRange(e);
    if (a !== 0) { //number
      if (e.keyCode !== 43 && e.keyCode !== 32 && e.keyCode !== 45) { //allow whitespaces and dashes, they will be replaced on blur
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      }
    } else if (y !== 3) {
      hideErrors(th);
    }
  });

  //tel and fax numbers with prefix
  telFaxNoPref.keypress(function (e) {
    th = $(this);
    y = stopTyping(e, th, 14);
    errorHandler(th, y);
    a = checkKeyCodeRange(e);
    if (a !== 0) { //number
      if (e.keyCode !== 32 && e.keyCode !== 45) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      }
    } else if (y !== 3) {
      hideErrors(th);
    }
  });

  telFaxPref.keypress(function (e) {
    th = $(this);
    y = stopTyping(e, th, 5);
    errorHandler(th, y);
    a = checkKeyCodeRange(e);
    if (a !== 0) { //number
      if (e.keyCode !== 43 && e.keyCode !== 32 && e.keyCode !== 45) {
        e.preventDefault();
        //call error with code 50: not allowed carachter
        errorHandler(th, 50);
      }
    } else if (y !== 3) {
      hideErrors(th);
    }
  });

  //allow plus sign only as first digit in string
  telFax.keyup(function () {
    th = $(this);
    a = th.val();
    var re = new RegExp(/^\+*[0-9\s\-]*$/);
    if (!re.test(a)) {
      th.val(a.slice(0, -1));
      errorHandler(th, 51);
    }
  });

  telFaxPref.keyup(function () {
    th = $(this);
    a = th.val();
    var re = new RegExp(/^\+*[0-9\s\-]*$/);
    if (!re.test(a)) {
      th.val(a.slice(0, -1));
      errorHandler(th, 51);
    }
  });


  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/


  //Convert strings to uppercase, lowercase or first upper and other lower before form submission
  //Conversion and replacement of the user input is performed after validation
  //For this reasone the case of the input is not considered for validation
  //Also it would be silly to throw an error because the case is not the expected ... 
  dCSel.blur(function () {
    th = $(this);
    a = attrChecker(th, dC);
    if (a === 'first') {
      toUpperCaseFirst(th);
    } else if (a === 'upper') {
      toUpperCase(th);
    } else if (a === 'lower') {
      toLowerCase(th);
    }
  });

  //push current value to external element (useful e.g. for type="range" and type="number")
  push.on('input', function () {
    th = $(this);
    a = th.val();
    b = th.attr('data-push');
    $('#' + b).html(a);
  });

  //push value on load, if !== 0, else push placeholder
  push.each(function () {
    th = $(this);
    a = th.val();
    b = th.attr('data-push');
    if (a !== '') {
      $('#' + b).html(a);
    } else {
      $('#' + b).html('&empty;');
    }
  });

  /*----------------------------------------------------------------------------*/
  /*----------------------------------------------------------------------------*/



  //bind blur or chenge events on every field type

  //GENERAL STRING FIELD (no numbers allowed)           | OK
  str.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    //if status checker returns a valid status (true)
    if (validateThis === true) {
      //call validationHandler 
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attriutes
        a = attrChecker(th, dAccept);
        b = attrChecker(th, dMin);
        c = attrChecker(th, dMax);
        y = vString(th, val, a, b, c);
        errorHandler(th, y);
      }
    }
  });

  //GENERAL TEXT FIELD                                  | OK
  txt.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    //if status checker returns a valid status (true)
    if (validateThis === true) {
      //call validationHandler 
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attriutes
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vText(th, val, a, b);
        errorHandler(th, y);
      }
    }
  });

  //GENERAL NUMBER FIELD                                | OK
  nr.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    //if status checker returns a valid status (true)
    if (validateThis === true) {
      //call validationHandler 
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attriutes
        a = attrChecker(th, dAccept);
        b = attrChecker(th, dMin);
        c = attrChecker(th, dMax);
        y = vNumber(th, val, a, b, c);
        errorHandler(th, y);
      }
    }
  });

  //INTEGER NUMBER FIELD                                | OK
  int.on('change input', function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    //if status checker returns a valid status (true)
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vInt(th, val, a, b);
        errorHandler(th, y);
      }
    }
  });

  //EMAIL FIELD                                         | OK
  email.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    //if status checker returns a valid status (true)
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        y = vEmail(val);
        errorHandler(th, y);
      }
    }
  });

  //PASSWORD FIELD                                      | OK
  passwd.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    //if status checker returns a valid status (true)
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vPasswd(val, a, b);
        errorHandler(th, y);
      }
    }
  });

  //YEAR FIELD                                          | OK
  year.change(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vYear(val, a, b);
        errorHandler(th, y);
      }
    }
  });

  //MONTH                                               | OK
  month.change(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vMonth(val, a, b);
        errorHandler(th, y);
      }
    }
  });

  //CALENDAR DAY (1 - 31)                               | OK
  day.change(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vDay(val, a, b);
        errorHandler(th, y);
      }
    }
  });

  //DAY OF THE WEEK (1 - 7 or mon to sun.)              | OK
  wDay.on('change input', function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vWDay(val, a, b);
        errorHandler(th, y);
      }
    }
  });

  //DATE FIELD
  date.change(function () {
    th = $(this);
    val = th.val();
    //get input type
    c = attrChecker(th, 'type');
    d = attrChecker(th, 'data-date-format');
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        y = vDate(th, val, a, b, c, d);
        errorHandler(th, y);
      }
    }
  });

  //TIME FIELD
  time.change(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker($(this));
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        a = attrChecker(th, dMin);
        b = attrChecker(th, dMax);
        vTime(val, a, b);
      }
    }
  });

  //TELEPHONE AND FAX                                   | OK
  telFax.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        y = vTelFax(th, val);
        errorHandler(th, y);
      }
    }
  });

  //TEL AND FAX WITHOUT PREFIX                          | OK
  telFaxNoPref.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        y = vTelFaxNoPref(th, val);
        errorHandler(th, y);
      }
    }
  });

  //TEL AND FAX PREFIX CODE                             | OK
  telFaxPref.blur(function () {
    th = $(this);
    val = th.val();
    //call statusChecker to check field status
    validateThis = statusChecker(th);
    if (validateThis === true) {
      //call validationHandler
      x = validationHandler(th, val);
      // if validation handler returns true, the input can be validated
      if (x === true) {
        //check attribute data-min and data-max
        y = vTelFaxPref(th, val);
        errorHandler(th, y);
      }
    }
  });

  //return keycode: for developement only
  $("#keycode").keypress(function (e) {
    alert(e.keyCode);
  });
});
