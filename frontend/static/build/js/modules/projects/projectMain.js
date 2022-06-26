/**
 * ==============================================
 * * PROJECT CLASSES
 * ==============================================
 */


'use strict';


const ProjectDetails = (() => {

  /**
   * * Local Variables`
   */

  const header = $('#projectDetails_header');
  const body = $('#projectDetails_body');
  let initialized = false;

  // Data Container
  let project;
  let mode;

  /**
   * * Private Functions
   */

  const noContentTemplate = (message) => `<div class="text-muted font-italic">${message}</div>`;

  const loadActiveBreadcrumb = () => {
    const title = project.title;
    $('#active_breadcrumb').html(() => title.length > 30 ? `${ title.substring(0, 30) } ...` : title);
  }

  const loadHeaderDetails = () => {
    loadActiveBreadcrumb();
    
    if (header.length) {
      setHTMLContent({
        '#projectDetails_header_title': project.title,
        '#projectDetails_header_implementer': () => {
          return `
            <i class="fas fa-gears fa-fw mr-2 text-dark" data-toggle="tooltip" title="Implementer"></i>
            <span>${ project.implementer || noContentTemplate('No implementer has been set up.') }</span>
          `
        },
        '#projectDetails_header_timeframe': () => `
          <i class="fas fa-calendar-alt fa-fw mr-2 text-dark" data-toggle="tooltip" title="Time Frame"></i>
          <span>${formatDateTime(project.start_date, 'Date')} - ${formatDateTime(project.end_date, 'Date')}</span>
        `,
        '#projectDetails_header_status': () => {

          // * For proposal mode * //
          if (mode == 'Proposal') {
            const status = project.status;
            const { theme, icon } = PROJECT_PROPOSAL_STATUS_STYLES[status];
            return `
              <div class="badge badge-subtle-${theme} py-1 px-2">
                <i class="${icon} fa-fw mr-1"></i>
                <span>${status}</span>
              </div>
            `
          } 
          
          // * For monitoring mode * //
          else if (mode === 'Monitoring') {
            const { start_date, end_date } = project;
            const today = moment();
            
            let status;
            if (today.isBefore(start_date) && today.isBefore(end_date))
              status = 'Soon';
            else if (today.isAfter(start_date) && today.isAfter(end_date))
              status = 'Ended';
            else if (today.isBetween(start_date, end_date))
              status = 'On going';
            else
              status = 'No data';
  
            const { theme, icon } = PROJECT_MONITORING_STATUS_STYLES[status];
            return `
              <div class="badge badge-subtle-${theme} py-1 px-2">
                <i class="${icon} fa-fw mr-1"></i>
                <span>${status}</span>
              </div>
            `
          }

          // * For evaluation mode * //
          else if (mode === 'Evaluation') {
            return 'Evaluation'
          }
        }
      });
    }
  }

  const loadBodyDetails = () => {
    if (body.length) {
      const {
        title,
        implementer,
        team_members: pt,
        target_groups: tg,
        partners: ca,
        start_date,
        end_date,
        impact_statement,
        summary,
        financial_requirements: fr,
        evaluation_plans: ep
      } = project;

      // Set the overall details of the project
      setHTMLContent({
        '#projectDetails_body_title': title || noContentTemplate('No title has been set up'),
        '#projectDetails_body_implementer': implementer || noContentTemplate('No implementer has been set up.'),
        '#projectDetails_body_projectTeam': () => {
          if (pt.length) {
            let list = '<ul class="mb-0">';
            pt.forEach(p => list += `<li>${p}</li>`);
            list += '</ul>';
            return list;
          }
          return noContentTemplate('No project team been set up.');
        },
        '#projectDetails_body_targetGroups': () => {
          if (tg.length) {
            let list = '<ul class="mb-0">';
            tg.forEach(t => list += `<li>${t}</li>`);
            list += '</ul>';
            return list;
          }
          return noContentTemplate('No target groups have been set up.');
        },
        '#projectDetails_body_cooperatingAgencies': () => {
          if (ca.length) {
            let list = '<ul class="mb-0">';
            ca.forEach(c => list += `<li>${c.name}</li>`);
            list += '</ul>';
            return list;
          }
          return noContentTemplate('No cooperating agencies have been set up.');
        },
        '#projectDetails_body_timeFrame': () => {
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
        '#projectDetails_body_impactStatement': impact_statement || noContentTemplate('No impact statement has been set up.'),
        '#projectDetails_body_summary': summary || noContentTemplate('No summary has been set up.</div>'),
        '#projectDetails_body_evaluationPlans': () => {
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
        '#projectDetails_body_financialRequirements': () => {
          
          let financialRequirementRows = '';
          let overallAmount = 0;

          // Read the object for rendering in the DOM
          fr.forEach(category => {

            // Create the line item budget row
            financialRequirementRows += `
              <tr style="background-color: #f6f6f6">
                <td 
                  class="font-weight-bold"
                  colspan="5"
                >${ category.category }</td>
              </tr>
            `;

            // Create the budget item rows
            category.items.forEach(r => {
              const { budget_item, particulars, quantity, estimated_cost } = r;
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

      // If Project Evaluation has been graded
      if (project.evaluation) {
        const { evaluation_date, evaluators } = project.evaluation;
        const presentation_date = project.presentation_date;

        setHTMLContent({
          '#projectDetails_body_presentationDate': () => {
            if (presentation_date) {
              return `
                <div>${ moment(presentation_date).format('MMMM DD, YYYY (dddd)') }</div>
                <div class="small text-muted">${ fromNow(presentation_date) }</div>
              `
            } else {
              return `<div class="font-italic text-muted">No date has been set.</div>`
            }
          },
          '#projectDetails_body_evaluationDate': () => {
            if (evaluation_date) {
              return `
                <div>${ moment(evaluation_date).format('MMMM DD, YYYY (dddd)') }</div>
                <div class="small text-muted">${ fromNow(evaluation_date) }</div>
              `
            } else {
              return `<div class="font-italic text-muted">No date has been set.</div>`
            }
          },
          '#projectDetails_body_evaluationSummary': () => {
            let rows = '';
            let sumPoints = 0;
            
            const getRemarks = (points) => {
              if (points >= 70 && points <= 100) {
                return `<span class="font-weight-bold text-success text-uppercase">PASSED</span>`;
              } else if (points < 70 && points >= 1) {
                return `<span class="font-weight-bold text-danger text-uppercase">FAILED</span>`;
              } else {
                return '--';
              }
            }

            evaluators.forEach(e => {
              const { name, points } = e;
              const realPoints = parseFloat(parseFloat(points).toFixed(2)) || 0;

              const getPoints = () => {
                return realPoints >= 1 && realPoints <= 100
                  ? `${ realPoints.toFixed(2) }%`
                  : '--'
              }

              rows += `
                <tr>
                  <td>${ name }</td>
                  <td class="text-right">${ getPoints() }</td>
                  <td class="text-center">${ getRemarks(realPoints) }</td>
                </tr>
              `

              sumPoints += realPoints;
            });

            const averagePoints = sumPoints/evaluators.length;

            const getAveragePoints = () => {
              return averagePoints >= 1 && averagePoints <= 100
                ? `${ averagePoints.toFixed(4) }%`
                : '--' 
            }

            rows += `
              <tr style="background: #f6f6f6">
                <td class="text-right font-weight-bold">Average Points</td>
                <td class="text-right font-weight-bold">${ getAveragePoints() }</td>
                <td class="text-center">${ getRemarks(averagePoints) }</td>
              </tr>
            `

            return rows;
          }
        });

        $('#projectDetails_evaluationSummary_tab').show();
      } else {
        $('#projectDetails_evaluationSummary_tab').hide();
      }

      // Finally, show the navigation tabs
      $('#projectDetails_navTabs').show();
    }
  }

  const removeLoaders = () => {
    $('#contentHeader_loader').remove();
    $('#contentHeader').show();

    $('#projectDetails_options_card_loader').remove();
    $('#projectDetails_options_card').show();

    $('#projectDetails_body_loader').remove();
    $('#projectDetails_body').show();
  }

  /**
   * * Public Functions
   */

  const loadDetails = (projectData) => {
    if (projectData) project = projectData;
    loadHeaderDetails();
    loadBodyDetails();
  }

  /**
   * * Init
   */

  const init = (data) => {
    if (!initialized) {
      initialized = true;
      project = data.project;
      mode = data.mode;
      loadDetails();
      removeLoaders();
    }
  }

  /**
   * * Return Public Functions
   */

  return {
    init,
    loadDetails,
  }
})();


const ProjectOptions = (() => {

  /**
   * * Local Variables
   */

  const body = $('#projectDetails_body');
  const activitiesDT = $('#activities_dt');
  const options = '#projectDetails_options';
  const user_roles = JSON.parse(getCookie('roles'));
  let initialized = 0;
  let processing = false; // For submissions

  // Data Container
  let project;
  let mode;

  // Submission Modals
  const forApproval_modal = $('#confirmSubmitForApproval_modal');
  const forRevision_modal = $('#confirmRequestForRevision_modal');
  const setPresentationSchedule_modal = $('#setPresentationSchedule_modal');
  const setProjectEvaluation_modal = $('#setProjectEvaluation_modal');
  const approveProject_modal = $('#confirmApproveTheProject_modal');
  const cancelProposal_modal = $('#confirmCancelTheProposal_modal');

  /**
   * * Private Methods
   */

  const updateProjectDetails = async obj => {
    let updated = false;

    Object.entries(obj).forEach(([key, value]) => {
      if (project.hasOwnProperty(key)) {
        project[key] = value;
        updated = true;
      }
    });

    if (updated) {
      ProjectDetails.loadDetails(project);
      ProjectOptions.setOptions(project);

      if (activitiesDT.length) {
        AddProjectActivity.init(project);
        ProjectActivities.init(project);
      }
  }
  }

  // *** FOR SUBMISSIONS *** //

  const initForApproval = () => {
    const isBadAction = () => !(project.status == 'Created' || project.status == 'For Revision');
    const confirmBtn = $('#confirmSubmitForApproval_btn');
    
    confirmBtn.on('click', async () => {
      if (isBadAction()) return;

      processing = true;
      
      // Disable elements
      confirmBtn.attr('disabled', true);
      confirmBtn.html(`
        <span class="px-3">
          <i class="fas fa-spinner fa-spin-pulse"></i>
        </span>
      `);
      
      // Enable elements function
      const enableElements = () => {
        confirmBtn.attr('disabled', false);
        confirmBtn.html('Yes, please!');
      }

      await $.ajax({
        url: `${ BASE_URL_API }/projects/review/${ project.id }`,
        type: 'PUT',
        success: async res => {
          processing = false;

          if (res.error) {
            ajaxErrorHandler(res.message);
            enableElements();
          } else if (res.warning) {
            forApproval_modal.modal('hide');
            enableElements();
            toastr.warning(res.message);
          } else {
            forApproval_modal.modal('hide');
            updateProjectDetails({ status: 'For Review' });
            enableElements();
            toastr.success('The proposal has been submitted successfully.');
          }
        }, 
        error: (xhr, status, error) => {
          ajaxErrorHandler({
            file: 'projects/projectProposalDetails.js',
            fn: `ProjectOptions.initForApproval(): confirmBtn.on('click', ...)`,
            details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
          });
          enableElements();
        }
      });
    });

    forApproval_modal.on('show.bs.modal', (e) => {
      if (isBadAction()) e.preventDefault();
    });

    forApproval_modal.on('hide.bs.modal', (e) => {
      if (processing) e.preventDefault();
    });
  }

  const initForRevision = () => {
    const isBadAction = () => project.status != 'For Review';
    const confirmBtn = $('#confirmRequestForRevision_btn');
    
    confirmBtn.on('click', async () => {
      if (isBadAction()) return;

      processing = true;
      
      // Disable elements
      confirmBtn.attr('disabled', true);
      confirmBtn.html(`
        <span class="px-3">
          <i class="fas fa-spinner fa-spin-pulse"></i>
        </span>
      `);
      
      // Enable elements function
      const enableElements = () => {
        confirmBtn.attr('disabled', false);
        confirmBtn.html('Yes, please!');
      }

      await $.ajax({
        url: `${ BASE_URL_API }/projects/revise/${ project.id }`,
        type: 'PUT',
        success: async res => {
          processing = false;

          if (res.error) {
            enableElements();
            toastr.warning(res.message);
          } else {
            forRevision_modal.modal('hide');
            enableElements();
            updateProjectDetails({ status: 'For Revision' });
            toastr.success('Your request of project revision has been successfully saved.');
          }
        }, 
        error: (xhr, status, error) => {
          ajaxErrorHandler({
            file: 'projects/projectProposalDetails.js',
            fn: `ProjectOptions.initForRevision(): confirmBtn.on('click', ...)`,
            details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
          });
          enableElements();
        }
      });
    });

    forRevision_modal.on('show.bs.modal', (e) => {
      if (isBadAction()) e.preventDefault();
    });

    forRevision_modal.on('hide.bs.modal', (e) => {
      if (processing) e.preventDefault();
    });
  }

  const initForEvaluation = () => {
    const isBadAction = () => project.status !== 'For Review';
    const formSelector = '#setPresentationSchedule_form';
    const form = $(formSelector);
    let validator;

    // Initialize Date Input
    $app('#setPresentation_date').initDateInput({
      button: '#setPresentation_date_pickerBtn'
    });

    // Prevent showing the modal if status is not "For Review"
    setPresentationSchedule_modal.on('show.bs.modal', (e) => {
      if (isBadAction()) e.preventDefault();
    });

    // Prevent hiding the modal if still processing
    setPresentationSchedule_modal.on('hide.bs.modal', (e) => {
      if (processing) e.preventDefault();
    });

    // Reset the form if modal has been hidden
    setPresentationSchedule_modal.on('hidden.bs.modal', () => {
      validator.resetForm();
      form.trigger('reset');
    });

    validator = $app(formSelector).handleForm({
      validators: {
        presentation_date: {
          required: 'Please select a date for the presentation of the project.',
          dateISO: 'Your input is not a valid date.',
          afterToday: 'The presentation date must be later than today.',
          beforeDateTime: {
            rule: project.end_date,
            message: 'The presentation date must be earlier than the end of the project timeline'
          }
        }
      },
      onSubmit: async () => {
        if (isBadAction()) return;

        processing = true;

        const confirmBtn = $('#setPresentationSchedule_btn');

        // Disable elements
        confirmBtn.attr('disabled', true);
        confirmBtn.html(`
          <span class="px-3">
            <i class="fas fa-spinner fa-spin-pulse"></i>
          </span>
        `);
        
        // Enable elements function
        const enableElements = () => {
          confirmBtn.attr('disabled', false);
          confirmBtn.html('Yes, please!');
        }

        // Get Data
        const fd = new FormData($('#setPresentationSchedule_form')[0]);
        const data = {
          presentation_date: fd.get('presentation_date')
        }

        await $.ajax({
          url: `${ BASE_URL_API }/projects/evaluation/${ project.id }`,
          type: 'PUT',
          data: data,
          success: async res => {
            processing = false;

            if (res.error) {
              ajaxErrorHandler(res.message);
              enableElements();
            } else {
              setPresentationSchedule_modal.modal('hide');
              enableElements();
              updateProjectDetails({ 
                status: 'For Evaluation',
                presentation_date: data.presentation_date 
              });
              toastr.success('A presentation schedule has been set.');
            }
          },
          error: (xhr, status, error) => {
            ajaxErrorHandler({
              file: 'projects/projectProposalDetails.js',
              fn: `ProjectOptions.initForEvaluation(): confirmBtn.on('click', ...)`,
              details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
            });
            enableElements();
          }
        });
      }
    });
  }

  const initProjectEvaluation = () => {
    const isBadAction = () => project.status !== 'For Evaluation';
    let PE_form;
    
    // Initialize Presentation Date
    $app('#setProjectEvaluation_evaluationDate').initDateInput({
      button: '#setProjectEvaluation_evaluationDate_pickerBtn'
    });

    setProjectEvaluation_modal.on('show.bs.modal', (e) => {
      if (isBadAction()) e.preventDefault();
    });

    setProjectEvaluation_modal.on('hide.bs.modal', (e) => {
      if (processing) e.preventDefault();
    });

    // Handle Form
    $app('#setProjectEvaluation_form').handleForm({
      validators: {
        evaluation_date: {
          required: 'Please select when the evaluation occured.',
          dateISO: 'Your input is not a valid date.',
          beforeDateTime: {
            rule: project.end_date,
            message: 'The evaluation date must be earlier than the end of the project timeline.'
          },
          afterDateTime: {
            rule: project.presentation_date,
            message: 'The evaluation date must be later than the presentation date.'
          }
        },
      },
      onSubmit: async () => {
        if (isBadAction()) return;

        processing = true;

        const confirmBtn = $('#setProjectEvaluation_btn');

        // Disable elements
        confirmBtn.attr('disabled', true);
        confirmBtn.html(`
          <span class="px-3">
            <i class="fas fa-spinner fa-spin-pulse"></i>
          </span>
        `);
        
        // Enable elements function
        const enableElements = () => {
          confirmBtn.attr('disabled', false);
          confirmBtn.html('Yes, please!');
        }

        // Get the data
        const fd = new FormData($('#setProjectEvaluation_form')[0]);
        const evaluationData = PE_form.getEvaluationData();
        const data = {
          evaluation_date: fd.get('evaluation_date'),
          evaluators: evaluationData.evaluation,
          average_points: evaluationData.average.points,
        }

        await $.ajax({
          url: `${ BASE_URL_API }/projects/${ project.id }/evaluate`,
          type: 'POST',
          data: data,
          success: async res => {
            processing = false;

            if (res.error) {
              ajaxErrorHandler(res.message);
              enableElements();
            } else {
              setProjectEvaluation_modal.modal('hide');
              enableElements();
              updateProjectDetails({ 
                status: 'Pending',
                evaluation: data 
              });
              toastr.success('An evaluation has been saved.');
            }
          },
          error: (xhr, status, error) => {
            ajaxErrorHandler({
              file: 'projects/projectProposalDetails.js',
              fn: `ProjectOptions.initProjectEvaluation(): confirmBtn.on('click', ...)`,
              details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
            });
            enableElements();
          }
        });
      }
    });

    // Create an instance of project evaluation form
    PE_form = new ProjectEvaluationForm($('#setProjectEvaluation_evaluatorsForm'));
  }

  const initApproveProject = () => {
    const isBadAction = () => project.status !== 'Pending';
    const confirmBtn = $('#confirmApproveTheProject_btn');

    confirmBtn.on('click', async () => {
      if (isBadAction()) return;
      
      processing = true;
      
      // Disable elements
      confirmBtn.attr('disabled', true);
      confirmBtn.html(`
        <span class="px-3">
          <i class="fas fa-spinner fa-spin-pulse"></i>
        </span>
      `);
    
      // Enable elements function
      const enableElements = () => {
        confirmBtn.attr('disabled', false);
        confirmBtn.html('Yes, please!');
      }
      
      await $.ajax({
        url: `${ BASE_URL_API }/projects/approve/${ project.id }`,
        type: 'PUT',
        success: async res => {
          processing = false;

          if (res.error) {
            ajaxErrorHandler(res.message);
            enableElements();
          } else {
            approveProject_modal.modal('hide');
            enableElements();
            updateProjectDetails({ status: 'Approved' });
            toastr.success('The proposal has been approved.');
          }
        },
        error: (xhr, status, error) => {
          ajaxErrorHandler({
            file: 'projects/projectProposalDetails.js',
            fn: `ProjectOptions.initApproveProject(): confirmBtn.on('click', ...)`,
            details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
          });
          enableElements();
        }
      });
    });

    approveProject_modal.on('show.bs.modal', (e) => {
      if (isBadAction()) e.preventDefault();
    });

    approveProject_modal.on('hide.bs.modal', (e) => {
      if (processing) e.preventDefault();
    })
  }

  const initCancelProposal = () => {
    const isBadAction = () => project.status !== 'Pending';
    const confirmBtn = $('#confirmCancelTheProposal_btn');

    confirmBtn.on('click', async () => {
      if (isBadAction()) return;

      processing = true;

      // Disable elements
      confirmBtn.attr('disabled', true);
      confirmBtn.html(`
        <span class="px-3">
          <i class="fas fa-spinner fa-spin-pulse"></i>
        </span>
      `);

      // Enable elements function
      const enableElements = () => {
        confirmBtn.attr('disabled', false);
        confirmBtn.html('Yes, please!');
      }

      await $.ajax({
        url: `${ BASE_URL_API }/projects/cancel/${ project.id }`,
        type: 'PUT',
        success: async res => {
          processing = false;
          
          if (res.error) {
            ajaxErrorHandler(res.message);
            enableElements();
          } else {
            cancelProposal_modal.modal('hide');
            enableElements();
            updateProjectDetails({ status: 'Cancelled' });
            toastr.success('The proposal has been submitted successfully.');
          }
        }, 
        error: (xhr, status, error) => {
          ajaxErrorHandler({
            file: 'projects/projectProposalDetails.js',
            fn: `ProjectOptions.initCancelProposal(): confirmBtn.on('click', ...)`,
            details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
          });
          enableElements();
        }
      });
    });

    cancelProposal_modal.on('show.bs.modal', (e) => {
      if (isBadAction()) e.preventDefault();
    });

    cancelProposal_modal.on('hide.bs.modal', (e) => {
      if (processing) e.preventDefault();
    });
  }

  // *** INITIALIZE SUBMISSIONS *** //

  const initSubmissions = () => {
    if (mode !== 'Proposal') return;

    // * ======== FOR EXTENSIONIST ======== * //

    if (user_roles.includes('Extensionist')) {
      initForApproval();
      initCancelProposal();
    }

    // * ======== FOR CHIEF ======== * //

    if (user_roles.includes('Chief')) {
      initForRevision();
      initForEvaluation();
      initProjectEvaluation();
      initApproveProject();
    }
  }

  /**
   * * Public Methods
   */

  const setOptions = (data) => {

    if (data) project = data;

    // Get the status
    const { id, status } = project;

    // Get Option List function
    const getOptionList = (optionArr = []) => {
      if(optionArr.length) {
        let optionList = '';
        let selectedOptions = {};
        optionArr.forEach(o => {
          const { id, category } = optionsDict.find(od => od.id == o);
          if (!selectedOptions.hasOwnProperty(category)) selectedOptions[category] = [];
          selectedOptions[category].push(id);
        });
        const entries = Object.entries(selectedOptions);
        entries.forEach((s, i) => {
          const [key, optionsArr] = s;
          optionList += `<div class="dropdown-header">${ key }</div>`;
          optionsArr.forEach(o => optionList += optionsDict.find(od => od.id == o).template);
          if (i < entries.length - 1) optionList += `<div class="dropdown-divider"></div>`
        });
        return optionList;
      }
    }

    let optionsDict;
    let optionList = [];

    // * For Proposal Mode
    if (mode === 'Proposal') {

      // Dictionary of options
      optionsDict = [
        {
          id: 'Add project activity',
          category: 'Project Activities',
          template: `
            <button 
              type="button"
              class="btn btn-negative btn-block text-left" 
              data-toggle="modal"
              data-target="#addProjectActivity_modal"
            >
              <i class="fas fa-plus text-success fa-fw mr-1"></i>
              <span>Add project activity</span>
            </button>
          `
        }, {
          id: 'View activities',
          category: 'Project Activities',
          template: `
            <div
              role="button"
              class="btn btn-negative btn-block text-left" 
              onclick="location.replace('${BASE_URL_WEB}/p/proposals/${id}/activities')"
            >
              <i class="fas fa-list text-primary fa-fw mr-1"></i>
              <span>View activities</span>
            </div>
          `
        }, {
          id: 'View project details',
          category: 'Project Details',
          template: `
            <div
              role="button"
              class="btn btn-negative btn-block text-left" 
              onclick="location.replace('${BASE_URL_WEB}/p/proposals/${id}')"
            >
              <i class="fas fa-list text-primary fa-fw mr-1"></i>
              <span>View project details</span>
            </div>
          `
        }, {
          id: 'Edit project details',
          category: 'Project Details',
          template: `
            <div
              role="button"
              class="btn btn-negative btn-block text-left" 
              onclick="location.assign('${BASE_URL_WEB}/p/edit-proposal/${id}')"
            >
              <i class="fas fa-edit text-info fa-fw mr-1"></i>
              <span>Edit details</span>
            </div>
          `
        }, {
          id: 'Submit for approval',
          category: 'For Submission',
          template: `
            <button 
              type="button"
              class="btn btn-outline-success btn-block text-left" 
              onclick="ProjectOptions.triggerOption('submitForApproval')"
            >
              <i class="fas fa-hand-pointer fa-fw mr-1"></i>
              <span>Submit for approval</span>
            </button>
          `
        }, {
          id: 'Submit evaluation grade',
          category: 'For Submission',
          template: `
            <button 
              type="button"
              class="btn btn-outline-info btn-block text-left" 
              onclick="ProjectOptions.triggerOption('submitEvaluationGrade')"
            >
              <i class="fas fa-list-alt fa-fw mr-1"></i>
              <span>Submit evaluation grade</span>
            </button>
          `
        }, {
          id: 'Cancel the proposal',
          category: 'For Submission',
          template: `
            <button 
              type="button"
              class="btn btn-negative btn-block text-left" 
              onclick="ProjectOptions.triggerOption('cancelTheProposal')"
            >
              <i class="fas fa-times-circle fa-fw mr-1 text-warning"></i>
              <span>Cancel the proposal</span>
            </button>
          `
        }, {
          id: 'Set presentation schedule',
          category: 'For Submission',
          template: `
            <button 
              type="button"
              class="btn btn-outline-primary btn-block text-left" 
              onclick="ProjectOptions.triggerOption('approveTheProposal')"
            >
              <i class="fas fa-calendar-alt fa-fw mr-1"></i>
              <span>Set presentation schedule</span>
            </button>
          `
        }, {
          id: 'Request for revision',
          category: 'For Submission',
          template: `
            <button 
              type="button"
              class="btn btn-negative btn-block text-left" 
              onclick="ProjectOptions.triggerOption('requestForRevision')"
            >
              <i class="fas fa-file-pen fa-fw mr-1 text-warning"></i>
              <span>Request for revision</span>
            </button>
          `
        }, {
          id: 'Approve the project',
          category: 'For Submission',
          template: `
            <button 
              type="button"
              class="btn btn-outline-success btn-block text-left" 
              onclick="ProjectOptions.triggerOption('approveTheProject')"
            >
              <i class="fas fa-check fa-fw mr-1"></i>
              <span>Approve the project</span>
            </button>
          `
        }
      ];

      let optionsTemplate;
  
      if (body.length) {
        optionList.push('View activities');
      } else if (activitiesDT.length) {
        optionList.push('View project details');
      }
  
      if (user_roles.includes('Extensionist')) {
        const revisingOptions = () => {
          if (body.length) {
            optionList.push('Edit project details');
            optionList.push('Submit for approval');
          }
          if (activitiesDT.length) {
            optionList.unshift('Add project activity');
            optionList.push('Edit project details');
            optionList.push('Submit for approval');
          }
        }
  
        optionsTemplate = {
          'Created': () => revisingOptions(),
          'For Revision': () => revisingOptions(),
          'Pending': () => {
            optionList.push('Cancel the proposal');
          },
        }
        if (typeof optionsTemplate[status] !== "undefined") optionsTemplate[status]();
      }
  
      if (user_roles.includes('Chief')) {
        optionsTemplate = {
          'For Review': () => {
            optionList.push('Set presentation schedule');
            optionList.push('Request for revision');
          },
          'For Evaluation': () => {
            optionList.push('Submit evaluation grade');
          },
          'Pending': () => {
            optionList.push('Approve the project');
          }
        }
        if (typeof optionsTemplate[status] !== "undefined") optionsTemplate[status]();
      }
    } 
    
    // * For Monitoring Mode
    else if (mode === 'Monitoring') {

      // Dictionary of options
      optionsDict = [
        {
          id: 'View activities',
          category: 'Project Activities',
          template: `
            <div
              role="button"
              class="btn btn-negative btn-block text-left" 
              onclick="location.replace('${BASE_URL_WEB}/p/monitoring/${id}/activities')"
            >
              <i class="fas fa-list text-primary fa-fw mr-1"></i>
              <span>View activities</span>
            </div>
          `
        }, {
          id: 'View project details',
          category: 'Project Details',
          template: `
            <div
              role="button"
              class="btn btn-negative btn-block text-left" 
              onclick="location.replace('${BASE_URL_WEB}/p/monitoring/${id}')"
            >
              <i class="fas fa-list text-primary fa-fw mr-1"></i>
              <span>View project details</span>
            </div>
          `
        },
      ];

      if (body.length) {
        optionList.push('View activities');
      } else if (activitiesDT.length) {
        optionList.push('View project details');
      }
    }

    // Set the options based on status
    setHTMLContent(options, getOptionList(optionList));
  }

  const triggerOption = (option) => {
    let optionFunc = {};
    
    if (user_roles.includes('Extensionist')) {
      optionFunc.submitForApproval = () => forApproval_modal.modal('show');
      optionFunc.cancelTheProposal = () => cancelProposal_modal.modal('show');
    }

    if (user_roles.includes('Chief')) {
      optionFunc.approveTheProposal = () => setPresentationSchedule_modal.modal('show');
      optionFunc.requestForRevision = () => forRevision_modal.modal('show');
      optionFunc.submitEvaluationGrade = () => setProjectEvaluation_modal.modal('show');
      optionFunc.approveTheProject = () => approveProject_modal.modal('show');
    }

    if (typeof optionFunc[option] !== "undefined") optionFunc[option]();
  };

  /**
   * * Init
   */

  const init = (data) => {
    if (!initialized) {
      initialized = 1;
      mode = data.mode;
      setOptions(data.project);
      initSubmissions();
    }
  }
  
  /**
   * * Return Public Methods
   */

  return {
    init,
    setOptions,
    triggerOption
  }
})();


const ProjectComments = (() => {
  
  /**
	 * * Local Variables
	 */

  const container = $('#projectComments_commentsList');
  const formSelector = '#projectComment_form';
  const form = $(formSelector)[0];
  const commentInput = $('#projectComment_comment');
  const user_id = getCookie('user');
  const noCommentDisplay = $('#projectComments_commentsList_noComment');
  let project;
  let initialized = false;
  let processing = false;

  /**
	 * * Private Functions
	 */

  const resetForm = () => {
    commentInput.val('').trigger('input');
  }

  const handleForm = () => {
    $app(formSelector).handleForm({
      validators: {},
      onSubmit: () => onFormSubmit()
    });
  }

  const onFormSubmit = async () => {
    if (processing) return;
    processing = true;

    const fd = new FormData(form);
    const body = fd.get('comment').trim();

    if (body === '') {
      resetForm();
      processing = false;
      return;
    }

    const submitBtn = $('#projectComments_postComment_btn');
    submitBtn.attr('disabled', true);
    submitBtn.html('<i class="fas fa-spinner fa-spin-pulse"></i>');

    const enableElements = () => {
      submitBtn.attr('disabled', false);
      submitBtn.html('<i class="fas fa-share"></i>');
      processing = false;
    }

    const data = { body: fd.get('comment') }

    await $.ajax({
      url: `${ BASE_URL_API }/projects/${ project.id }/comments/add`,
      type: 'POST',
      data: data,
      success: res => {
        if (res.error) {
          ajaxErrorHandler(res.message);
          enableElements();
        } else {
          const newComment = { ...res.data };
          project.comments.push(newComment);
          addComment(newComment);
          resetForm();
          enableElements();          
          if (project.comments.length > 0) noCommentDisplay.hide();
        }
      },
      error: (xhr, status, error) => {
        ajaxErrorHandler({
          file: 'projects/projectProposalDetails.js',
          fn: 'ProjectComments.handleForm().$.ajax',
          details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
        });
        enableElements();
      }
    });
  }

  const loadComments = () => {
    const comments = project.comments;

    if (!comments.length) {
      noCommentDisplay.show();
    } else {
      comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      comments.forEach(c => addComment({ ...c }));
    }
  }

  const removeComment = (commentId, commentBlock) => {
    if (processing) return;
    processing = true;

    $.ajax({
      url: `${ BASE_URL_API }/projects/${ project.id }/comments/${ commentId }`,
      type: 'DELETE',
      success: res => {
        processing = false;
        if (res.error) {
          ajaxErrorHandler(res.message);
        } else {
          commentBlock.remove();
          project.comments = project.comments.filter(x => x.id != commentId);
          if (project.comments.length === 0) noCommentDisplay.show();
        }
      },
      error: (xhr, status, error) => {
        ajaxErrorHandler({
          file: 'projects/projectProposalDetails.js',
          fn: 'ProjectComments.removeComment().$.ajax',
          details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
        });
        processing = false;
      }
    });
  }

  const initEditComment = (commentId, commentBlock) => {

    // Check if there are active edit blocks
    const activeEditBodySection = container.find(`[data-comment-section="editBody"]`);
    if (activeEditBodySection.length) {
      const activeEditBlockId = activeEditBodySection.closest('[data-comment-block]').attr('data-comment-block');
      const activeEditBlock = container.find(`[data-comment-block="${ activeEditBlockId }"]`);
      activeEditBlock.find(`[data-comment-section="editBody"`).remove();
      activeEditBlock.find(`[data-comment-section="displayBody"]`).show();
    }

    const bodySection = commentBlock.find(`[data-comment-section="body"]`);
    const displayBodySection = bodySection.find(`[data-comment-section="displayBody"]`);

    // Hide the display body section
    displayBodySection.hide();

    // Append the form
    bodySection.append(`
      <div class="mt-1" data-comment-section="editBody">
        <div class="form-group mr-3 mb-0 flex-grow-1">
          <input 
            type="text"
            class="form-control form-control-border comment" 
            name="comment" 
            data-comment-input="editBody"
            placeholder="Edit your comment here ..."
          />
        </div>
        <div class="mt-1">
          <button 
            type="submit"
            class="btn btn-sm btn-success" 
            data-comment-btn="saveEdit"
          >
            <i class="fas fa-check mr-1"></i>
            <span>Save</span>
          </button>
          <button 
            type="submit"
            class="btn btn-sm btn-negative" 
            data-comment-btn="cancelEdit"
          >
            <i class="fas fa-times mr-1"></i>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    `);
    
    // * Initiate input * //
    
    // Get the old comment
    const oldBody = project.comments.find(x => x.id == commentId).body;

    // Set the value
    bodySection.find(`[data-comment-input="editBody"]`).val(oldBody);

    // * Initiate buttons * //

    const saveBtn = bodySection.find(`[data-comment-btn="saveEdit"]`);
    const cancelBtn = bodySection.find(`[data-comment-btn="cancelEdit"]`);

    if (saveBtn.length) {
      saveBtn.on('click', async () => {
        if (processing) return;
        processing = true;

        saveBtn.attr('disabled', true);
        saveBtn.html(`
          <span class="px-2">
            <i class="fas fa-spinner fa-spin-pulse"></i>
          </span>
        `);

        const enableElements = () => {
          saveBtn.attr('disabled', false);
          saveBtn.html(`
            <span class="px-3">
              <i class="fas fa-spinner fa-spin-pulse"></i>
            </span>
          `);
          processing = false;
        }

        const newBody = bodySection.find(`[data-comment-input="editBody"]`).val();

        await $.ajax({
          url: `${ BASE_URL_API }/projects/${ project.id }/comments/${ commentId }`,
          type: 'PUT',
          data: { body: newBody },
          success: res => {
            if (res.error) {
              ajaxErrorHandler(res.message);
              enableElements();
            } else {
              saveBtn.tooltip('hide');
              project.comments = project.comments.map(x => x.id == commentId ? { ...x, body: newBody} : x);
              displayBodySection.find(`[data-comment-part="body"]`).html(newBody);
              bodySection.find(`[data-comment-section="editBody"]`).remove();
              displayBodySection.show();
              processing = false;
            }
          },
          error: (xhr, status, error) => {
            ajaxErrorHandler({
              file: 'projects/projectProposalDetails.js',
              fn: 'ProjectComments.handleForm().$.ajax',
              details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
            });
            enableElements();
          }
        })
      });
    }

    if (cancelBtn.length) {
      cancelBtn.on('click', () => {
        if (processing) return;
        cancelBtn.tooltip('hide');
        bodySection.find(`[data-comment-section="editBody"]`).remove();
        displayBodySection.show();
      });
    }
  }

  const removeLoaders = () => {
    $('#commments_card').show();
  }

  /**
	 * * Public Functions
	 */

  const init = (projectData) => {
    if (!initialized) {
      initialized = true;
      project = {
        id: projectData.id,
        comments: projectData.comments,
      };
      handleForm();
      loadComments();
      removeLoaders();
    }
  }

  const addComment = ({ id, body, created_at, user }) => {
    const blockId = uuid();

    // Check if commented by user, if that's the case then add the buttons
    const isCommentedByUser = () => {
      return user.id == user_id 
        ? `
          <div class="mt-2">
            <span
              role="button" 
              class="btn border btn-negative btn-sm px-2 py-1"
              data-comment-btn="edit"
            >
              <i class="fas fa-edit mr-1 text-info"></i>
              <span>Edit</span>
            </span>
            <span
              role="button" 
              class="btn border btn-negative btn-sm px-2 py-1"
              data-comment-btn="delete"
            >
              <i class="fas fa-trash-alt mr-1 text-danger"></i>
              <span>Remove</span>
            </span>
          </div>
        `
        : ''
    }

    const getTime = () => {
      const months = moment().diff(moment(created_at), 'months');
      if (months >= 1) {
        return `${ moment(created_at).format('MMMM DD, YYYY') }`;
      }
      return `<span data-toggle="tooltip" title="${ moment(created_at).format('MMMM DD, YYYY') }">${ fromNow(created_at) }</span>`;
    }

    // Create the comment template
    const comment = `
      <div class="d-flex mt-3 mb-2" data-comment-block="${ blockId }">
        <div class="user-block mr-3">
          <div class="d-inline-block bg-light border rounded-circle" style="width: 34px; height: 34px"></div>
          <!-- <img class="img-circle" src="../../dist/img/user1-128x128.jpg" alt="user image"> -->
        </div>
        <div class="flex-grow-1" data-comment-section="body">
          <a href="${ BASE_URL_WEB }/profile/${ user.id }" class="font-weight-bold text-dark">${ user.first_name } ${ user.last_name }</a>
          <div class="small text-muted" data-comment-part="time">${ getTime() }</div>
          <div data-comment-section="displayBody">
            <div>
              <div class="mt-2" data-comment-part="body">${ body }</div>
            </div>
            ${ isCommentedByUser() }
          </div>
        </div>
      </div>
    `

    // Append the comment
    container.prepend(comment);

    // * Initialize the buttons * //

    const commentBlock = $(`[data-comment-block="${ blockId }"]`);

    const editBtn = commentBlock.find(`[data-comment-btn="edit"]`);
    const deleteBtn = commentBlock.find(`[data-comment-btn="delete"]`);

    if (editBtn.length) {
      editBtn.on('click', () => {
        initEditComment(id, commentBlock);
      });
    }

    if (deleteBtn.length) {
      deleteBtn.on('click', () => {
        removeComment(id, commentBlock);
      });
    }

    // * Initialize the humanized time * //
    const timeDisplay = commentBlock.find(`[data-comment-part="time"]`);
    setInterval(() => {
      const newTime = getTime();
      if (timeDisplay.html() != newTime) timeDisplay.html(newTime);
    }, 200);
  }

  /**
	 * * On DOM Load
	 */

  return {
    init,
    addComment
  }

})();


const ProjectActivities = (() => {

  /**
	 * * Local Variables
	 */

  const dtElem = $('#activities_dt');
  const viewModal = $('#projectActivityDetails_modal');
  const editModal = $('#editProjectActivity_modal');
  const editFormSelector = '#editProjectActivity_form';
  const editForm = $(editFormSelector)[0];
  const user_roles = JSON.parse(getCookie('roles'));
  let dt;
  let editValidator;
  let PA_form;
  let initialized = false;
  let processing = false; // For edit

  // Data Containers
  let project;
  let mode;

  /**
	 * * Private Methods
	 */

  const initializations = () => {

    // *** For View *** //

    viewModal.on('hidden.bs.modal', () => {

      // Show the loaders
      $('#projectActivityDetails_loader').show();
      $('#projectActivityDetails').hide();
    });

    // *** For Edit *** //

    if (mode === 'Proposal') {

      // Initialize Start Date
      $app('#editProjectActivity_startDate').initDateInput({
        button: '#editProjectActivity_startDate_pickerBtn'
      });
  
      // Initialize End Date
      $app('#editProjectActivity_endDate').initDateInput({
        button: '#editProjectActivity_endDate_pickerBtn'
      });
      
      PA_form = new ProjectActivityForm({
        topicsForm: {
          formGroup: '#editProjectActivity_topics_grp',
          buttons: {
            add: '#editTopic_btn',
            clear: '#clearEditTopicEmptyFields_btn'
          }
        },
        outcomesForm: {
          formGroup: '#editProjectActivity_outcomes_grp',
          buttons: {
            add: '#editOutcome_btn',
            clear: '#clearEditOutcomeEmptyFields_btn'
          }
        }
      });
  
      editModal.on('show.bs.modal', (e) => {
        if (project.status !== 'Created') e.preventDefault();
      });
  
      editModal.on('shown.bs.modal', () => $(editFormSelector).valid());
  
      editModal.on('hide.bs.modal', (e) => {
        if (processing) e.preventDefault();
      });
  
      editModal.on('hidden.bs.modal', () => {
  
        // Reset the edit form
        editForm.reset();
  
        // Reset the activity form
        PA_form.resetActivityForm();
  
        // Reset the validator
        editValidator.resetForm();
  
        // Show the loaders
        $('#editProjectActivity_formGroups_loader').show();
        $('#editProjectActivity_formGroups').hide();
  
        // Disable buttons
        $('#editProjectActivity_form_saveBtn').attr('disabled', true);
      });
    }
  }

  const initDataTable = async () => {

    let dtOptions;

    if (mode === 'Proposal') {
      dtOptions = {
        ...DT_CONFIG_DEFAULTS,
        ajax: {
          url: `${ BASE_URL_API }/projects/${ project.id }/activities`,
          // success: result => {
          //   console.log(result);
          // },
          error: (xhr, status, error) => {
            ajaxErrorHandler({
              file: 'projects/PropojectProposalDetails.js',
              fn: 'ProjectActivities.initDataTable',
              details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
            }, 1);
          },
          data: {
            types: {
              created_at: 'date',
              activity_name: 'string',
              start_date: 'date',
              end_date: 'date'
            }
          }
        },
        columns: [
          {
            data: 'created_at',
            visible: false
          }, {
            data: 'activity_name',
            width: '25%',
            render: (data, type, row) => {
              return `<span role="button" class="text-primary" onclick="ProjectActivities.initViewMode('${ row.id }')">${ data }</span>`
            }
          }, {
            data: null,
            searchable: false,
            sortable: false,
            width: '25%',
            render: data => {
              const topics = data.topics;
              const length = topics.length;
              if (length > 1) {
                return `
                  <div>${ topics[0]}</div>
                  <div class="small text-muted">and ${ length - 1 } more.</div>
                `
              } else if (length == 1) {
                return topics[0]
              } else {
                return `<div class="text-muted font-italic">No topics.</div>`
              }
            }
          }, {
            data: 'start_date',
            width: '22.5%',
            render: (data, type, row) => {
              const start_date = data;
              const needEdit = () => {
                return !moment(start_date).isBetween(
                  moment(project.start_date), 
                  moment(project.end_date),
                  undefined,
                  '[]'
                )
                  ? `
                    <i 
                      class="fas fa-exclamation-triangle fa-beat-fade text-warning mr-1" 
                      style="--fa-animation-duration: 1s;"
                      data-toggle="tooltip" 
                      title="The start date should be within the project timeline"
                    ></i>
                  ` : ''
              }
              return `
                <div>${ needEdit() }${formatDateTime(start_date, 'Date')}</div>
                <div class="small text-muted">${ fromNow(start_date) }</div>
              `
            }
          }, {
            data: 'end_date',
            width: '22.5%',
            render: (data, type, row) => {
              const end_date = data;
              const needEdit = () => {
                return !moment(end_date).isBetween(
                  moment(project.start_date), 
                  moment(project.end_date),
                  undefined,
                  '[]'
                )
                  ? `
                    <i 
                      class="fas fa-exclamation-triangle fa-beat-fade text-warning mr-1" 
                      style="--fa-animation-duration: 1s;"
                      data-toggle="tooltip" 
                      title="The end date should be within the project timeline"
                    ></i>
                  ` : ''
              }
              return `
                <div>${ needEdit() }${formatDateTime(end_date, 'Date')}</div>
                <div class="small text-muted">${ fromNow(end_date) }</div>
              `
            }
          }, {
            data: null,
            width: '5%',
            render: data => {
  
              const editOption = () => {
                return user_roles.includes('Extensionist') && (project.status == 'Created' || project.status == 'For Revision'
  )
                  ? `
                    <button
                      type="button"
                      class="dropdown-item"
                      onclick="ProjectActivities.initEditMode('${ data.id }')"
                    >
                      <span>Edit details</span>
                    </button>
                  `
                  : ''
              }
  
              return `
                <div class="dropdown text-sm-center">
                  <div class="btn btn-sm btn-negative" data-toggle="dropdown" data-dt-btn="options" title="Options">
                    <i class="fas fa-ellipsis-h"></i>
                  </div>
                  <div class="dropdown-menu dropdown-menu-right">
                    <div class="dropdown-header">Options</div>
                    <button
                      type="button"
                      class="dropdown-item"
                      onclick="ProjectActivities.initViewMode('${ data.id }')"
                    >
                      <span>View details</span>
                    </button>
                    ${ editOption() }
                  </div>
                </div>
              `;
            }
          }
        ]
      }
    } else if (mode === 'Monitoring') {
      dtOptions = {
        ...DT_CONFIG_DEFAULTS,
        ajax: {
          url: `${ BASE_URL_API }/projects/${ project.id }/activities`,
          // success: result => {
          //   console.log(result);
          // },
          error: (xhr, status, error) => {
            ajaxErrorHandler({
              file: 'projects/PropojectMonitoringDetails.js',
              fn: 'ProjectActivities.initDataTable',
              details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
            }, 1);
          },
          data: {
            types: {
              created_at: 'date',
              activity_name: 'string',
              start_date: 'date',
              end_date: 'date'
            }
          }
        },
        columns: [
          {
            data: 'created_at',
            visible: false
          }, {
            data: 'activity_name',
            width: '25%',
            render: (data, type, row) => {
              return `<span role="button" class="text-primary" onclick="ProjectActivities.initViewMode('${ row.id }')">${ data }</span>`
            }
          }, {
            data: null,
            sortable: false,
            width: '22.5%',
            render: data => {
              const topics = data.topics;
              const length = topics.length;
              if (length > 1) {
                return `
                  <div>${ topics[0]}</div>
                  <div class="small text-muted">and ${ length - 1 } more.</div>
                `
              } else if (length == 1) {
                return topics[0]
              } else {
                return `<div class="text-muted font-italic">No topics.</div>`
              }
            }
          }, {
            data: 'start_date',
            width: '22.5%',
            render: (data, type, row) => {
              const start_date = data;
              const needEdit = () => {
                return !moment(start_date).isBetween(
                  moment(project.start_date), 
                  moment(project.end_date),
                  undefined,
                  '[]'
                )
                  ? `
                    <i 
                      class="fas fa-exclamation-triangle fa-beat-fade text-warning mr-1" 
                      style="--fa-animation-duration: 1s;"
                      data-toggle="tooltip" 
                      title="The start date should be within the project timeline"
                    ></i>
                  ` : ''
              }
              return `
                <div>${ needEdit() }${formatDateTime(start_date, 'Date')}</div>
                <div class="small text-muted">${ fromNow(start_date) }</div>
              `
            }
          }, {
            data: 'end_date',
            width: '22.5%',
            render: (data, type, row) => {
              const end_date = data;
              const needEdit = () => {
                return !moment(end_date).isBetween(
                  moment(project.start_date), 
                  moment(project.end_date),
                  undefined,
                  '[]'
                )
                  ? `
                    <i 
                      class="fas fa-exclamation-triangle fa-beat-fade text-warning mr-1" 
                      style="--fa-animation-duration: 1s;"
                      data-toggle="tooltip" 
                      title="The end date should be within the project timeline"
                    ></i>
                  ` : ''
              }
              return `
                <div>${ needEdit() }${formatDateTime(end_date, 'Date')}</div>
                <div class="small text-muted">${ fromNow(end_date) }</div>
              `
            }
          }, {
            data: null,
            searchable: false,
            sortable: false,
            render: (data, type, row) => {
              const { start_date, end_date } = data;
              const today = moment();
              let status;
              if (today.isBefore(start_date) && today.isBefore(end_date)) {
                status = 'Soon';
              } else if (today.isAfter(start_date) && today.isAfter(end_date)) {
                status = 'Ended';
              } else if (today.isBetween(start_date, end_date)) {
                status = 'On going';
              } else {
                status = 'No data';
              }
              const { theme, icon } = PROJECT_MONITORING_STATUS_STYLES[status];
              return `
                <div class="text-center">
                  <div class="badge badge-subtle-${ theme } px-2 py-1">
                    <i class="${ icon } fa-fw mr-1"></i>
                    <span>${ status }</span>
                  </div>
                </div>
              `;
            }
          }, {
            data: null,
            render: data => {
  
              const editOption = () => {
                return user_roles.includes('Extensionist') && project.status == 'Created'
                  ? `
                    <button
                      type="button"
                      class="dropdown-item"
                      onclick="ProjectActivities.initEditMode('${ data.id }')"
                    >
                      <span>Edit details</span>
                    </button>
                  `
                  : ''
              }
  
              return `
                <div class="dropdown text-sm-center">
                  <div class="btn btn-sm btn-negative" data-toggle="dropdown" data-dt-btn="options" title="Options">
                    <i class="fas fa-ellipsis-h"></i>
                  </div>
                  <div class="dropdown-menu dropdown-menu-right">
                    <div class="dropdown-header">Options</div>
                    <button
                      type="button"
                      class="dropdown-item"
                      onclick="ProjectActivities.initViewMode('${ data.id }')"
                    >
                      <span>View details</span>
                    </button>
                    ${ editOption() }
                  </div>
                </div>
              `;
            }
          }
        ]
      }
    }

    dt = dtElem.DataTable(dtOptions);
  }

  const handleEditForm = () => {
    editValidator = $app(editFormSelector).handleForm({
      validators: {
        title: {
          required: 'The title of the activity is required.',
          notEmpty: 'This field cannot be blank.',
          minlength: {
            rule: 5,
            message: 'Make sure you type the full title of the activity.'
          }
        },
        start_date: {
          required: 'Please select a start date', 
          dateISO: 'Your input is an invalid date',
          sameOrAfterDateTime: {
            rule: project.start_date,
            message: 'The start date must be within the project timeline.'
          },
          sameOrBeforeDateTime: {
            rule: project.end_date,
            message: 'The start date must be within the project timeline.'
          },
          sameOrBeforeDateTimeSelector: {
            rule: '#editProjectActivity_endDate',
            message: "The start date must be earlier than the end date."
          }
        },
        end_date: {
          required: 'Please select a end date', 
          dateISO: 'Your input is an invalid date',
          sameOrAfterDateTime: {
            rule: project.start_date,
            message: 'The end date must be within the project timeline.'
          },
          sameOrBeforeDateTime: {
            rule: project.end_date,
            message: 'The end date must be within the project timeline.'
          },
          sameOrAfterDateTimeSelector: {
            rule: '#editProjectActivity_startDate',
            message: "The end date must be later than the end date."
          }
        },
        details: {
          required: 'The summary/details of the activity is required.',
          notEmpty: 'This field cannot be blank.',
          minlength: {
            rule: 5,
            message: 'Make sure you type the full summary or details of the activity.'
          }
        }
      },
      onSubmit: () => onEditFormSubmit()
    });
  }

  const onEditFormSubmit = async () => {
    if (!(project.status == 'Created' || project.status == 'For Revision')) return;

    processing = true;

    // Disable the elements
    const saveBtn = $('#editProjectActivity_saveBtn');
    const cancelBtn = $('#editProjectActivity_cancelBtn');
    
    cancelBtn.attr('disabled', true);
    saveBtn.attr('disabled', true);
    saveBtn.html(`
      <span class="px-3">
        <i class="fas fa-spinner fa-spin-pulse"></i>
      </span>
    `);

    // For enabling elements
    const enableElements = () => {

      // Enable buttons
      cancelBtn.attr('disabled', false);
      saveBtn.attr('disabled', false);
      saveBtn.html(`Submit`);

      processing = false;
    }

    // Get the data
    const fd = new FormData(editForm);
    const data = {
      activity_name: fd.get('title'),
      ...PA_form.getActivityData(),
      start_date: fd.get('start_date'),
      end_date: fd.get('end_date'),
      details: fd.get('details')
    }
    
    await $.ajax({
      url: `${ BASE_URL_API }/projects/${ project.id }/activities/${ fd.get('activity_id') }`,
      type: 'PUT',
      data: data,
      success: async res => {
        if (res.error) {
          ajaxErrorHandler(res.message);
          enableElements();
        } else {
          await reloadDataTable();
          enableElements();
          editModal.modal('hide');
          toastr.success('A project activity has been successfully updated');
        }
      }, 
      error: (xhr, status, error) => {
        ajaxErrorHandler({
          file: 'projects/projectProposalDetails.js',
          fn: 'ProjectActivities.onEditFormSubmit()',
          data: data,
          details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
        });
        enableElements();
      }
    });

  }

  /**
	 * * Public Methods
	 */

  const reloadDataTable = async () => {
    await dt.ajax.reload();
  }

  const initViewMode = async (activity_id) => {
    
    // Show the modal
    viewModal.modal('show');
    
    // Get the project activity details
    await $.ajax({
      url: `${ BASE_URL_API }/projects/${ project.id }/activities/${ activity_id }`,
      type: 'GET',
      success: result => {
        if (result.error) {
          ajaxErrorHandler(result.message)
        } else {
          const { 
            activity_name, 
            topics, 
            outcomes,
            start_date,
            end_date,
            details 
          } = result.data;

          // Set Content
          setHTMLContent({
            '#projectActivityDetails_title': activity_name,
            '#projectActivityDetails_topics': () => {
              if(topics.length) {
                let list = `<ul class="mb-0">`;
                topics.forEach(t => list += `<li>${ t }</li>`);
                list += `</ul>`;
                return list;
              }
            },
            '#projectActivityDetails_outcomes': () => {
              if(outcomes.length) {
                let list = `<ul class="mb-0">`;
                outcomes.forEach(o => list += `<li>${ o }</li>`);
                list += `</ul>`;
                return list;
              }
            },
            '#projectActivityDetails_timeframe': () => {
              if (start_date && end_date) {
                const needStartDateEdit = () => {
                  return !moment(start_date).isBetween(
                    moment(project.start_date), 
                    moment(project.end_date),
                    undefined,
                    '[]'
                  )
                    ? `
                      <i 
                        class="fas fa-exclamation-triangle fa-beat-fade text-warning mr-1" 
                        style="--fa-animation-duration: 1s;"
                        data-toggle="tooltip" 
                        title="The start date should be within the project timeline"
                      ></i>
                    ` : ''
                }
                const needEndDateEdit = () => {
                  return !moment(end_date).isBetween(
                    moment(project.start_date), 
                    moment(project.end_date),
                    undefined,
                    '[]'
                  )
                    ? `
                      <i 
                        class="fas fa-exclamation-triangle fa-beat-fade text-warning mr-1" 
                        style="--fa-animation-duration: 1s;"
                        data-toggle="tooltip" 
                        title="The end date should be within the project timeline"
                      ></i>
                    ` : ''
                }
                const getDuration = () => {
                  return moment(start_date).isSame(moment(end_date))
                    ? 'in the whole day'
                    : moment(start_date).to(moment(end_date), true)
                }
                const forMonitoring = () => {
                  if(mode === 'Monitoring') {
                    const today = moment();
                    let status;
                    if (today.isBefore(start_date) && today.isBefore(end_date)) {
                      status = 'Soon';
                    } else if (today.isAfter(start_date) && today.isAfter(end_date)) {
                      status = 'Ended';
                    } else if (today.isBetween(start_date, end_date)) {
                      status = 'On going';
                    } else {
                      status = 'No data';
                    }
                    const { theme, icon } = PROJECT_MONITORING_STATUS_STYLES[status];
                    const statusTemplate = `
                      <div class="badge badge-subtle-${ theme } px-2 py-1">
                        <i class="${ icon } fa-fw mr-1"></i>
                        <span>${ status }</span>
                      </div>
                    `;
                    return `
                      <div class="col-12"><div class="mt-2"></div></div>

                      <div class="pl-0 col-4 col-lg-2">
                        <div class="font-weight-bold">Status:</div>
                      </div>
                      <div class="col-8 col-lg-10">
                        ${ statusTemplate }
                      </div>
                    `
                  }
                  return '';
                }
                return `
                  <div class="ml-4 ml-lg-0 row">
                    <div class="pl-0 col-4 col-lg-2">
                      <div class="font-weight-bold">Start Date:</div>
                    </div>
                    <div class="col-8 col-lg-10">
                      <div>${ needStartDateEdit() }${ moment(start_date).format('MMMM D, YYYY (dddd)') }</div>
                      <div class="small text-muted">${ fromNow(start_date) }</div>
                    </div>

                    <div class="col-12"><div class="mt-2"></div></div>

                    <div class="pl-0 col-4 col-lg-2">
                      <div class="font-weight-bold">End Date:</div>
                    </div>
                    <div class="col-8 col-lg-10">
                      <div>${ needEndDateEdit() }${ moment(end_date).format('MMMM D, YYYY (dddd)') }</div>
                      <div class="small text-muted">${ fromNow(end_date) }</div>
                    </div>

                    <div class="col-12"><div class="mt-2"></div></div>

                    <div class="pl-0 col-4 col-lg-2">
                      <div class="font-weight-bold">Duration:</div>
                    </div>
                    <div class="col-8 col-lg-10">
                      <div>Approximately ${ getDuration() }</div>
                    </div>

                    ${ forMonitoring() }
                  </div>
                `
              } else return noContentTemplate('No dates have been set up.');
            },
            '#projectActivityDetails_details': details
          });
  
          // Hide the loaders
          $('#projectActivityDetails_loader').hide();
          $('#projectActivityDetails').show();
        }
      },
      error: (xhr, status, error) => {
        ajaxErrorHandler({
          file: 'projects/projectProposalDetails.js',
          fn: 'ProjectActivities.initViewMode()',
          details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
        });
      }
    });
  }

  const initEditMode = async (activity_id) => {
    if (!(project.status === 'Created' || project.status === 'For Revision')) return;
    
    // Show the modal
    editModal.modal('show');

    // Get the details of the project activity
    await $.ajax({
      url: `${ BASE_URL_API }/projects/${ project.id }/activities/${ activity_id }`,
      type: 'GET',
      success: result => {
        if (result.error) {
          ajaxErrorHandler(result.message)
        } else {
          const { 
            activity_name, 
            topics, 
            outcomes,
            start_date,
            end_date,
            details
          } = result.data;
        
          // Set the input values
          setInputValue({
            '#editProjectActivity_activityId': activity_id,
            '#editProjectActivity_title': activity_name,
            '#editProjectActivity_startDate': formatDateTime(start_date, 'MM/DD/YYYY'),
            '#editProjectActivity_endDate': formatDateTime(end_date, 'MM/DD/YYYY'),
            '#editProjectActivity_details': details,
          });

          // To make sure that input dates are updated
          $('#editProjectActivity_startDate').trigger('change');
          $('#editProjectActivity_endDate').trigger('change');

          // Set the topics and outcomes
          PA_form.setTopics(topics);
          PA_form.setOutcomes(outcomes);

          // Hide the loaders
          $('#editProjectActivity_formGroups_loader').hide();
          $('#editProjectActivity_formGroups').show();
          
          // Enable buttons
          $('#editProjectActivity_form_saveBtn').attr('disabled', false);
        }
      },
      error: (xhr, status, error) => {
        ajaxErrorHandler({
          file: 'projects/projectProposalDetails.js',
          fn: 'ProjectActivities.initEditMode()',
          details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
        });
      }
    });
  }
  
  /**
	 * * Init
	 */

  const init = (data) => {
    if (!initialized) {
      initialized = true;
      project = data.project;
      mode = data.mode;
      handleEditForm();
      initializations();
      initDataTable();
    };
  }

  /**
	 * * Return Public Functions
	 */

  return {
    init,
    reloadDataTable,
    initViewMode,
    initEditMode,
  }
})();


const AddProjectActivity = (() => {

  /**
   * * Local Variables
   */
  const formSelector = '#addProjectActivity_form';
  const form = $(formSelector)[0];
  const addActivityModal = $('#addProjectActivity_modal');
  let validator;
  let PA_form;
  let initiated = 0;
  let processing = false;
  let project;

  /**
   * * Private Functions
   */

  const initProjectActivityForm = () => {
    
    // Initialize Start Date
    $app('#addProjectActivity_startDate').initDateInput({
      button: '#addProjectActivity_startDate_pickerBtn'
    });

    // Initialize End Date
    $app('#addProjectActivity_endDate').initDateInput({
      button: '#addProjectActivity_endDate_pickerBtn'
    });

    PA_form = new ProjectActivityForm({
      topicsForm: {
        formGroup: '#addProjectActivity_topics_grp',
        buttons: {
          add: '#addTopic_btn',
          clear: '#clearTopicEmptyFields_btn'
        }
      },
      outcomesForm: {
        formGroup: '#addProjectActivity_outcomes_grp',
        buttons: {
          add: '#addOutcome_btn',
          clear: '#clearOutcomeEmptyFields_btn'
        }
      }
    });
    
    // On modal hide
    addActivityModal.on('hide.bs.modal', (e) => {
      if (processing) e.preventDefault();
    })

    // On modal hidden
    addActivityModal.on('hidden.bs.modal', (e) => {
      processing ? e.preventDefault() : resetForm();
    });
  }

  const resetForm = () => {

    // Reset validation
    validator.resetForm();
    
    // Reset native inputs
    form.reset();

    // Reset Automated Forms
    PA_form.resetActivityForm();
  }

  const handleForm = () => {
    validator = $app(formSelector).handleForm({
      validators: {
        title: {
          required: 'The title of the activity is required.',
          notEmpty: 'This field cannot be blank.',
          minlength: {
            rule: 5,
            message: 'Make sure you type the full title of the activity.'
          }
        },
        start_date: {
          required: 'Please select a start date',
          dateISO: 'Your input is not a valid date',
          sameOrAfterDateTime: {
            rule: project.start_date,
            message: 'The start date must be within the project timeline.'
          },
          sameOrBeforeDateTime: {
            rule: project.end_date,
            message: 'The start date must be within the project timeline.'
          },
          sameOrBeforeDateTimeSelector: {
            rule: '#addProjectActivity_endDate',
            message: "The start date must be earlier than the end date"
          }
        },
        end_date: {
          required: 'Please select a end date',
          dateISO: 'Your input is not a valid date',
          sameOrAfterDateTime: {
            rule: project.start_date,
            message: 'The end date must be within the project timeline.'
          },
          sameOrBeforeDateTime: {
            rule: project.end_date,
            message: 'The end date must be within the project timeline.'
          },
          sameOrAfterDateTimeSelector: {
            rule: '#addProjectActivity_startDate',
            message: "The end date must be later than the start date"
          }
        },
        details: {
          required: 'The summary/details of the activity is required.',
          notEmpty: 'This field cannot be blank.',
          minlength: {
            rule: 5,
            message: 'Make sure you type the full summary or details of the activity.'
          }
        }
      },
      onSubmit: () => onFormSubmit()
    });
  }
  
  const onFormSubmit = async () => {
    if (!(project.status === 'Created' || project.status === 'For Revision')) return;

    processing = true;

    // Disable the elements
    const saveBtn = $('#addProjectActivity_saveBtn');
    const cancelBtn = $('#addProjectActivity_cancelBtn');
    
    cancelBtn.attr('disabled', true);
    saveBtn.attr('disabled', true);
    saveBtn.html(`
      <span class="px-3">
        <i class="fas fa-spinner fa-spin-pulse"></i>
      </span>
    `);

    // For enabling elements
    const enableElements = () => {

      // Enable buttons
      cancelBtn.attr('disabled', false);
      saveBtn.attr('disabled', false);
      saveBtn.html(`Submit`);

      processing = false;
    }


    // Get the data
    const fd = new FormData(form);
    const data = {
      activity_name: fd.get('title'),
      ...PA_form.getActivityData(),
      start_date: fd.get('start_date'),
      end_date: fd.get('end_date'),
      details: fd.get('details'),
      status: 'Not evaluated'
    }

    // Save data to db
    await $.ajax({
      url: `${ BASE_URL_API }/projects/${ project.id }/activities/create`,
      type: 'POST',
      data: data,
      success: async res => {
        if (res.error) {
          ajaxErrorHandler(res.message);
          enableElements();
        } else {

          // Reload the datatable
          await ProjectActivities.reloadDataTable();
          
          // Enable Elements
          enableElements();

          // Hide the modal
          addActivityModal.modal('hide');
          
          // Reset the form
          resetForm();

          // Show a toast notification
          toastr.success('An activity has been successfully added.');
        }
      },
      error: (xhr, status, error) => {
        enableElements();
        ajaxErrorHandler({
          file: 'projects/projectProposalDetails.js',
          fn: 'AddProjectActivity.onFormSubmit()',
          data: data,
          details: xhr.status + ': ' + xhr.statusText + "\n\n" + xhr.responseText,
        });
      }
    });
  }

  /**
   * * Init
   */

  const init = (data) => {
    if (!initiated) {
      initiated = 1;
      if (data.mode = 'Proposal') {
        project = data.project;
        if (JSON.parse(getCookie('roles')).includes('Extensionist')) {
          handleForm();
          initProjectActivityForm();
        }
      }
    }
  }
  
  /**
   * * Return Public Functions
   */

  return {
    init,
  }
})();