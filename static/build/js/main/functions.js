/**
 * ============================================================================
 * * FUNCTIONS
 * ============================================================================
 */

'use strict';

/**
 * ? Main Functions
 * =================================
 */

/**
 * Generate and returns a short universal unique id 
 * @returns {string} Returns a uuid
 */
const uuid = () => {
    const id = () => ("000" + ((Math.random() * 46656) | 0).toString(36)).slice(-3);
    return Date.now().toString(36) + id() + id(); 
}


/** 
 * ? Moments Custom Functions 
 * =================================
 */

// *** Humanize DateTime *** //

/**
 * Returns a humanized details of date from now
 * @param {string} datetime Datetime to be humanized
 */
const fromNow = (datetime) => moment(datetime).fromNow();

/**
 * Returns a humanized details of date to now
 * @param datetime Datetime to be humanized
 */
const toNow = (datetime) => moment(datetime).toNow();


// *** Comparison of date: before/after today *** //

const isBeforeToday = (datetime) => moment(datetime).isBefore(moment());
const isBeforeOrToday = (datetime) => moment(datetime).isSameOrBefore(moment());
const isAfterToday = (datetime) => moment(datetime).isAfter(moment());
const isAfterOrToday = (datetime) => moment(datetime).isSameOrAfter(moment());

/**
 * Formats the datetime into readable ones
 * @param {string} datetime The datetime to be formatted
 * @param {string} format Type of format
 * @returns String of readable datetime format
 */
const formatDateTime = (datetime, format = "") => format
    ? moment(datetime).format(format in DATETIME_FORMATS ? DATETIME_FORMATS[format] : format)
    : moment(datetime).format();

/** 
 * ? jQuery Validation Methods 
 * =================================
 */

// Set Custom Validations
CUSTOM_VALIDATIONS?.forEach(({ ruleName, handler, defaultMessage }) => jQuery.validator.addMethod(ruleName, handler, defaultMessage));


/** 
 * ? App Functions 
 * =================================
 */

