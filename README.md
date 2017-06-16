# ARIA FORMS

## About

**COMING SOON!** A WAI-ARIA 1.1 compliant solution for **client-side form validation**.



## Options


### Elements classes

Set the classes accordingly to the classes used in the html. The classes are used to select the elements of a form.

Name | Default | Type | Description | Required or optional
-----|---------|------|-------------|---------------------
fieldClass | field | string | Class of field element (wrapper of a group made up by input, label and message region) | optional
labelClass | field__label | string | Class of field label | optional
inputClass | field__input | string | Class of field input | optional
fieldMessageWrapperClass | string | field__message | Class of a message region wrapper (where error and valid messages are injected) | optional
fieldErrorClass | field_not-valid | string | Class added to a field, when the user input is not valid | optional
fieldValidClass | field_valid  | string |Class added to a field, when the user input is valid | optional
labelErrorClass | field__label_not-valid | string | Class added to a label, when the user input is not valid | optional
labelValidClass | field__label_valid | string | Class added to a label, when the user input is valid | optional
inputErrorClass | field__input_not-valid | string | Class added to an input, when the user input is not valid | optional
inputValidClass | field__input_valid | string | Class added to an input, when the user input is valid | optional
fieldMessageErrorClass | field__message_not-valid | string | Class added to a field message wrapper, when the user input is not valid | optional
fieldMessageValidClass | field__message_valid | string | Class added to a field message wrapper, when the user input is valid | optional
formMessageWrapperClass | form__message | string | Class of a form message wrapper. Not a global option, restricted to form. | optional
formMessageErrorClass | form__message_not-valid | string | Class added to a form message wrapper, when showing an error message. Not a global option, restricted to form. | optional
formMessageValidClass | form__message_valid | string | Class added to a form message wrapper, when showing a valid message. Not a global option, restricted to form. | optional


### Messages objects

Name | Default | Type | Description | Required or optional
-----|---------|------|-------------|---------------------
fieldErrorMessages | placeholder (example error message) | object | Object where field error messages should be stored | required
fieldValidMessages | placeholder (example error message) | object | Object where field valid messages should be stored | required
formErrorMessages | placeholder (example error message) | object | Object where form error messages should be stored. Not a global option, restricted to form. | required
formValidMessages | placeholder (example error message) | object | Object where form valid messages should be stored. Not a global option, restricted to form. | required


### Validation rules

Name | Default | Type | Description | Required or optional
-----|---------|------|-------------|---------------------