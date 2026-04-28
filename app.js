/* ===== ResQLink – app.js ===== */
/* All 12 annotated interactions implemented */

$(function () {

  /* ================================================
     DATA STORE
  ================================================ */
  let tasks = [
    {
      id: 1,
      title: 'Medical Supply Distribution',
      description: 'Coordinate delivery of medical kits to Zone A shelters. Minimum 3 volunteers required.',
      priority: 'critical',
      status: 'pending',
      minVolunteers: 3,
      requiredSkills: ['First Aid', 'Logistics'],
      assignedVolunteers: []
    },
    {
      id: 2,
      title: 'Shelter Infrastructure Zone B',
      description: 'Set up temporary shelters for 200 displaced families in Zone B. Engineering skills needed.',
      priority: 'high',
      status: 'active',
      minVolunteers: 5,
      requiredSkills: ['Engineering', 'Logistics'],
      assignedVolunteers: ['Sara M.', 'Ahmad K.', 'Bilal R.']
    },
    {
      id: 3,
      title: 'Water Purification Unit Ops',
      description: 'Operate purification stations at locations W1, W2, W3. Daily volunteer rotation schedule.',
      priority: 'medium',
      status: 'completed',
      minVolunteers: 2,
      requiredSkills: ['Medical', 'Engineering'],
      assignedVolunteers: ['Ahmad K.', 'Sara M.', 'Bilal R.', 'Faiza T.', 'Hamid S.']
    }
  ];

  let volunteers = [
    { id: 'v1', name: 'Ahmad K.', email: 'ahmad@resq.org',  skills: ['First Aid', 'Logistics'],         availability: 'available' },
    { id: 'v2', name: 'Sara M.',  email: 'sara@resq.org',   skills: ['Medical', 'Search & Rescue'],      availability: 'on_task'   },
    { id: 'v3', name: 'Bilal R.', email: 'bilal@resq.org',  skills: ['Engineering', 'Logistics'],        availability: 'available' }
  ];

  let nextTaskId = 10;
  let nextVolId  = 10;
  let activeFilter = 'all';
  let searchQuery  = '';

  /* ================================================
     HELPERS
  ================================================ */
  function getAvatarClass(idx) {
    return 'av' + (idx % 5);
  }
  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
  function statusClass(s) {
    return s; // pending | active | completed
  }
  function nextStatus(s) {
    if (s === 'pending')   return 'active';
    if (s === 'active')    return 'completed';
    return 'pending';
  }

  /* ================================================
     COUNTERS – computed from live arrays
  ================================================ */
  function refreshStats() {
    const active    = tasks.filter(t => t.status === 'active').length;
    const critical  = tasks.filter(t => t.priority === 'critical').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const volCount  = volunteers.length;

    $('#stat-active').text(active);
    $('#stat-critical').text(critical);
    $('#stat-completed').text(completed);
    $('#stat-volunteers').text(volCount);
  }

  /* ================================================
     RENDER TASK CARD
  ================================================ */
  function buildTaskCard(task) {
    const isCompleted = task.status === 'completed';
    const assignDisabled = isCompleted ? 'disabled' : '';

    const $card = $(`
      <div class="task-card ${task.priority}" data-id="${task.id}">
        <div class="card-header">
          <span class="priority-badge ${task.priority}">${task.priority.toUpperCase()}</span>
          <span class="card-title">${$('<span>').text(task.title).html()}</span>
          <button class="card-delete" title="Delete task" aria-label="Delete task">✕</button>
        </div>
        <p class="card-desc">${$('<span>').text(task.description).html()}</p>
        <div class="card-footer">
          <button class="status-btn ${statusClass(task.status)}">${task.status.toUpperCase()}</button>
          <span class="assigned-count">${task.assignedVolunteers.length} assigned</span>
          <div class="assign-area">
            <button class="btn-assign ${assignDisabled}">+ Assign</button>
            <div class="assign-dropdown"></div>
          </div>
        </div>
      </div>
    `);

    return $card;
  }

  /* ================================================
     RENDER ALL TASKS (with filter + search)
  ================================================ */
  function renderTasks() {
    const $grid = $('#task-grid');
    $grid.empty();

    const visible = tasks.filter(t => {
      const priorityOk = (activeFilter === 'all') || (t.priority === activeFilter);
      const searchOk   = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return priorityOk && searchOk;
    });

    if (visible.length === 0) {
      $grid.html('<div class="empty-state">No tasks match your filters.</div>');
      return;
    }

    visible.forEach(task => {
      $grid.append(buildTaskCard(task));
    });
  }

  /* ================================================
     RENDER VOLUNTEERS SIDEBAR
  ================================================ */
  function renderVolunteers() {
    const $list = $('#volunteer-list');
    $list.empty();
    volunteers.forEach((v, idx) => {
      const $card = $(`
        <div class="vol-card" data-vid="${v.id}">
          <div class="vol-card-top">
            <div class="vol-avatar ${getAvatarClass(idx)}">${initials(v.name)}</div>
            <div class="vol-info">
              <div class="vol-name">${$('<span>').text(v.name).html()}</div>
              <div class="vol-skills">${$('<span>').text(v.skills.join(' · ')).html()}</div>
            </div>
          </div>
          <span class="vol-status ${v.availability}">${v.availability === 'available' ? 'Available' : 'On Task'}</span>
        </div>
      `);
      $list.append($card);
    });
  }

  /* ================================================
     INITIAL RENDER
  ================================================ */
  renderTasks();
  renderVolunteers();
  refreshStats();

  /* ================================================
     ANNOTATION 1 – FAB opens Create Task modal
  ================================================ */
  $('#fab-new-task').on('click', function () {
    openTaskModal();
  });

  function openTaskModal() {
    resetTaskForm();
    $('#modal-backdrop').removeAttr('hidden');
    // Focus trap: focus first focusable
    setTimeout(() => $('#task-title').focus(), 50);
  }
  function closeTaskModal() {
    $('#modal-backdrop').attr('hidden', true);
    resetTaskForm();
  }
  $('#modal-close, #modal-cancel').on('click', closeTaskModal);
  $('#modal-backdrop').on('click', function (e) {
    if ($(e.target).is('#modal-backdrop')) closeTaskModal();
  });

  // Focus trap for task modal (Tab cycles within)
  $('#task-modal').on('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = $(this).find('button, input, select, textarea, [href]').filter(':visible:not(:disabled)');
    const first = focusable.first()[0];
    const last  = focusable.last()[0];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      closeTaskModal();
      closeVolModal();
    }
  });

  /* ================================================
     ANNOTATION 2 – Status badge cycling
  ================================================ */
  $(document).on('click', '.status-btn', function () {
    const $card = $(this).closest('.task-card');
    const id    = parseInt($card.data('id'));
    const task  = tasks.find(t => t.id === id);
    if (!task) return;

    // Track old status for stat update
    const oldStatus = task.status;
    task.status = nextStatus(task.status);

    // Update DOM badge
    $(this)
      .removeClass('pending active completed')
      .addClass(task.status)
      .text(task.status.toUpperCase());

    // Toggle Assign button disability
    const $assignBtn = $card.find('.btn-assign');
    if (task.status === 'completed') {
      $assignBtn.addClass('disabled');
      $card.find('.assign-dropdown').removeClass('open');
    } else {
      $assignBtn.removeClass('disabled');
    }

    refreshStats();
  });

  /* ================================================
     ANNOTATION 3 – Register Volunteer modal
  ================================================ */
  $('#btn-register-vol').on('click', function () {
    openVolModal();
  });

  function openVolModal() {
    resetVolForm();
    $('#vol-modal-backdrop').removeAttr('hidden');
    setTimeout(() => $('#vol-name').focus(), 50);
  }
  function closeVolModal() {
    $('#vol-modal-backdrop').attr('hidden', true);
    resetVolForm();
  }
  $('#vol-modal-close, #vol-modal-cancel').on('click', closeVolModal);
  $('#vol-modal-backdrop').on('click', function (e) {
    if ($(e.target).is('#vol-modal-backdrop')) closeVolModal();
  });

  // Focus trap for volunteer modal
  $('#vol-modal').on('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = $(this).find('button, input, select, textarea').filter(':visible:not(:disabled)');
    const first = focusable.first()[0];
    const last  = focusable.last()[0];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  $('#btn-register-submit').on('click', function () {
    const name  = $('#vol-name').val().trim();
    const email = $('#vol-email').val().trim();
    const skills = [];
    $('input[name="vol-skill"]:checked').each(function () {
      skills.push($(this).val());
    });

    let valid = true;

    if (!name) {
      $('#vol-name-error').text('Full name is required.');
      $('#vol-name').addClass('error');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      $('#vol-email-error').text('Please enter a valid email address.');
      $('#vol-email').addClass('error');
      valid = false;
    }

    if (!valid) return;

    // Create volunteer object
    const newVol = {
      id: 'v' + (nextVolId++),
      name,
      email,
      skills,
      availability: 'available'
    };
    volunteers.push(newVol);

    // Append to sidebar
    const idx = volunteers.length - 1;
    const $card = $(`
      <div class="vol-card" data-vid="${newVol.id}">
        <div class="vol-card-top">
          <div class="vol-avatar ${getAvatarClass(idx)}">${initials(newVol.name)}</div>
          <div class="vol-info">
            <div class="vol-name">${$('<span>').text(newVol.name).html()}</div>
            <div class="vol-skills">${$('<span>').text(newVol.skills.join(' · ') || 'No skills listed').html()}</div>
          </div>
        </div>
        <span class="vol-status available">Available</span>
      </div>
    `);
    $('#volunteer-list').append($card);

    // Increment counter
    refreshStats();
    closeVolModal();
  });

  /* ================================================
     ANNOTATION 4 – Assign dropdown
  ================================================ */
  $(document).on('click', '.btn-assign', function (e) {
    e.stopPropagation();
    const $btn  = $(this);
    if ($btn.hasClass('disabled')) return;

    const $card = $btn.closest('.task-card');
    const id    = parseInt($card.data('id'));
    const task  = tasks.find(t => t.id === id);
    if (!task) return;

    const $dd = $card.find('.assign-dropdown');

    // Close all other dropdowns
    $('.assign-dropdown').not($dd).removeClass('open');

    if ($dd.hasClass('open')) {
      $dd.removeClass('open');
      return;
    }

    // Populate dropdown with available volunteers not already assigned
    $dd.empty();
    const available = volunteers.filter(v =>
      v.availability === 'available' &&
      !task.assignedVolunteers.includes(v.name)
    );

    if (available.length === 0) {
      $dd.append('<div class="assign-dropdown-empty">No available volunteers</div>');
    } else {
      available.forEach(v => {
        const $item = $(`<div class="assign-dropdown-item" data-vid="${v.id}">${$('<span>').text(v.name).html()}</div>`);
        $item.on('click', function (e2) {
          e2.stopPropagation();
          // Update task
          task.assignedVolunteers.push(v.name);
          // Update volunteer availability
          v.availability = 'on_task';
          // Update volunteer card in sidebar
          $(`#volunteer-list .vol-card[data-vid="${v.id}"] .vol-status`)
            .removeClass('available')
            .addClass('on_task')
            .text('On Task');

          // Update assigned count on card
          $card.find('.assigned-count').text(task.assignedVolunteers.length + ' assigned');

          $dd.removeClass('open');
        });
        $dd.append($item);
      });
    }

    $dd.addClass('open');
  });

  // Close dropdown on outside click
  $(document).on('click', function () {
    $('.assign-dropdown').removeClass('open');
  });

  /* ================================================
     ANNOTATION 5 – Priority filter tabs
  ================================================ */
  $(document).on('click', '.pill', function () {
    activeFilter = $(this).data('priority');
    $('.pill').removeClass('active');
    $(this).addClass('active');
    renderTasks();
  });

  /* ================================================
     ANNOTATION 6 – Search input (real-time)
  ================================================ */
  $('#search-input').on('input', function () {
    searchQuery = $(this).val();
    renderTasks();
  });

  /* ================================================
     ANNOTATION 8 – Delete task card
  ================================================ */
  $(document).on('click', '.card-delete', function (e) {
    e.stopPropagation();
    const $card = $(this).closest('.task-card');
    const id    = parseInt($card.data('id'));
    const idx   = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;

    const task = tasks[idx];
    // Splice from array
    tasks.splice(idx, 1);

    // CSS transition removal
    $card.css({
      'overflow': 'hidden',
      'opacity': '1',
      'max-height': $card[0].scrollHeight + 'px'
    });
    // Force reflow
    $card[0].offsetHeight;
    $card.css({
      'opacity': '0',
      'max-height': '0',
      'margin-bottom': '0',
      'padding-top': '0',
      'padding-bottom': '0',
      'border-width': '0',
      'transition': 'opacity 0.3s ease, max-height 0.3s ease, margin-bottom 0.3s ease, padding 0.3s ease, border-width 0.3s ease'
    });
    setTimeout(() => {
      $card.remove();
      refreshStats();
    }, 310);

    refreshStats();
  });

  /* ================================================
     ANNOTATION 9, 10, 11, 12 – Create Task modal
  ================================================ */

  // Annotation 11 – char counter for description
  $('#task-desc').on('input', function () {
    const len = $(this).val().length;
    const $counter = $('.char-counter');
    $('#char-count').text(len);
    if (len >= 200) {
      $counter.addClass('over');
    } else {
      $counter.removeClass('over');
    }
    // Clear error on correction
    if (len > 0) {
      $('#desc-error').text('');
      $('#task-desc').removeClass('error');
    }
  });

  // Annotation 9 – clear title error on input
  $('#task-title').on('input', function () {
    if ($(this).val().trim().length >= 5) {
      $('#title-error').text('');
      $(this).removeClass('error');
    }
  });

  // Annotation 12 – Create Task button
  $('#btn-create-task').on('click', function () {
    let valid = true;

    const title = $('#task-title').val().trim();
    const desc  = $('#task-desc').val().trim();
    const priority = $('#task-priority').val();
    const minVol   = parseInt($('#task-min-vol').val()) || 1;

    // Validate title (annotation 9)
    if (title.length < 5) {
      $('#title-error').text('Title must be at least 5 characters.');
      $('#task-title').addClass('error');
      valid = false;
    }

    // Validate description (annotation 11)
    if (desc.length === 0) {
      $('#desc-error').text('Description is required.');
      $('#task-desc').addClass('error');
      valid = false;
    } else if (desc.length > 200) {
      $('#desc-error').text('Description must not exceed 200 characters.');
      $('#task-desc').addClass('error');
      valid = false;
    }

    if (!valid) return;

    // Collect required skills
    const skills = [];
    $('input[name="skill"]:checked').each(function () {
      skills.push($(this).val());
    });

    // Build task object (annotation 12)
    const newTask = {
      id: nextTaskId++,
      title,
      description: desc,
      priority,
      status: 'pending',
      minVolunteers: minVol,
      requiredSkills: skills,
      assignedVolunteers: []
    };

    // Prepend to tasks array
    tasks.unshift(newTask);

    // Build card and prepend to grid
    const $newCard = buildTaskCard(newTask);
    $newCard.css({ opacity: 0 });
    $('#task-grid').prepend($newCard);
    // Fade in
    setTimeout(() => $newCard.css({ opacity: 1, transition: 'opacity 0.25s ease' }), 10);

    // Update stats
    refreshStats();

    // Close and reset
    closeTaskModal();
  });

  /* ================================================
     FORM HELPERS
  ================================================ */
  function resetTaskForm() {
    $('#task-title').val('').removeClass('error');
    $('#task-priority').val('medium');
    $('#task-min-vol').val(2);
    $('#task-desc').val('').removeClass('error');
    $('#char-count').text(0);
    $('.char-counter').removeClass('over');
    $('input[name="skill"]').prop('checked', false);
    $('input[name="skill"][value="Logistics"]').prop('checked', true);
    $('#title-error, #desc-error').text('');
  }
  function resetVolForm() {
    $('#vol-name').val('').removeClass('error');
    $('#vol-email').val('').removeClass('error');
    $('input[name="vol-skill"]').prop('checked', false);
    $('#vol-name-error, #vol-email-error').text('');
  }

});
