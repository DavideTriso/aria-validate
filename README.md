# ARIA VALIDATE

## About

A WAI-ARIA 1.1 compliant solution for **client-side form input validation**.


## Introduction

Describe mman concepts of how the plugin works here: 

* What is a field group
* Wich element contains a field group
* A field without alert and/or successbox: what happens?
* Validation steps: Error prevention/live valiation on typing. / autoformatting on blur / validation on blur

## Settings:

### Classes and default settings


Name | Default | Type | Description 
-----|---------|------|-------------
fieldGroupIdPrefix | field-group-- | string | The prefix used to generate IDs of field groups.
fieldGroupValidClass | field-group_valid string | The class added by the plugin to a field group when user input is valid.
fieldGroupErrorClass | field-group_error string | The class added by the plugin to a field group when user input is invalid.
fieldClass | field-group__field string | The class used by the plugin to retrive the field.
fieldErrorClass | field-group__field_error string | The class added by the plugin to a field when user input is invalid.
fieldValidClass | field-group__field_valid string | The class added by the plugin to a field group when user input is valid.
labelClass | field-group__label string | The class used by the plugin to retrive the label
labelErrorClass | field-group__label_error string | The class added by the plugin to a label when user input is invalid.
labelValidClass | field-group__label_valid string | The class added by the plugin to a label  when user input is valid.
alertboxClass | field-group__alertbox string | The class used by the plugin to retrive the alert-box
successboxClass | field-group__successbox string | The class used by the plugin to retrive the success-box
alertboxVisibleClass | field-group__alertbox_visible string | The class added by the plugin to the alert-box when an error occurs and an error message must be shown.
successboxVisibleClass | field-group__successbox_visible string | The class added by the plugin to the success-box when user input is correct and a success message must be shown.