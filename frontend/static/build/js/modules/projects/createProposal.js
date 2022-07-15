/**
 * ==============================================
 * * CREATE PROJECT PROPOSAL
 * ==============================================
 */

'use strict';

(() => {

  // * Local Variables

  const formSelector = '#addProject_form';
  
  const noCoopAgency_modal = $('#noCooperatingAgency_modal');
  
  let stepper;
  let PT_form; // Project Team Form
  let TG_form; // Target Group Form
  let CA_form; // Cooperating Agencies form
  let FR_form; // Financial Requirements form
  let EP_form; // Evaluation Plan form
  let lineItemBudget_list;
  let cooperatingAgencies_list;
  let noCoopAgency_mode = false;

  // * Private Methods

  const initializations = async () => {

    // Extension Project Type
    const extensionType_select = $('#addProject_extensionType_select');
    const extension_types = [
      {
        id: 'Livelihood',
        name: 'Livelihood',
      },{
        id: 'Literacy',
        name: 'Literacy',
      }, {
        id: 'Knowledge Transfer',
        name: 'Knowledge Transfer',
      }
    ]

    extensionType_select.empty();
    extensionType_select.append(`<option></option>`);
    extension_types.forEach(t => {
      extensionType_select.append(`
        <option value="${ t.id }">${ t.name }</option>
      `);
    });

    // Initialize Start Date
    $app('#addProject_startDate').initDateInput({
      button: '#addProject_startDate_pickerBtn'
    });

    // Initialize End Date
    $app('#addProject_endDate').initDateInput({
      button: '#addProject_endDate_pickerBtn'
    });

    // Handle Date inputs on change
    $('#addProject_startDate, #addProject_endDate').on('change', () => {
      const start_date_elem = $('#addProject_startDate');
      const end_date_elem = $('#addProject_endDate');

      const start_date = $(start_date_elem).val();
      const end_date = $(end_date_elem).val();

      const start_date_moment = moment(start_date);
      const end_date_moment = moment(end_date);

      if (!start_date) end_date_elem.valid();
      if (!end_date) start_date_elem.valid();

      if (start_date_moment.isValid() && end_date_moment.isValid()) {
        start_date_elem.valid();
        end_date_elem.valid();
      }

      // const start_date = startDateElem.val();
      // const end_date = endDateElem.val();
      
      // if (start_date && end_date) {
      //   getPartners({
      //     start_date: start_date,
      //     end_date: end_date
      //   });
      // }
    });

    const noCoopAgency_btn = noCoopAgency_modal.find(`[data-cooperating-agency-btn="addLater"]`);

    noCoopAgency_modal.on('show.bs.modal', (e) => {
      if (noCoopAgency_mode) e.preventDefault();
    });
    
    noCoopAgency_btn.on('click', () => {
      noCoopAgency_mode = true;
      noCoopAgency_modal.modal('hide');
      stepper.next();
    });
  }

  const handleStepper = () => {
    let currentStep = 0;
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');
    const submitBtn = $('#submitBtn');

    // Initialize Stepper
    stepper = new Stepper(document.querySelector('.bs-stepper'), {
      linear: true,
      animation: false,
      selectors: {
        steps: '.step',
        trigger: '.step-trigger',
        stepper: '.bs-stepper'
      }
    });

    // When next button has been clicked
    nextBtn.on('click', () => {
      // stepper.next();
      if ($(formSelector).valid()) {
        if (currentStep == 0 && CA_form.getSelectedCooperatingAgencies().length == 0) {
          !noCoopAgency_mode ? noCoopAgency_modal.modal('show') : stepper.next();
        } else if (currentStep == 1) {
          if (FR_form.requirements.length == 0)
            toastr.warning('Please add at least one line item budget');
          else if (FR_form.getFinancialRequirements().overallAmount > MONEY_LIMIT_LARGER)
            toastr.warning('The overall amount is too much');
          else 
            stepper.next();
        } else {
          stepper.next();
        }
      }
    });

    // When previous button has been clicked
    prevBtn.on('click', () => stepper.previous());

    // Handle steps
    document.getElementById('addProject_stepper').addEventListener('shown.bs-stepper', (event) => {

      // Update the current step
      currentStep = event.detail.to;

      // Show/Hide the buttons according to step
      if (currentStep == 0) {
        prevBtn.hide();
        submitBtn.hide();
        nextBtn.show();
      } else if (currentStep > 0 && currentStep < 3) {
        prevBtn.show();
        nextBtn.show();
        submitBtn.hide();
      } else {
        prevBtn.show();
        submitBtn.show();
        nextBtn.hide();
      }

      if (currentStep == 3) loadProjectDetails();
    });
  }

  const getPartners = async (params) => {
    await $.ajax({
      // url: `${ BASE_URL_API }/partners?start_date=${ params.start_date }&end_date=${ params.end_date }`,
      url: `${ BASE_URL_API }/partners`,
      type: 'GET',
      success: result => {
        if (result.error) {
          ajaxErrorHandler(result.message);
        } else {
          cooperatingAgencies_list = result.data;
          CA_form.setCooperatingAgenciesList(cooperatingAgencies_list);
        }
      },
      error: (xhr, status, error) => {
        ajaxErrorHandler({
          file: 'projects/createPropsal.js',
          fn: 'onDOMLoad.getPartners()',
          details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
        });
      }
    })
  }

  const initProjectTeamForm = () => {
    PT_form = new ProjectTeamForm();
  }

  const initTargetGroupForm = () => {
    TG_form = new TargetGroupsForm('#addProject_targetGroups_grp', {
      buttons: {
        add: '#addTargetGroup_btn',
        // clear: '#clearTargetGroupEmptyFields_btn'
      }
    });
  }

  const initCooperatingAgenciesGroupForm = () => {
    // await $.ajax({
    //   url: `${ BASE_URL_API }/partners`,
    //   type: 'GET',
    //   success: result => {
    //     if (result.error) {
    //       ajaxErrorHandler(result.message);
    //     } else {
    //       cooperatingAgencies_list = result.data;
    //     }
    //   },
    //   error: () => {
    //     ajaxErrorHandler(
    //       {
    //         file: 'projects/createProposal.js',
    //         fn: 'onDOMLoad.initCooperatingAgenciesGroupForm()',
    //       }
    //       , 1
    //     );
    //   }
    // });

    CA_form = new CooperatingAgenciesForm(
      '#addProject_cooperatingAgencies_grp',
      '#addProject_cooperatingAgencies_select'
    );
  }

  const initFinancialRequirementsForm = () => {

    // Get the line item budget
    const lineItemBudget = [
      {
        id: 1,
        name: 'Operating Cost',
      }, {
        id: 2,
        name: 'Supplies',
      }, {
        id: 3,
        name: 'Communication',
      }, {
        id: 4,
        name: 'Documentation',
      }, {
        id: 5,
        name: 'Travel Cost'
      }, {
        id: 6,
        name: 'Food Expenses'
      }, {
        id: 7,
        name: 'Others'
      },
    ];

    lineItemBudget_list = [...lineItemBudget];

    // Create an instance of financial requirements form
    FR_form = new FinancialRequirementsForm(
      '#financialRequirements_form',
      '#financialRequirement_addLineItemBudget_select',
      {
        buttons: {
          add: '#financialRequirement_addLineItemBudget_btn'
        }
      }
    );

    // Set Line Item Budget List
    FR_form.setLineItemBudgetList(lineItemBudget_list);
  }

  const initEvaluationPlanForm = () => {

    // Create a new instance of evaluation plan form
    EP_form = new EvaluationPlanForm('#evaluationPlan_form', {
      buttons: {
        add: '#evaluationPlan_addPlan_btn',
        clear: '#evaluationPlan_clearEmptyFields_btn'
      }
    });
  }

  const handleForm = () => {
    $app(formSelector).handleForm({
      validators: {
        title: {
          required: "The title of the project is required.",
          notEmpty: "This field cannot be blank.",
          minlength: {
            rule: 5,
            message: 'Make sure you  enter the full title of the project.'
          }
        },
        extension_type: {
          required: "Please select an extension project type.",
        },
        implementer: {
          required: "The implementer is required.",
          notEmpty: "This field cannot be blank.",
          minlength: {
            rule: 5,
            message: 'Make sure you enter the full name of the implementer.'
          }
        },
        start_date: {
          required: "Please select a date when the project will start.",
          dateISO: "Your input is an invalid date.",
          beforeDateTimeSelector: {
            rule: '#addProject_endDate',
            message: 'The start date must be earlier than end date.'
          }
        },
        end_date: {
          required: "Please select a date when the project will end.",
          dateISO: "Your input is an invalid date.",
          afterDateTimeSelector: {
            rule: '#addProject_startDate',
            message: 'The end date must be later than the start date.'
          }
        },
        impact_statement: {
          required: "Please compose the impact statement here.",
          notEmpty: "This field cannot be blank.",
          minlength: {
            rule: 5,
            message: 'Make sure you  enter the full details for the impact statement.'
          }
        },
        summary: {
          required: "Please compose the project summary here.",
          notEmpty: "This field cannot be blank.",
          minlength: {
            rule: 5,
            message: 'Make sure you enter the full summary of the project.'
          }
        }
      },
      onSubmit: async () => {
        const submitBtn = $('#submitBtn');
        const prevBtn = $('#prevBtn');

        // Set elements to loading state
        prevBtn.attr('disabled', true);
        submitBtn.attr('disabled', true);
        submitBtn.html(`
          <span class="px-3">
            <i class="fas fa-spinner fa-spin-pulse"></i>
          </span>
        `);

        // To enable elements
        const enableElements = () => {
          prevBtn.attr('disabled', false);
          submitBtn.attr('disabled', false);
          submitBtn.html('Submit');
        }

        // Get the data
        let data = getProjectDetailsData();

        // Create the partner_id array and delete the cooperating_agencies
        data.partner_id = data.cooperating_agencies.map(p => p.id);
        delete data.cooperating_agencies;

        await $.ajax({
          url: `${ BASE_URL_API }/projects/create`,
          type: 'POST',
          data: data,
          success: res => {
            if (res.error) {
              ajaxErrorHandler(res.message);
              enableElements();
            } else {
              
              // Set session alert
              setSessionAlert(`${ BASE_URL_WEB }/p/proposals/${ res.data.id }`, {
                theme: 'success',
                message: 'A new proposal has been successfully created.'
              });
            }
          },
          error: (xhr, status, error) => {
            enableElements();
            ajaxErrorHandler({
              file: 'projects/projectProposalDetails.js',
              fn: 'onDOMLoad.$.ajax',
              data: data,
              details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
            });
          }
        });
      }
    });
  }

  const getProjectDetailsData = () => {
    const fd = new FormData($(formSelector)[0]);
    return {
      title: fd.get('title'),
      extension_type: fd.get('extension_type'),
      implementer: fd.get('implementer'),
      team_members: PT_form.getTeamMembers(),
      target_groups: TG_form.getTargetGroups(),
      cooperating_agencies: CA_form.getSelectedCooperatingAgencies(),
      start_date: '' || fd.get('start_date'),
      end_date: '' || fd.get('end_date'),
      impact_statement: fd.get('impact_statement'),
      summary: fd.get('summary'),
      financial_requirements: FR_form.getFinancialRequirements().requirements,
      evaluation_plans: EP_form.getEvaluationPlans()
    }
  }

  const loadProjectDetails = () => {
    const {
      title,
      extension_type,
      implementer,
      team_members: pt,
      target_groups: tg,
      cooperating_agencies: ca,
      start_date,
      end_date,
      impact_statement,
      summary,
      financial_requirements: fr,
      evaluation_plans: ep
    } = getProjectDetailsData();

    const noContentTemplate = (message) => `<div class="text-muted font-italic">${message}</div>`;

    setHTMLContent({
      '#projectDetailsConfirm_title': title || noContentTemplate('No title has been set up'),
      '#projectDetailsConfirm_extensionType': extension_type || noContentTemplate('No project extension type has been set up.</div>'),
      '#projectDetailsConfirm_implementer': implementer || noContentTemplate('No implementer has been set up.'),
      '#projectDetailsConfirm_projectTeam': () => {
        if (pt.length) {
          let list = '<ul class="mb-0">';
          pt.forEach(p => list += `<li>${p.name}${ p.role ? ` - ${ p.role }` : '' }</li>`);
          list += '</ul>';
          return list;
        }
        return noContentTemplate('No project team been set up.');
      },
      '#projectDetailsConfirm_targetGroups': () => {
        if (tg.length) {
          let list = '<ul class="mb-0">';
          tg.forEach(t => list += `<li>${t}</li>`);
          list += '</ul>';
          return list;
        }
        return noContentTemplate('No target groups have been set up.');
      },
      '#projectDetailsConfirm_cooperatingAgencies': () => {
        if (ca.length) {
          let list = '<ul class="mb-0">';
          ca.forEach(c => list += `<li>${c.name}</li>`);
          list += '</ul>';
          return list;
        }
        return noContentTemplate('No cooperating agencies have been set up.');
      },
      '#projectDetailsConfirm_timeFrame': () => {
        if (start_date && end_date) {
          const getDuration = () => {
            return moment(start_date).isSame(moment(end_date))
              ? 'in the whole day'
              : moment(start_date).to(moment(end_date), true)
          }
          return `
            <div class="ml-4 ml-lg-0 row">
              <div class="pl-0 col-4 col-lg-2">
                <div class="font-weight-bold">Start Date:</div>
              </div>
              <div class="col-8 col-lg-10">
                <div>${ moment(start_date).format('MMMM D, YYYY (dddd)') }</div>
                <div class="small text-muted">${ fromNow(start_date) }</div>
              </div>

              <div class="col-12"><div class="mt-2"></div></div>

              <div class="pl-0 col-4 col-lg-2">
                <div class="font-weight-bold">End Date:</div>
              </div>
              <div class="col-8 col-lg-10">
                <div>${ moment(end_date).format('MMMM D, YYYY (dddd)') }</div>
                <div class="small text-muted">${ fromNow(end_date) }</div>
              </div>

              <div class="col-12"><div class="mt-2"></div></div>

              <div class="pl-0 col-4 col-lg-2">
                <div class="font-weight-bold">Duration:</div>
              </div>
              <div class="col-8 col-lg-10">
                <div>Approximately ${ getDuration() }</div>
              </div>
            </div>
          `
        } else return noContentTemplate('No dates have been set up.');
      },
      '#projectDetailsConfirm_impactStatement': impact_statement || noContentTemplate('No impact statement has been set up.'),
      '#projectDetailsConfirm_summary': summary || noContentTemplate('No summary has been set up.</div>'),
      '#projectDetailsConfirm_evaluationPlans': () => {
        if (ep.length) {
          let evaluationPlanRows = '';
          ep.forEach(p => {
            evaluationPlanRows += `
              <tr>
                <td>${p.outcome || noContentTemplate('--')}</td>
                <td>${p.indicator || noContentTemplate('--')}</td>
                <td>${p.data_collection_method || noContentTemplate('--')}</td>
                <td>${p.frequency || noContentTemplate('--')}</td>
              </tr>
            `
          });
          return evaluationPlanRows;
        } else {
          return `
            <tr>
              <td colspan="4">
                <div class="p-5 text-center">${noContentTemplate('No evaluation plan has been set up.')}</div>
              </td>
            </tr>
          `
        }
      },
      '#projectDetailsConfirm_financialRequirements': () => {
				let financialRequirementRows = '';
				let overallAmount = 0;

				// Read the object for rendering in the DOM
				fr.forEach(requirement => {

					// Create the line item budget row
					financialRequirementRows += `
						<tr style="background-color: #f6f6f6">
							<td 
								class="font-weight-bold"
								colspan="5"
							>${ requirement.category }</td>
						</tr>
					`;

					// Create the budget item rows
					requirement.items.forEach(({ budget_item, particulars, quantity, estimated_cost }) => {
						const totalAmount = quantity * estimated_cost;
						overallAmount += totalAmount;
						financialRequirementRows += `
							<tr>
								<td>${ budget_item }</td>
								<td>${ particulars }</td>
								<td class="text-right">${ quantity }</td>
								<td class="text-right">${ formatToPeso(estimated_cost) }</td>
								<td class="text-right">${ formatToPeso(totalAmount) }</td>
							</tr>
						`
					});
				});

				financialRequirementRows += `
					<tr class="font-weight-bold" style="background-color: #f6f6f6">
						<td colspan="4" class="text-right">Overall Amount</td>
						<td class="text-right">${ formatToPeso(overallAmount) }</td>
					</tr>
				`;

				return financialRequirementRows;
      }
    });
  }

  const removeLoaders = () => {
    $('#contentHeader_loader').remove();
    $('#contentHeader').show();

    $('#content_loader').remove();
    $('#addProject_form').show();
  }

  // * Initialize

  return {
    init: async () => {
      if ($(formSelector).length) {
        await initializations();
        handleStepper();
        handleForm();
        initProjectTeamForm();
        initTargetGroupForm();
        initCooperatingAgenciesGroupForm();
        await getPartners();
        initFinancialRequirementsForm();
        initEvaluationPlanForm();
        removeLoaders();
      }
    },
  }
})().init();
