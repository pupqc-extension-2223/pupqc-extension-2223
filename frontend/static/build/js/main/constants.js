/**
 * ============================================================================
 * * CONSTANTS AND CONFIGURATIONS
 * ============================================================================
 */

'use strict';

// Developer Mode
const DEV_MODE = true;

// For DataTables
const DT_LANGUAGE = {
	emptyTable: `
		<div class="text-center p-5">
			<h3>No records yet</h3>
			<div class="text-secondary">Hey! We found no records here yet.</div>
		</div>
	`,
	loadingRecords: `
		<div class="text-center py-5 wait">
			<div class="spinner-border text-primary mb-3" role="status">
				<span class="sr-only">Loading ...</span>
			</div>
			<div class="text-secondary">Making it ready ...</div>
		</div>
	`,
	processing: `
		<div class="text-center p-5 wait">
			<div class="spinner-border text-primary mb-3" role="status">
				<span class="sr-only">Loading ...</span>
			</div>
			<div class="text-secondary">Processing, please wait ...</div>
		</div>
	`,
	zeroRecords: `
		<div class="text-center p-5">
			<h3>No match found</h3>
			<div class="text-secondary">No records was found that matched to your request. Please check if the spelling is correct or try other keywords.</div>
		</div>
	`,
	paginate: {
		previous: `<i class="fas fa-caret-left mr-1"></i><span>Previous</span>`,
		next: `<span>Next</span><i class="fas fa-caret-right ml-1"></i>`,
	}
}

// DateTime Formats
const DATETIME_FORMATS = {
	"Full DateTime": "dddd, MMMM D, YYYY; hh:mm A",
	"DateTime": "MMMM D, YYYY; hh:mm A",
	"Short DateTime": "MMM. D, YYYY; hh:mm A",
	"Full Date": "dddd, MMMM D, YYYY",
	"Date": "MMMM D, YYYY",
	"Short Date": "MMM. D, YYYY",
	"Time": "hh:mm A"
}

// jQuery Custom Validation
const CUSTOM_VALIDATIONS = [
	{
		ruleName: "lessThan",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				return !c ? true : parseFloat(value) < parseFloat(c);
			}
			return true;
		},
		defaultMessage: 'It must be less than something'
	}, {
		ruleName: "greaterThan",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				return !c ? true : parseFloat(value) > parseFloat(c);
			}
			return true;
		},
		defaultMessage: 'It must be greater than something'
	}, {
		ruleName: "lessThanOrEqualTo",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				if (c) return parseFloat(value) <= parseFloat(c);
			}
			return true;
		},
		defaultMessage: 'It must be less than or equal to something'
	}, {
		ruleName: "greaterThanOrEqualTo",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				if (c) return parseFloat(value) >= parseFloat(c);
			}
			return true;
		},
		defaultMessage: 'It must be greater than or equal to something'
	}, {
		ruleName: "beforeToday",
		handler: (value, element, params) => {
			return this.optional(element) || isBeforeToday(value);
		},
		defaultMessage: 'Date and/or time must be earlier than today'
	}, {
		ruleName: "afterToday",
		handler: (value, element, params) => {
			return this.optional(element) || isAfterToday(value);
		},
		defaultMessage: 'Date and/or time must be later than today'
	}, {
		ruleName: "beforeTime",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				return !c ? true : moment(value, 'H:mm').isBefore(moment(c, 'H:mm'));
			}
			return true;
		},
		defaultMessage: 'It must before an indicated time'
	}, {
		ruleName: "afterTime",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				return !c ? true : moment(value, 'H:mm').isAfter(moment(c, 'H:mm'));
			}
			return true;
		},
		defaultMessage: 'It must after an indicated time'
	}, {
		ruleName: "beforeDateTime",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				return !c
					? true
					: moment(value, 'MM/DD/YYYY HH:mm:ss').isBefore(moment(c, 'MM/DD/YYYY HH:mm:ss'));
			}
			return true;
		},
		defaultMessage: 'It must before an indicated date and time'
	}, {
		ruleName: "afterDateTime",
		handler: (value, element, params) => {
			if ($(params).length) {
				const c = $(params).val();
				return !c
					? true
					: moment(value, 'MM/DD/YYYY HH:mm:ss').isAfter(moment(c, 'MM/DD/YYYY HH:mm:ss'));
			}
			return true;
		},
		defaultMessage: 'It must after an indicated date and time'
	}
]

const TOOLTIP_OPTIONS = {
	container: 'body',
	delay: {
		show: 500,
		hide: 0
	},
	trigger: 'hover'
}

const MAX_EMPTY_FIELDS = 10;

const MONEY_LIMIT = 999999999999;