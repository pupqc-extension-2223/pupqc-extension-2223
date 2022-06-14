/**
 * ==============================================
 * * PROJECT ACTIVITIES
 * ==============================================
 */


'use strict';


const AddProjectActivity = (() => {

  /**
   * * Local Variables
   */
  const addActivityModal = $('#addProjectActivity_modal');
  let validator;
  let PA_form;
  let initiated = 0;
  let project_details;

  /**
   * * Private Functions
   */

  const initProjectActivityForm = () => {
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
    addActivityModal.on('hidden.bs.modal', () => {
      PA_form.resetActivityForm();
      validator.resetForm();
    });
  }

  const handleForm = () => {
    validator = $app('#addProjectActivity_form').handleForm({
      validators: {
        title: {
          required: 'The title of the activity is required.'
        }
      },
      onSubmit: () => onFormSubmit()
    });
  }
  
  const onFormSubmit = () => {
    const data = {
      title: 'Test',
      ...PA_form.getActivityData()
    }

    console.log(data);

    toastr.success('Submitted successfully!');
    
    addActivityModal.modal('hide');
  }

  /**
   * * Init
   * o--/[=================>
   */

  const init = (project_details_data) => {
    if (!initiated) {
      initiated = 1;
      project_details = project_details_data;
      if (JSON.parse(getCookie('roles')).includes('Extensionist') && project_details.status == 'Created') {
        handleForm();
        initProjectActivityForm();
      } else {

        // Remove Modals from the DOM
        $('#addProjectActivity_modal').remove();
        $('#editProjectActivity_modal').remove();
      }
    }
  }
  
  /**
   * * Return Public Functions
   * o--/[=================>
   */

  return {
    init,
  }
})();


const ProjectActivities = (() => {

  /**
	 * * Local Variables
	 */

  const dtElem = $('#activities_dt');
  const viewModal = $('#projectActivityDetails_modal');
  const editModal = $('#editProjectActivity_modal');
  let project_details;
  let dt;
  let editValidator;
  let PA_form;
  let initialized = 0;

  // ! Simulation
  // Sample Data
  const activities = [
    {
      id: 1,
      name: 'Health Awareness and Office Productivity Tools',
      topics: [
        'Mental Health Awareness',
        'How to Cope up with the Pandemic',
        'Information Communication Technology',
      ],
      outcomes: [
        'Participants will be knowledgeable about proper mental health care',
        'Participant will know how to cope up with the pandemics',
      ]
    }, {
      id: 2,
      name: 'Media and Information Literacy and Google Apps',
      topics: [
        'Google Forms',
        'Google Docs',
        'Google Slides',
      ],
      outcomes: [
        'Lorem ipsum dolor',
        'Lorem ipsum dolor',
      ]
    }, 
  ];

  /**
	 * * Private Methods
	 */

  const handleEditForm = () => {
    editValidator = $app('#editProjectActivity_form').handleForm({
      validators: {
        title: {
          required: 'The title of the activity is required.'
        }
      },
      onSubmit: () => onEditFormSubmit()
    });
  }

  const preInitializations = () => {

    // *** Initialize Edit Activity Form *** //
    
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

    // *** On Modals Hidden State *** //
    
    viewModal.on('hidden.bs.modal', () => {

      // Show the loaders
      $('#projectActivityDetails_loader').show();
      $('#projectActivityDetails').hide();
    });

    editModal.on('hidden.bs.modal', () => {

      // Reset the activity form
      PA_form.resetActivityForm();

      // Show the loaders
      $('#editProjectActivity_formGroups_loader').show();
      $('#editProjectActivity_formGroups').hide();

      // Disable buttons
      $('#editProjectActivity_form_saveBtn').attr('disabled', true);
    });
  }

  const initDataTable = async () => {
    dt = dtElem.DataTable({
      ajax: {
        url: `${ BASE_URL }/projects/${ project_details.id }/activities`,
        success: result => {
          console.log(result);
        }
      },
      serverSide: true,
      columns: [
        {
          data: 'activity_name'
        }, {
          data: null,
          render: data => {
            const topics = data.topics;
            const length = topics.length;
            if (length > 1) {
              return `
                <div>${ topics[0]}</div>
                <div class="small">and ${ length - 1 } more.</div>
              `
            } else if (length == 1) {
              return topics[0]
            } else {
              return `<div class="text-muted font-italic">No topics.</div>`
            }
          }
        }, {
          data: null,
          render: data => {
            return `
              <div class="dropdown text-center">
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
                  ${
                    project_details.status == 'Created'
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
                  }
                </div>
              </div>
            `;
          }
        }
      ]
    });
  }

  const onEditFormSubmit = () => {
    const data = {
      ...PA_form.getActivityData()
    }
    console.log(data);
    editModal.modal('hide');
    toastr.success('A project activity has been successfully updated');
  }

  /**
	 * * Public Methods
	 */

  const reloadDataTable = () => {
    // dt.ajax.reload();
    console.log(dt);
    toastr.success('List of activities has been reloaded');
  }

  const initViewMode = async (activity_id) => {
    viewModal.modal('show');
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        const { name, topics, outcomes } = activities.find(a => a.id == activity_id);

        // Set Content
        setHTMLContent({
          '#projectActivityDetails_title': name,
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
        });

        // Hide the loaders
        $('#projectActivityDetails_loader').hide();
        $('#projectActivityDetails').show();
        resolve();
      }, 750)
    });
  }

  const initEditMode = async (activity_id) => {
    editModal.modal('show');
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        const { name, topics, outcomes } = activities.find(a => a.id == activity_id);
        
        // Set the input values
        setInputValue({'#editProjectActivity_title': name});

        // Set the topics and outcomes
        PA_form.setTopics(topics);
        PA_form.setOutcomes(outcomes);

        // Hide the loaders
        $('#editProjectActivity_formGroups_loader').hide();
        $('#editProjectActivity_formGroups').show();
        
        // Enable buttons
        $('#editProjectActivity_form_saveBtn').attr('disabled', false);

        resolve();
      }, 750);
    });
  }
  
  /**
	 * * Init
	 */

  const init = (data) => {
    if(!initialized) {
      initialized = 1;
      project_details = data;
      handleEditForm();
      preInitializations();
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