const $app = (selector) => {

    /**
     * * App Object
     */
    let app = {}

    /**
     * * Private Variables
     */

    /**
     * * App Properties
     */
    app.element = $(selector)

    /**
     * * App Methods
     */

    // Handle Form
    app.handleForm = ({ validators, onSubmit }) => {

        let validationRules = {}, validationMessages = {}

        const booleanRuleKeys = [
            'required',
            'email'
        ]

        const ruleObjects = ['rule', 'message']

        Object.entries(validators).forEach(([name, objRules]) => {
            let _rules = {}
            let _messages = {}

            const rules = Object.entries(objRules);
            rules.forEach(([ruleKey, rule]) => {
                if(booleanRuleKeys.includes(ruleKey) && typeof rule === "string") {
                    _rules[ruleKey] = true;
                    _messages[ruleKey] = rule
                } else if(typeof rule === "object") {
                    Object.keys(rule).forEach(key => {
                        if(!ruleObjects.includes(key)) {
                            console.error(`"${ key }" is an invalid validation parameter`)
                        } else {
                            _rules[ruleKey] = rule.rule;
                            _messages[ruleKey] = rule.message
                        }
                    })
                }
            });

            validationRules[name] = _rules;
            validationMessages[name] = _messages;
        });

        app.element.validate({
            rules: validationRules,
            messages: validationMessages,
            errorElement: 'div',
            errorPlacement: (error, element) => {
                if (element.parent('.input-group').length) { // For checkbox/radio
                    error
                        .addClass('invalid-feedback')
                        .insertAfter(element.parent());
                } else if (element.hasClass('select2')) { // For select2
                    error
                        .addClass('invalid-feedback')
                        .insertAfter(element.next('span'));
                } else { // For Default   
                    error.addClass('invalid-feedback')
                    element.closest('.form-group').append(error)
                }
            },
            highlight: (element, errorClass, validClass) => {
                if($(element).hasClass('select2')) {
                    $(element)
                        .siblings('span.select2-container')
                        .children('.selection')
                        .children('.select2-selection')
                        .addClass('is-invalid');
                } else {
                    $(element).addClass('is-invalid')
                }
            },
            unhighlight: (element, errorClass, validClass) => {
                if($(element).hasClass('select2')) {
                    $(element)
                        .siblings('span.select2-container')
                        .children('.selection')
                        .children('.select2-selection')
                        .removeClass('is-invalid');
                } else {
                    $(element).removeClass('is-invalid')
                }
            },
            submitHandler: () => {
                onSubmit();
                return false
            }
        });
    }

    // Initialize Date Range Picker
    app.initDateInput = ({
        button = null,
        mode = 'single',
        daterangepicker = {},
        inputmask = {},
    }) => {
    
        /**
         * For Date Range Picker
         */

        // Initialize default options
        let _daterangepicker = {
            singleDatePicker: true,
            autoUpdateInput: false,
            autoApply: true,
            showDropdowns: true,
            opens: 'left', 
            drops: 'auto',
            locale: {
                cancelLabel: 'Clear',
                applyLabel: 'Select'
            }
        }
        
        // Configure Single Date Picker
        if(mode === 'single') _daterangepicker.singleDatePicker = true;
        if(mode === 'range') _daterangepicker.singleDatePicker = false;

        // Reconfigure the options if set
        Object.entries(daterangepicker)?.forEach(([key, value]) => _daterangepicker[key] = value)

        /**
         * For Input Mask
         */

        // Initialize default options
        let _inputmask = { 
            placeholder: 'mm/dd/yyyy',
        }

        // Reconfigure the options if set
        Object.entries(inputmask)?.forEach(([key, value]) => _inputmask[key] = value)

        /**
         * Overall Setup
         */

        if(button !== null) {
            const btn = $(button), input = $(selector);
            
            // Initialize Date Range Picker
            btn.daterangepicker(_daterangepicker);

            // Initialize Input Mask
            input.inputmask('mm/dd/yyyy', _inputmask);

            // On Button Apply
            btn.on('apply.daterangepicker', (ev, { startDate }) => {
                input.val(startDate.format('MM/DD/YYYY'));
                input.trigger('change');
                input.valid();
            });
            
            // On Button Cancel
            btn.on('cancel.daterangepicker', () => {
                input.val('');
                input.trigger('change');
                input.valid();
                const element = btn.data('daterangepicker');
                const dateToday = moment().format('MM/DD/YYYY');
                element.setStartDate(dateToday);
                element.setEndDate(dateToday);
            });

            // On Input Change
            input.on('change', () => {
                const value = input.val();
                const element = btn.data('daterangepicker');
                if(value) {
                    element.setStartDate(value);
                    element.setEndDate(value);
                } else {
                    const dateToday = moment().format('MM/DD/YYYY');
                    element.setStartDate(dateToday);
                    element.setEndDate(dateToday);
                }
            });
        }
    }

    // DataTable
    app.dataTable = () => {
        
    }

    /**
     * * Return the app object
     */
    return app;
}

/** 
 * ? Ajax Functions 
 * =================================
 */

const $ajax = () => {
    let ajax = {}

    let ajaxOptions = {
        url: '',
        data: null,
        onSuccess: (result) => {
            console.log(result);
        },
        onError: () => {
            console.error('AJAX Error');
        }
    }

    ajax.get = async (options = ajaxOptions) => {
        console.log("Loading ....");
        await $.ajax({
            url: options.url,
            type: 'GET',
            success: options.onSuccess,
            error: options.onError
        });
        console.log("Done!");
    }

    ajax.post = async (options = ajaxOptions) => {
        console.log("Loading ....");
        await $.ajax({
            url: options.url,
            type: 'POST',
            data: ajaxOptions.data,
            success: options.onSuccess,
            error: options.onError
        });
        console.log("Done!");
    }

    return ajax;
}

// We need that our library is globally accesible, then we save in the window
if(typeof(window.ajax) === 'undefined') window.ajax = $ajax();