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
        factory(jQuery);
    }
}(function ($) {
    'use strict';
    var pluginName = 'adaptive'; // the name of the plugin

    //---------------------
    //PRIVATE FUNCTIONS

    /*
     * Check if the field has focus or is not empty,
     * and toggle the adaptive placeholder class.
     */
    function toggleLabel(field, label, className) {
        if (field.val() !== '' || field.is(':focus')) {
            label.addClass(className);
            return;
        }
        label.removeClass(className);
        return;
    }
       
    //---------------------
    //PLUGIN CONSTRUCTOR
    $.fn[pluginName] = function (userSettings) {
        return this.each(function () {
            var self = this;

            self.settings = $.extend({}, defaultSettings, userSettings); //The plugin settings
            self.element = $(element); //The field-group
            self.label = self.element.find(self.settings.labelSelector); //The label
            self.field = self.element.find(self.settings.fieldSelector); //The field

            toggleLabel(self.field, self.label, self.settings.labelToggleClass);

            self.field.on('focus.' + pluginName + ' blur.' + pluginName, function () {
                toggleLabel(self.field, self.label, self.settings.labelToggleClass);
            });
        });
    };


    $.fn[pluginName].defaultSettings = {
        labelSelector: '.field-group__label',
        labelToggleClass: 'label_adaptive',
        fieldSelector: '.field-group__field'
    };
}));